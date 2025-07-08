from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    subscription_tier: str = "free"
    preferences: dict = {}
    
    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    subscription_tier: str
    preferences: dict
    document_count: int
    total_words_written: int

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    email: Optional[str] = None