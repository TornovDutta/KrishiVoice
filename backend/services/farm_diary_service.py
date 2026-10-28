import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from backend.database import get_database

class FarmDiaryService:
    async def add_voice_log(self, farmer_id: str, spoken_text: str, language: str = "bn-IN") -> Dict[str, Any]:
        """
        Interprets spoken diary entries like: 'আমি ১৫ জুলাই মাঠে ধান রোপণ করেছি'
        or 'I planted paddy on 15 July in North field'.
        Saves diary entry and automatically sets up reminders.
        """
        db = get_database()
        
        # Simple extraction heuristics
        crop = "Paddy (ধান)"
        crop_code = "paddy"
        if "potato" in spoken_text.lower() or "আলু" in spoken_text:
            crop = "Potato (আলু)"
            crop_code = "potato"
        elif "mustard" in spoken_text.lower() or "সরিষা" in spoken_text:
            crop = "Mustard (সরিষা)"
            crop_code = "mustard"

        field = "Field A (উত্তর মাঠ)"
        if "দক্ষিণ" in spoken_text or "south" in spoken_text.lower() or "field b" in spoken_text.lower():
            field = "Field B (দক্ষিণ মাঠ)"

        # Infer planting date
        event_date = datetime.utcnow().strftime("%Y-%m-%d")
        if "15 july" in spoken_text.lower() or "১৫ জুলাই" in spoken_text:
            event_date = "2026-07-15"

        diary_entry = {
            "farmer_id": farmer_id,
            "crop": crop,
            "crop_code": crop_code,
            "activity": "Transplanting / Sowing (রোপণ)",
            "date": event_date,
            "field": field,
            "spoken_input": spoken_text,
            "created_at": datetime.utcnow().isoformat()
        }

        if db is not None:
            await db["diary"].insert_one(diary_entry)

        # Generate smart agronomic reminders for this crop cycle
        generated_reminders = self._generate_reminders_for_crop(farmer_id, crop, field, event_date)
        if db is not None and generated_reminders:
            await db["reminders"].insert_many(generated_reminders)

        message_bn = f"{field}-এ {crop} রোপণের তথ্য ডায়েরিতে যুক্ত করা হয়েছে। আপনার জন্য প্রয়োজনীয় পরিচর্যা ও সার প্রয়োগের রিমাইন্ডার তৈরি করা হলো।"
        message_en = f"Logged planting of {crop} in {field}. Scheduled agronomical reminders for fertilizing and pest inspection."

        return {
            "success": True,
            "entry": diary_entry,
            "generated_reminders": generated_reminders,
            "message": message_bn if language == "bn-IN" else message_en
        }

    def _generate_reminders_for_crop(self, farmer_id: str, crop: str, field: str, base_date_str: str) -> List[Dict[str, Any]]:
        base_date = datetime.strptime(base_date_str, "%Y-%m-%d")
        reminders = []

        if "paddy" in crop.lower() or "ধান" in crop:
            tasks = [
                {
                    "days": 21,
                    "title": "Top dressing with Urea & Potash",
                    "title_bn": "ইউরিয়া ও পটাশ সারের দ্বিতীয় কিস্তি প্রয়োগ",
                    "desc": "Apply 15 kg Urea + 8 kg MOP per bigha. Maintain 2-3 cm thin standing water.",
                    "desc_bn": "থোর আসার মুখে বিঘা প্রতি ১৫ কেজি ইউরিয়া এবং ৮ কেজি পটাশ দিন।",
                    "category": "fertilizer",
                    "priority": "high"
                },
                {
                    "days": 35,
                    "title": "Check for Brown Spot & Stem Borer",
                    "title_bn": "পাতায় বাদামী দাগ ও মাজরা পোকা নিরীক্ষণ",
                    "desc": "Monitor 20 random hills for oval brown spots and dead-heart symptoms.",
                    "desc_bn": "জমির চার কোণে ২০টি গোছা ঘুরে দেখুন পাতায় ডিম্বাকৃতি বাদামী দাগ বা ডগা শুকিয়ে যাওয়া আছে কি না।",
                    "category": "pest_disease",
                    "priority": "medium"
                },
                {
                    "days": 75,
                    "title": "Field Drainage before Harvest",
                    "title_bn": "ধান কাটার আগে জমির জল নিষ্কাশন",
                    "desc": "Drain out excess standing water 10-14 days prior to harvesting for uniform grain drying.",
                    "desc_bn": "ধান পাকার ১০-১২ দিন আগে জমির জল পুরোপুরি বার করে দিন যাতে ধান সমানভাবে শুকায়।",
                    "category": "harvest",
                    "priority": "high"
                }
            ]
        else:
            tasks = [
                {
                    "days": 15,
                    "title": "First Earthing Up and Weeding",
                    "title_bn": "গাছের গোড়ায় মাটি তোলা ও আগাছা দমন",
                    "desc": "Carefully hoe and earth up ridges around the potato stems.",
                    "desc_bn": "আলু গাছের গোড়ায় ভেলি বেঁধে মাটি তুলে দিন ও আগাছা পরিষ্কার করুন।",
                    "category": "cultural",
                    "priority": "high"
                },
                {
                    "days": 30,
                    "title": "Prophylactic Mancozeb Spray against Late Blight",
                    "title_bn": "নাবী ধসা রোগ প্রতিরোধে ম্যানকোজেব স্প্রে",
                    "desc": "Apply Mancozeb 75% WP @ 2.5 g/L if weather turns cloudy or foggy.",
                    "desc_bn": "আকাশ মেঘলা বা কুয়াশা থাকলে প্রতি লিটার জলে ২.৫ গ্রাম ম্যানকোজেব স্প্রে করুন।",
                    "category": "pest_disease",
                    "priority": "high"
                }
            ]

        for i, t in enumerate(tasks):
            due = base_date + timedelta(days=t["days"])
            reminders.append({
                "reminder_id": f"rem_{farmer_id}_{crop[:3].lower()}_{t['days']}",
                "farmer_id": farmer_id,
                "crop": crop,
                "field": field,
                "title": t["title"],
                "title_bn": t["title_bn"],
                "description": t["desc"],
                "description_bn": t["desc_bn"],
                "due_date": due.strftime("%Y-%m-%d"),
                "priority": t["priority"],
                "completed": False,
                "category": t["category"]
            })

        return reminders

    async def get_reminders(self, farmer_id: str) -> List[Dict[str, Any]]:
        db = get_database()
        reminders = []
        if db is not None:
            cursor = db["reminders"].find({"farmer_id": farmer_id}).sort("due_date", 1)
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                reminders.append(doc)

        if not reminders:
            reminders = [
                {
                    "reminder_id": "rem_default_1",
                    "farmer_id": farmer_id,
                    "crop": "Paddy (ধান)",
                    "field": "Field A (উত্তর মাঠ)",
                    "title": "Top dressing with Urea & Potash",
                    "title_bn": "ইউরিয়া ও পটাশ সারের দ্বিতীয় কিস্তি প্রয়োগ",
                    "description": "Apply 15 kg Urea + 8 kg MOP per bigha at panicle initiation stage. Maintain thin water layer.",
                    "description_bn": "থোর আসার মুখে বিঘা প্রতি ১৫ কেজি ইউরিয়া এবং ৮ কেজি পটাশ দিন। জমিতে ২-৩ সেমি পাতলা জল রাখুন।",
                    "due_date": "2026-10-29",
                    "priority": "high",
                    "completed": False,
                    "category": "fertilizer"
                },
                {
                    "reminder_id": "rem_default_2",
                    "farmer_id": farmer_id,
                    "crop": "Paddy (ধান)",
                    "field": "Field A (উত্তর মাঠ)",
                    "title": "Check for Brown Spot & Stem Borer",
                    "title_bn": "পাতায় বাদামী দাগ ও মাজরা পোকা নিরীক্ষণ",
                    "description": "Inspect 20 random hills across field corners for oval brown spots on leaves.",
                    "description_bn": "জমির চার কোণে ২০টি গোছা ঘুরে দেখুন পাতায় ডিম্বাকৃতি বাদামী দাগ বা ডগা শুকিয়ে যাওয়া আছে কি না।",
                    "due_date": "2026-10-30",
                    "priority": "medium",
                    "completed": False,
                    "category": "pest_disease"
                }
            ]
        return reminders

    async def toggle_reminder(self, reminder_id: str, completed: bool) -> bool:
        db = get_database()
        if db is not None:
            res = await db["reminders"].update_one(
                {"reminder_id": reminder_id},
                {"$set": {"completed": completed}}
            )
            return res.modified_count > 0
        return True

farm_diary_service = FarmDiaryService()
