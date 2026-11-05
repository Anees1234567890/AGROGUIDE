import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, backend_path)

from app.main import app

client = TestClient(app)


def test_health_and_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "AgroGuide"

    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "healthy"


def test_auth_login():
    response = client.post("/api/auth/login", json={
        "email": "farmer@agroguide.com",
        "password": "farmer123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Farmer"


def test_crops_api():
    # List crops
    response = client.get("/api/crops?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 100
    assert len(data["crops"]) == 10

    # Search crop
    search_resp = client.get("/api/crops?query=Rice")
    assert search_resp.status_code == 200
    assert len(search_resp.json()["crops"]) >= 1

    # Filter by category
    cat_resp = client.get("/api/crops?category=Spices")
    assert cat_resp.status_code == 200
    assert len(cat_resp.json()["crops"]) >= 5


def test_recommendation_engine():
    payload = {
        "state": "Kerala",
        "district": "Palakkad",
        "soil_type": "Alluvial",
        "soil_ph": 6.5,
        "season": "Kharif",
        "farm_size": 2.5,
        "irrigation_availability": "Canal / River",
        "previous_crop": "Rice (Paddy)"
    }
    response = client.post("/api/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_evaluated"] >= 100
    assert len(data["recommendations"]) > 0
    top_rec = data["recommendations"][0]
    assert "score" in top_rec
    assert "factors" in top_rec


def test_weather_api():
    response = client.get("/api/weather?location=Palakkad")
    assert response.status_code == 200
    data = response.json()
    assert data["location"] == "Palakkad"
    assert "temperature" in data
    assert len(data["daily_forecast"]) == 5


def test_market_prices_api():
    response = client.get("/api/market-prices?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 10
    assert len(data["items"]) <= 10


def test_pests_and_diseases_api():
    pests_resp = client.get("/api/pests")
    assert pests_resp.status_code == 200
    assert len(pests_resp.json()) >= 4

    diseases_resp = client.get("/api/diseases")
    assert diseases_resp.status_code == 200
    assert len(diseases_resp.json()) >= 4


def test_chat_api():
    response = client.post("/api/chat", json={
        "message": "Which crop is best for alluvial soil in Kerala?",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert len(data["suggested_questions"]) > 0
    assert "AgroGuide" in data["disclaimer"]


def test_community_api():
    # Login as farmer
    login_resp = client.post("/api/auth/login", json={
        "email": "farmer@agroguide.com",
        "password": "farmer123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get community posts
    posts_resp = client.get("/api/community/posts", headers=headers)
    assert posts_resp.status_code == 200
    posts = posts_resp.json()["posts"]
    assert len(posts) > 0

    # Create post
    new_post = client.post("/api/community/posts", json={
        "title": "Best organic fertilizer for turmeric?",
        "content": "What is the recommended dosage of neem cake and vermicompost for turmeric in sandy loam?",
        "category": "Soil"
    }, headers=headers)
    assert new_post.status_code == 201
    post_id = new_post.json()["id"]

    # Like post
    like_resp = client.post(f"/api/community/posts/{post_id}/like", headers=headers)
    assert like_resp.status_code == 200

    # Comment on post
    comment_resp = client.post(f"/api/community/posts/{post_id}/comments", json={
        "content": "Apply 10 tonnes FYM per hectare along with 2 tonnes neem cake during land preparation."
    }, headers=headers)
    assert comment_resp.status_code == 201


def test_professionals_api():
    # List experts
    resp = client.get("/api/professionals")
    assert resp.status_code == 200
    experts = resp.json()
    assert len(experts) > 0
    expert_id = experts[0]["id"]

    # Support request
    login_resp = client.post("/api/auth/login", json={
        "email": "farmer@agroguide.com",
        "password": "farmer123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    inquiry_resp = client.post("/api/support-requests", json={
        "professional_id": expert_id,
        "subject": "Soil salinity management in Kuttanad",
        "crop_name": "Rice (Paddy)",
        "message": "We observe high salinity after tides. What lime treatment is recommended?"
    }, headers=headers)
    assert inquiry_resp.status_code == 201
    assert inquiry_resp.json()["status"] == "Pending"


def test_notifications_and_farm_profile():
    # Login as farmer
    login_resp = client.post("/api/auth/login", json={
        "email": "farmer@agroguide.com",
        "password": "farmer123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch notifications
    notif_resp = client.get("/api/notifications", headers=headers)
    assert notif_resp.status_code == 200
    assert "notifications" in notif_resp.json()

    # Fetch profile
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "farmer@agroguide.com"

    # Update farm
    farm_resp = client.put("/api/auth/farm", json={
        "farm_name": "Green Valley Organic Farm",
        "farm_size": 4.5,
        "soil_type": "Laterite",
        "soil_ph": 6.2,
        "irrigation_type": "Drip Irrigation",
        "location": "Palakkad, Kerala",
        "current_season": "Kharif",
        "current_crops": "Black Pepper, Banana"
    }, headers=headers)
    assert farm_resp.status_code == 200
    assert farm_resp.json()["farm_name"] == "Green Valley Organic Farm"


def test_admin_api():
    # Login as Admin
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@agroguide.com",
        "password": "admin123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Admin stats
    stats_resp = client.get("/api/admin/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_crops"] >= 100
    assert stats["total_users"] >= 3

    # Admin users list
    users_resp = client.get("/api/admin/users", headers=headers)
    assert users_resp.status_code == 200
    assert len(users_resp.json()) >= 3


def test_agmarknet_live_api():
    # Fetch live AGMARKNET mandi feeds
    resp = client.get("/api/market-prices/agmarknet/live")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_records"] >= 10
    assert "AGMARKNET" in data["source"]

    # Filter by state
    kerala_resp = client.get("/api/market-prices/agmarknet/live?state=Kerala")
    assert kerala_resp.status_code == 200
    assert len(kerala_resp.json()["commodities"]) >= 5

    # Trigger database synchronization
    sync_resp = client.post("/api/market-prices/sync-agmarknet")
    assert sync_resp.status_code == 200
    assert sync_resp.json()["status"] == "success"


def test_pest_detection_api():
    # List sample test scans
    samples_resp = client.get("/api/pest-detection/samples")
    assert samples_resp.status_code == 200
    samples = samples_resp.json()
    assert len(samples) >= 4

    # Run AI diagnostic scan on a sample
    scan_payload = {
        "crop_name": "Rice (Paddy)",
        "plant_part": "Leaf",
        "sample_id": "sample_1"
    }
    scan_resp = client.post("/api/pest-detection/scan", json=scan_payload)
    assert scan_resp.status_code == 200
    result = scan_resp.json()
    assert "Blast" in result["detected_disease"]
    assert result["confidence_score"] > 90.0
    assert "treatment_plan" in result
    assert len(result["treatment_plan"]["organic_control"]) > 10


def test_crop_delivery_api():
    # 1. Get Freight Quote
    quote_payload = {
        "crop_name": "Nendran Banana",
        "quantity_quintals": 12.0,
        "distance_km": 40.0,
        "vehicle_type": "Eco Mini-Truck (1.5 Ton)",
        "requires_cold_chain": False
    }
    quote_resp = client.post("/api/delivery/quote", json=quote_payload)
    assert quote_resp.status_code == 200
    quote = quote_resp.json()
    assert quote["total_estimated_cost"] > 500.0
    assert quote["spoilage_risk"] in ["Perishable", "High", "Medium", "Low"]

    # 2. Book Delivery Order (as authenticated farmer)
    login_resp = client.post("/api/auth/login", json={
        "email": "farmer@agroguide.com",
        "password": "farmer123"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    order_payload = {
        "crop_name": "Tomato (Hybrid)",
        "quantity_quintals": 8.5,
        "packaging_type": "Plastic Crates",
        "pickup_address": "Green Fields Farm, Chittur, Palakkad",
        "pickup_district": "Palakkad",
        "destination_mandi": "Ottapalam APMC Mandi",
        "destination_address": "Central Vegetable Auction Hall, Ottapalam",
        "distance_km": 38.0,
        "vehicle_type": "Eco Mini-Truck (1.5 Ton)",
        "requires_cold_chain": False
    }
    order_resp = client.post("/api/delivery/orders", json=order_payload, headers=headers)
    assert order_resp.status_code == 201
    order = order_resp.json()
    assert "AGD-" in order["tracking_number"]
    assert order["status"] == "Driver Assigned"
    order_id = order["id"]

    # 3. List Farmer Orders
    my_orders_resp = client.get("/api/delivery/orders", headers=headers)
    assert my_orders_resp.status_code == 200
    assert len(my_orders_resp.json()) >= 1

    # 4. Generate Digital Mandi Gate Pass
    gate_pass_resp = client.get(f"/api/delivery/orders/{order_id}/gate-pass", headers=headers)
    assert gate_pass_resp.status_code == 200
    gate_pass = gate_pass_resp.json()
    assert "MANDI-GP-" in gate_pass["gate_pass_id"]
    assert gate_pass["vehicle_number"] != ""



