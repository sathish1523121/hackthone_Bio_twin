from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from backend.database import profiles_col
from backend.services.supabase_helper import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])

class UserProfileData(BaseModel):
    userId: str
    name: str
    age: str
    gender: str
    height: str
    weight: str
    location: str
    healthGoals: List[str]
    # Lifestyle
    sleepHours: str
    sleepQuality: str
    exerciseLevel: str
    workoutFrequency: str
    diet: str
    waterIntake: str
    stressLevel: Optional[str] = "Normal"
    # Medical
    existingConditions: str
    allergies: str
    currentMedications: str
    # New additions
    profilePhoto: Optional[str] = ""
    bloodGroup: Optional[str] = ""
    emergencyContact: Optional[str] = ""
    lifestyleOccupation: Optional[str] = ""
    lifestyleSmoking: Optional[str] = ""
    lifestyleAlcohol: Optional[str] = ""
    lifestyleScreenTime: Optional[str] = ""
    lifestyleTravel: Optional[str] = ""
    contactPhone: Optional[str] = ""
    contactEmail: Optional[str] = ""

@router.post("")
async def create_or_update_profile(profile: UserProfileData, current_user: dict = Depends(get_current_user)):
    # Restrict action to the authenticated user ID
    if profile.userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update another user's profile."
        )
        
    # Upsert profile document based on userId
    profile_dict = profile.model_dump()
    
    await profiles_col.update_one(
        {"userId": profile.userId},
        {"$set": profile_dict},
        upsert=True
    )
    
    return {
        "status": "success",
        "message": "User health profile stored successfully",
        "profile": profile_dict
    }

@router.get("/{userId}")
async def get_profile(userId: str, current_user: dict = Depends(get_current_user)):
    # Restrict data access to the authenticated user ID
    if userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access another user's profile."
        )
        
    profile = await profiles_col.find_one({"userId": userId})
    if not profile:
        if userId == "demo-user":
            profile = {
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
            await profiles_col.insert_one(profile)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
    # Remove MongoDB internal _id for serialization
    profile.pop("_id", None)
    return profile
