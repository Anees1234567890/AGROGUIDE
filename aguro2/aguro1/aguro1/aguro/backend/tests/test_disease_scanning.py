import os
import io
import base64
import pytest
import numpy as np
import cv2
from fastapi.testclient import TestClient

from app.main import app
from app.services.disease_service import predict_crop_disease, DefaultPlantDomainClassifier

client = TestClient(app)


def create_test_image(blur=False, plant=True, sharp_leaf=False):
    """Helper to generate OpenCV images for testing guardrail steps."""
    img = np.zeros((200, 200, 3), dtype=np.uint8)
    
    if plant:
        # Green plant foliage color (BGR: B=30, G=180, R=50)
        img[:] = (30, 180, 50)
        if sharp_leaf:
            # Add high-contrast leaf vein patterns for high Laplacian variance (> 100)
            cv2.line(img, (10, 10), (190, 190), (0, 255, 255), 5)
            cv2.line(img, (190, 10), (10, 190), (255, 255, 0), 5)
            for i in range(10, 190, 15):
                cv2.circle(img, (i, i), 8, (255, 255, 255), -1)
                cv2.circle(img, (200 - i, i), 8, (0, 0, 0), -1)
    else:
        # Non-plant metallic blue/red car surface with sharp checkerboard pattern (no green foliage)
        img[:] = (200, 50, 50)
        if sharp_leaf:
            for y in range(0, 200, 20):
                for x in range(0, 200, 20):
                    if (x + y) % 40 == 0:
                        img[y:y+20, x:x+20] = (255, 0, 0)  # Bright blue tile

    if blur:
        img = cv2.GaussianBlur(img, (25, 25), 0)

    _, encoded = cv2.imencode(".jpg", img)
    b64_str = base64.b64encode(encoded).decode("utf-8")
    return img, f"data:image/jpeg;base64,{b64_str}"


def test_step_1_image_quality_blur_rejection():
    """STEP 1: Verify blurry image (< 100 Laplacian variance) is rejected."""
    blur_img, b64_str = create_test_image(blur=True, plant=True, sharp_leaf=False)
    
    res = predict_crop_disease(blur_img)
    
    assert res["status"] == "REJECTED"
    assert res["error_code"] == "IMAGE_TOO_BLURRY"
    assert res["is_valid_crop_leaf"] is False
    assert "blurry" in res["user_message"].lower()


def test_step_2_non_plant_domain_rejection():
    """STEP 2: Verify non-plant image (metallic gray / non-foliage) is rejected."""
    non_plant_img, b64_str = create_test_image(blur=False, plant=False, sharp_leaf=True)
    
    res = predict_crop_disease(non_plant_img)
    
    assert res["status"] == "REJECTED"
    assert res["error_code"] == "INVALID_IMAGE_DOMAIN"
    assert res["is_valid_crop_leaf"] is False
    assert "invalid image" in res["user_message"].lower()


class MockLowConfidenceDiseaseModel:
    def predict(self, image_input):
        return {"crop": "Tomato", "disease": "Early Blight", "confidence": 0.45, "severity": "Mild"}


class MockNonPlantBackgroundModel:
    def predict(self, image_input):
        return {"crop": "Unknown", "disease": "Non_Plant_Background", "confidence": 0.95, "severity": "None"}


def test_step_3_low_confidence_ood_rejection():
    """STEP 3: Verify low confidence (< 0.75) or Non_Plant prediction is rejected."""
    sharp_leaf_img, b64_str = create_test_image(blur=False, plant=True, sharp_leaf=True)
    
    # 1. Low confidence test
    res_low = predict_crop_disease(sharp_leaf_img, disease_model=MockLowConfidenceDiseaseModel())
    assert res_low["status"] == "REJECTED"
    assert res_low["error_code"] == "LOW_CONFIDENCE_OOD"
    assert res_low["is_valid_crop_leaf"] is False
    assert "could not confidently identify" in res_low["user_message"].lower()

    # 2. Non-plant background prediction test
    res_bg = predict_crop_disease(sharp_leaf_img, disease_model=MockNonPlantBackgroundModel())
    assert res_bg["status"] == "REJECTED"
    assert res_bg["error_code"] == "LOW_CONFIDENCE_OOD"
    assert res_bg["is_valid_crop_leaf"] is False


def test_success_case_valid_crop_leaf():
    """Verify clear, valid crop leaf image returns SUCCESS schema with confidence and next steps."""
    sharp_leaf_img, b64_str = create_test_image(blur=False, plant=True, sharp_leaf=True)
    
    res = predict_crop_disease(sharp_leaf_img, crop_hint="Tomato")
    
    assert res["status"] == "SUCCESS"
    assert res["is_valid_crop_leaf"] is True
    assert "crop" in res
    assert "disease" in res
    assert "%" in res["confidence_score"]
    assert "severity" in res
    assert isinstance(res["next_steps"], list)
    assert len(res["next_steps"]) > 0


def test_api_validate_and_predict_endpoint():
    """Verify FastAPI API endpoint /api/pest-detection/validate-and-predict."""
    # Test blurry image rejection via API
    _, blur_b64 = create_test_image(blur=True, plant=True, sharp_leaf=False)
    api_res = client.post(
        "/api/pest-detection/validate-and-predict",
        json={"crop_name": "Tomato", "image_data": blur_b64}
    )
    assert api_res.status_code == 200
    data = api_res.json()
    assert data["status"] == "REJECTED"
    assert data["error_code"] == "IMAGE_TOO_BLURRY"

    # Test success image via API
    _, sharp_b64 = create_test_image(blur=False, plant=True, sharp_leaf=True)
    api_res_success = client.post(
        "/api/pest-detection/validate-and-predict",
        json={"crop_name": "Tomato", "image_data": sharp_b64}
    )
    assert api_res_success.status_code == 200
    data_success = api_res_success.json()
    assert data_success["status"] == "SUCCESS"
    assert data_success["is_valid_crop_leaf"] is True
    assert "next_steps" in data_success
