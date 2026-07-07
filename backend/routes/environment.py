from fastapi import APIRouter, HTTPException, status, Depends
import requests
import urllib.parse
from datetime import datetime, timezone
from backend.services.supabase_helper import get_current_user
from backend.database import db, profiles_col

router = APIRouter(prefix="/api/environment", tags=["environment"])

environment_history_col = db.environment_history

def get_lat_lon(location_name: str):
    """
    Geocodes a location string using Open-Meteo Geocoding API.
    Returns: (latitude, longitude, formatted name) or (None, None, None)
    """
    safe_name = urllib.parse.quote(location_name.strip())
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={safe_name}&count=1&language=en&format=json"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        results = response.json().get("results")
        if results and len(results) > 0:
            match = results[0]
            return match["latitude"], match["longitude"], f"{match.get('name', '')}, {match.get('country', '')}"
    except Exception as e:
        print(f"Geocoding failed for {location_name}: {e}")
    return None, None, None

def get_weather_and_aqi(lat: float, lon: float):
    """
    Fetches weather & air quality details for a given lat/lon from Open-Meteo.
    """
    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m"
    aqi_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi,uv_index,pm2_5,pm10"
    
    data = {
        "temperature": 22.0,
        "humidity": 50,
        "aqi": 40,
        "uvIndex": 1.0,
        "pm2_5": 8.0,
        "pm10": 15.0
    }
    
    try:
        # Weather request
        res_w = requests.get(weather_url, timeout=5)
        res_w.raise_for_status()
        w_data = res_w.json()
        current_w = w_data.get("current", {})
        data["temperature"] = current_w.get("temperature_2m", data["temperature"])
        data["humidity"] = current_w.get("relative_humidity_2m", data["humidity"])
    except Exception as e:
        print(f"Weather fetch failed: {e}")
        
    try:
        # AQI request
        res_a = requests.get(aqi_url, timeout=5)
        res_a.raise_for_status()
        a_data = res_a.json()
        current_a = a_data.get("current", {})
        data["aqi"] = current_a.get("us_aqi", data["aqi"])
        data["uvIndex"] = current_a.get("uv_index", data["uvIndex"])
        data["pm2_5"] = current_a.get("pm2_5", data["pm2_5"])
        data["pm10"] = current_a.get("pm10", data["pm10"])
    except Exception as e:
        print(f"AQI fetch failed: {e}")
        
    return data

@router.get("/{userId}")
async def get_live_environment(userId: str, current_user: dict = Depends(get_current_user)):
    """
    Fetches real-time environmental metrics (temp, AQI, UV, humidity) for the user's location,
    inserts into MongoDB log, and returns.
    """
    if userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized access."
        )
        
    # Get user profile to check location
    profile = await profiles_col.find_one({"userId": userId})
    if not profile or not profile.get("location"):
        # Fallback location
        location_name = "New York, USA"
    else:
        location_name = profile["location"]
        
    # 1. Geocode location name
    lat, lon, resolved_name = get_lat_lon(location_name)
    if not lat or not lon:
        # Default coordinates for New York
        lat, lon, resolved_name = 40.7128, -74.0060, location_name
        
    # 2. Fetch meteorological details
    metrics = get_weather_and_aqi(lat, lon)
    
    # 3. Save logs in history database
    log_doc = {
        "userId": userId,
        "location": resolved_name,
        "latitude": lat,
        "longitude": lon,
        **metrics,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await environment_history_col.insert_one(log_doc)
    
    # Convert MongoDB internal _id for serialization
    log_doc.pop("_id", None)
    return log_doc

@router.get("/history/{userId}")
async def get_environment_history(userId: str, current_user: dict = Depends(get_current_user)):
    """Retrieves previous weather and AQI fetches for charts."""
    if userId != current_user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized access."
        )
        
    cursor = environment_history_col.find({"userId": userId}).sort("createdAt", 1).limit(7)
    history_logs = []
    async for doc in cursor:
        doc.pop("_id", None)
        history_logs.append(doc)
        
    # Generate mock history if empty to bootstrap charts
    if not history_logs:
        profile = await profiles_col.find_one({"userId": userId})
        loc = profile.get("location", "New York, USA") if profile else "New York, USA"
        for i in range(5, 0, -1):
            history_logs.append({
                "userId": userId,
                "location": loc,
                "latitude": 40.71,
                "longitude": -74.0,
                "temperature": 20 + i % 3,
                "humidity": 55 + i % 5,
                "aqi": 35 + i * 2,
                "uvIndex": 1.5 + i * 0.5,
                "pm2_5": 7.5 + i,
                "pm10": 12.0 + i * 1.5,
                "createdAt": datetime.now(timezone.utc).isoformat()
            })
            
    return history_logs
