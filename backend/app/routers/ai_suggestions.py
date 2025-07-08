from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from typing import List
import time
import asyncio
import json

from app.models.suggestion import (
    Suggestion, SuggestionCreate, SuggestionResponse, 
    BulkSuggestionRequest, SuggestionType
)
from app.models.user import User
from app.database import get_database
from app.routers.auth import get_current_user
from app.services.ollama_service import OllamaService
from databases import Database

router = APIRouter()

async def get_ollama_service() -> OllamaService:
    """Get Ollama service from app state"""
    from app.main import app
    return app.state.ollama_service

@router.post("/suggestions", response_model=SuggestionResponse)
async def generate_suggestions(
    request: BulkSuggestionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database),
    ollama_service: OllamaService = Depends(get_ollama_service)
):
    """Generate AI-powered writing suggestions for a document"""
    start_time = time.time()
    
    try:
        # Verify document access
        query = "SELECT user_id, writing_goal, language FROM documents WHERE id = :id"
        doc_result = await database.fetch_one(query, {"id": request.document_id})
        
        if not doc_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        document = dict(doc_result)
        if document["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Use document's writing goal and language if not provided
        writing_goal = request.writing_goal or document.get("writing_goal", "professional")
        language = request.language or document.get("language", "en-US")
        
        # Generate suggestions using Ollama
        suggestions_data = await ollama_service.generate_suggestions(
            content=request.content,
            writing_goal=writing_goal,
            language=language
        )
        
        # Convert to Suggestion objects and save to database
        suggestions = []
        for suggestion_data in suggestions_data:
            suggestion_id = f"suggestion_{int(time.time() * 1000)}_{len(suggestions)}"
            
            suggestion = Suggestion(
                id=suggestion_id,
                document_id=request.document_id,
                type=suggestion_data["type"],
                text=suggestion_data["text"],
                suggestion=suggestion_data["suggestion"],
                explanation=suggestion_data["explanation"],
                position=suggestion_data["position"],
                severity=suggestion_data["severity"],
                confidence=suggestion_data["confidence"],
                created_at=time.time(),
                is_applied=False,
                is_dismissed=False
            )
            
            suggestions.append(suggestion)
            
            # Save to database in background
            background_tasks.add_task(
                save_suggestion_to_db,
                suggestion,
                database
            )
        
        processing_time = time.time() - start_time
        
        return SuggestionResponse(
            suggestions=suggestions,
            total_count=len(suggestions),
            processing_time=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate suggestions: {str(e)}"
        )

async def save_suggestion_to_db(suggestion: Suggestion, database: Database):
    """Save suggestion to database"""
    try:
        query = """
        INSERT INTO suggestions (id, document_id, type, text, suggestion, explanation, position, severity, confidence, created_at, is_applied, is_dismissed)
        VALUES (:id, :document_id, :type, :text, :suggestion, :explanation, :position, :severity, :confidence, :created_at, :is_applied, :is_dismissed)
        """
        await database.execute(query, {
            "id": suggestion.id,
            "document_id": suggestion.document_id,
            "type": suggestion.type,
            "text": suggestion.text,
            "suggestion": suggestion.suggestion,
            "explanation": suggestion.explanation,
            "position": json.dumps(suggestion.position.dict()),
            "severity": suggestion.severity,
            "confidence": suggestion.confidence,
            "created_at": suggestion.created_at,
            "is_applied": suggestion.is_applied,
            "is_dismissed": suggestion.is_dismissed
        })
    except Exception as e:
        print(f"Failed to save suggestion to database: {e}")

@router.get("/suggestions/{document_id}", response_model=List[Suggestion])
async def get_document_suggestions(
    document_id: str,
    suggestion_type: SuggestionType = None,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    """Get all suggestions for a document"""
    try:
        # Verify document access
        query = "SELECT user_id FROM documents WHERE id = :id"
        doc_result = await database.fetch_one(query, {"id": document_id})
        
        if not doc_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if doc_result["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Get suggestions
        query = "SELECT * FROM suggestions WHERE document_id = :document_id"
        params = {"document_id": document_id}
        
        if suggestion_type:
            query += " AND type = :type"
            params["type"] = suggestion_type
        
        query += " ORDER BY created_at DESC"
        
        results = await database.fetch_all(query, params)
        
        suggestions = []
        for suggestion_data in results:
            data = dict(suggestion_data)
            data["position"] = json.loads(data["position"])
            suggestions.append(Suggestion(**data))
        
        return suggestions
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch suggestions: {str(e)}"
        )

@router.put("/suggestions/{suggestion_id}/apply")
async def apply_suggestion(
    suggestion_id: str,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    """Mark a suggestion as applied"""
    try:
        # Get suggestion and verify access
        query = """
        SELECT s.*, d.user_id 
        FROM suggestions s 
        JOIN documents d ON s.document_id = d.id 
        WHERE s.id = :id
        """
        suggestion_result = await database.fetch_one(query, {"id": suggestion_id})
        
        if not suggestion_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Suggestion not found"
            )
        
        suggestion_data = dict(suggestion_result)
        if suggestion_data["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Update suggestion
        query = """
        UPDATE suggestions 
        SET is_applied = :is_applied, applied_at = :applied_at 
        WHERE id = :id
        """
        await database.execute(query, {
            "is_applied": True,
            "applied_at": time.time(),
            "id": suggestion_id
        })
        
        return {"message": "Suggestion applied successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to apply suggestion: {str(e)}"
        )

@router.put("/suggestions/{suggestion_id}/dismiss")
async def dismiss_suggestion(
    suggestion_id: str,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    """Mark a suggestion as dismissed"""
    try:
        # Get suggestion and verify access
        query = """
        SELECT s.*, d.user_id 
        FROM suggestions s 
        JOIN documents d ON s.document_id = d.id 
        WHERE s.id = :id
        """
        suggestion_result = await database.fetch_one(query, {"id": suggestion_id})
        
        if not suggestion_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Suggestion not found"
            )
        
        suggestion_data = dict(suggestion_result)
        if suggestion_data["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Update suggestion
        query = """
        UPDATE suggestions 
        SET is_dismissed = :is_dismissed, dismissed_at = :dismissed_at 
        WHERE id = :id
        """
        await database.execute(query, {
            "is_dismissed": True,
            "dismissed_at": time.time(),
            "id": suggestion_id
        })
        
        return {"message": "Suggestion dismissed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to dismiss suggestion: {str(e)}"
        )

@router.post("/tone-analysis")
async def analyze_tone(
    request: dict,
    current_user: User = Depends(get_current_user),
    ollama_service: OllamaService = Depends(get_ollama_service)
):
    """Analyze the tone of text content"""
    try:
        content = request.get("content", "")
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content is required"
            )
        
        tone_analysis = await ollama_service.analyze_tone(content)
        
        return {
            "tone_analysis": tone_analysis,
            "content_length": len(content),
            "analysis_timestamp": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze tone: {str(e)}"
        )

@router.post("/plagiarism-check")
async def check_plagiarism(
    request: dict,
    current_user: User = Depends(get_current_user),
    ollama_service: OllamaService = Depends(get_ollama_service)
):
    """Check content for potential plagiarism"""
    try:
        content = request.get("content", "")
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content is required"
            )
        
        plagiarism_score = await ollama_service.check_plagiarism(content)
        
        return {
            "plagiarism_score": plagiarism_score,
            "status": "original" if plagiarism_score < 5 else "similarities_found",
            "content_length": len(content),
            "check_timestamp": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check plagiarism: {str(e)}"
        )

@router.post("/vocabulary-enhancement")
async def enhance_vocabulary(
    request: dict,
    current_user: User = Depends(get_current_user),
    ollama_service: OllamaService = Depends(get_ollama_service)
):
    """Enhance vocabulary in text"""
    try:
        text = request.get("text", "")
        target_level = request.get("target_level", "advanced")
        
        if not text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text is required"
            )
        
        enhanced_text = await ollama_service.improve_vocabulary(text, target_level)
        
        return {
            "original_text": text,
            "enhanced_text": enhanced_text,
            "target_level": target_level,
            "enhancement_timestamp": time.time()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enhance vocabulary: {str(e)}"
        )