from typing import Dict, Any, Optional, List
from backend.database import get_database

class FarmerMemoryService:
    async def get_profile(self, farmer_id: str) -> Optional[Dict[str, Any]]:
        db = get_database()
        if db is not None:
            doc = await db["farmers"].find_one({"farmer_id": farmer_id})
            if doc:
                doc["_id"] = str(doc["_id"])
                return doc

        # Fallback default farmer memory if db is initializing
        return {
            "farmer_id": farmer_id,
            "name": "Ramesh Ghosh",
            "native_name": "রমেশ ঘোষ",
            "phone": "+91 98321 45678",
            "state": "West Bengal",
            "district": "Purba Bardhaman",
            "village": "Memari",
            "preferred_language": "bn-IN",
            "land_size_bigha": 4.5,
            "land_size_acre": 1.5,
            "soil_type": "Alluvial Loam (পলি দোআঁশ)",
            "active_crops": [
                {
                    "crop_name": "Paddy (ধান)",
                    "variety": "Swarna (MTU 7029)",
                    "season": "Aman (খরিফ / আমন)",
                    "sowing_date": "2026-07-15",
                    "field_name": "Field A (North Field)",
                    "growth_stage": "Tillering to Panicle Initiation (কুশি থেকে থোর অবস্থা)"
                },
                {
                    "crop_name": "Potato (আলু)",
                    "variety": "Kufri Jyoti",
                    "season": "Rabi (রবি)",
                    "sowing_date": "2026-11-10",
                    "field_name": "Field B (South Field)",
                    "growth_stage": "Planned"
                }
            ]
        }

    async def update_profile(self, farmer_id: str, updates: Dict[str, Any]) -> bool:
        db = get_database()
        if db is not None:
            res = await db["farmers"].update_one(
                {"farmer_id": farmer_id},
                {"$set": updates},
                upsert=True
            )
            return True
        return False

    async def get_conversation_history(self, farmer_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        db = get_database()
        history = []
        if db is not None:
            cursor = db["conversations"].find({"farmer_id": farmer_id}).sort("created_at", -1).limit(limit)
            async for doc in cursor:
                doc["_id"] = str(doc["_id"])
                if "created_at" in doc:
                    doc["created_at"] = str(doc["created_at"])
                history.append(doc)
        return history

farmer_memory_service = FarmerMemoryService()
