from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from core.database import users_collection
from core.security import get_password_hash, verify_password, create_access_token
from core.settings import settings
from models.user import UserCreate, UserResponse, Token
from datetime import timedelta
from dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await users_collection.find_one({"$or": [{"email": user.email}, {"username": user.username}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="L'email ou le nom d'utilisateur est déjà utilisé")
    
    user_dict = user.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    return user_dict

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"username": form_data.username})
    if not user:
        # fallback to email login
        user = await users_collection.find_one({"email": form_data.username})
        
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

from pydantic import BaseModel as PydanticBaseModel

class PasswordChange(PydanticBaseModel):
    current_password: str
    new_password: str

class ProfileUpdate(PydanticBaseModel):
    username: str | None = None
    email: str | None = None

@router.put("/me/password")
async def change_password(data: PasswordChange, current_user: dict = Depends(get_current_user)):
    # Refetch user with hashed_password
    user = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
    if not verify_password(data.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    if len(data.new_password) < 4:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit contenir au moins 4 caractères")
    new_hash = get_password_hash(data.new_password)
    await users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"hashed_password": new_hash}}
    )
    return {"status": "success", "message": "Mot de passe modifié avec succès"}

@router.put("/me", response_model=UserResponse)
async def update_profile(data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {}
    if data.username and data.username != current_user.get("username"):
        existing = await users_collection.find_one({"username": data.username})
        if existing and str(existing["_id"]) != current_user["_id"]:
            raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà utilisé")
        update_data["username"] = data.username
    if data.email and data.email != current_user.get("email"):
        existing = await users_collection.find_one({"email": data.email})
        if existing and str(existing["_id"]) != current_user["_id"]:
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        update_data["email"] = data.email
    if update_data:
        await users_collection.update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": update_data}
        )
    updated = await users_collection.find_one({"_id": ObjectId(current_user["_id"])})
    updated["_id"] = str(updated["_id"])
    return updated

# --- User Management ---
from typing import List
from dependencies import get_current_admin_user
from bson import ObjectId

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(current_admin: dict = Depends(get_current_admin_user)):
    users = await users_collection.find().to_list(100)
    for user in users:
        user["_id"] = str(user["_id"])
    return users

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_admin: dict = Depends(get_current_admin_user)):
    if str(current_admin["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "deleted"}

@router.put("/users/{user_id}/promote")
async def promote_user(user_id: str, current_admin: dict = Depends(get_current_admin_user)):
    result = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_admin": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or already admin")
    return {"status": "promoted"}
