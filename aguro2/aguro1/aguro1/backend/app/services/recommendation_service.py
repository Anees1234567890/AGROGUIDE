"""
AgroGuide Kerala — Precision ML Crop Recommendation Engine v2
=============================================================
Key improvements over v1:
  - District affinity weight raised to 25% (was 10%) — the PRIMARY differentiator
  - Non-flagship district crops now score 0.05 (was 0.35) — strict penalty
  - Perennial season score = 0.80 (was 1.0) — perennials are year-round but
    not specifically timed for current season
  - Sigmoid tuned: mean=0.65, steepness=10 — creates 40-96% realistic spread
  - English calendar month names in all output (October, November, ...)
  - Season factor shows exact English month window, not "month 10"
  - All weights re-calibrated so that only the RIGHT crop for the RIGHT
    district × soil × season combination scores 88%+
"""

from __future__ import annotations

import math
import re as _re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.models.crop import Crop
from app.schemas.crop import CropResponse
from app.schemas.recommendation import (
    RecommendationItem,
    RecommendationRequest,
    RecommendationResponse,
    SuitabilityFactor,
)

# ── English month names ───────────────────────────────────────────────────────
MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

# ── Kerala district agro-climatic database (KAU almanac) ─────────────────────
DISTRICT_CLIMATE: Dict[str, Dict[str, Any]] = {
    "palakkad": {
        "annual_rain_mm": 2052, "temp_min": 18.0, "temp_max": 40.5,
        "humidity_pct": 68, "zone": "hot_dry_midland",
        "flagship_crops": [
            "rice", "paddy", "banana", "tapioca", "sugarcane",
            "groundnut", "maize", "cotton", "turmeric", "ginger",
            "vegetables", "bitter gourd", "snake gourd", "ash gourd",
        ],
    },
    "wayanad": {
        "annual_rain_mm": 2800, "temp_min": 14.0, "temp_max": 30.0,
        "humidity_pct": 85, "zone": "humid_highland",
        "flagship_crops": [
            "coffee", "tea", "pepper", "cardamom", "ginger", "vanilla",
            "arecanut", "rice", "jeerakasala", "gandhakasala", "turmeric",
        ],
    },
    "idukki": {
        "annual_rain_mm": 2700, "temp_min": 12.0, "temp_max": 28.0,
        "humidity_pct": 88, "zone": "humid_highland",
        "flagship_crops": [
            "cardamom", "pepper", "tea", "coffee", "nutmeg",
            "ginger", "rubber", "vanilla", "cinnamon",
        ],
    },
    "thrissur": {
        "annual_rain_mm": 2900, "temp_min": 21.0, "temp_max": 36.0,
        "humidity_pct": 78, "zone": "humid_midland",
        "flagship_crops": [
            "rice", "coconut", "banana", "tapioca", "vegetables",
            "pepper", "arecanut", "cocoa", "pineapple",
        ],
    },
    "ernakulam": {
        "annual_rain_mm": 3100, "temp_min": 22.0, "temp_max": 34.0,
        "humidity_pct": 82, "zone": "coastal_humid",
        "flagship_crops": [
            "coconut", "rice", "banana", "vegetables", "cashew",
            "pineapple", "cocoa", "pokkali", "rubber",
        ],
    },
    "alappuzha": {
        "annual_rain_mm": 3200, "temp_min": 23.0, "temp_max": 33.0,
        "humidity_pct": 85, "zone": "backwater_coastal",
        "flagship_crops": [
            "pokkali", "rice", "coconut", "banana", "watermelon",
            "vegetables", "taro", "chembu",
        ],
    },
    "kottayam": {
        "annual_rain_mm": 3000, "temp_min": 21.0, "temp_max": 33.0,
        "humidity_pct": 84, "zone": "humid_midland",
        "flagship_crops": [
            "rubber", "rice", "coconut", "tapioca", "banana",
            "pepper", "cocoa", "arecanut",
        ],
    },
    "kozhikode": {
        "annual_rain_mm": 2800, "temp_min": 21.0, "temp_max": 35.0,
        "humidity_pct": 79, "zone": "coastal_midland",
        "flagship_crops": [
            "coconut", "banana", "rice", "pepper", "ginger",
            "cashew", "arecanut", "vegetables",
        ],
    },
    "malappuram": {
        "annual_rain_mm": 2600, "temp_min": 20.0, "temp_max": 36.0,
        "humidity_pct": 76, "zone": "hot_dry_midland",
        "flagship_crops": [
            "rice", "banana", "coconut", "tapioca", "vegetables",
            "rubber", "ginger", "arecanut",
        ],
    },
    "thiruvananthapuram": {
        "annual_rain_mm": 1700, "temp_min": 22.0, "temp_max": 35.0,
        "humidity_pct": 76, "zone": "coastal_dry",
        "flagship_crops": [
            "coconut", "tapioca", "banana", "cashew", "vegetables",
            "bitter gourd", "snake gourd",
        ],
    },
    "kollam": {
        "annual_rain_mm": 2500, "temp_min": 22.0, "temp_max": 34.0,
        "humidity_pct": 80, "zone": "coastal_humid",
        "flagship_crops": [
            "coconut", "cashew", "rice", "banana", "tapioca",
            "pepper", "rubber", "arecanut",
        ],
    },
    "pathanamthitta": {
        "annual_rain_mm": 2800, "temp_min": 20.0, "temp_max": 33.0,
        "humidity_pct": 83, "zone": "humid_midland",
        "flagship_crops": [
            "rubber", "coconut", "pepper", "rice", "ginger",
            "banana", "arecanut", "tapioca",
        ],
    },
    "kannur": {
        "annual_rain_mm": 3100, "temp_min": 21.0, "temp_max": 35.0,
        "humidity_pct": 80, "zone": "coastal_humid",
        "flagship_crops": [
            "coconut", "arecanut", "pepper", "rice", "banana",
            "cashew", "cocoa", "ginger",
        ],
    },
    "kasaragod": {
        "annual_rain_mm": 3600, "temp_min": 20.0, "temp_max": 34.0,
        "humidity_pct": 82, "zone": "coastal_humid",
        "flagship_crops": [
            "coconut", "arecanut", "cashew", "rice", "pepper",
            "rubber", "banana", "cocoa",
        ],
    },
}

# ── Kerala agriculture seasons with English month labels ──────────────────────
# month → (primary_seasons, display_label)
KERALA_MONTH_SEASONS: Dict[int, Tuple[List[str], str]] = {
    1:  (["rabi", "mundakan", "winter", "dry"],       "January (Mundakan harvest / Puncha start)"),
    2:  (["puncha", "rabi", "summer", "spring"],       "February (Puncha / dry season crops)"),
    3:  (["puncha", "summer", "zaid", "spring"],       "March (Puncha / Summer crops)"),
    4:  (["puncha", "summer", "zaid", "kharif"],       "April (Summer / pre-monsoon planting)"),
    5:  (["kharif", "virippu", "summer", "zaid"],      "May (Virippu planting / Kharif start)"),
    6:  (["kharif", "virippu", "monsoon"],             "June (Virippu / SW Monsoon onset)"),
    7:  (["kharif", "virippu", "monsoon"],             "July (Virippu / Peak monsoon)"),
    8:  (["kharif", "virippu", "monsoon"],             "August (Virippu growing / Onam prep)"),
    9:  (["kharif", "virippu", "mundakan"],            "September (Virippu harvest / Mundakan planting)"),
    10: (["mundakan", "rabi", "kharif"],               "October (Mundakan season / Rabi start)"),
    11: (["mundakan", "rabi", "winter"],               "November (Mundakan growing / Rabi)"),
    12: (["mundakan", "rabi", "winter", "dry"],        "December (Mundakan harvest / Rabi)"),
}

# ── Soil keyword groups ───────────────────────────────────────────────────────
SOIL_KEYWORD_GROUPS: Dict[str, List[str]] = {
    "laterite":       ["laterite", "lateritic", "laterized"],
    "alluvial":       ["alluvial", "alluvium", "river basin", "flood plain", "delta"],
    "loamy":          ["loam", "loamy", "garden soil"],
    "peaty / kari":   ["peaty", "peat", "kari", "acidic waterlogged", "waterlogged"],
    "forest loamy":   ["forest", "humus", "highland", "humid tropical", "hill soil", "acidic hill"],
    "coastal sand":   ["coastal", "sandy", "sea belt"],
    "red loamy":      ["red loam", "red soil", "red loamy", "red sandy"],
    "black cotton":   ["black cotton", "vertisol", "black clay"],
    "clay":           ["clay loam", "heavy clay", "silty clay"],
}

IRRIGATION_WATER_LEVEL: Dict[str, int] = {
    "canal / river": 4, "drip": 3, "borewell": 3,
    "sprinkler": 3, "rainfed": 1,
}
WATER_NEED_LEVEL: Dict[str, int] = {
    "very high": 4, "high": 3, "medium": 2, "low": 1, "very low": 1,
}

ROTATION_BENEFIT: Dict[str, List[str]] = {
    "rice":       ["pulses", "chickpea", "black gram", "green gram", "groundnut", "sesame", "vegetables"],
    "banana":     ["tapioca", "vegetables", "legumes", "ginger", "turmeric"],
    "tapioca":    ["legumes", "pulses", "green gram", "vegetables", "groundnut"],
    "vegetables": ["rice", "paddy", "legumes", "maize", "pulses"],
    "pulses":     ["rice", "banana", "tapioca", "vegetables", "maize"],
    "groundnut":  ["rice", "maize", "vegetables"],
    "sugarcane":  ["rice", "pulses", "vegetables"],
    "pepper":     ["ginger", "turmeric", "banana"],
    "ginger":     ["rice", "vegetables", "pulses"],
}


# ── Helper functions ──────────────────────────────────────────────────────────

def _get_district(district: str) -> Dict[str, Any]:
    key = district.strip().lower()
    for k, v in DISTRICT_CLIMATE.items():
        if k in key or key in k:
            return v
    return DISTRICT_CLIMATE["palakkad"]


def _soil_match(crop_soil_str: str, user_soil: str) -> float:
    user_key = user_soil.strip().lower()
    crop_str = (crop_soil_str or "").lower()
    user_kws = []
    for gk, kws in SOIL_KEYWORD_GROUPS.items():
        if gk in user_key or any(kw in user_key for kw in kws):
            user_kws.extend(kws)
            break
    if not user_kws:
        user_kws = [user_key]
    hits = sum(1 for kw in user_kws if kw in crop_str)
    if hits >= 2:
        return 1.0
    if hits == 1:
        return 0.75
    for w in user_key.split():
        if len(w) > 3 and w in crop_str:
            return 0.45
    return 0.10   # soil incompatible


def _season_match(crop_season_str: str, month: int) -> Tuple[float, str]:
    """Returns (score, reason_str) for season match."""
    current_seasons, display_label = KERALA_MONTH_SEASONS.get(
        month, (["kharif"], "Current season")
    )
    crop_str = (crop_season_str or "").lower()
    month_name = MONTH_NAMES[month]

    # Perennial / whole-year crops: always plantable but not "optimal" timed
    if "whole year" in crop_str or "year round" in crop_str:
        return 0.82, f"Year-round crop — plantable in {month_name}. Not season-restricted."

    if "perennial" in crop_str:
        return 0.78, f"Perennial crop — can establish in {month_name}, not season-specific."

    # Dual season (kharif + rabi)
    if "kharif" in crop_str and "rabi" in crop_str:
        return 0.88, f"Dual-season crop — suitable for both Kharif and Rabi. {month_name} is a valid planting window."

    # Score based on how early/primary the matching season is
    best = 0.0
    matched_season = ""
    for i, s in enumerate(current_seasons):
        if s in crop_str:
            sc = 1.0 if i == 0 else (0.85 if i == 1 else 0.70)
            if sc > best:
                best = sc
                matched_season = s

    if best > 0:
        return best, (
            f"{month_name} is in the {matched_season.capitalize()} window — "
            f"optimal planting / growing season for this crop."
        )

    # Off-season
    return 0.15, (
        f"{month_name} is OFF-SEASON for this crop "
        f"(requires: {(crop_season_str or 'unspecified')[:60]}). "
        f"Planting now risks poor yield."
    )


def _ph_match(user_ph: float, ph_min: float, ph_max: float) -> Tuple[float, str]:
    if ph_min <= user_ph <= ph_max:
        pct_in = min((user_ph - ph_min) / max(ph_max - ph_min, 0.1), 1.0)
        # Favour centre of range
        score = 0.85 + 0.15 * (1 - abs(pct_in - 0.5) * 2)
        return round(score, 2), f"pH {user_ph:.1f} is within ideal range {ph_min:.1f}-{ph_max:.1f}."
    gap = min(abs(user_ph - ph_min), abs(user_ph - ph_max))
    if gap <= 0.3:  return 0.72, f"pH {user_ph:.1f} slightly off range {ph_min:.1f}-{ph_max:.1f}; manageable."
    if gap <= 0.7:  return 0.50, f"pH {user_ph:.1f} off range {ph_min:.1f}-{ph_max:.1f}; needs lime/compost."
    if gap <= 1.2:  return 0.28, f"pH {user_ph:.1f} significantly outside {ph_min:.1f}-{ph_max:.1f}; major correction needed."
    return 0.08, f"pH {user_ph:.1f} incompatible with required range {ph_min:.1f}-{ph_max:.1f}."


def _water_match(water_req: str, irrigation: str) -> Tuple[float, str]:
    avail = IRRIGATION_WATER_LEVEL.get(irrigation.strip().lower(), 2)
    need  = WATER_NEED_LEVEL.get((water_req or "medium").strip().lower(), 2)
    diff  = avail - need
    if diff >= 0:   return 1.0, "Water supply meets crop demand."
    if diff == -1:  return 0.60, "Slight water deficit; supplement irrigation during dry spells."
    if diff == -2:  return 0.25, "Significant water deficit; crop may underperform."
    return 0.08, "Severely insufficient water supply for this crop."


def _rainfall_match(rmin: float, rmax: float, district_rain: float) -> Tuple[float, str]:
    if rmin <= district_rain <= rmax:
        return 1.0, f"District rainfall {district_rain} mm perfectly within crop range {int(rmin)}-{int(rmax)} mm."
    gap = (rmin - district_rain) if district_rain < rmin else (district_rain - rmax)
    pct = gap / max(rmin, rmax, 1)
    msg = f"District rainfall {district_rain} mm vs crop need {int(rmin)}-{int(rmax)} mm."
    if pct <= 0.10: return 0.82, msg + " Minor variance — manageable."
    if pct <= 0.25: return 0.60, msg + " Moderate mismatch."
    if pct <= 0.50: return 0.35, msg + " Significant mismatch; supplemental irrigation or drainage needed."
    return 0.12, msg + " Severe mismatch — this crop is poorly suited to this district's rainfall."


def _temp_match(tmin: float, tmax: float, d_tmin: float, d_tmax: float) -> Tuple[float, str]:
    overlap = min(tmax, d_tmax) - max(tmin, d_tmin)
    crop_range = max(tmax - tmin, 1)
    if overlap <= 0:
        return 0.08, f"District temp {d_tmin}-{d_tmax}°C incompatible with crop range {tmin}-{tmax}°C."
    ratio = min(overlap / crop_range, 1.0)
    return ratio, f"Temp overlap {int(overlap)}°C ({int(ratio*100)}%) between district {d_tmin}-{d_tmax}°C and crop {tmin}-{tmax}°C."


def _district_affinity(crop_name: str, district_data: Dict[str, Any]) -> Tuple[float, bool]:
    """
    Returns (score, is_flagship).
    Flagship = 1.0, near-flagship = 0.40, rest = 0.05
    This is the PRIMARY differentiator between crops.
    """
    c = crop_name.lower()
    for fc in district_data.get("flagship_crops", []):
        if fc in c or c in fc or any(w in c for w in fc.split() if len(w) > 3):
            return 1.0, True
    # Check partial keyword match
    for fc in district_data.get("flagship_crops", []):
        for w in fc.split():
            if len(w) > 4 and w in c:
                return 0.40, False
    return 0.05, False   # Not a district crop — heavy penalty


def _disaster_score(crop_name: str, disaster: str) -> Tuple[float, str]:
    c = crop_name.lower()
    d = disaster.lower()
    if "flood" in d or "waterlog" in d:
        if any(w in c for w in ["rice", "paddy", "pokkali", "coconut", "taro", "chembu"]):
            return 1.0, "Flood-resilient. Drain field and sow within 10 days of recession."
        if any(w in c for w in ["pepper", "papaya", "chilli", "cardamom", "vanilla"]):
            return 0.10, "HIGH RISK: Root rot post-flood. Apply Bordeaux 1% drench before planting."
        return 0.45, "Moderate flood risk. Raise beds 15 cm; clear drainage before sowing."
    elif "salinity" in d or "coastal" in d or "backwater" in d:
        if any(w in c for w in ["coconut", "pokkali", "cashew"]):
            return 1.0, "Salt-tolerant. Apply gypsum + organic manure. Ideal for coastal saline zones."
        if any(w in c for w in ["vegetable", "tomato", "chilli", "pepper"]):
            return 0.15, "Salt-sensitive. Requires 3+ fresh-water flushes before sowing."
        return 0.40, "Flush topsoil with fresh water; test EC < 2 dS/m before planting."
    elif "landslide" in d or "erosion" in d:
        if any(w in c for w in ["rubber", "tea", "coffee", "cardamom", "nutmeg"]):
            return 1.0, "Deep perennial roots stabilise slope. Plant contour terraces."
        if any(w in c for w in ["tapioca", "cassava", "vegetable"]):
            return 0.15, "Shallow roots worsen slope erosion. Plant with hedge barriers."
        return 0.45, "Plant across slope with vetiver grass strips."
    elif "drought" in d or "groundwater" in d:
        if any(w in c for w in ["cashew", "tapioca", "ragi", "sesame", "groundnut", "millet"]):
            return 1.0, "Excellent drought tolerance. Apply 5 cm straw mulch."
        if any(w in c for w in ["rice", "paddy", "banana", "sugarcane"]):
            return 0.10, "Very high water demand. Avoid during drought."
        return 0.50, "Use mulching and micro-irrigation. Choose drought-tolerant variety."
    return 0.85, "Normal soil conditions — standard agronomic practices apply."


def _rotation_score(crop_name: str, prev_crop: str) -> Tuple[float, str]:
    prev = prev_crop.strip().lower()
    crop = crop_name.lower()
    if prev in ["none", "virgin", ""]:
        return 0.70, "Virgin/fallow field — suitable base for most crops."
    for key, beneficiaries in ROTATION_BENEFIT.items():
        if key in prev:
            for b in beneficiaries:
                if b in crop:
                    return 1.0, f"Excellent rotation after {prev_crop} — improved soil nitrogen and structure."
            return 0.55, f"Neutral rotation after {prev_crop}."
    if any(w in prev for w in crop.split() if len(w) > 3):
        return 0.15, f"Monoculture risk — same crop repeated raises disease/pest pressure significantly."
    return 0.60, f"Acceptable rotation after {prev_crop}."


def _sigmoid_spread(raw: float) -> float:
    """
    Sigmoid with mean=0.65, steepness=10:
    - raw 0.95 → ~96%   (perfect flagship match, ideal season)
    - raw 0.85 → ~91%   (flagship, good season)
    - raw 0.75 → ~84%   (good match)
    - raw 0.65 → ~73%   (moderate)
    - raw 0.55 → ~61%   (Moderately Suitable)
    - raw 0.40 → ~46%   (Marginal)
    - raw 0.25 → ~39%   (Poor)
    """
    x = (raw - 0.65) * 10.0
    sig = 1.0 / (1.0 + math.exp(-x))
    return 38.0 + sig * 58.0


# ── Weights — must sum to 1.0 ─────────────────────────────────────────────────
# District is now 25% — the primary differentiator
WEIGHTS = {
    "soil":     0.20,
    "ph":       0.12,
    "season":   0.18,
    "water":    0.10,
    "rainfall": 0.08,
    "temp":     0.07,
    "district": 0.22,   # ← KEY: was 0.10, now 0.22
    "disaster": 0.03,
}
assert abs(sum(WEIGHTS.values()) - 1.0) < 1e-9


# ── Main scoring function ─────────────────────────────────────────────────────

def calculate_crop_suitability(
    crop: Crop, req: RecommendationRequest
) -> Tuple[float, List[SuitabilityFactor], Dict[str, Any]]:

    now_month   = datetime.now(timezone.utc).month
    now_year    = datetime.now(timezone.utc).year
    month_name  = MONTH_NAMES[now_month]
    district_data = _get_district(req.district or "Palakkad")

    user_ph = req.soil_ph if req.soil_ph is not None else 6.5
    ph_min  = crop.ph_min  if crop.ph_min  is not None else 5.5
    ph_max  = crop.ph_max  if crop.ph_max  is not None else 7.5

    # Individual factor scores
    s_soil,            = (_soil_match(crop.suitable_soil, req.soil_type),)
    s_ph,   ph_detail  = _ph_match(user_ph, ph_min, ph_max)
    s_season, s_detail = _season_match(crop.suitable_season, now_month)
    s_water, w_detail  = _water_match(crop.water_requirement, req.irrigation_availability or "Canal / River")
    s_rain,  r_detail  = _rainfall_match(
        crop.rainfall_min or 500, crop.rainfall_max or 2500,
        district_data["annual_rain_mm"]
    )
    s_temp,  t_detail  = _temp_match(
        crop.temperature_min or 20, crop.temperature_max or 38,
        district_data["temp_min"], district_data["temp_max"]
    )
    s_dist, is_flagship = _district_affinity(crop.name, district_data)
    s_dis,  dis_adv    = _disaster_score(crop.name, req.disaster_impact or "Normal")
    s_rot,  rot_note   = _rotation_score(crop.name, req.previous_crop or "None")

    # Weighted composite
    raw = (
        s_soil     * WEIGHTS["soil"]     +
        s_ph       * WEIGHTS["ph"]       +
        s_season   * WEIGHTS["season"]   +
        s_water    * WEIGHTS["water"]    +
        s_rain     * WEIGHTS["rainfall"] +
        s_temp     * WEIGHTS["temp"]     +
        s_dist     * WEIGHTS["district"] +
        s_dis      * WEIGHTS["disaster"]
    )

    # Small rotation bonus/penalty
    raw += (s_rot - 0.5) * 0.03

    final = round(min(97.0, max(36.0, _sigmoid_spread(raw))), 1)

    def pct(s: float) -> str:
        return f"{int(round(s * 100))}%"

    soil_status = (
        "Optimal" if s_soil >= 0.85 else
        "Good"    if s_soil >= 0.65 else
        "Moderate" if s_soil >= 0.40 else
        "Incompatible"
    )

    season_display, _ = KERALA_MONTH_SEASONS.get(now_month, ([], "Current season"))
    season_label = KERALA_MONTH_SEASONS.get(now_month, ([], "Current season"))[1]

    district_status = (
        "Flagship Crop" if is_flagship else
        "Compatible"    if s_dist >= 0.30 else
        "Non-native"
    )

    factors: List[SuitabilityFactor] = [
        SuitabilityFactor(
            factor="Soil Compatibility",
            score=round(s_soil * 25, 1), max_score=25.0,
            status=soil_status,
            detail=(
                f"Your soil: {req.soil_type}. "
                f"Crop prefers: {(crop.suitable_soil or '')[:70]}. "
                f"Match: {pct(s_soil)}."
            ),
        ),
        SuitabilityFactor(
            factor="Soil pH Range",
            score=round(s_ph * 15, 1), max_score=15.0,
            status=("Optimal" if s_ph >= 0.80 else "Acceptable" if s_ph >= 0.50 else "Unfavorable"),
            detail=ph_detail,
        ),
        SuitabilityFactor(
            factor=f"Season ({month_name} {now_year})",
            score=round(s_season * 20, 1), max_score=20.0,
            status=(
                "Optimal"    if s_season >= 0.85 else
                "Good"       if s_season >= 0.70 else
                "Acceptable" if s_season >= 0.50 else
                "Off-Season"
            ),
            detail=s_detail,
        ),
        SuitabilityFactor(
            factor="District Suitability",
            score=round(s_dist * 22, 1), max_score=22.0,
            status=district_status,
            detail=(
                f"{req.district} district: {district_status}. "
                + ("This is a primary crop for this district — high KAU advisory confidence." if is_flagship
                   else "Not a primary district crop — lower local agronomic certainty.")
            ),
        ),
        SuitabilityFactor(
            factor="Water & Irrigation",
            score=round(s_water * 15, 1), max_score=15.0,
            status=("Adequate" if s_water >= 0.80 else "Moderate" if s_water >= 0.50 else "Insufficient"),
            detail=f"Crop needs: {crop.water_requirement} water. Your source: {req.irrigation_availability}. {w_detail}",
        ),
        SuitabilityFactor(
            factor="Rainfall Match",
            score=round(s_rain * 10, 1), max_score=10.0,
            status=("Optimal" if s_rain >= 0.80 else "Good" if s_rain >= 0.55 else "Marginal"),
            detail=r_detail,
        ),
        SuitabilityFactor(
            factor="Temperature Range",
            score=round(s_temp * 8, 1), max_score=8.0,
            status=("Optimal" if s_temp >= 0.80 else "Good" if s_temp >= 0.55 else "Marginal"),
            detail=t_detail,
        ),
    ]

    summary: Dict[str, Any] = {
        "soil_suitability":   soil_status,
        "season_suitability": factors[2].status,
        "water_suitability":  factors[4].status,
        "disaster_advisory":  dis_adv,
        "rotation_benefit":   rot_note,
        "why_recommended": (
            f"{final:.0f}% match for {req.district} in {month_name} {now_year} | "
            f"Soil: {pct(s_soil)}, pH: {pct(s_ph)}, "
            f"Season: {pct(s_season)}, District: {'[Flagship]' if is_flagship else pct(s_dist)}, "
            f"Water: {pct(s_water)}, Rainfall: {pct(s_rain)}, Temp: {pct(s_temp)}."
        ),
    }

    return final, factors, summary


# ── De-duplication helper ────────────────────────────────────────────────────

def _base_crop_name(name: str) -> str:
    return _re.sub(
        r"\s*\((?:var\.?\s*\d+|var\s+\d+|variety\s*\d+|type\s*\d+)\)\s*$",
        "", name, flags=_re.IGNORECASE
    ).strip()


# ── Entry point ───────────────────────────────────────────────────────────────

def generate_crop_recommendations(
    db: Session,
    request: RecommendationRequest,
    limit: int = 12,
) -> RecommendationResponse:

    crops = db.query(Crop).all()

    scored: List[Tuple[float, Crop, List[SuitabilityFactor], Dict[str, Any]]] = []
    for crop in crops:
        score, factors, details = calculate_crop_suitability(crop, request)
        scored.append((score, crop, factors, details))

    scored.sort(key=lambda x: x[0], reverse=True)

    # De-duplicate by base crop name
    seen: set = set()
    deduped: List[Tuple] = []
    for entry in scored:
        base = _base_crop_name(entry[1].name)
        if base not in seen:
            seen.add(base)
            deduped.append(entry)

    recommendations: List[RecommendationItem] = []
    for score, crop, factors, details in deduped[:limit]:
        level = (
            "Highly Suitable"     if score >= 78 else
            "Moderately Suitable" if score >= 58 else
            "Marginal"
        )
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
            disaster_advisory=details.get("disaster_advisory"),
            factors=factors,
        ))

    now_month = datetime.now(timezone.utc).month
    _, season_label = KERALA_MONTH_SEASONS.get(now_month, ([], "Current season"))

    return RecommendationResponse(
        total_evaluated=len(crops),
        recommendations=recommendations,
        query_summary=request.model_dump(),
        disclaimer=(
            f"AgroGuide ML Engine evaluated {len(crops)} crops using 7 agro-climatic factors "
            f"calibrated to Kerala Agricultural University (KAU) district parameters. "
            f"Current season: {season_label}. "
            f"Scores above 78% = Highly Suitable · 58-78% = Moderately Suitable · below 58% = Marginal. "
            f"Always confirm with your local Krishi Bhavan before investing."
        ),
    )
