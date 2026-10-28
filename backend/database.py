import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.config import settings

logger = logging.getLogger("krishivoice.database")

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None

async def connect_to_mongo():
    global client, db
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGO_URI}...")
        client = AsyncIOMotorClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=4000
        )
        db = client[settings.DB_NAME]
        # Ping test
        await client.admin.command('ping')
        logger.info(f"Connected successfully to MongoDB database: {settings.DB_NAME}")
        
        # Ensure proper indexes exist
        await db["farmers"].create_index("farmer_id", unique=True)
        await db["conversations"].create_index([("farmer_id", 1), ("created_at", -1)])
        await db["reminders"].create_index([("farmer_id", 1), ("due_date", 1)])
        await db["mandi_prices"].create_index([("commodity", 1), ("market", 1)])
        await db["expert_cases"].create_index("case_id", unique=True)
        logger.info("MongoDB indexes verified.")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        db = None

async def close_mongo_connection():
    global client
    if client:
        logger.info("Closing MongoDB connection...")
        client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    return db
