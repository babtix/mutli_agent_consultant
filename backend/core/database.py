from motor.motor_asyncio import AsyncIOMotorClient
from core.settings import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
database = client[settings.DATABASE_NAME]

# Collections
users_collection = database.get_collection("users")
agents_collection = database.get_collection("agents")
conversations_collection = database.get_collection("conversations")

async def init_db():
    import pymongo
    await users_collection.create_index([("email", pymongo.ASCENDING)], unique=True)
    await users_collection.create_index([("username", pymongo.ASCENDING)], unique=True)
    await conversations_collection.create_index([("user_id", pymongo.ASCENDING), ("updated_at", pymongo.DESCENDING)])
