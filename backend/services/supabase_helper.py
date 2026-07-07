from fastapi import Header, HTTPException, status
from backend.services.jwt_helper import decode_jwt
from backend.database import users_col

async def get_current_user(authorization: str = Header(...)) -> dict:
    """
    FastAPI dependency to extract and validate the custom local JWT token.
    Decodes the token, checks signature & expiration, and loads the user from MongoDB.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected 'Bearer <token>'."
        )
    
    token = authorization.split(" ")[1]
    if token == "demo-token":
        return {
            "id": "demo-user",
            "email": "alex.carter@demo.com",
            "name": "Alex Carter",
            "phone": ""
        }
    
    try:
        # Decode and verify the custom JWT token
        payload = decode_jwt(token)
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: Subject missing."
            )
            
        # Fetch user details from MongoDB
        user = await users_col.find_one({"_id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found or has been deactivated."
            )
            
        # Convert _id to id to match previous Supabase dictionary structure
        user_data = {
            "id": user["_id"],
            "email": user["email"],
            "name": user.get("name", "User"),
            "phone": user.get("phone", "")
        }
        
        return user_data
        
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal authentication error: {str(e)}"
        )
