from datetime import datetime
from typing import Dict, Any, Optional, List
from backend.services.agri_rag_service import agri_rag_service
from backend.database import get_database

class CropAssistantService:
    async def analyze_crop_issue(
        self,
        farmer_id: str,
        voice_query: str,
        language: str = "bn-IN",
        follow_up_answers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Processes real farmer voice query, retrieves verified ICAR/IRRI agricultural factsheets,
        prepares actionable safe guidance, handles uncertainty, and logs session to MongoDB.
        """
        db = get_database()
        farmer_context = None

        # Retrieve authentic personal farm memory from MongoDB if available
        if db is not None:
            farmer_context = await db["farmers"].find_one({"farmer_id": farmer_id})

        # Query RAG engine over official agricultural factsheets
        rag_result = agri_rag_service.retrieve_guidance(voice_query, farmer_context)

        # Build personalized spoken response in farmer's language
        if language == "bn-IN":
            spoken_response = self._build_bengali_response(rag_result, farmer_context, voice_query)
        elif language == "hi-IN":
            spoken_response = self._build_hindi_response(rag_result, farmer_context, voice_query)
        else:
            spoken_response = self._build_english_response(rag_result, farmer_context, voice_query)

        farmer_display_name = "Farmer"
        if farmer_context:
            farmer_display_name = farmer_context.get("native_name") or farmer_context.get("name") or "Farmer"

        result = {
            "query": voice_query,
            "language": language,
            "farmer_id": farmer_id,
            "farmer_name": farmer_display_name,
            "crop_identified": rag_result.get("crop", "Paddy (ধান)"),
            "disease_name": rag_result.get("disease_name", "Uncertain Leaf Symptom"),
            "confidence": rag_result.get("confidence", 0.70),
            "is_uncertain": rag_result.get("is_uncertain", False),
            "spoken_response": spoken_response,
            "distinguishing_feature": rag_result.get("distinguishing_feature", ""),
            "follow_up_questions": rag_result.get("follow_up_questions", []),
            "cultural_remedies": rag_result.get("cultural_remedies", []),
            "chemical_remedies_safe": rag_result.get("chemical_remedies_safe", []),
            "citation": rag_result.get("source_citation", "ICAR - National Rice Research Institute & IRRI"),
            "severity": rag_result.get("severity", "Moderate"),
            "escalate_recommended": rag_result.get("escalate_recommended", False),
            "timestamp": datetime.now().isoformat()
        }

        # Store in MongoDB conversation history
        if db is not None:
            try:
                await db["conversations"].insert_one({
                    "farmer_id": farmer_id,
                    "type": "crop_problem",
                    "query": voice_query,
                    "language": language,
                    "result": result,
                    "created_at": datetime.now()
                })
            except Exception as e:
                print(f"Error saving conversation to MongoDB: {e}")

        return result

    def _build_bengali_response(self, rag: Dict[str, Any], farmer: Optional[Dict[str, Any]], query: str) -> str:
        if not rag.get("found", True):
            return "আপনার বর্ণনাকৃত লক্ষণটি সম্পূর্ণ স্পষ্ট নয়। নিশ্চিত হওয়ার জন্য অনুগ্রহ করে বলুন পাতাটির কোন অংশে দাগ হয়েছে এবং দাগের আকার কেমন? প্রয়োজনে কৃষি বিশেষজ্ঞের পরামর্শ নেওয়া নিরাপদ।"
        
        disease = rag.get("disease_name", "")
        if "Brown Spot" in disease or "বাদামী দাগ" in disease:
            return (
                "লক্ষণ দেখে মনে হচ্ছে এটি ধানের বাদামী দাগ রোগ (Brown Spot)। "
                "সাধারণত মাটিতে পটাশ বা নাইট্রোজেনের ঘাটতি এবং জমিতে জলের টান পড়লে এই রোগ বাড়ে। "
                "প্রথমে জমিতে পর্যাপ্ত রস বজায় রাখুন এবং সম্ভব হলে বিঘা প্রতি ৬-৮ কেজি মিউরেট অব পটাশ (MOP) উপরিপ্রয়োগ করুন। "
                "প্রয়োজনে ম্যানকোজেব ৭৫% ডব্লিউপি প্রতি লিটার জলে ২ গ্রাম গুলে স্প্রে করতে পারেন। "
                "দয়া করে লক্ষ্য করুন দাগের চারপাশে কি হলুদ বলয় আছে? এটি নিশ্চিত হতে সাহায্য করবে।"
            )
        elif "Blast" in disease or "ঝলসা" in disease:
            return (
                "লক্ষণগুলো ধানের ব্লাস্ট বা পাতা ঝলসা রোগের সাথে মিলে যায়। "
                "দাগগুলো সাধারণত তীরের ফলা বা নৌকার মতো ছুঁচলো হয়। "
                "আপাতত জমিতে ইউরিয়া সার দেওয়া বন্ধ রাখুন এবং জমিতে পাতলা জল রাখুন। "
                "ট্রাইসাইক্লাজোল ৭৫% ডব্লিউপি প্রতি লিটার জলে ০.৬ গ্রাম গুলে স্প্রে করতে পারেন।"
            )
        elif "Stem Borer" in disease or "মাজরা" in disease:
            return (
                "এটি ধানের মাজরা পোকার আক্রমণ হতে পারে। এর কারণে মাঝের কচি ডগা শুকিয়ে যায়। "
                "জমি থেকে শুকনো ডগাটি আলগাভাবে উঠে এলে এটি নিশ্চিত। "
                "জমিতে বিঘাপ্রতি ১-২টি ফেরোমোন ফাঁদ পাতুন এবং কারটাপ হাইড্রোক্লোরাইড ৪% জি বিঘা প্রতি ৭.৫ কেজি দিতে পারেন।"
            )
        elif "Late Blight" in disease or "ধসা" in disease:
            return (
                "লক্ষণগুলো আলুর নাবী ধসা (Late Blight) রোগের ইঙ্গিত দিচ্ছে। "
                "কুয়াশাচ্ছন্ন আবহাওয়ায় এটি দ্রুত ছড়ায়। অবিলম্বে ম্যানকোজেব বা সাইমোক্সানিল+ম্যানকোজেব স্প্রে করুন এবং সেচ বন্ধ রাখুন।"
            )
        return f"আপনার ফসলে {disease}-এর লক্ষণ দেখা যাচ্ছে। প্রাথমিক সমাধান হিসেবে পরিষ্কার জল এবং সুষম সার ব্যবহার করুন।"

    def _build_hindi_response(self, rag: Dict[str, Any], farmer: Optional[Dict[str, Any]], query: str) -> str:
        disease = rag.get("disease_name", "")
        if "Brown Spot" in disease or "বাদামী দাগ" in disease:
            return (
                "लक्षणों के आधार पर यह धान का भूरा धब्बा रोग (Brown Spot) प्रतीत होता है। "
                "यह आमतौर पर पोटाश की कमी या खेत में नमी की कमी से होता है। "
                "खेत में नमी बनाए रखें और पोटाश का उचित प्रयोग करें। "
                "जरूरत पड़ने पर मैंकोजेब 75% WP 2 ग्राम प्रति लीटर पानी में मिलाकर छिड़काव करें।"
            )
        return f"आपकी फसल में {disease} के लक्षण हैं। कृपया खेत में नमी और खाद की जांच करें।"

    def _build_english_response(self, rag: Dict[str, Any], farmer: Optional[Dict[str, Any]], query: str) -> str:
        disease = rag.get("disease_name", "")
        return (
            f"Based on the symptoms, this appears to be {disease}. "
            "Maintain adequate soil moisture and apply balanced fertilizers. "
            "For safe management, spray Mancozeb 75% WP at 2g per liter of water. "
            "Refer to the verified ICAR/IRRI advisory for detailed dosage and waiting period."
        )

crop_assistant_service = CropAssistantService()
