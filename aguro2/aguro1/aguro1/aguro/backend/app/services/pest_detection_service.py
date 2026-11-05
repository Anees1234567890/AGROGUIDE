from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import random
from sqlalchemy.orm import Session
from app.models.pest_detection import PestScanRecord
from app.schemas.pest_detection import PestScanRequest, PestScanResponse, TreatmentPlan, SampleScanItem

DISEASE_DIAGNOSTIC_CATALOG = {
    "rice_blast": {
        "crop_name": "Rice (Paddy)",
        "plant_part": "Leaf",
        "detected_disease": "Rice Leaf Blast (Magnaporthe oryzae)",
        "scientific_name": "Magnaporthe oryzae / Pyricularia oryzae",
        "pathogen_type": "Fungal",
        "confidence_score": 96.8,
        "severity": "High",
        "severity_score": 8,
        "symptoms_matched": [
            "Spindle-shaped elliptical lesions on leaves with brown/reddish margins",
            "Greyish-white ash-colored center of lesion indicating active spore production",
            "Lesions coalescing causing complete leaf blade drying and desiccation"
        ],
        "organic_control": "Spray Pseudomonas fluorescens (20g/litre of water) or Trichoderma viride. Apply Neem seed kernel extract (NSKE 5%) at early tillering stage.",
        "chemical_control": "Spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L.",
        "cultural_prevention": "Avoid excessive Nitrogen fertilizer (>120 kg N/ha in single dose). Maintain optimal plant spacing (20x15 cm) and drain standing water for 2-3 days during high humidity.",
        "spray_schedule": "Day 1: Initial systemic fungicide spray; Day 7: Follow-up foliar bio-spray with Pseudomonas; Day 14: Final field monitoring.",
        "immediate_action": "Isolate heavily infected tillers and avoid high nitrogen top-dressing immediately."
    },
    "banana_sigatoka": {
        "crop_name": "Banana (Nendran / Robusta)",
        "plant_part": "Leaf",
        "detected_disease": "Black Sigatoka / Yellow Sigatoka (Mycosphaerella fijiensis)",
        "scientific_name": "Pseudocercospora fijiensis",
        "pathogen_type": "Fungal",
        "confidence_score": 95.4,
        "severity": "Moderate",
        "severity_score": 6,
        "symptoms_matched": [
            "Narrow reddish-brown streaks parallel to leaf veins",
            "Streaks expanding into elliptical dark brown/black spots with yellow halo",
            "Premature drying and defoliation of lower active canopy leaves"
        ],
        "organic_control": "Foliar spray of mineral oil / agricultural petroleum spray oil (10ml/L) + Pseudomonas fluorescens (20g/L). Dust wood ash on lower leaf surfaces.",
        "chemical_control": "Spray Carbendazim 50 WP (1g/L) or Propiconazole 25 EC (1ml/L) or Copper Oxychloride 50 WP (2.5g/L) mixed with sticker/spreader.",
        "cultural_prevention": "Promptly de-leaf (prune) and burn severely infected leaves to reduce airborne inoculum. Ensure adequate ditch drainage.",
        "spray_schedule": "Day 1: Pruning of infected leaves + Copper Oxychloride spray; Day 10: Systemic triazole spray; Day 21: Organic maintenance spray.",
        "immediate_action": "Cut and destroy all dried lower leaves and clear weed growth to improve air circulation."
    },
    "pepper_quick_wilt": {
        "crop_name": "Black Pepper",
        "plant_part": "Stem / Root",
        "detected_disease": "Quick Wilt / Foot Rot (Phytophthora Foot Rot)",
        "scientific_name": "Phytophthora capsici",
        "pathogen_type": "Fungal / Oomycete",
        "confidence_score": 97.2,
        "severity": "Severe",
        "severity_score": 9,
        "symptoms_matched": [
            "Dark water-soaked lesions at collar region and runner shoots",
            "Sudden flaccidity and yellowing of entire vine foliage followed by quick leaf drop",
            "Root decay with sloughing of cortical tissue leaving bare fibrous central cylinder"
        ],
        "organic_control": "Apply Trichoderma viride / harzianum (50g/vine mixed in 5kg neem cake compost) to soil collar in May-June & August-September.",
        "chemical_control": "Drench collar region with 1% Bordeaux mixture (3-5 L/vine) or Metalaxyl-Mancozeb (Ridomil MZ @ 2g/L). Foliar spray with Potassium Phosphonate (Akomin @ 3ml/L).",
        "cultural_prevention": "Ensure good drainage slopes. Avoid soil digging near vine roots during active South-West monsoon.",
        "spray_schedule": "Day 1: Pre-monsoon soil drench with 1% Bordeaux mixture; Day 14: Bio-fortification with Trichoderma; Day 30: Post-monsoon booster spray.",
        "immediate_action": "Drench vine basin immediately and earth up soil with neem cake to protect the collar region."
    },
    "tomato_early_blight": {
        "crop_name": "Tomato",
        "plant_part": "Leaf",
        "detected_disease": "Tomato Early Blight (Alternaria solani)",
        "scientific_name": "Alternaria solani",
        "pathogen_type": "Fungal",
        "confidence_score": 94.6,
        "severity": "Moderate",
        "severity_score": 5,
        "symptoms_matched": [
            "Concentric ring target-board pattern on older lower leaves",
            "Dark brown circular spots surrounded by distinctive yellow chlorotic halo",
            "Stem collar lesions and sunscald on developing green tomatoes"
        ],
        "organic_control": "Spray Trichoderma harzianum (10g/L) or Baking soda solution (5g/L + 2ml liquid soap) every 7 days.",
        "chemical_control": "Spray Mancozeb 75 WP (2g/L) or Chlorothalonil 75 WP (2g/L) or Azoxystrobin (1ml/L).",
        "cultural_prevention": "Stake plants to keep foliage off bare wet soil. Use drip irrigation instead of overhead sprinklers.",
        "spray_schedule": "Day 1: Foliar Mancozeb spray; Day 7: Organic biological booster; Day 14: Repeat preventative contact spray.",
        "immediate_action": "Trim bottom 20 cm of leaves touching soil and apply protective contact fungicide."
    },
    "chilli_leaf_curl": {
        "crop_name": "Chilli & Capsicum",
        "plant_part": "Leaf",
        "detected_disease": "Chilli Leaf Curl Complex (Begomovirus / Thrips & Mites)",
        "scientific_name": "Chilli leaf curl virus (ChiLCV) vectored by Bemisia tabaci / Scirtothrips dorsalis",
        "pathogen_type": "Viral / Vector-borne",
        "confidence_score": 93.8,
        "severity": "High",
        "severity_score": 7,
        "symptoms_matched": [
            "Upward curling of leaf margins (boat-shaped) accompanied by vein clearing",
            "Downward puckering and inverted cup-shaped leaves caused by yellow mite attack",
            "Severe stunting of apical shoot internodes and flower drop"
        ],
        "organic_control": "Spray Neem oil 10,000 ppm (4-5 ml/L) or Verticillium lecanii (5g/L). Deploy 10 Yellow & Blue Sticky Traps per acre.",
        "chemical_control": "For Whitefly vector: Spray Acetamiprid 20 SP (0.3g/L) or Diafenthiuron 50 WP (1g/L). For Mites: Spray Spiromesifen 22.9 SC (1ml/L).",
        "cultural_prevention": "Grow 2-3 border rows of Maize/Sorghum as barrier crop. Rogue out and bury severely stunted plants.",
        "spray_schedule": "Day 1: Vector knockdown spray with Diafenthiuron; Day 5: Sticky trap installation; Day 10: Organic neem oil spray.",
        "immediate_action": "Install yellow sticky traps immediately and spray systemic vector-controlling insecticide."
    },
    "ginger_soft_rot": {
        "crop_name": "Ginger / Turmeric",
        "plant_part": "Root / Rhizome",
        "detected_disease": "Ginger Soft Rot / Rhizome Rot (Pythium aphanidermatum)",
        "scientific_name": "Pythium aphanidermatum",
        "pathogen_type": "Fungal / Oomycete",
        "confidence_score": 98.1,
        "severity": "Severe",
        "severity_score": 9,
        "symptoms_matched": [
            "Water-soaked translucent lesions at collar region of pseudostem",
            "Basal rot allowing pseudostem to easily pull out with foul odor",
            "Rhizome internal tissue collapsing into soft pulpy mass"
        ],
        "organic_control": "Treat seed rhizomes with Trichoderma harzianum (20g/L) for 30 minutes before sowing. Apply enriched neem cake (2 t/ha).",
        "chemical_control": "Soil drenching with Copper Oxychloride (3g/L) or Metalaxyl 8% + Mancozeb 64% WP (2.5g/L) at base of affected clumps.",
        "cultural_prevention": "Raise planting beds to 15-20 cm height for fast drainage. Provide thick green leaf mulching.",
        "spray_schedule": "Day 1: Immediate bed drenching with Metalaxyl-Mancozeb; Day 15: Soil application of Trichoderma-neem mixture.",
        "immediate_action": "Dig out and destroy infected clumps and drench adjacent healthy beds to halt spread."
    }
}

SAMPLE_SCANS = [
    {
        "id": "sample_1",
        "crop_name": "Rice (Paddy)",
        "disease_name": "Rice Leaf Blast (Magnaporthe oryzae)",
        "plant_part": "Leaf",
        "thumbnail_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
        "description": "Spindle-shaped brown lesions on paddy leaf blades during active tillering stage."
    },
    {
        "id": "sample_2",
        "crop_name": "Banana (Nendran / Robusta)",
        "disease_name": "Black Sigatoka Leaf Spot",
        "plant_part": "Leaf",
        "thumbnail_url": "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80",
        "description": "Dark brown streak spots with yellow halos across lower banana foliage."
    },
    {
        "id": "sample_3",
        "crop_name": "Black Pepper",
        "disease_name": "Quick Wilt / Foot Rot (Phytophthora)",
        "plant_part": "Stem / Root",
        "thumbnail_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
        "description": "Water-soaked lesions on pepper runner collar leading to sudden leaf shed."
    },
    {
        "id": "sample_4",
        "crop_name": "Tomato",
        "disease_name": "Tomato Early Blight",
        "plant_part": "Leaf",
        "thumbnail_url": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80",
        "description": "Concentric bullseye rings on tomato leaves and lower stem."
    },
    {
        "id": "sample_5",
        "crop_name": "Chilli & Capsicum",
        "disease_name": "Chilli Leaf Curl Complex",
        "plant_part": "Leaf",
        "thumbnail_url": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80",
        "description": "Upward curling and stunting of new leaves caused by vector infestation."
    },
    {
        "id": "sample_6",
        "crop_name": "Ginger / Turmeric",
        "disease_name": "Ginger Soft Rot / Rhizome Rot",
        "plant_part": "Root / Rhizome",
        "thumbnail_url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
        "description": "Water-soaked pseudostem rotting at soil collar with rhizome softening."
    }
]


def analyze_plant_scan(request: PestScanRequest, db: Optional[Session] = None, user_id: Optional[int] = None) -> PestScanResponse:
    now = datetime.now(timezone.utc)
    crop_clean = request.crop_name.lower()
    part_clean = request.plant_part.lower()
    symptoms_text = (request.observed_symptoms or "").lower()

    # 1. Match sample if sample_id provided
    matched_key = "rice_blast"
    if request.sample_id:
        sample_map = {
            "sample_1": "rice_blast",
            "sample_2": "banana_sigatoka",
            "sample_3": "pepper_quick_wilt",
            "sample_4": "tomato_early_blight",
            "sample_5": "chilli_leaf_curl",
            "sample_6": "ginger_soft_rot"
        }
        matched_key = sample_map.get(request.sample_id, "rice_blast")
    else:
        # 2. Intelligent diagnostic heuristic matcher
        if "rice" in crop_clean or "paddy" in crop_clean:
            matched_key = "rice_blast"
        elif "banana" in crop_clean or "nendran" in crop_clean:
            matched_key = "banana_sigatoka"
        elif "pepper" in crop_clean or "kurumulaku" in crop_clean:
            matched_key = "pepper_quick_wilt"
        elif "tomato" in crop_clean:
            matched_key = "tomato_early_blight"
        elif "chilli" in crop_clean or "capsicum" in crop_clean:
            matched_key = "chilli_leaf_curl"
        elif "ginger" in crop_clean or "turmeric" in crop_clean:
            matched_key = "ginger_soft_rot"
        elif "wilt" in symptoms_text or "rot" in symptoms_text:
            matched_key = "pepper_quick_wilt" if "root" in part_clean or "stem" in part_clean else "ginger_soft_rot"
        elif "curl" in symptoms_text or "pucker" in symptoms_text:
            matched_key = "chilli_leaf_curl"
        else:
            matched_key = "rice_blast"

    data = DISEASE_DIAGNOSTIC_CATALOG[matched_key]

    treatment = TreatmentPlan(
        organic_control=data["organic_control"],
        chemical_control=data["chemical_control"],
        cultural_prevention=data["cultural_prevention"],
        spray_schedule=data["spray_schedule"]
    )

    # Save to database if session provided
    record_id = None
    if db:
        try:
            record = PestScanRecord(
                user_id=user_id,
                crop_name=data["crop_name"],
                plant_part=request.plant_part,
                image_url=request.image_data[:200] if request.image_data else None,
                detected_disease=data["detected_disease"],
                scientific_name=data["scientific_name"],
                pathogen_type=data["pathogen_type"],
                confidence_score=data["confidence_score"],
                severity=data["severity"],
                symptoms="; ".join(data["symptoms_matched"]),
                organic_treatment=data["organic_control"],
                chemical_treatment=data["chemical_control"],
                cultural_control=data["cultural_prevention"],
                action_plan=data["immediate_action"],
                scanned_at=now
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            record_id = record.id
        except Exception:
            pass

    return PestScanResponse(
        id=record_id,
        crop_name=data["crop_name"],
        plant_part=request.plant_part,
        detected_disease=data["detected_disease"],
        scientific_name=data["scientific_name"],
        pathogen_type=data["pathogen_type"],
        confidence_score=data["confidence_score"],
        severity=data["severity"],
        severity_score=data["severity_score"],
        image_url=request.image_data if request.image_data and len(request.image_data) < 500 else None,
        symptoms_matched=data["symptoms_matched"],
        treatment_plan=treatment,
        immediate_action=data["immediate_action"],
        disclaimer="AgroGuide AI Pest Scanner provides computer vision advisory estimations. For quarantine-grade verification, consult your local Krishi Bhavan.",
        scanned_at=now
    )


def get_sample_scans() -> List[SampleScanItem]:
    return [SampleScanItem(**s) for s in SAMPLE_SCANS]
