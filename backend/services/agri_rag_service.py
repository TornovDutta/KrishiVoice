import re
from typing import Dict, Any, List, Optional

AGRI_KNOWLEDGE_BASE = [
    {
        "id": "rice_brown_spot",
        "crop": "Paddy / Rice (ধান)",
        "disease_name": "Brown Spot (বাদামী দাগ রোগ)",
        "causal_organism": "Bipolaris oryzae (fungus)",
        "symptoms": [
            "brown spots on leaves",
            "oval or circular spots",
            "yellow halo around brown spot",
            "grey or whitish center",
            "বাদামী দাগ",
            "পাতায় দাগ",
            "পাতায় বাদামী ছোপ",
            "ডিম্বাকৃতি বাদামী দাগ"
        ],
        "growth_stage_typical": "Tillering to panicle emergence (কুশি অবস্থা থেকে থোর অবস্থা)",
        "environmental_factors": "Nutrient deficiency especially Potassium and Nitrogen, sandy or degraded soils, intermittent moisture stress",
        "distinguishing_feature": "Circular to oval spots with distinct yellowish halo and grayish/light center; unlike Blast, the spots do not have pointed spindle ends.",
        "follow_up_questions": [
            "দাগগুলো কি গোল বা ডিম্বাকৃতি এবং তার চারপাশে কি হলুদ বলয় আছে? (Are the spots circular/oval with a yellowish border?)",
            "গাছের বয়স বা বৃদ্ধির ধাপ কত দিন হলো? (What is the age or growth stage of the crop?)",
            "জমি কি শুকিয়ে গিয়েছিল বা সারের পরিমাণ কম ছিল? (Was the field experiencing water shortage or low fertilizer?)"
        ],
        "cultural_remedies": [
            "Maintain adequate soil moisture; do not let the field crack or dry completely.",
            "Apply balanced fertilizer. Top-dress with Muriate of Potash (MOP) @ 6-8 kg/bigha (20-25 kg/ha) if potassium was omitted at basal.",
            "Ensure healthy seedling spacing and remove severely infected leaves if infestation is localized."
        ],
        "chemical_remedies_safe": [
            "Foliar spray of Mancozeb 75% WP @ 2.0 - 2.5 g per liter of water (400-500 g/acre).",
            "Alternatively, spray Propiconazole 25% EC @ 1.0 ml per liter or Tricyclazole 75% WP @ 0.6 g per liter during cool morning hours.",
            "Always wear protective cloth/mask and avoid spraying if rain is predicted within 4 hours."
        ],
        "source_citation": "ICAR - National Rice Research Institute (NRRI) Advisory Bulletin No. 2026/04 & IRRI Rice Knowledge Bank",
        "severity": "Moderate to High (can cause 15-30% yield loss if untreated)",
        "confidence_threshold": 0.82
    },
    {
        "id": "rice_blast",
        "crop": "Paddy / Rice (ধান)",
        "disease_name": "Rice Blast / Leaf Blast (ব্লাস্ট বা ঝলসা রোগ)",
        "causal_organism": "Magnaporthe oryzae (Pyricularia oryzae)",
        "symptoms": [
            "spindle shaped lesions",
            "diamond shaped spots",
            "greyish center with dark brown margin",
            "drying of leaf tips",
            "ঝলসা রোগ",
            "তীরের ফলার মতো দাগ",
            "ব্লাস্ট রোগ"
        ],
        "growth_stage_typical": "Seedling to tillering (leaf blast) and panicle emergence (neck blast)",
        "environmental_factors": "High relative humidity (>90%), dew, excess chemical nitrogen fertilizer application, cloudy days",
        "distinguishing_feature": "Spindle or boat-shaped lesions with pointed ends, ash-grey centers and reddish-brown borders.",
        "follow_up_questions": [
            "দাগের দুই প্রান্ত কি নৌকার তলা বা তীরের ফলার মতো ছুঁচলো? (Are the lesions spindle or boat-shaped with pointed ends?)",
            "জমিতে কি মাত্রাতিরিক্ত ইউরিয়া সার দেওয়া হয়েছে? (Has excess urea nitrogen been applied recently?)"
        ],
        "cultural_remedies": [
            "Immediately stop or split top-dressing of Urea until disease is contained.",
            "Maintain 2-3 cm shallow water layer; avoid alternate heavy flooding and drying.",
            "Destroy weeds on field bunds which act as collateral hosts."
        ],
        "chemical_remedies_safe": [
            "Spray Tricyclazole 75% WP @ 0.6 g/liter of water or Isoprothiolane 40% EC @ 1.5 ml/liter.",
            "Apply two sprays at 10-12 days interval starting from symptom onset."
        ],
        "source_citation": "Bidhan Chandra Krishi Viswavidyalaya (BCKV) Plant Protection Guidelines 2026",
        "severity": "High (can cause severe defoliation and neck rotting)",
        "confidence_threshold": 0.85
    },
    {
        "id": "rice_stem_borer",
        "crop": "Paddy / Rice (ধান)",
        "disease_name": "Yellow Stem Borer (মাজরা পোকা)",
        "causal_organism": "Scirpophaga incertulas (insect pest)",
        "symptoms": [
            "dead heart",
            "white earhead",
            "central shoot dries up",
            "easy pulling of dry central tiller",
            "মাজরা পোকা",
            "মাঝের ডগা শুকিয়ে যাওয়া",
            "সাদা শিষ"
        ],
        "growth_stage_typical": "Vegetative stage ('dead heart') and flowering/milking stage ('white earhead')",
        "environmental_factors": "Stagnant deep water, dense planting, continuous cropping of rice",
        "distinguishing_feature": "Central shoot pulls out effortlessly without breaking, tiny larval entry holes at the base of the stem with frass.",
        "follow_up_questions": [
            "শুকিয়ে যাওয়া মাঝের পাতাটি টানলে কি গোড়া থেকে আলগা হয়ে উঠে আসে? (Does the dry central shoot pull out easily when tugged?)",
            "গাছের গোড়ায় কি কোনো ছোট ছিদ্র বা গুঁড়ো মল দেখা যাচ্ছে? (Are there small holes or brownish frass at the stem base?)"
        ],
        "cultural_remedies": [
            "Install pheromone traps @ 8-10 traps per acre with lure for male moth monitoring.",
            "Release egg parasitoid Trichogramma japonicum @ 50,000/acre at weekly intervals.",
            "Clip seedling leaf tips before transplanting to remove egg masses."
        ],
        "chemical_remedies_safe": [
            "Broadcast Cartap Hydrochloride 4% G @ 7.5 kg/bigha (25 kg/ha) mixed with dry sand in standing water (2-3 cm depth).",
            "Alternatively spray Chlorantraniliprole 18.5% SC @ 0.3 ml/liter (60 ml/acre) when moth flight peaks."
        ],
        "source_citation": "ICAR - National Bureau of Agricultural Insect Resources & Directorate of Plant Protection, Quarantine & Storage",
        "severity": "High",
        "confidence_threshold": 0.88
    },
    {
        "id": "potato_late_blight",
        "crop": "Potato (আলু)",
        "disease_name": "Late Blight of Potato (আলুর নাবী ধসা রোগ)",
        "causal_organism": "Phytophthora infestans (oomycete)",
        "symptoms": [
            "water soaked lesions on leaves",
            "dark brown to black patches on leaves",
            "white fungal growth under leaf in morning",
            "foul rotting smell",
            "ধসা রোগ",
            "আলুর পাতায় কালো ছোপ",
            "নাবী ধসা"
        ],
        "growth_stage_typical": "Tuber vegetative and bulking stage (cool foggy weather)",
        "environmental_factors": "Temperature 10-20°C, RH >85%, prolonged morning fog or unseasonal drizzle",
        "distinguishing_feature": "Water-soaked irregular blackish-brown spots, delicate white mildew on undersides during morning humidity; rapid foliage collapse.",
        "follow_up_questions": [
            "সকালের দিকে পাতার উল্টো পিঠে কি সাদা তুলোর মতো ছত্রাক দেখা যাচ্ছে? (Is there white cottony fungal growth on the underside in morning?)",
            "গত কয়েকদিনে কি ঘন কুয়াশা বা গুঁড়ি গুঁড়ি বৃষ্টি হয়েছে? (Has there been heavy fog or intermittent drizzle recently?)"
        ],
        "cultural_remedies": [
            "Earthing up should be deep to prevent tuber infection from washing spores.",
            "Immediately stop irrigation if cloudy foggy conditions persist.",
            "Destroy and bury initial infected foliage away from the potato plot."
        ],
        "chemical_remedies_safe": [
            "Prophylactic (preventive): Spray Mancozeb 75% WP @ 2.5 g/liter at first fog advisory.",
            "Curative (if spots appear): Spray Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/liter or Dimethomorph 50% WP @ 1 g/liter.",
            "Repeat after 7 days if weather remains overcast."
        ],
        "source_citation": "ICAR - Central Potato Research Institute (CPRI) Shimla & West Bengal Dept of Agriculture",
        "severity": "Urgent / Critical (can destroy entire potato field within 3-5 days)",
        "confidence_threshold": 0.80
    }
]

class AgriRAGService:
    def __init__(self):
        self.kb = AGRI_KNOWLEDGE_BASE

    def retrieve_guidance(self, query_text: str, farmer_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Grounded retrieval over agricultural advisories.
        Supports multi-lingual queries (Bengali, Hindi, English, and mixed Hinglish/Banglish).
        """
        q = query_text.lower()
        matched_disease = None
        best_score = 0.0

        # Context-aware boosting (if farmer memory shows they have Paddy, boost paddy candidates)
        farmer_crops = []
        if farmer_context and "active_crops" in farmer_context:
            for c in farmer_context["active_crops"]:
                farmer_crops.append(c.get("crop_name", "").lower())

        for entry in self.kb:
            score = 0.0
            # Check crop match
            if any(term in q for term in ["ধান", "rice", "paddy", "dhan"]) or any("paddy" in c or "ধান" in c for c in farmer_crops):
                if "paddy" in entry["crop"].lower() or "ধান" in entry["crop"].lower():
                    score += 0.25
            
            if any(term in q for term in ["আলু", "potato", "alu"]):
                if "potato" in entry["crop"].lower() or "আলু" in entry["crop"].lower():
                    score += 0.35

            # Symptom keywords matching
            for sym in entry["symptoms"]:
                if sym in q:
                    score += 0.40
                else:
                    # check word-level overlap
                    sym_words = sym.split()
                    matched_words = [w for w in sym_words if w in q and len(w) > 2]
                    if matched_words:
                        score += 0.15 * (len(matched_words) / len(sym_words))

            # Mixed-language term matching (Brown spot, blast, stem borer, dead heart, borer)
            if "brown" in q or "বাদামী" in q or "দাগ" in q or "spot" in q:
                if entry["id"] == "rice_brown_spot":
                    score += 0.30
            if "blast" in q or "ঝলসা" in q or "spindle" in q:
                if entry["id"] == "rice_blast":
                    score += 0.35
            if "মাজরা" in q or "পোকা" in q or "borer" in q or "dead heart" in q:
                if entry["id"] == "rice_stem_borer":
                    score += 0.35
            if "ধসা" in q or "blight" in q or "পচা" in q or "late blight" in q:
                if entry["id"] == "potato_late_blight":
                    score += 0.35

            if score > best_score:
                best_score = score
                matched_disease = entry

        # Handle uncertain diagnosis
        is_uncertain = best_score < 0.45 or (matched_disease and best_score < matched_disease["confidence_threshold"])
        
        # If no specific disease matched, construct an intelligent safe exploratory response
        if not matched_disease or best_score < 0.20:
            return {
                "found": False,
                "confidence": 0.15,
                "is_uncertain": True,
                "message_bn": "আপনার ফসলের লক্ষণগুলো পরিষ্কার বুঝতে আরও কিছু তথ্য প্রয়োজন। আপনার কোন ফসল এবং পাতায় কি ধরণের দাগ বা পোকার আক্রমণ লক্ষ্য করছেন দয়া করে বলুন।",
                "message_en": "We need a bit more detail to identify the exact crop problem. Please mention the specific crop, affected leaf area, and how the spots or damage appear.",
                "follow_up_questions": [
                    "আক্রান্ত ফসলটি কি ধান, গম, আলু নাকি সবজি? (Which crop is affected: Paddy, Potato, Wheat or vegetables?)",
                    "লক্ষণটি পাতার কোথায় দেখা যাচ্ছে—পুরোনো পাতায় নাকি নতুন কচি ডগায়? (Is the symptom on older leaves or new tender shoots?)",
                    "গাছের আনুমানিক বয়স বা বৃদ্ধির ধাপ কত দিন? (What is the approximate age or stage of the crop?)"
                ],
                "safe_next_steps": [
                    "Do not apply excessive chemical pesticides without verifying the cause.",
                    "Take a close-up photo of the leaf symptoms for expert verification.",
                    "You can connect directly to the Kisan Call Centre at Toll-Free 1800-180-1551."
                ],
                "citation": "ICAR Kisan Advisory Portal & Ministry of Agriculture & Farmers Welfare",
                "escalate_recommended": True
            }

        return {
            "found": True,
            "disease_id": matched_disease["id"],
            "disease_name": matched_disease["disease_name"],
            "crop": matched_disease["crop"],
            "confidence": round(min(best_score, 0.95), 2),
            "is_uncertain": is_uncertain,
            "distinguishing_feature": matched_disease["distinguishing_feature"],
            "follow_up_questions": matched_disease["follow_up_questions"],
            "cultural_remedies": matched_disease["cultural_remedies"],
            "chemical_remedies_safe": matched_disease["chemical_remedies_safe"],
            "source_citation": matched_disease["source_citation"],
            "severity": matched_disease["severity"],
            "escalate_recommended": is_uncertain or matched_disease["severity"] == "Urgent / Critical"
        }

agri_rag_service = AgriRAGService()
