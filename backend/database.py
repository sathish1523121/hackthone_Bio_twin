import motor.motor_asyncio
from backend.config import settings

# Initialize Async MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URI)
db = client.biotwin_ai

# Collection helpers
users_col = db.users
profiles_col = db.profiles
reports_col = db.reports
documents_col = db.documents
pending_signups_col = db.pending_signups
password_resets_col = db.password_resets

async def init_db():
    # We can create indexes if needed (e.g. email index)
    await users_col.create_index("email", unique=True)
    await pending_signups_col.create_index("email", unique=True)
    await password_resets_col.create_index("token", unique=True)
    
    # TTL Index: Automatically expire pending signups after 5 mins (300s)
    # based on created_at field
    try:
        await pending_signups_col.create_index("created_at", expireAfterSeconds=300)
        await password_resets_col.create_index("created_at", expireAfterSeconds=900)
    except Exception as e:
        print(f"Error creating TTL indexes (could be local MongoDB limitations): {e}")
        
    # Seed demo user profile for Demo Sandbox Mode
    try:
        demo_profile = {
            "userId": "demo-user",
            "name": "Alex Carter",
            "age": "32",
            "gender": "Non-binary",
            "height": "178 cm",
            "weight": "74 kg",
            "location": "San Francisco, CA",
            "healthGoals": ["Reduce cholesterol", "Increase Vitamin D", "Improve sleep quality"],
            "sleepHours": "6.5",
            "sleepQuality": "Fair",
            "exerciseLevel": "Moderate",
            "workoutFrequency": "3 times/week",
            "diet": "Mainly vegetarian",
            "waterIntake": "1.5L",
            "stressLevel": "Moderate",
            "existingConditions": "None",
            "allergies": "Seasonal pollen",
            "currentMedications": "None"
        }
        await profiles_col.update_one(
            {"userId": "demo-user"},
            {"$set": demo_profile},
            upsert=True
        )
        print("Demo user profile seeded in MongoDB.")
    except Exception as e:
        print(f"Error seeding demo user profile: {e}")
        
    print("Database connection initialized and unique indices created.")


