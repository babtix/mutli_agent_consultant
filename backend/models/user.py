from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    is_admin: bool = False

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    username: str
    is_admin: bool = False

class UserInDB(UserResponse):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
