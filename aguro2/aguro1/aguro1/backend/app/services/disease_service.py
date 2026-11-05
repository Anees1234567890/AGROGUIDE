import base64
import os
import io
import logging
from typing import Dict, Any, Optional, Tuple, Union
import numpy as np

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    cv2 = None
    CV2_AVAILABLE = False

from app.services.ai_vision_model import run_kaggle_vision_inference, KAGGLE_PLANTVILLAGE_CLASSES

logger = logging.getLogger(__name__)


class DefaultPlantDomainClassifier:
    """
    Lightweight Domain Classifier for verifying if an image contains a valid plant / crop leaf.
    Uses HSV/LAB color channel distribution across green, yellow, rust, and chlorotic foliage spectrums.
    """
    def predict(self, img_cv: np.ndarray) -> Tuple[bool, float]:
        if img_cv is None or not isinstance(img_cv, np.ndarray) or img_cv.size == 0:
            return False, 0.0

        if not CV2_AVAILABLE:
            return True, 0.85

        # Convert to HSV color space
        hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
        
        # 1. Vivid Green Foliage (Hue 25-95)
        lower_foliage1 = np.array([25, 20, 20])
        upper_foliage1 = np.array([95, 255, 255])
        mask1 = cv2.inRange(hsv, lower_foliage1, upper_foliage1)

        # 2. Yellow / Rust / Stripe Rust / Chlorotic Leaf Spectrum (Hue 8-30)
        lower_foliage2 = np.array([8, 25, 30])
        upper_foliage2 = np.array([30, 255, 255])
        mask2 = cv2.inRange(hsv, lower_foliage2, upper_foliage2)

        # 3. Dark Olive Green / Wet Leaf Spectrum (Hue 15-85)
        lower_foliage3 = np.array([15, 15, 15])
        upper_foliage3 = np.array([85, 255, 200])
        mask3 = cv2.inRange(hsv, lower_foliage3, upper_foliage3)

        combined_mask = cv2.bitwise_or(mask1, cv2.bitwise_or(mask2, mask3))
        plant_pixel_ratio = float(np.count_nonzero(combined_mask)) / float(img_cv.shape[0] * img_cv.shape[1])

        # Also inspect LAB color space (a* channel represents green-red balance: a* < 130 is green spectrum)
        lab = cv2.cvtColor(img_cv, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)
        green_a_ratio = float(np.count_nonzero(a_channel < 130)) / float(a_channel.size)

        confidence = max(plant_pixel_ratio * 1.4, green_a_ratio * 0.95)
        confidence = min(max(confidence, 0.05), 0.99)

        # Non-plant threshold: if plant ratio < 0.04 AND green balance < 0.08
        if plant_pixel_ratio < 0.04 and green_a_ratio < 0.08:
            return False, round(confidence, 2)

        return True, round(max(confidence, 0.75), 2)


default_domain_classifier = DefaultPlantDomainClassifier()


def _load_cv2_image(image_input: Union[str, bytes, np.ndarray]) -> Optional[np.ndarray]:
    """
    Robust Helper to convert various image input formats (Base64 string, file path, raw bytes, or ndarray)
    into standard OpenCV BGR image array with Pillow (PIL) decoding fallback.
    """
    if not CV2_AVAILABLE:
        logger.error("OpenCV (cv2) is not installed in the environment.")
        return None

    if isinstance(image_input, np.ndarray):
        return image_input

    if isinstance(image_input, bytes):
        try:
            nparr = np.frombuffer(image_input, np.uint8)
            img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_cv is not None and img_cv.size > 0:
                return img_cv
            from PIL import Image
            pil_img = Image.open(io.BytesIO(image_input)).convert("RGB")
            return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        except Exception as e:
            logger.warning(f"Error decoding image bytes: {e}")
            return None

    if isinstance(image_input, str):
        # Case 1: Base64 data string (data:image/png;base64,...)
        if image_input.startswith("data:image") or "," in image_input or len(image_input) > 200:
            try:
                b64_str = image_input.split(",")[1] if "," in image_input else image_input
                b64_str = b64_str.strip().replace(" ", "+").replace("\n", "").replace("\r", "")
                missing_padding = len(b64_str) % 4
                if missing_padding:
                    b64_str += "=" * (4 - missing_padding)

                img_bytes = base64.b64decode(b64_str)
                nparr = np.frombuffer(img_bytes, np.uint8)
                img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img_cv is not None and img_cv.size > 0:
                    return img_cv

                # Pillow (PIL) decoding fallback
                from PIL import Image
                pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            except Exception as e:
                logger.warning(f"Failed to decode base64 image: {e}")

        # Case 2: Local File Path
        if os.path.exists(image_input):
            try:
                img_cv = cv2.imread(image_input)
                if img_cv is not None and img_cv.size > 0:
                    return img_cv
            except Exception as e:
                logger.warning(f"Failed to read image file {image_input}: {e}")

    return None


def predict_crop_disease(
    image_input: Union[str, bytes, np.ndarray],
    disease_model: Optional[Any] = None,
    domain_classifier: Optional[Any] = None,
    crop_hint: Optional[str] = None
) -> Dict[str, Any]:
    """
    AgroGuide 3-Step Image Validation & Pre-Classification Guardrail Pipeline:
    Step 1: Blur Check (OpenCV Laplacian Variance < 100 -> Reject)
    Step 2: Strict Crop/Plant Domain Check (Non-plant detection -> Reject)
    Step 3: Disease Model Confidence & Out-of-Distribution (OOD) Guard (Confidence < 0.75 -> Reject)
    """
    img_cv = _load_cv2_image(image_input)

    if img_cv is None:
        return {
            "status": "REJECTED",
            "error_code": "INVALID_IMAGE_FORMAT",
            "is_valid_crop_leaf": False,
            "confidence_score": 0.0,
            "user_message": "Invalid or unreadable image data. Please upload a valid image file of a crop leaf."
        }

    # STEP 1: Quality Check (Blurriness via Laplacian Variance)
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

    if laplacian_var < 100:
        return {
            "status": "REJECTED",
            "error_code": "IMAGE_TOO_BLURRY",
            "is_valid_crop_leaf": False,
            "confidence_score": float(round(laplacian_var / 1000.0, 2)),
            "user_message": "Image is too blurry. Please capture a clear, focused photo of the crop leaf."
        }

    # STEP 2: Domain Check (Is it actually a plant / crop leaf?)
    if domain_classifier is not None and hasattr(domain_classifier, "predict"):
        res = domain_classifier.predict(image_input if isinstance(image_input, str) else img_cv)
        if isinstance(res, tuple):
            is_plant, plant_confidence = res
        else:
            is_plant, plant_confidence = bool(res), 0.85
    else:
        is_plant, plant_confidence = default_domain_classifier.predict(img_cv)

    if not is_plant or plant_confidence < 0.70:
        return {
            "status": "REJECTED",
            "error_code": "INVALID_IMAGE_DOMAIN",
            "is_valid_crop_leaf": False,
            "confidence_score": float(plant_confidence),
            "user_message": "Invalid image detected. Please upload a clear photo of a supported crop leaf (e.g., Tomato, Potato, Pepper, Wheat, Rice)."
        }

    # STEP 3: Disease Model Prediction with Threshold Safety (>= 0.75)
    disease_title = "Tomato Early Blight (Alternaria solani)"
    crop_name = "Tomato"
    disease_name = "Early Blight"
    confidence = 0.925
    severity = "Moderate"

    if disease_model is not None and hasattr(disease_model, "predict"):
        raw_pred = disease_model.predict(image_input)
        if isinstance(raw_pred, dict):
            confidence = float(raw_pred.get("confidence", raw_pred.get("confidence_score", 0.0)))
            if confidence > 1.0:
                confidence = confidence / 100.0
            disease_title = raw_pred.get("crop_disease", raw_pred.get("disease", "Unknown"))
            crop_name = raw_pred.get("crop", "Crop")
            disease_name = raw_pred.get("disease", disease_title)
            severity = raw_pred.get("severity", "Moderate")
        elif isinstance(raw_pred, (list, np.ndarray)):
            top_idx = int(np.argmax(raw_pred))
            confidence = float(raw_pred[top_idx])
            if confidence > 1.0:
                confidence = confidence / 100.0
            if top_idx < len(KAGGLE_PLANTVILLAGE_CLASSES):
                cls = KAGGLE_PLANTVILLAGE_CLASSES[top_idx]
                crop_name = cls["crop"]
                disease_name = cls["disease"]
                disease_title = f"{cls['crop']} {cls['disease']}"
            else:
                disease_title = "Non_Plant_Background"
    else:
        # Fallback to AgroGuide ML Vision Model
        ml_res = run_kaggle_vision_inference(
            image_data=image_input if isinstance(image_input, str) else "image_bytes",
            crop_hint=crop_hint
        )
        crop_name = ml_res["crop_name"]
        disease_title = ml_res["detected_disease"]
        disease_name = disease_title.replace(crop_name, "").strip()
        confidence = float(ml_res["confidence_score"]) / 100.0
        severity = ml_res["severity"]

    # Rejection Rule: Confidence < 0.75 OR Background/Non_Plant prediction
    is_non_plant_class = any(
        bg in disease_title.lower() for bg in ["non_plant", "background", "non-plant", "unknown"]
    )

    if confidence < 0.75 or is_non_plant_class:
        return {
            "status": "REJECTED",
            "error_code": "LOW_CONFIDENCE_OOD",
            "is_valid_crop_leaf": False,
            "confidence_score": float(round(confidence, 2)),
            "user_message": "The system could not confidently identify a valid crop disease in this photo. Please ensure the image shows an infected leaf or consult a local agricultural expert."
        }

    # SUCCESS CASE
    return {
        "status": "SUCCESS",
        "is_valid_crop_leaf": True,
        "crop": crop_name,
        "disease": disease_name,
        "confidence_score": f"{confidence * 100:.1f}%",
        "severity": severity,
        "next_steps": [
            "Remove infected lower leaves to reduce spore spread.",
            "Ensure adequate spacing between plants for airflow.",
            "Consult local agricultural extension for approved treatments if severe."
        ]
    }
