from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.crop import Crop
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationItem,
    RecommendationResponse,
    SuitabilityFactor,
)
from app.schemas.crop import CropResponse

# Soil compatibility matrix
SOIL_COMPATIBILITY_MAP = {
    "Alluvial": ["Rice", "Wheat", "Sugarcane", "Maize", "Cotton", "Jute", "Banana", "Tomato", "Potato", "Mustard", "Chilli", "Onion", "Brinjal", "Tapioca"],
    "Black": ["Cotton", "Soybean", "Sorghum", "Wheat", "Chickpea", "Groundnut", "Sunflower", "Chilli", "Onion", "Millets", "Pigeon Pea", "Sesame"],
    "Red": ["Groundnut", "Ragi", "Maize", "Pulses", "Millets", "Tobacco", "Potato", "Tomato", "Brinjal", "Mango", "Cashew", "Cassava"],
    "Laterite": ["Tea", "Coffee", "Rubber", "Coconut", "Arecanut", "Cardamom", "Black Pepper", "Cashew", "Tapioca", "Pineapple", "Ginger", "Turmeric", "Nutmeg"],
    "Clay": ["Rice", "Wheat", "Sugarcane", "Jute", "Broccoli", "Cabbage", "Cauliflower", "Lotus Root"],
    "Loamy": ["All", "Tomato", "Potato", "Carrot", "Radish", "Spinach", "Cucumber", "Banana", "Papaya", "Ginger", "Turmeric", "Garlic", "Beans", "Peas"],
    "Sandy": ["Watermelon", "Muskmelon", "Groundnut", "Sweet Potato", "Carrot", "Radish", "Cucumber", "Coconut"]
}

# Crop rotation compatibility (previous crop -> beneficial following crops)
CROP_ROTATION_BENEFITS = {
    "Rice": ["Pulses", "Chickpea", "Black Gram", "Green Gram", "Groundnut", "Mustard", "Sesame", "Vegetables"],
    "Wheat": ["Soybean", "Green Gram", "Maize", "Cotton", "Groundnut", "Cowpea"],
    "Maize": ["Chickpea", "Lentil", "Wheat", "Mustard", "Potato"],
    "Cotton": ["Wheat", "Chickpea", "Sorghum", "Groundnut"],
    "Pulses": ["Rice", "Wheat", "Maize", "Sugarcane", "Banana", "Vegetables"],
    "Groundnut": ["Wheat", "Sorghum", "Pearl Millet", "Rice", "Maize"],
    "Sugarcane": ["Pulses", "Green Gram", "Cowpea", "Vegetables"],
    "Banana": ["Tapioca", "Vegetables", "Legumes", "Ginger"],
}


def calculate_crop_suitability(crop: Crop, req: RecommendationRequest) -> Tuple[float, List[SuitabilityFactor], Dict[str, str]]:
    factors: List[SuitabilityFactor] = []
    total_score = 0.0

    # 1. Soil Compatibility (Weight: 25%)
    soil_weight = 25.0
    soil_score = 0.0
    soil_status = "Moderate"
    crop_suitable_soils = [s.strip().lower() for s in crop.suitable_soil.split(",")]
    req_soil = req.soil_type.strip().lower()

    matched = False
    for s in crop_suitable_soils:
        if req_soil in s or s in req_soil or "all" in s or "loam" in req_soil:
            matched = True
            break

    if matched:
        soil_score = 25.0
        soil_status = "Optimal"
        soil_detail = f"{req.soil_type} soil is an ideal match for {crop.name} cultivation."
    elif req.soil_type in ["Loamy", "Alluvial"]:
        soil_score = 20.0
        soil_status = "Good"
        soil_detail = f"{req.soil_type} soil supports {crop.name} with standard organic amendment."
    else:
        soil_score = 10.0
        soil_status = "Marginal"
        soil_detail = f"{crop.name} typically prefers {crop.suitable_soil}; requires soil enhancement."

    total_score += soil_score
    factors.append(SuitabilityFactor(
        factor="Soil Compatibility",
        score=soil_score,
        max_score=soil_weight,
        status=soil_status,
        detail=soil_detail
    ))

    # 2. Season Match (Weight: 25%)
    season_weight = 25.0
    season_score = 0.0
    season_status = "Moderate"
    crop_seasons = [s.strip().lower() for s in crop.suitable_season.split(",")]
    req_season = req.season.strip().lower()

    if any(req_season in cs or cs in req_season or "whole year" in cs or "perennial" in cs or "all season" in cs for cs in crop_seasons):
        season_score = 25.0
        season_status = "Optimal"
        season_detail = f"Current season ({req.season}) matches planting calendar for {crop.name}."
    elif "zaid" in req_season and ("summer" in crop.suitable_season.lower() or "kharif" in crop.suitable_season.lower()):
        season_score = 18.0
        season_status = "Moderate"
        season_detail = f"Can be grown in {req.season} with adequate irrigation access."
    else:
        season_score = 8.0
        season_status = "Off-Season"
        season_detail = f"Planting in {req.season} is off-cycle for {crop.name} ({crop.suitable_season})."

    total_score += season_score
    factors.append(SuitabilityFactor(
        factor="Season Match",
        score=season_score,
        max_score=season_weight,
        status=season_status,
        detail=season_detail
    ))

    # 3. Soil pH Compatibility (Weight: 15%)
    ph_weight = 15.0
    ph_score = 0.0
    ph_status = "Moderate"
    user_ph = req.soil_ph if req.soil_ph is not None else 6.5
    min_ph = crop.ph_min if crop.ph_min is not None else 5.5
    max_ph = crop.ph_max if crop.ph_max is not None else 7.5

    if min_ph <= user_ph <= max_ph:
        ph_score = 15.0
        ph_status = "Optimal"
        ph_detail = f"Soil pH {user_ph:.1f} falls in the ideal range ({min_ph:.1f} - {max_ph:.1f})."
    elif abs(user_ph - min_ph) <= 0.8 or abs(user_ph - max_ph) <= 0.8:
        ph_score = 10.0
        ph_status = "Acceptable"
        ph_detail = f"Soil pH {user_ph:.1f} is slightly outside optimal ({min_ph:.1f} - {max_ph:.1f}); manageable with lime/gypsum."
    else:
        ph_score = 4.0
        ph_status = "Unfavorable"
        ph_detail = f"Soil pH {user_ph:.1f} requires significant conditioning for {crop.name}."

    total_score += ph_score
    factors.append(SuitabilityFactor(
        factor="Soil pH Range",
        score=ph_score,
        max_score=ph_weight,
        status=ph_status,
        detail=ph_detail
    ))

    # 4. Irrigation & Water Requirement (Weight: 20%)
    water_weight = 20.0
    water_score = 0.0
    water_status = "Moderate"
    crop_water = crop.water_requirement.lower()
    irrigation = req.irrigation_availability.lower()

    if "drip" in irrigation or "canal" in irrigation or "borewell" in irrigation or "sprinkler" in irrigation:
        if "high" in crop_water or "very high" in crop_water:
            water_score = 20.0 if "canal" in irrigation or "borewell" in irrigation else 17.0
            water_status = "Optimal"
            water_detail = f"Irrigation facility ({req.irrigation_availability}) supports {crop.name}'s {crop.water_requirement} water demand."
        else:
            water_score = 20.0
            water_status = "Optimal"
            water_detail = f"Irrigation setup provides controlled moisture for {crop.name}."
    else:  # Rainfed
        if "low" in crop_water:
            water_score = 19.0
            water_status = "Good"
            water_detail = f"{crop.name} is drought tolerant and thrives under rainfed conditions."
        elif "medium" in crop_water:
            water_score = 14.0
            water_status = "Moderate"
            water_detail = f"Sufficient during normal monsoon; moisture stress possible in dry spells."
        else:
            water_score = 6.0
            water_status = "Risk of Deficit"
            water_detail = f"{crop.name} has high water requirements; supplemental irrigation strongly advised."

    total_score += water_score
    factors.append(SuitabilityFactor(
        factor="Water & Irrigation",
        score=water_score,
        max_score=water_weight,
        status=water_status,
        detail=water_detail
    ))

    # 5. Crop Rotation & Agro-Ecological Compatibility (Weight: 15%)
    rotation_weight = 15.0
    rotation_score = 10.0  # base
    rotation_status = "Neutral"
    rotation_detail = f"Standard agronomic suitability for {req.district}, {req.state}."

    prev = req.previous_crop.strip() if req.previous_crop else ""
    if prev and prev != "None":
        beneficial_following = CROP_ROTATION_BENEFITS.get(prev, [])
        if any(b.lower() in crop.name.lower() or b.lower() in crop.category.lower() for b in beneficial_following):
            rotation_score = 15.0
            rotation_status = "Excellent Rotation"
            rotation_detail = f"Planting {crop.name} after {prev} restores soil fertility and breaks pest cycles."
        elif prev.lower() == crop.name.lower():
            rotation_score = 5.0
            rotation_status = "Monoculture Risk"
            rotation_detail = f"Continuous planting of {crop.name} increases pest/pathogen buildup. Consider rotation."
        else:
            rotation_score = 11.0
            rotation_status = "Compatible"
            rotation_detail = f"Rotation from {prev} to {crop.name} is agronomically viable."
    else:
        rotation_score = 12.0

    total_score += rotation_score
    factors.append(SuitabilityFactor(
        factor="Crop Rotation & Ecology",
        score=rotation_score,
        max_score=rotation_weight,
        status=rotation_status,
        detail=rotation_detail
    ))

    # Determine qualitative level
    final_score = min(100.0, max(0.0, round(total_score, 1)))
    if final_score >= 80.0:
        level = "Highly Suitable"
    elif final_score >= 60.0:
        level = "Moderately Suitable"
    else:
        level = "Marginal"

    summary_details = {
        "soil_suitability": soil_status,
        "season_suitability": season_status,
        "water_suitability": water_status,
        "rotation_benefit": rotation_detail if prev and prev != "None" else "Standard rotation",
        "why_recommended": f"Evaluated {final_score:.0f}% match based on {req.soil_type} soil, {req.season} season, and {req.irrigation_availability} water availability in {req.district}."
    }

    return final_score, factors, summary_details


def generate_crop_recommendations(
    db: Session,
    request: RecommendationRequest,
    limit: int = 12
) -> RecommendationResponse:
    crops = db.query(Crop).all()

    scored_items: List[Tuple[float, Crop, List[SuitabilityFactor], Dict[str, str]]] = []
    for crop in crops:
        score, factors, details = calculate_crop_suitability(crop, request)
        scored_items.append((score, crop, factors, details))

    # Sort descending by score
    scored_items.sort(key=lambda x: x[0], reverse=True)

    recommendations: List[RecommendationItem] = []
    for score, crop, factors, details in scored_items[:limit]:
        level = "Highly Suitable" if score >= 80 else ("Moderately Suitable" if score >= 60 else "Marginal")
        recommendations.append(RecommendationItem(
            crop=CropResponse.model_validate(crop),
            score=score,
            suitability_level=level,
            match_percentage=int(round(score)),
            why_recommended=details["why_recommended"],
            soil_suitability=details["soil_suitability"],
            season_suitability=details["season_suitability"],
            water_suitability=details["water_suitability"],
            rotation_benefit=details.get("rotation_benefit"),
            factors=factors
        ))

    return RecommendationResponse(
        total_evaluated=len(crops),
        recommendations=recommendations,
        query_summary=request.model_dump(),
        disclaimer="AgroGuide recommendations are rule-based agronomic estimates and not scientific guarantees. Confirm with your local Krishi Bhavan or agricultural officer."
    )
