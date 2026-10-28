import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from backend.database import get_database

logger = logging.getLogger("krishivoice.farmer")

class FarmerMemoryService:
    async def get_profile(self, farmer_id: str) -> Optional[Dict[str, Any]]:
        db = get_database()
        if db is not None:
            doc = await db["farmers"].find_one({"farmer_id": farmer_id})
            if doc:
                doc["_id"] = str(doc["_id"])
                return doc
        # No fake fallback! Returns None if farmer has not yet created a profile.
        return None

    async def save_or_update_profile(self, farmer_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Saves or updates real farmer profile into MongoDB.
        """
        db = get_database()
        if db is None:
            return {"success": False, "error": "Database not connected"}

        profile_data["farmer_id"] = farmer_id
        profile_data["updated_at"] = datetime.now().isoformat()
        if "created_at" not in profile_data:
            profile_data["created_at"] = datetime.now().isoformat()

        await db["farmers"].update_one(
            {"farmer_id": farmer_id},
            {"$set": profile_data},
            upsert=True
        )

        saved = await db["farmers"].find_one({"farmer_id": farmer_id})
        if saved:
            saved["_id"] = str(saved["_id"])
        return {"success": True, "profile": saved}

    async def get_conversation_history(self, farmer_id: str, limit: int = 15) -> List[Dict[str, Any]]:
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
