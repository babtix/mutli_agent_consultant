from motor.motor_asyncio import AsyncIOMotorClient
from core.settings import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)
database = client[settings.DATABASE_NAME]

# Collections
users_collection = database.get_collection("users")
agents_collection = database.get_collection("agents")
conversations_collection = database.get_collection("conversations")
