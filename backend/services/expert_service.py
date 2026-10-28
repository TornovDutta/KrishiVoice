import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from backend.database import get_database

class ExpertService:
    async def create_expert_case(
        self,
        farmer_id: str,
        crop: str,
        symptoms: str,
        growth_stage: Optional[str] = None,
        severity: str = "Urgent / High",
        notes: Optional[str] = None,
        image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes a structured Case Summary for agricultural extension officers / KVK specialists.
        """
        db = get_database()
        farmer = None
        if db is not None:
            farmer = await db["farmers"].find_one({"farmer_id": farmer_id})

        farmer_name = farmer.get("name", "Farmer") if farmer else "Ramesh Ghosh"
        farmer_phone = farmer.get("phone", "+91 98321 45678") if farmer else "+91 98321 45678"
        district = farmer.get("district", "Purba Bardhaman") if farmer else "Purba Bardhaman"
        village = farmer.get("village", "Memari") if farmer else "Memari"

        case_id = f"KV-{district[:3].upper()}-{uuid.uuid4().hex[:6].upper()}"

        # Build concise case summary for extension worker
        case_summary = {
            "case_id": case_id,
            "created_at": datetime.utcnow().isoformat(),
            "status": "Escalated to KVK Specialist",
            "farmer_profile": {
                "farmer_id": farmer_id,
                "name": farmer_name,
                "phone": farmer_phone,
                "village": village,
                "district": district,
                "state": "West Bengal"
            },
            "agronomic_details": {
                "crop": crop,
                "stage": growth_stage or "Tillering to Panicle Initiation",
                "reported_symptoms": symptoms,
                "severity_assessment": severity,
                "ai_preliminary_hypothesis": "Ambiguous leaf spot symptoms (differential: Bipolaris oryzae vs Pyricularia oryzae). Immediate field examination advised."
            },
            "contact_options": {
                "kisan_call_centre": {
                    "number": "1800-180-1551",
                    "timing": "6:00 AM - 10:00 PM (Daily)",
                    "toll_free": True,
                    "languages": ["Bengali", "Hindi", "English"]
                },
                "assigned_kvk": {
                    "name": "Krishi Vigyan Kendra (KVK) Purba Bardhaman",
                    "officer": "Dr. S. Chatterjee (Subject Matter Specialist - Plant Protection)",
                    "phone": "+91 342 265 8921",
                    "office_location": "Chinsurah / Burdwan Agro Campus"
                }
            },
            "notes": notes,
            "image_url": image_url
        }

        if db is not None:
            await db["expert_cases"].insert_one(case_summary)

        return case_summary

    async def get_cases_for_farmer(self, farmer_id: str) -> list:
        db = get_database()
        cases = []
        if db is not None:
            cursor = db["expert_cases"].find({"farmer_profile.farmer_id": farmer_id}).sort("created_at", -1)
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                cases.append(doc)
        return cases

expert_service = ExpertService()
