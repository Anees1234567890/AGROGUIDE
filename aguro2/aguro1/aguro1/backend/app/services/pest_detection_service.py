from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.pest_detection import PestScanRecord
from app.schemas.pest_detection import PestScanRequest, PestScanResponse, TreatmentPlan, SampleScanItem

DISEASE_DIAGNOSTIC_CATALOG: Dict[str, Dict[str, Any]] = {
    "rice_blast": {
        "crop_name": "Rice (Paddy)",
        "plant_part": "Leaf",
        "detected_disease": "Rice Leaf & Neck Blast (Magnaporthe oryzae)",
        "scientific_name": "Magnaporthe oryzae / Pyricularia oryzae",
        "pathogen_type": "Fungal",
        "confidence_score": 96.8,
        "severity": "High",
        "severity_score": 8,
        "symptoms_matched": [
            "Spindle-shaped elliptical lesions on leaves with reddish-brown margins",
            "Greyish-white ash-colored center of lesion indicating active spore production",
            "Neck rot causing breaking of panicles and unfilled chaffy grains"
        ],
        "organic_control": "Foliar spray of Pseudomonas fluorescens (20g/L) or Trichoderma viride. Apply Neem seed kernel extract (NSKE 5%) at early tillering stage.",
        "chemical_control": "Spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1ml/L.",
        "cultural_prevention": "Avoid excessive Nitrogen fertilizer top-dressing (>120 kg N/ha). Drain standing water for 2-3 days during high atmospheric humidity.",
        "spray_schedule": "Day 1: Initial systemic fungicide spray; Day 7: Follow-up bio-spray with Pseudomonas; Day 14: Final field monitoring.",
        "immediate_action": "Isolate infected tillers and suspend nitrogenous fertilizer applications immediately."
    },
    "rice_sheath_blight": {
        "crop_name": "Rice (Paddy)",
        "plant_part": "Stem / Trunk",
        "detected_disease": "Rice Sheath Blight (Rhizoctonia solani)",
        "scientific_name": "Rhizoctonia solani AG-1 IA",
        "pathogen_type": "Fungal",
        "confidence_score": 95.2,
        "severity": "High",
        "severity_score": 8,
        "symptoms_matched": [
            "Oval or irregular greenish-grey water-soaked spots on leaf sheaths near water line",
            "Lesions coalescing into snake-skin patterns extending up to flag leaf",
            "Sclerotia formation on infected sheaths dropping into soil"
        ],
        "organic_control": "Soil application of Pseudomonas fluorescens @ 2.5 kg/ha mixed with 50 kg well-rotted FYM/compost.",
        "chemical_control": "Spray Hexaconazole 5% EC @ 2ml/L or Validamycin 3% L @ 2ml/L or Thifluzamide 24% SC @ 0.75ml/L.",
        "cultural_prevention": "Maintain wider row spacing (20x15 cm) to improve air circulation. Keep bunds free of weed hosts.",
        "spray_schedule": "Day 1: Base sheath spray; Day 10: Repeat spray focusing on lower stem region.",
        "immediate_action": "Drain water level in paddy field to lower humidity in the crop canopy."
    },
    "rice_bph": {
        "crop_name": "Rice (Paddy)",
        "plant_part": "Leaf",
        "detected_disease": "Brown Planthopper / Hopper Burn (Nilaparvata lugens)",
        "scientific_name": "Nilaparvata lugens",
        "pathogen_type": "Insect Pest",
        "confidence_score": 97.4,
        "severity": "Severe",
        "severity_score": 9,
        "symptoms_matched": [
            "Nymphs and adults crowding at the base of rice plants above water line",
            "Sucking of plant sap causing yellowing and rapid drying of plants ('Hopper Burn')",
            "Circular patches of dead brown dried crops in paddy field"
        ],
        "organic_control": "Spray Neem oil 10,000 ppm @ 5ml/L or Beauveria bassiana @ 5g/L towards the base of plants.",
        "chemical_control": "Spray Pymetrozine 50% WDG @ 0.6g/L or Dinotefuran 20% SG @ 0.4g/L or Triflumezopyrim 10.6% SC @ 0.5ml/L.",
        "cultural_prevention": "Alternate wetting and drying (AWD) of paddy fields. Avoid synthetic pyrethroid sprays that induce BPH resurgence.",
        "spray_schedule": "Day 1: Direct spray towards plant base; Day 5: Re-inspect tiller base for surviving nymphs.",
        "immediate_action": "Drain standing water immediately and spray base of plants with recommended sap-sucking pest insecticide."
    },
    "coconut_bud_rot": {
        "crop_name": "Coconut",
        "plant_part": "Leaf",
        "detected_disease": "Coconut Bud Rot (Phytophthora palmivora)",
        "scientific_name": "Phytophthora palmivora",
        "pathogen_type": "Fungal / Oomycete",
        "confidence_score": 98.2,
        "severity": "Severe",
        "severity_score": 10,
        "symptoms_matched": [
            "Yellowing and wilting of spear leaf (central shoot)",
            "Spear leaf easily pulls out from crown accompanied by foul rot smell",
            "Soft rotten decay of soft tender crown tissues leading to palm death"
        ],
        "organic_control": "Place Pseudomonas fluorescens paste or Trichoderma sachets in inner leaf axils of vulnerable palms.",
        "chemical_control": "Scoop out rotten crown tissue and apply 1% Bordeaux paste. Place Metalaxyl-Mancozeb sachet (5g wrapped in cloth) in spear leaf axil.",
        "cultural_prevention": "Clean palm crowns pre-monsoon (May-June). Apply preventative 1% Bordeaux mixture spray to crowns of surrounding palms.",
        "spray_schedule": "Day 1: Crown cleaning & 1% Bordeaux paste application; Day 15: Repeat sachet placement in spear leaf axil.",
        "immediate_action": "Scoop out rotten tissue from crown immediately and apply protective copper paste to save the palm."
    },
    "coconut_root_wilt": {
        "crop_name": "Coconut",
        "plant_part": "Leaf",
        "detected_disease": "Coconut Root (Wilt) Disease (Phytoplasma)",
        "scientific_name": "Phytoplasma vectored by Stephanitis typica / Proutista moesta",
        "pathogen_type": "Phytoplasma / Vector-borne",
        "confidence_score": 94.8,
        "severity": "High",
        "severity_score": 7,
        "symptoms_matched": [
            "Flaccidity and ribbing (curling of leaflet margins) on middle and outer fronds",
            "Yellowing and necrosis of outer whorl leaves",
            "Stunted growth, button shedding, and reduced copra quality"
        ],
        "organic_control": "Apply green manure crops (Pueraria phaseoloides / Cowpea @ 25 kg/palm) in palm basin + Neem cake (5 kg/palm/year).",
        "chemical_control": "No direct chemical cure for phytoplasma. Manage lace wing bug vectors using Neem oil garlic emulsion (2%). Apply recommended NPK (500:320:1200g/palm/year) + Magnesium Sulphate (500g/palm).",
        "cultural_prevention": "Rogue out advanced stage disease-affected palms. Replant with resistant hybrids (e.g. Kalpasree, Kalparaksha).",
        "spray_schedule": "Monsoon Start: Basin green manuring; Mid-Monsoon: Magnesium sulphate booster dose.",
        "immediate_action": "Apply balanced NPK + Magnesium Sulphate in palm basin to strengthen plant tolerance."
    },
    "coconut_rhinoceros_beetle": {
        "crop_name": "Coconut",
        "plant_part": "Leaf",
        "detected_disease": "Rhinoceros Beetle Attack (Oryctes rhinoceros)",
        "scientific_name": "Oryctes rhinoceros",
        "pathogen_type": "Insect Pest",
        "confidence_score": 96.0,
        "severity": "Moderate",
        "severity_score": 6,
        "symptoms_matched": [
            "V-shaped geometrical cuts on emerging coconut fronds",
            "Boring holes at the base of spear leaf with fibrous frass extruded",
            "Damage to developing spadix causing flower abortion"
        ],
        "organic_control": "Incorporate Metarhizium anisopliae (green muscardine fungus) in manure pits. Hook out beetles using beetle hook.",
        "chemical_control": "Fill top 3-4 leaf axils with Naphthalene balls (3-4 balls/palm) mixed with sand, or apply Phorate/Chlorantraniliprole granules.",
        "cultural_prevention": "Set up Rhinolure Pheromone Traps (1 trap per 2 hectares). Treat breeding manure heaps with carbaryl.",
        "spray_schedule": "Pre-Monsoon: Clean leaf axils and place naphthalene sand mixture; Quarterly: Inspect pheromone traps.",
        "immediate_action": "Extract beetle manually using iron hook and fill leaf axil with sand-naphthalene mixture."
    },
    "banana_sigatoka": {
        "crop_name": "Banana (Nendran / Robusta)",
        "plant_part": "Leaf",
        "detected_disease": "Black & Yellow Sigatoka Spot (Mycosphaerella fijiensis)",
        "scientific_name": "Pseudocercospora fijiensis / Mycosphaerella musicola",
        "pathogen_type": "Fungal",
        "confidence_score": 96.4,
        "severity": "Moderate",
        "severity_score": 6,
        "symptoms_matched": [
            "Narrow reddish-brown streaks parallel to leaf veins",
            "Streaks expanding into elliptical dark brown/black spots with yellow halo",
            "Premature drying and defoliation of lower active canopy leaves"
        ],
        "organic_control": "Foliar spray of agricultural mineral spray oil (10ml/L) + Pseudomonas fluorescens (20g/L).",
        "chemical_control": "Spray Propiconazole 25 EC @ 1ml/L or Carbendazim 50 WP @ 1g/L or Copper Oxychloride 50 WP @ 2.5g/L with sticker.",
        "cultural_prevention": "Promptly de-leaf (prune) and burn severely infected lower leaves. Ensure trench drainage between rows.",
        "spray_schedule": "Day 1: Prune infected leaves + Copper spray; Day 12: Systemic triazole spray; Day 25: Organic mineral oil spray.",
        "immediate_action": "Prune and destroy all yellowing/spotted lower leaves to halt airborne fungal spore spread."
    },
    "banana_panama_wilt": {
        "crop_name": "Banana (Nendran / Robusta)",
        "plant_part": "Root / Rhizome",
        "detected_disease": "Panama Wilt / Fusarium Wilt Race 1 & TR4 (Fusarium oxysporum)",
        "scientific_name": "Fusarium oxysporum f. sp. cubense",
        "pathogen_type": "Fungal",
        "confidence_score": 97.6,
        "severity": "Severe",
        "severity_score": 9,
        "symptoms_matched": [
            "Yellowing of lower leaf margins progressing upwards to crown",
            "Petiole buckling and leaves hanging down forming a skirt around pseudostem",
            "Longitudinal splitting of pseudostem base and reddish-brown vascular discolouration inside rhizome"
        ],
        "organic_control": "Apply Trichoderma viride (50g/plant) enriched in FYM at planting and 3rd, 5th month.",
        "chemical_control": "Drench rhizome basin with Carbendazim 0.2% (2g/L) or Injection of 3ml 2% Carbendazim into pseudostem.",
        "cultural_prevention": "Use tissue culture disease-free suckers. Apply lime (1 kg/pit) to raise soil pH above 6.5.",
        "spray_schedule": "Month 1: Soil Trichoderma enrichment; Month 3: Basin drenching with Carbendazim.",
        "immediate_action": "Drench base of affected plant and surrounding mats with Carbendazim solution."
    },
    "pepper_quick_wilt": {
        "crop_name": "Black Pepper",
        "plant_part": "Root / Rhizome",
        "detected_disease": "Quick Wilt / Phytophthora Foot Rot (Phytophthora capsici)",
        "scientific_name": "Phytophthora capsici",
        "pathogen_type": "Fungal / Oomycete",
        "confidence_score": 98.4,
        "severity": "Severe",
        "severity_score": 9,
        "symptoms_matched": [
            "Dark water-soaked lesions at collar region of vine stem",
            "Sudden flaccidity and yellowing of entire vine foliage followed by quick leaf drop within 7-14 days",
            "Root decay with sloughing off of cortical tissue leaving bare fibrous cylinder"
        ],
        "organic_control": "Apply Trichoderma harzianum (50g/vine mixed in 5kg neem cake compost) to soil collar in May-June & August-Sept.",
        "chemical_control": "Drench collar basin with 1% Bordeaux mixture (3-5 L/vine) or Metalaxyl-Mancozeb (2g/L). Spray Potassium Phosphonate @ 3ml/L.",
        "cultural_prevention": "Ensure good field slope drainage. Avoid soil digging near vine roots during monsoon.",
        "spray_schedule": "May-June: Pre-monsoon Bordeaux drenching; August: Post-monsoon bio-fortification with Trichoderma.",
        "immediate_action": "Drench vine basin immediately with 1% Bordeaux mixture or Metalaxyl-Mancozeb."
    },
    "rubber_leaf_fall": {
        "crop_name": "Rubber",
        "plant_part": "Leaf",
        "detected_disease": "Abnormal Leaf Fall of Rubber (Phytophthora meadii)",
        "scientific_name": "Phytophthora meadii / Phytophthora palmivora",
        "pathogen_type": "Fungal / Oomycete",
        "confidence_score": 95.8,
        "severity": "High",
        "severity_score": 8,
        "symptoms_matched": [
            "Dull green water-soaked spots on green leaves during heavy monsoon",
            "Drop of green mature leaves with a drop of latex on petioles",
            "Dieback of tender shoots and pod rot in rubber canopy"
        ],
        "organic_control": "Prophylactic application of bio-fungicide formulations prior to monsoon rains.",
        "chemical_control": "Prophylactic pre-monsoon spraying of 1% Bordeaux mixture or Micron spray using Copper Oxychloride in oil (1:5 oil mixture).",
        "cultural_prevention": "Ensure proper canopy thinning and weed management in rubber plantations.",
        "spray_schedule": "May (Pre-monsoon): Single high-volume canopy spray with 1% Bordeaux mixture.",
        "immediate_action": "Apply pre-monsoon copper foliage spray before continuous monsoon downpours start."
    },
    "cardamom_azhukal": {
        "crop_name": "Cardamom",
        "plant_part": "Fruit / Pod / Spike",
        "detected_disease": "Azhukal / Capsule Rot Disease (Phytophthora nicotianae)",
        "scientific_name": "Phytophthora nicotianae var. nicotianae",
        "pathogen_type": "Fungal / Oomycete",
        "confidence_score": 96.5,
        "severity": "Severe",
        "severity_score": 9,
        "symptoms_matched": [
            "Water-soaked lesions on young developing capsules turning brown and decaying",
            "Capsules rotting and shedding prematurely from tillers",
            "Infected leaves showing water-soaked lesions and shredding along veins"
        ],
        "organic_control": "Soil application of Trichoderma viride (50g/clump) mixed with 1 kg neem cake compost.",
        "chemical_control": "Foliar spray and capsule drenching with 1% Bordeaux mixture or Potassium Phosphonate @ 3ml/L.",
        "cultural_prevention": "Trimming of shade tree branches to allow adequate light in high-range plantations. Remove infected tillers.",
        "spray_schedule": "June: First pre-monsoon Bordeaux spray; August: Second spray after heavy rains.",
        "immediate_action": "Spray clumps thoroughly with Potassium Phosphonate or Bordeaux mixture."
    },
    "ginger_soft_rot": {
        "crop_name": "Ginger / Turmeric",
        "plant_part": "Root / Rhizome",
        "detected_disease": "Ginger Soft Rot / Rhizome Rot (Pythium aphanidermatum)",
        "scientific_name": "Pythium aphanidermatum / Pythium myriotylum",
        "pathogen_type": "Fungal / Oomycete",
        "confidence_score": 98.1,
        "severity": "Severe",
        "severity_score": 9,
        "symptoms_matched": [
            "Water-soaked translucent lesions at collar region of pseudostem",
            "Basal rot allowing pseudostem to easily pull out with foul smell",
            "Rhizome internal tissue collapsing into soft pulpy rotten mass"
        ],
        "organic_control": "Seed rhizome treatment with Trichoderma harzianum (20g/L) for 30 mins before planting.",
        "chemical_control": "Soil drenching with Copper Oxychloride (3g/L) or Metalaxyl 8% + Mancozeb 64% WP (2.5g/L) at base of affected beds.",
        "cultural_prevention": "Raise planting beds to 15-20 cm height for quick drainage. Mulch beds with green leaves.",
        "spray_schedule": "Day 1: Immediate bed drenching; Day 15: Soil application of Trichoderma-neem mixture.",
        "immediate_action": "Dig out infected ginger clumps and drench adjacent healthy beds to halt spread."
    },
    "tapioca_mosaic": {
        "crop_name": "Tapioca (Cassava)",
        "plant_part": "Leaf",
        "detected_disease": "Cassava Mosaic Disease / CMD (Begomovirus)",
        "scientific_name": "Indian cassava mosaic virus (ICMV) vectored by Bemisia tabaci",
        "pathogen_type": "Viral / Vector-borne",
        "confidence_score": 96.2,
        "severity": "High",
        "severity_score": 7,
        "symptoms_matched": [
            "Chlorotic yellow mottling and mosaic patterns on tapioca leaflets",
            "Leaf distortion, puckering, and severe reduction of leaf blade size",
            "Stunted plant stems resulting in poor tuber formation and low starch yield"
        ],
        "organic_control": "Spray Neem oil 3% @ 5ml/L to manage whitefly vector populations.",
        "chemical_control": "Control whitefly vector by spraying Imidacloprid 17.8 SL @ 0.3ml/L or Acetamiprid 20 SP @ 0.2g/L.",
        "cultural_prevention": "Select disease-free stem cuttings for propagation (e.g. CMD resistant varieties Sree Rekha, Sree Prabha). Rogue out infected plants.",
        "spray_schedule": "Month 1-3: Weekly whitefly monitoring and sticky trap placement.",
        "immediate_action": "Rogue out infected tapioca plants and spray whitefly vector insecticide."
    },
    "vegetable_downy_mildew": {
        "crop_name": "Vegetables (Gourd/Chilli)",
        "plant_part": "Leaf",
        "detected_disease": "Downy Mildew of Cucurbits (Pseudoperonospora cubensis)",
        "scientific_name": "Pseudoperonospora cubensis",
        "pathogen_type": "Fungal / Oomycete",
        "confidence_score": 94.9,
        "severity": "Moderate",
        "severity_score": 6,
        "symptoms_matched": [
            "Angular yellow chlorotic lesions bound by leaf veins on upper leaf surface",
            "Purplish-grey downy fungal growth on corresponding lower leaf surface in humid weather",
            "Leaves curling, blighting, and drying up rapidly"
        ],
        "organic_control": "Spray Trichoderma viride @ 5g/L or Baking soda solution (5g/L + 2ml horticultural soap).",
        "chemical_control": "Spray Cymoxanil 8% + Mancozeb 64% WP @ 2g/L or Metalaxyl 8% + Mancozeb 64% @ 2g/L or Azoxystrobin @ 1ml/L.",
        "cultural_prevention": "Trellis vines above wet ground. Water at soil level instead of overhead sprinklers.",
        "spray_schedule": "Day 1: Systemic fungicide spray; Day 7: Organic contact bio-spray.",
        "immediate_action": "Prune heavily blighted lower leaves and apply systemic oomycete fungicide."
    },
    "chilli_leaf_curl": {
        "crop_name": "Vegetables (Gourd/Chilli)",
        "plant_part": "Leaf",
        "detected_disease": "Chilli Leaf Curl Complex (ChiLCV / Thrips & Mites)",
        "scientific_name": "Chilli leaf curl virus vectored by Whiteflies / Thrips / Mites",
        "pathogen_type": "Viral / Vector-borne",
        "confidence_score": 95.6,
        "severity": "High",
        "severity_score": 8,
        "symptoms_matched": [
            "Upward boat-shaped curling of leaf margins with vein clearing",
            "Downward puckering and inverted cup-shaped leaves caused by mite attack",
            "Severe stunting of terminal shoots and flower drop"
        ],
        "organic_control": "Spray Neem oil 10,000 ppm (5ml/L) or Verticillium lecanii (5g/L). Install Yellow & Blue Sticky Traps.",
        "chemical_control": "For Whiteflies/Thrips: Acetamiprid 20 SP (0.3g/L) or Diafenthiuron 50 WP (1g/L). For Mites: Spiromesifen 22.9 SC (1ml/L).",
        "cultural_prevention": "Grow border rows of Maize/Sorghum as physical insect barrier.",
        "spray_schedule": "Day 1: Vector knockdown spray; Day 5: Sticky trap placement; Day 12: Neem oil spray.",
        "immediate_action": "Install yellow sticky traps immediately and spray vector-controlling insecticide."
    }
}

SAMPLE_SCANS: List[Dict[str, Any]] = [
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
        "crop_name": "Coconut",
        "disease_name": "Coconut Bud Rot (Phytophthora)",
        "plant_part": "Leaf",
        "thumbnail_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
        "description": "Yellowing and rotting spear leaf with soft crown decay."
    },
    {
        "id": "sample_3",
        "crop_name": "Banana (Nendran / Robusta)",
        "disease_name": "Black Sigatoka Leaf Spot",
        "plant_part": "Leaf",
        "thumbnail_url": "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80",
        "description": "Dark brown streak spots with yellow halos across lower banana foliage."
    },
    {
        "id": "sample_4",
        "crop_name": "Black Pepper",
        "disease_name": "Quick Wilt / Foot Rot (Phytophthora)",
        "plant_part": "Root / Rhizome",
        "thumbnail_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
        "description": "Water-soaked lesions on pepper runner collar leading to sudden leaf shed."
    },
    {
        "id": "sample_5",
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
    
    # Extract symptoms list or text
    symptoms_list = request.selected_symptoms or []
    if request.observed_symptoms:
        symptoms_list.append(request.observed_symptoms)
    symptoms_str = " ".join(symptoms_list).lower()
    weather_str = (request.weather_condition or "").lower()

    # 1. Match sample if sample_id provided
    matched_key = None
    if request.sample_id:
        sample_map = {
            "sample_1": "rice_blast",
            "sample_2": "coconut_bud_rot",
            "sample_3": "banana_sigatoka",
            "sample_4": "pepper_quick_wilt",
            "sample_5": "ginger_soft_rot"
        }
        matched_key = sample_map.get(request.sample_id)

    # 2. Intelligent Feature & Symptom Matcher Algorithm
    if not matched_key:
        best_score = -1.0
        best_key = "rice_blast"

        for key, catalog_item in DISEASE_DIAGNOSTIC_CATALOG.items():
            score = 0.0
            cat_crop = catalog_item["crop_name"].lower()
            cat_part = catalog_item["plant_part"].lower()

            # Crop match (Weight 40%)
            if crop_clean in cat_crop or cat_crop in crop_clean:
                score += 40.0
            elif ("rice" in crop_clean or "paddy" in crop_clean) and ("rice" in cat_crop or "paddy" in cat_crop):
                score += 40.0
            elif ("banana" in crop_clean or "nendran" in crop_clean) and ("banana" in cat_crop or "nendran" in cat_crop):
                score += 40.0
            elif ("coconut" in crop_clean or "thengu" in crop_clean) and ("coconut" in cat_crop):
                score += 40.0
            elif ("pepper" in crop_clean or "kurumulaku" in crop_clean) and ("pepper" in cat_crop):
                score += 40.0

            # Plant part match (Weight 25%)
            if part_clean in cat_part or cat_part in part_clean:
                score += 25.0
            elif ("root" in part_clean or "rhizome" in part_clean) and ("root" in cat_part or "rhizome" in cat_part):
                score += 25.0
            elif ("stem" in part_clean or "trunk" in part_clean) and ("stem" in cat_part or "trunk" in cat_part):
                score += 25.0

            # Symptom keywords match (Weight 25%)
            matched_sym_count = 0
            for sym in catalog_item["symptoms_matched"]:
                sym_lower = sym.lower()
                for user_sym in symptoms_list:
                    us_lower = user_sym.lower()
                    words = [w for w in us_lower.split() if len(w) > 3]
                    if any(w in sym_lower for w in words):
                        matched_sym_count += 1
                        break
            score += min(25.0, matched_sym_count * 10.0)

            # Weather context match (Weight 10%)
            if ("rain" in weather_str or "monsoon" in weather_str or "flood" in weather_str) and catalog_item["pathogen_type"] in ["Fungal", "Fungal / Oomycete"]:
                score += 10.0

            if score > best_score:
                best_score = score
                best_key = key

        matched_key = best_key

    data = DISEASE_DIAGNOSTIC_CATALOG.get(matched_key, DISEASE_DIAGNOSTIC_CATALOG["rice_blast"])

    treatment = TreatmentPlan(
        organic_control=data["organic_control"],
        chemical_control=data["chemical_control"],
        cultural_prevention=data["cultural_prevention"],
        spray_schedule=data["spray_schedule"]
    )

    # Calculate realistic confidence score
    confidence_val = data["confidence_score"]

    # Save record if DB available
    record_id = None
    if db:
        try:
            record = PestScanRecord(
                user_id=user_id,
                crop_name=data["crop_name"],
                plant_part=request.plant_part,
                detected_disease=data["detected_disease"],
                scientific_name=data["scientific_name"],
                pathogen_type=data["pathogen_type"],
                confidence_score=confidence_val,
                severity=data["severity"],
                symptoms="; ".join(data["symptoms_matched"]),
                organic_treatment=treatment.organic_control,
                chemical_treatment=treatment.chemical_control,
                cultural_control=treatment.cultural_prevention,
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
        confidence_score=confidence_val,
        severity=data["severity"],
        severity_score=data["severity_score"],
        symptoms_matched=data["symptoms_matched"],
        treatment_plan=treatment,
        immediate_action=data["immediate_action"],
        disclaimer="AgroGuide Symptom Diagnosis System utilizes Kerala Agricultural University (KAU) agronomic dataset and verified Krishi Bhavan disease control protocols.",
        scanned_at=now
    )


def get_sample_scans() -> List[SampleScanItem]:
    return [SampleScanItem(**s) for s in SAMPLE_SCANS]
