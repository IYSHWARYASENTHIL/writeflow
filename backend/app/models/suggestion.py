from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class SuggestionType(str, Enum):
    GRAMMAR = "grammar"
    STYLE = "style"
    CLARITY = "clarity"
    TONE = "tone"
    VOCABULARY = "vocabulary"
    PLAGIARISM = "plagiarism"
    STRUCTURE = "structure"

class SeverityLevel(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"

class TextPosition(BaseModel):
    start: int
    end: int

class SuggestionCreate(BaseModel):
    document_id: str
    type: SuggestionType
    text: str
    suggestion: str
    explanation: str
    position: TextPosition
    severity: SeverityLevel
    confidence: float = Field(..., ge=0, le=100)

class Suggestion(BaseModel):
    id: str
    document_id: str
    type: SuggestionType
    text: str
    suggestion: str
    explanation: str
    position: TextPosition
    severity: SeverityLevel
    confidence: float
    created_at: datetime
    is_applied: bool = False
    is_dismissed: bool = False
    
    class Config:
        from_attributes = True

class SuggestionResponse(BaseModel):
    suggestions: List[Suggestion]
    total_count: int
    processing_time: float

class BulkSuggestionRequest(BaseModel):
    document_id: str
    content: str
    language: str = "en-US"
    writing_goal: str = "professional"
    suggestion_types: List[SuggestionType] = [
        SuggestionType.GRAMMAR,
        SuggestionType.STYLE,
        SuggestionType.CLARITY,
        SuggestionType.TONE
    ]