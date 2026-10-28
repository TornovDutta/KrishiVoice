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
        
        # Seed initial data if empty
        await seed_initial_data()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # Note: If Mongo is unavailable, in-memory fallback will be utilized
        db = None

async def close_mongo_connection():
    global client
    if client:
        logger.info("Closing MongoDB connection...")
        client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    return db

async def seed_initial_data():
    """Seed initial farmer profile, mandi prices, and crop guides if database is empty."""
    if db is None:
        return
        
    try:
        # 1. Seed Default Farmer Profile (Ramesh Ghosh, Bardhaman, West Bengal)
        farmer_col = db["farmers"]
        existing_farmer = await farmer_col.find_one({"farmer_id": "farmer_wb_001"})
        if not existing_farmer:
            default_farmer = {
                "farmer_id": "farmer_wb_001",
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
                ],
                "created_at": "2026-07-15T08:00:00Z"
            }
            await farmer_col.insert_one(default_farmer)
            logger.info("Seeded default farmer profile: Ramesh Ghosh (Purba Bardhaman)")

        # 2. Seed Mandi Rates (West Bengal Mandis: Bardhaman, Sheoraphuli, Nadia, etc.)
        mandi_col = db["mandi_prices"]
        if await mandi_col.count_documents({}) == 0:
            sample_prices = [
                {
                    "commodity": "Paddy (Dhan - Common)",
                    "local_name": "ধান (স্বর্ণা / সাধারণ)",
                    "market": "Bardhaman APMC Mandi",
                    "district": "Purba Bardhaman",
                    "state": "West Bengal",
                    "arrival_date": "2026-10-28",
                    "min_price": 2250,
                    "max_price": 2380,
                    "modal_price": 2320,
                    "unit": "₹/Quintal",
                    "price_per_kg": 23.2,
                    "trend": "up",
                    "change_pct": "+1.8%",
                    "source": "Agmarknet (Govt. of India)",
                    "msp_reference": 2300
                },
                {
                    "commodity": "Potato (Jyoti)",
                    "local_name": "আলু (জ্যোতি)",
                    "market": "Memari Wholesale Market",
                    "district": "Purba Bardhaman",
                    "state": "West Bengal",
                    "arrival_date": "2026-10-28",
                    "min_price": 1450,
                    "max_price": 1600,
                    "modal_price": 1520,
                    "unit": "₹/Quintal",
                    "price_per_kg": 15.2,
                    "trend": "stable",
                    "change_pct": "0.0%",
                    "source": "West Bengal State Agricultural Marketing Board",
                    "msp_reference": None
                },
                {
                    "commodity": "Tomato",
                    "local_name": "টমেটো",
                    "market": "Sheoraphuli Mandi",
                    "district": "Hooghly",
                    "state": "West Bengal",
                    "arrival_date": "2026-10-28",
                    "min_price": 2800,
                    "max_price": 3200,
                    "modal_price": 3000,
                    "unit": "₹/Quintal",
                    "price_per_kg": 30.0,
                    "trend": "down",
                    "change_pct": "-4.2%",
                    "source": "Agmarknet (Govt. of India)",
                    "msp_reference": None
                },
                {
                    "commodity": "Mustard (Sarson)",
                    "local_name": "সরিষা",
                    "market": "Kalna Market",
                    "district": "Purba Bardhaman",
                    "state": "West Bengal",
                    "arrival_date": "2026-10-28",
                    "min_price": 5400,
                    "max_price": 5750,
                    "modal_price": 5600,
                    "unit": "₹/Quintal",
                    "price_per_kg": 56.0,
                    "trend": "up",
                    "change_pct": "+2.5%",
                    "source": "Agmarknet (Govt. of India)",
                    "msp_reference": 5650
                },
                {
                    "commodity": "Onion",
                    "local_name": "পেঁয়াজ (নাসিক / দেশি)",
                    "market": "Krishnanagar Market",
                    "district": "Nadia",
                    "state": "West Bengal",
                    "arrival_date": "2026-10-28",
                    "min_price": 3400,
                    "max_price": 3800,
                    "modal_price": 3600,
                    "unit": "₹/Quintal",
                    "price_per_kg": 36.0,
                    "trend": "up",
                    "change_pct": "+3.1%",
                    "source": "Agmarknet (Govt. of India)",
                    "msp_reference": None
                }
            ]
            await mandi_col.insert_many(sample_prices)
            logger.info("Seeded initial Mandi price records.")

        # 3. Seed Farm Diary & Reminders
        reminders_col = db["reminders"]
        if await reminders_col.count_documents({}) == 0:
            sample_reminders = [
                {
                    "reminder_id": "rem_001",
                    "farmer_id": "farmer_wb_001",
                    "crop": "Paddy (ধান)",
                    "field": "Field A (North Field)",
                    "title": "Top dressing with Urea & Potash",
                    "title_bn": "ইউরিয়া ও পটাশ সারের দ্বিতীয় কিস্তি প্রয়োগ",
                    "description": "Apply 15 kg Urea + 8 kg MOP per bigha at panicle initiation stage. Maintain 2-3 cm thin water layer.",
                    "description_bn": "থোর আসার মুখে বিঘা প্রতি ১৫ কেজি ইউরিয়া এবং ৮ কেজি পটাশ সার দিন। জমিতে ২-৩ সেমি পাতলা জল রাখুন।",
                    "due_date": "2026-10-29",
                    "priority": "high",
                    "completed": False,
                    "category": "fertilizer"
                },
                {
                    "reminder_id": "rem_002",
                    "farmer_id": "farmer_wb_001",
                    "crop": "Paddy (ধান)",
                    "field": "Field A (North Field)",
                    "title": "Check for Brown Spot & Stem Borer",
                    "title_bn": "পাতায় বাদামী দাগ ও মাজরা পোকা নিরীক্ষণ",
                    "description": "Inspect 20 random hills across field corners for oval brown spots on leaves and dead-hearts.",
                    "description_bn": "জমির চার কোণে ২০টি গোছা ঘুরে দেখুন পাতায় ডিম্বাকৃতি বাদামী দাগ বা ডগা শুকিয়ে যাওয়া আছে কি না।",
                    "due_date": "2026-10-30",
                    "priority": "medium",
                    "completed": False,
                    "category": "pest_disease"
                },
                {
                    "reminder_id": "rem_003",
                    "farmer_id": "farmer_wb_001",
                    "crop": "Potato (আলু)",
                    "field": "Field B (South Field)",
                    "title": "Land preparation & FYM application for Potato",
                    "title_bn": "আলু চাষের জমি তৈরি ও গোবর সার প্রয়োগ",
                    "description": "Deep ploughing and incorporation of 20-25 quintal well-decomposed FYM per acre.",
                    "description_bn": "জমি গভীর চাষ দিন এবং বিঘা প্রতি ৮-১০ কুইন্টাল পচা গোবর সার ভালো করে মিশিয়ে দিন।",
                    "due_date": "2026-11-02",
                    "priority": "medium",
                    "completed": True,
                    "category": "land_prep"
                }
            ]
            await reminders_col.insert_many(sample_reminders)
            logger.info("Seeded initial crop reminders.")

    except Exception as e:
        logger.error(f"Error seeding initial data: {e}")
