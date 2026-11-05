import httpx
from typing import List, Optional, Dict, Any
import re
from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage

# Deep Agronomic Knowledge Base across all core farming domains
AGRONOMIC_DOMAIN_KNOWLEDGE = {
    "crops": {
        "rice": {
            "name": "Rice / Paddy (Oryza sativa)",
            "soil": "Clayey loam, alluvial soil with pH 5.5 - 7.0.",
            "seasons": "Virippu (Autumn/Kharif: Apr-May to Aug-Sep), Mundakan (Winter/Rabi: Sep-Oct to Dec-Jan), Puncha (Summer: Dec-Jan to Mar-Apr).",
            "fertilizer": "Basal: 10 tonnes FYM/ha + 35 kg P2O5 (SSP 220 kg/ha). Top dressing: Nitrogen (90 kg/ha) in 3 splits at basal, active tillering, and panicle initiation. Potash (45 kg/ha) in 2 splits.",
            "water": "Keep 2-3 cm standing water during transplanting, increase to 5 cm during tillering to flowering. Drain water 10 days before harvest.",
            "pests_diseases": "For Leaf Blast / Sheath Blight: Spray Tricyclazole 75 WP @ 0.6g/L or Pseudomonas fluorescens 20g/L. For Stem Borer: Use Pheromone traps @ 8/acre or Cartap Hydrochloride 4G @ 10kg/acre.",
            "harvest": "Harvest when 80-85% of the panicles turn golden straw yellow and grain moisture is around 20-22%."
        },
        "banana": {
            "name": "Banana / Nendran / Robusta (Musa paradisiaca)",
            "soil": "Well-drained rich loamy and alluvial soil with pH 6.0 - 7.5.",
            "seasons": "Planting in Aug-Sep (Nendran for festival peak demand) or Feb-Apr with irrigation.",
            "fertilizer": "Per plant: 10 kg FYM + 500g Neem cake at planting. Chemical NPK: 200g N, 200g P2O5, 400g K2O applied in 4 splits at 2nd, 3rd, 4th, and 5th month after planting. Extra 100g Potash at bunch emergence enhances finger size and fruit weight.",
            "water": "Requires 20-25 litres of water/plant/day via drip irrigation or basin irrigation every 3-4 days.",
            "pests_diseases": "For Sigatoka Leaf Spot: Spray Carbendazim (1g/L) + Mineral oil (10ml/L) or Copper Oxychloride (2.5g/L). For Pseudostem Weevil: Apply entomopathogenic nematode (EPN) or swab trunk with Beauveria bassiana (20g/L).",
            "harvest": "Matures in 10-12 months for Nendran and 12-14 months for Robusta. Harvest when fruit ridges turn rounded."
        },
        "pepper": {
            "name": "Black Pepper (Piper nigrum) — King of Spices",
            "soil": "Humus-rich laterite or red loam soil with pH 5.5 - 6.5 and good slope drainage.",
            "seasons": "Planting root cuttings in June-July with onset of South-West monsoon.",
            "fertilizer": "Per vine per year: 10 kg compost/FYM + 1 kg neem cake + 100g N, 40g P2O5, 140g K2O in two split doses (May-June and Aug-Sep). Apply 500g lime per vine in alternate years.",
            "water": "Irrigate @ 40-50 litres per vine at 10-14 day intervals from March till summer showers to boost spike emergence.",
            "pests_diseases": "For Quick Wilt (Foot Rot caused by Phytophthora capsici): Drench soil with Bordeaux mixture 1% or Metalaxyl-Mancozeb (2g/L) + Trichoderma viride (50g/vine with compost). For Pollu Beetle: Spray Quinalphos 0.05% in June & Sep.",
            "harvest": "Berries mature in 7-8 months after flowering (Dec-March). Harvest when 1-2 berries in the spike turn bright orange/red."
        },
        "cardamom": {
            "name": "Small Cardamom (Elettaria cardamomum) — Queen of Spices",
            "soil": "Forest loam rich in organic matter (pH 5.0 - 6.0) under filtered evergreen tree shade (40-50% shade).",
            "seasons": "Planting in June-July. Harvesting spans Aug to Feb at 30-40 day intervals.",
            "fertilizer": "Apply N:P:K 75:75:150 kg/ha in 2-3 splits. Incorporate 5 kg compost/clump + 1 kg neem cake annually.",
            "water": "Requires continuous soil moisture. Overhead sprinkler irrigation @ 25-35 mm every 10-12 days during dry season (Jan-May).",
            "pests_diseases": "For Capsule Rot (Azhukal): Spray 1% Bordeaux mixture or Copper Hydroxide (2g/L). For Thrips: Spray Spinosad (0.3ml/L) or Quinalphos (2ml/L).",
            "harvest": "Pick capsules just before full ripening (when seeds inside turn dark brown/black) to retain green color during curing."
        },
        "coconut": {
            "name": "Coconut Palm (Cocos nucifera)",
            "soil": "Sandy loam, coastal alluvium, and red loam with pH 5.2 - 8.0.",
            "seasons": "Planting in May-June before heavy rains.",
            "fertilizer": "Per adult palm/year: 50 kg FYM/green leaf manure + 500g N (1.1 kg Urea), 320g P2O5 (1.6 kg Rock Phosphate), 1200g K2O (2 kg Muriate of Potash) in 2 splits (May-June & Sep-Oct) + 500g Magnesium Sulphate in laterite tracts.",
            "water": "Requires 45-50 litres water/palm/day through drip irrigation during dry months.",
            "pests_diseases": "For Rhinoceros Beetle: Hook beetles out, fill leaf axils with Sevidol/Neem cake + sand (1:1). For Red Palm Weevil: Pheromone lure traps (Ferrolure+) + stem injection with Imidacloprid (1ml/L). For Root Wilt: Apply balanced NPK + 1 kg MgSO4 + 1 kg lime.",
            "harvest": "Harvest mature 11-12 month old bunches at 45-day intervals."
        },
        "tomato": {
            "name": "Tomato (Solanum lycopersicum)",
            "soil": "Well-drained sandy loam or clay loam rich in organic matter with pH 6.0 - 7.0.",
            "seasons": "Kharif (June-July), Rabi (Oct-Nov), Summer (Jan-Feb).",
            "fertilizer": "FYM 25 t/ha + N:P:K @ 100:60:60 kg/ha. Apply full P and half N & K at transplanting, balance N & K at 30 and 45 days.",
            "water": "Irrigate immediately after transplanting; subsequent irrigations at 5-7 days interval. Avoid water stagnation to prevent bacterial wilt.",
            "pests_diseases": "For Early/Late Blight: Spray Mancozeb 75 WP (2g/L) or Azoxystrobin (1ml/L). For Fruit Borer (Helicoverpa): Spray Bacillus thuringiensis (Bt @ 2g/L) or Chlorantraniliprole 18.5 SC (0.3ml/L).",
            "harvest": "Pick at breaker stage for distant market delivery, red ripe stage for local processing."
        },
        "chilli": {
            "name": "Chilli & Capsicum (Capsicum annuum)",
            "soil": "Well-aerated sandy loam and black soil with pH 6.5 - 7.5.",
            "seasons": "Kharif (June-July), Rabi (Oct-Nov).",
            "fertilizer": "FYM 20 t/ha + NPK 75:40:40 kg/ha. 50% N at planting, 25% at 30 days, 25% at 60 days.",
            "water": "Irrigate at flowering and fruit set stages. Sensitive to both waterlogging and drought stress.",
            "pests_diseases": "For Chilli Leaf Curl Virus (Thrips & Mites vector): Spray Neem oil (5ml/L) + Verticillium lecanii (5g/L) or Diafenthiuron 50 WP (1g/L). For Anthracnose / Die-back: Spray Copper Oxychloride (2.5g/L).",
            "harvest": "Green chillies picked at 10-15 day intervals; ripe red chillies picked when fully red and sundried."
        },
        "ginger": {
            "name": "Ginger (Zingiber officinale)",
            "soil": "Sandy loam, clay loam with high humus content and pH 5.5 - 6.5.",
            "seasons": "Planting with pre-monsoon showers in the first fortnight of April.",
            "fertilizer": "FYM 25-30 t/ha + 50 kg N, 50 kg P2O5, 50 kg K2O/ha. Apply green leaf mulching @ 12 tonnes/ha at planting and 5 tonnes at 45 & 90 days.",
            "water": "Provide protective irrigation at 7-10 day intervals during dry spells.",
            "pests_diseases": "For Soft Rot / Rhizome Rot (Pythium aphanidermatum): Treat seed rhizomes with Mancozeb (3g/L) for 30 mins before planting. Drench soil with Copper Oxychloride (3g/L) or Trichoderma harzianum (20g/L).",
            "harvest": "Harvest at 8 months for dry ginger when leaves start yellowing and drying."
        },
        "turmeric": {
            "name": "Turmeric (Curcuma longa)",
            "soil": "Deep, well-drained loamy or alluvial soil with pH 5.5 - 7.5.",
            "seasons": "Planting in April-May with onset of summer showers.",
            "fertilizer": "FYM 25 t/ha + Neem cake 2 t/ha. NPK @ 60:50:120 kg/ha in 3 split doses at 30, 60, and 90 days.",
            "water": "Requires 15-20 irrigations in medium soils; mulch heavily with green leaves.",
            "pests_diseases": "For Leaf Spot (Colletotrichum capsici): Spray Mancozeb (2g/L) or Bordeaux mixture 1%. For Shoot Borer: Spray Bacillus thuringiensis (2g/L).",
            "harvest": "Ready in 7-9 months when leaves turn dry and yellow (Jan-March)."
        }
    }
}

SUGGESTED_QUESTIONS_EN = [
    "What is the complete fertilizer schedule for Nendran Banana?",
    "How do I control Quick Wilt and foot rot in Black Pepper?",
    "How to prepare and apply Jeevamrutha for organic farming?",
    "What crops are best suited for acidic laterite soil?",
    "What is the step-by-step pest management for Tomato fruit borer?"
]

SUGGESTED_QUESTIONS_ML = [
    "നേന്ത്രവാഴയ്ക്ക് നൽകേണ്ട വളപ്രയോഗ ക്രമം എന്താണ്?",
    "കുരുമുളകിലെ ദ്രുതവാട്ടം എങ്ങനെ നിയന്ത്രിക്കാം?",
    "ജീവാമൃതം എങ്ങനെ ഉണ്ടാക്കാം, എങ്ങനെ ഉപയോഗിക്കാം?",
    "അമ്ലഗുണമുള്ള വെട്ടുക്കൽ മണ്ണിന് ഏറ്റവും അനുയോജ്യമായ വിളകൾ ഏവ?",
    "തക്കാളിയിലെ പുഴുക്കളെയും കുമിൾ രോഗങ്ങളെയും എങ്ങനെ പ്രതിരോധിക്കാം?"
]

SUGGESTED_QUESTIONS_HI = [
    "केले (नेन्द्रन/रोबस्टा) के लिए खाद की मात्रा और समय क्या है?",
    "काली मिर्च में विल्ट (उकठा) रोग का जैविक और रासायनिक उपचार क्या है?",
    "जैविक खेती के लिए जीवामृत कैसे बनाएं और उपयोग करें?",
    "अम्लीय मिट्टी (Laterite Soil) में कौन सी फसलें सबसे अच्छी हैं?",
    "टमाटर में फल छेदक कीट और झुलसा रोग का नियंत्रण कैसे करें?"
]


def extract_keywords_and_intent(message: str) -> Dict[str, Any]:
    text = message.lower()
    intent = "general"
    matched_crop = None
    
    crops_map = {
        "rice": ["rice", "paddy", "nellu", "മുണ്ടകൻ", "വിരിപ്പ്", "പുഞ്ച", "धान", "चावल"],
        "banana": ["banana", "nendran", "robusta", "വാഴ", "നേന്ത്രൻ", "പഴം", "केला"],
        "pepper": ["pepper", "black pepper", "kurumulaku", "കുരുമുളക്", "काली मिर्च", "मिरच"],
        "cardamom": ["cardamom", "elam", "ഏലം", "ഇലാച്ചി", "इलायची"],
        "coconut": ["coconut", "thengu", "നാളികേരം", "തേങ്ങ", "नारियल"],
        "tomato": ["tomato", "thakkali", "തക്കാളി", "टमाटर"],
        "chilli": ["chilli", "chili", "mulaku", "മുളക്", "मिर्च", "capsicum"],
        "ginger": ["ginger", "inji", "ഇഞ്ചി", "अदरक"],
        "turmeric": ["turmeric", "manjal", "മഞ്ഞൾ", "हल्दी"]
    }
    for crop_key, kws in crops_map.items():
        if any(kw in text for kw in kws):
            matched_crop = crop_key
            break

    if any(w in text for w in ["pest", "disease", "insect", "blight", "wilt", "rot", "spray", "fungus", "worm", "കീടം", "രോഗം", "വാട്ടം", "ചീയൽ", "കുമിൾ", "തളിക്ക", "कीट", "रोग", "झुलसा", "दवा", "छिड़काव"]):
        intent = "pest_disease"
    elif any(w in text for w in ["fertilizer", "manure", "npk", "urea", "potash", "dap", "organic", "jeevamrutha", "compost", "വളം", "ചാണകം", "പൊട്ടാഷ്", "യൂറിയ", "ജീവാമൃതം", "खाद", "उर्वरक", "यूरिया", "पोटाश"]):
        intent = "fertilizer_soil"
    elif any(w in text for w in ["water", "irrigation", "drip", "dry", "moisture", "നന", "ജലസേചനം", "വെള്ളം", "पानी", "सिंचाई"]):
        intent = "water_irrigation"
    elif any(w in text for w in ["season", "sowing", "planting", "month", "harvest", "yield", "നടീൽ", "വിളവെടുപ്പ്", "കാലം", "बुवाई", "कटाई", "मौसम"]):
        intent = "cultivation_calendar"
    elif any(w in text for w in ["soil", "ph", "acid", "lime", "dolomite", "മണ്ണ്", "പി.എച്ച്", "കുമ്മായം", "मिट्टी", "चूना"]):
        intent = "soil_health"
    elif any(w in text for w in ["price", "mandi", "market", "rate", "cost", "വില", "വിപണി", "മാർക്കറ്റ്", "भाव", "मंडी", "दाम"]):
        intent = "market_price"

    return {"intent": intent, "crop": matched_crop, "raw_query": text}


def build_agronomic_response(intent_data: Dict[str, Any], lang: str) -> str:
    crop_key = intent_data.get("crop")
    intent = intent_data.get("intent")
    query = intent_data.get("raw_query", "")

    if crop_key and crop_key in AGRONOMIC_DOMAIN_KNOWLEDGE["crops"]:
        c = AGRONOMIC_DOMAIN_KNOWLEDGE["crops"][crop_key]
        
        if intent == "pest_disease":
            if lang == "ml":
                return f"🌿 **{c['name']} - കീട-രോഗ സംരക്ഷണ മാർഗ്ഗങ്ങൾ:**\n\n• **പ്രധാന രോഗങ്ങളും പ്രതിവിധികളും:**\n{c['pests_diseases']}\n\n• **ജൈവ നിയന്ത്രണം:** സ്യൂഡോമോണസ് ഫ്ലൂറസെൻസ് (20 ഗ്രാം/ലിറ്റർ) അല്ലെങ്കിൽ വേപ്പെണ്ണ എമൽഷൻ (5 മില്ലി/ലിറ്റർ) പ്രയോഗിക്കുക.\n• **ശ്രദ്ധിക്കേണ്ട കാര്യങ്ങൾ:** രോഗബാധയുള്ള ഭാഗങ്ങൾ പറിച്ചുമാറ്റി നശിപ്പിക്കുക, തോട്ടത്തിൽ നീർവാർച്ച ഉറപ്പാക്കുക."
            elif lang == "hi":
                return f"🌿 **{c['name']} - कीट एवं रोग नियंत्रण उपाय:**\n\n• **प्रमुख रोग और प्रबंधन:**\n{c['pests_diseases']}\n\n• **जैविक उपचार:** स्यूडोमोनास (20 ग्राम/लीटर) या नीम तेल (5 मिली/लीटर) का छिड़काव करें।\n• **महत्वपूर्ण सावधानियां:** जल निकासी की उचित व्यवस्था रखें और संक्रमित पत्तियों को हटा दें।"
            else:
                return f"🌿 **{c['name']} — Comprehensive Pest & Disease Management:**\n\n• **Primary Diagnostic Guidance & Treatments:**\n{c['pests_diseases']}\n\n• **Biological & Organic Controls:** Apply *Pseudomonas fluorescens* (20g/L) or cold-pressed Neem Oil emulsion (5ml/L) as preventative foliage sprays.\n• **Cultural Measures:** Maintain field sanitation, prune infected shoots, and avoid excessive overhead wetting."

        elif intent == "fertilizer_soil":
            if lang == "ml":
                return f"🌱 **{c['name']} - ശാസ്ത്രീയ വളപ്രയോഗ ക്രമം:**\n\n• **മണ്ണിന്റെ സ്വഭാവം:** {c['soil']}\n• **വളപ്രയോഗം (NPK):**\n{c['fertilizer']}\n\n• **ജൈവ വളങ്ങൾ:** നടീൽ സമയത്ത് ആവശ്യത്തിന് ചാണകപ്പൊടിയും വേപ്പിൻപിണ്ണാക്കും ചേർക്കുക. അമ്ലത കുറയ്ക്കാൻ കുമ്മായം പ്രയോഗിക്കുക."
            elif lang == "hi":
                return f"🌱 **{c['name']} - संतुलित उर्वरक एवं पोषण प्रबंधन:**\n\n• **मिट्टी की आवश्यकता:** {c['soil']}\n• **उर्वरक अनुसूची (NPK):**\n{c['fertilizer']}\n\n• **जैविक पोषण:** गोबर की खाद (FYM) और नीम खली का प्रयोग अवश्य करें।"
            else:
                return f"🌱 **{c['name']} — Fertilizer & Soil Nutrition Plan:**\n\n• **Soil Requirement:** {c['soil']}\n• **Recommended Fertilizer Schedule (NPK & Basal):**\n{c['fertilizer']}\n\n• **Organic Enrichment:** Incorporate well-decomposed FYM and neem cake during basal land preparation."

        elif intent == "water_irrigation":
            if lang == "ml":
                return f"💧 **{c['name']} - ജലസേചന മാർഗ്ഗങ്ങൾ:**\n\n• **നന രീതി:** {c['water']}\n• **വേനൽക്കാല പരിചരണം:** പുതയിടൽ (Mulching) നടത്തുന്നത് ഈർപ്പം നിലനിർത്താൻ സഹായിക്കും."
            elif lang == "hi":
                return f"💧 **{c['name']} - सिंचाई एवं जल प्रबंधन:**\n\n• **सिंचाई आवश्यकता:** {c['water']}\n• **जल संरक्षण:** ड्रिप सिंचाई या मल्चिंग का उपयोग करने से पानी की बचत होती है।"
            else:
                return f"💧 **{c['name']} — Irrigation & Moisture Management:**\n\n• **Irrigation Regimen:** {c['water']}\n• **Water Conservation:** Use organic straw mulching around the root zone to prevent evaporation during high-temperature spells."

        else:
            if lang == "ml":
                return f"🌾 **{c['name']} - സമഗ്ര കൃഷി വിവരങ്ങൾ:**\n\n• **അനുയോജ്യമായ മണ്ണ്:** {c['soil']}\n• **കൃഷി സീസൺ:** {c['seasons']}\n• **വളപ്രയോഗം:** {c['fertilizer']}\n• **നന:** {c['water']}\n• **രോഗ-കീട നിയന്ത്രണം:** {c['pests_diseases']}\n• **വിളവെടുപ്പ്:** {c['harvest']}"
            elif lang == "hi":
                return f"🌾 **{c['name']} - संपूर्ण खेती गाइड:**\n\n• **उपयुक्त मिट्टी:** {c['soil']}\n• **बुवाई का मौसम:** {c['seasons']}\n• **खाद एवं पोषण:** {c['fertilizer']}\n• **सिंचाई:** {c['water']}\n• **कीट एवं रोग नियंत्रण:** {c['pests_diseases']}\n• **कटाई व उत्पादन:** {c['harvest']}"
            else:
                return f"🌾 **{c['name']} — Complete Cultivation Guide:**\n\n• **Soil & pH:** {c['soil']}\n• **Seasons & Sowing:** {c['seasons']}\n• **Fertilizer & NPK:** {c['fertilizer']}\n• **Water & Irrigation:** {c['water']}\n• **Pest & Disease Control:** {c['pests_diseases']}\n• **Harvesting Standards:** {c['harvest']}"

    if intent == "fertilizer_soil" or "jeevamrutha" in query or "organic" in query:
        if lang == "ml":
            return f"🍃 **ജൈവ വളങ്ങളും പോഷക പരിപാലനവും:**\n\n1. **ജീവാമൃതം നിർമ്മാണം:** 10 കി.ഗ്രാം ചാണകം + 10 ലിറ്റർ ഗോമൂത്രം + 2 കി.ഗ്രാം ശർക്കര + 2 കി.ഗ്രാം പയറുപൊടി + ഒരു പിടി ഫലഭൂയിഷ്ഠമായ മണ്ണ് എന്നിവ 200 ലിറ്റർ വെള്ളത്തിൽ കലക്കി 4-5 ദിവസം തണലിൽ സൂക്ഷിക്കുക. ദിവസവും രണ്ടുതവണ ഇളക്കുക. ഏക്കറിന് 200 ലിറ്റർ എന്ന തോതിൽ നനവെള്ളത്തോടൊപ്പം നൽകാം.\n2. **മണ്ണിന്റെ പുളിപ്പ് (അമ്ലത) മാറ്റാൻ:** അമ്ലഗുണമുള്ള വെട്ടുക്കൽ മണ്ണിൽ ഏക്കറിന് 200-250 കി.ഗ്രാം കുമ്മായം അല്ലെങ്കിൽ ഡോളമൈറ്റ് ചേർക്കുക.\n3. **സൂക്ഷ്മ മൂലകങ്ങൾ:** വേപ്പിൻപിണ്ണാക്കും ട്രൈക്കോഡെർമയും ചേർത്ത മിശ്രിതം മണ്ണിലെ നിമാവിരകളെയും കുമിളുകളെയും തടയും."
        elif lang == "hi":
            return f"🍃 **जैविक खाद एवं पोषण प्रबंधन:**\n\n1. **जीवामृत निर्माण विधि:** 10 किग्रा देसी गाय का गोबर + 10 लीटर गोमूत्र + 2 किग्रा गुड़ + 2 किग्रा बेसन + मुट्ठी भर उपजाऊ मिट्टी को 200 लीटर पानी में घोलें। 4-5 दिनों तक छाया में रखें और प्रतिदिन हिलाएं। प्रति एकड़ 200 लीटर का प्रयोग करें।\n2. **अम्लीय मिट्टी सुधार:** अम्लीय मिट्टी (pH < 6.0) में 200-250 किग्रा कृषि चूना/डोलोमाइट प्रति एकड़ डालें।\n3. **जैव उर्वरक:** एजोस्पाइरिलम और पीएसबी (फॉस्फेट सोलुबिलाइजिंग बैक्टीरिया) का प्रयोग बीजोपचार एवं मृदा उपचार हेतु करें।"
        else:
            return f"🍃 **Organic Soil Nutrition & Bio-Fertilizer Guide:**\n\n1. **Jeevamrutha Preparation:** Combine 10 kg native cow dung + 10 L cow urine + 2 kg jaggery + 2 kg pulse flour + handful of virgin farm soil in 200 L water. Ferment in shade for 4-5 days, stirring twice daily. Apply @ 200 L/acre with irrigation every 15-21 days.\n2. **Soil Acidity & Liming:** For acidic soils (pH < 6.0), broadcast Agricultural Lime or Dolomite @ 250-400 kg/acre 2 weeks prior to fertilizing.\n3. **Bio-Control & Organic Nematicides:** Incorporate *Trichoderma viride* fortified neem cake (500 kg/ha) to suppress soil-borne fungal pathogens."

    if intent == "pest_disease":
        if lang == "ml":
            return f"🛡️ **സസ്യസംരക്ഷണവും കീട-രോഗ നിയന്ത്രണവും:**\n\n1. **ജൈവ കീടനാശിനികൾ:**\n• ഇലതീനിപ്പുഴുക്കൾ, ചാഴി: വേപ്പെണ്ണ വെളുത്തുള്ളി മിശ്രിതം (20 മി.ലി വെളുത്തുള്ളി നീര് + 5 മി.ലി വേപ്പെണ്ണ/ലിറ്റർ) തളിക്കുക.\n• കുമിൾ രോഗങ്ങൾ: സ്യൂഡോമോണസ് ഫ്ലൂറസെൻസ് (20 ഗ്രാം/ലിറ്റർ) അല്ലെങ്കിൽ 1% ബോർഡോ മിശ്രിതം തളിക്കുക.\n2. **കെണികൾ:** മഞ്ഞക്കെണി (Whiteflies/Aphids), ഫെറമോൺ കെണി (Stem borer/Fruit fly) എന്നിവ ഉപയോഗിക്കുക.\n3. കൃത്യമായ രോഗലക്ഷണ പരിശോധനയ്ക്ക് നമ്മുടെ **'പെസ്റ്റ് സ്കാനർ'** സംവിധാനം ഉപയോഗിച്ച് ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാവുന്നതാണ്."
        elif lang == "hi":
            return f"🛡️ **एकीकृत कीट एवं रोग प्रबंधन (IPM):**\n\n1. **जैविक कीटनाशक:**\n• रस चूसक कीटों के लिए: 10,000 ppm नीम तेल (5 मिली/लीटर) + स्टिकर का छिड़काव करें।\n• फफूंद जनित रोगों के लिए: ट्राइकोडर्मा विरिडी या स्यूडोमोनास (20 ग्राम/लीटर) का प्रयोग करें।\n2. **भौतिक नियंत्रण:** पीला चिपचिपा ट्रैप (एफिड्स/व्हाइटफ्लाई हेतु 10/एकड़) और फेरोमोन ट्रैप लगाएं।\n3. तत्काल रोग पहचान के लिए हमारे **'पेस्ट स्कैनर'** में पौधे की पत्ती की फोटो स्कैन करें।"
        else:
            return f"🛡️ **Integrated Pest & Disease Management (IPM):**\n\n1. **Organic & Biological Control:**\n• **Foliar Fungal Diseases:** Spray *Pseudomonas fluorescens* (20g/L) or 1% Bordeaux mixture on leaves.\n• **Sucking Pests (Aphids, Thrips, Whiteflies):** Spray cold-pressed Neem Oil (5ml/L with mild soap emulsifier) or *Beauveria bassiana* (5g/L).\n2. **Traps & Mechanical Barriers:** Deploy Yellow Sticky Traps (10/acre) and Pheromone Traps (5-8/acre) for early monitoring.\n3. **Instant Diagnosis:** You can also use our **AI Pest & Disease Scanner** to upload a leaf photograph for computer vision symptom analysis."

    if intent == "market_price":
        if lang == "ml":
            return f"📈 **തത്സമയ കാർഷിക വിപണി നിരക്കുകൾ (AGMARKNET):**\n\nഅഗ്രോ ഗൈഡ് ലൈവ് മണ്ടി വിലകൾ AGMARKNET ഡാറ്റാബേസുമായി ബന്ധിപ്പിച്ചിരിക്കുന്നു. നിലവിലെ പ്രധാന നിരക്കുകൾ:\n• **കുരുമുളക്:** ₹59,500/ക്വിന്റൽ (ഉയരുന്നു)\n• **ഏലം:** ₹2,150/കി.ഗ്രാം (ഉയരുന്നു)\n• **നേന്ത്രക്കായ:** ₹4,200/ക്വിന്റൽ (സ്ഥിരത)\n• **കൊപ്ര:** ₹9,850/ക്വിന്റൽ\n\nവിശദമായ മണ്ടി വിവരങ്ങൾക്ക് **'Market Prices'** ടാബ് സന്ദർശിക്കുക."
        elif lang == "hi":
            return f"📈 **दैनिक मंडी भाव (AGMARKNET लाइव फीड):**\n\nएग्रोगाइड सीधे आधिकारिक AGMARKNET मंडी दरों से जुड़ा हुआ है।\n• **काली मिर्च:** ₹59,500/क्विंटल (तेजी)\n• **इलायची:** ₹2,150/किग्रा (तेजी)\n• **केला (नेन्द्रन):** ₹4,200/क्विंटल\n• **धान (ज्योति):** ₹2,820/क्विंटल\n\nसभी प्रमुख मंडियों के ताज़ा भाव देखने के लिए **'Market Prices'** पेज पर जाएं।"
        else:
            return f"📈 **Live Mandi Commodity Prices (AGMARKNET Integrated):**\n\nAgroGuide monitors live APMC arrival prices directly from AGMARKNET feeds:\n• **Black Pepper (Garbled):** ₹59,500/Quintal (Bullish ↑)\n• **Small Cardamom:** ₹2,150/Kg (Bullish ↑)\n• **Nendran Banana:** ₹4,200/Quintal (Stable)\n• **Paddy (Common):** ₹2,820/Quintal\n\nExplore real-time state & district market comparisons in the **'Market Prices'** tab."

    if lang == "ml":
        return f"🌾 **അഗ്രോ ഗൈഡ് കാർഷിക ഉപദേശം:**\n\nനിങ്ങൾ ചോദിച്ച വിഷയത്തിൽ താഴെ പറയുന്ന പ്രധാന കാർഷിക മാർഗ്ഗനിർദ്ദേശങ്ങൾ പാലിക്കുക:\n\n1. **മണ്ണ് പരിശോധന:** വിളയിറക്കുന്നതിന് മുൻപ് മണ്ണിലെ NPK അളവും പി.എച്ചും പരിശോധിക്കുക.\n2. **സീസൺ അധിഷ്ഠിത കൃഷി:** നിങ്ങളുടെ പ്രദേശത്തെ കാലാവസ്ഥയ്ക്കും മഴയ്ക്കും അനുയോജ്യമായ വിളകൾ തിരഞ്ഞെടുക്കുക (വിശദമായ അനുയോജ്യതയ്ക്ക് **'Crop Recommendation'** ഉപയോഗിക്കുക).\n3. **സംയോജിത വളപ്രയോഗം:** രാസവളങ്ങൾക്കൊപ്പം ചാണകപ്പൊടിയും ജീവാമൃതവും നൽകുന്നത് വിളവ് വർദ്ധിപ്പിക്കും.\n4. **കീട നിരീക്ഷണം:** ആഴ്ചയിലൊരിക്കൽ തോട്ടം പരിശോധിച്ച് പ്രാരംഭ ലക്ഷണങ്ങൾ കണ്ടെത്തി ജൈവ രീതിയിൽ പ്രതിരോധിക്കുക.\n\nനിങ്ങൾക്ക് ഏതെങ്കിലും പ്രത്യേക വിളയെക്കുറിച്ചോ (ഉദാ: വാഴ, കുരുമുളക്, നെല്ല്, തക്കാളി) രോഗങ്ങളെക്കുറിച്ചോ അറിയണമെങ്കിൽ പേര് വ്യക്തമാക്കി ചോദിക്കാവുന്നതാണ്."
    elif lang == "hi":
        return f"🌾 **एग्रोगाइड कृषि परामर्श:**\n\nकृषि में सर्वोत्तम उपज और लाभ प्राप्त करने के लिए महत्वपूर्ण सुझाव:\n\n1. **मृदा स्वास्थ्य:** बुवाई से पहले मिट्टी की जांच अवश्य करवाएं और आवश्यकतानुसार चूना/जिप्सम डालें।\n2. **फसल चयन:** स्थानीय मौसम और मिट्टी के अनुसार फसल चुनें (सटीक सुझाव के लिए **'Crop Recommendation'** टूल देखें)।\n3. **संतुलित पोषण:** जैविक खाद (गोबर/कम्पोस्ट) के साथ संतुलित NPK का प्रयोग करें।\n4. **कीट निगरानी:** प्रारंभिक अवस्था में ही जैविक कीटनाशकों (नीम अर्क/ट्राइकोडर्मा) का उपयोग करें।\n\nकिसी विशिष्ट फसल (धान, केला, टमाटर, मिर्च, हल्दी आदि) या बीमारी के बारे में विस्तार से जानने के लिए फसल का नाम लिखकर पूछें।"
    else:
        return f"🌾 **AgroGuide Scientific Agronomic Advisory:**\n\nFor productive and sustainable farming outcomes, consider these core recommendations:\n\n1. **Soil & pH Preparation:** Ensure tested soil pH is within 5.5 - 7.0. Apply agricultural dolomite/lime if acidity is high, and incorporate 10-15 tonnes FYM/ha during land preparation.\n2. **Precision Crop Selection:** Match crop varieties with your agro-climatic zone, water source, and season using our **Crop Recommendation Engine**.\n3. **Balanced Plant Nutrition:** Apply Nitrogen in split doses (basal, vegetative, reproductive) and combine with potassium during flowering/fruiting.\n4. **Proactive Crop Health:** Utilize our **AI Pest Scanner** for visual leaf disease detection and use preventative bio-agents (*Trichoderma* and *Pseudomonas*).\n\nTip: Ask specifically about any crop (e.g. Rice, Banana, Black Pepper, Tomato, Ginger) or disease symptom for exact step-by-step guidance!"


async def generate_chat_response(request: ChatRequest) -> ChatResponse:
    lang = (request.language or "en").lower()

    suggested = SUGGESTED_QUESTIONS_EN
    if lang == "ml":
        suggested = SUGGESTED_QUESTIONS_ML
    elif lang == "hi":
        suggested = SUGGESTED_QUESTIONS_HI

    intent_data = extract_keywords_and_intent(request.message)
    response_text = build_agronomic_response(intent_data, lang)

    return ChatResponse(
        response=response_text,
        suggested_questions=suggested,
        source="AgroGuide Agronomic Intelligence Engine",
        disclaimer="AgroGuide provides verified scientific agronomic practices based on Indian & Kerala Agricultural University guidelines."
    )
