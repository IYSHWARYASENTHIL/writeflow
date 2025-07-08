from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class DocumentStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = ""
    tags: List[str] = []
    language: str = "en-US"
    writing_goal: str = "professional"
    is_public: bool = False

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    language: Optional[str] = None
    writing_goal: Optional[str] = None
    is_public: Optional[bool] = None
    status: Optional[DocumentStatus] = None

class Document(BaseModel):
    id: str
    title: str
    content: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    word_count: int
    reading_time: int
    tags: List[str]
    language: str
    writing_goal: str
    is_public: bool
    status: DocumentStatus
    version: int
    collaborators: List[str] = []
    
    class Config:
        from_attributes = True

class DocumentAnalytics(BaseModel):
    document_id: str
    readability_score: float
    clarity_score: float
    engagement_score: float
    plagiarism_score: float
    vocabulary_score: float
    grade_level: int
    tone_analysis: Dict[str, float]
    writing_stats: Dict[str, Any]
    
class DocumentVersion(BaseModel):
    id: str
    document_id: str
    content: str
    version_number: int
    created_at: datetime
    changes_summary: str