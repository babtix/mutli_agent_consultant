from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    username: str

class UserInDB(UserResponse):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
