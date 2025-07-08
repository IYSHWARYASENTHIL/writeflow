from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any
import json

from app.models.document import DocumentAnalytics
from app.models.user import User
from app.database import get_database
from app.routers.auth import get_current_user
from app.services.analytics_service import AnalyticsService
from databases import Database

router = APIRouter()
analytics_service = AnalyticsService()

@router.get("/document/{document_id}", response_model=DocumentAnalytics)
async def get_document_analytics(
    document_id: str,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    """Get comprehensive analytics for a document"""
    try:
        # Verify document access
        query = "SELECT * FROM documents WHERE id = :id"
        doc_result = await database.fetch_one(query, {"id": document_id})
        
        if not doc_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        document = dict(doc_result)
        if document["user_id"] != current_user.id:
            # Check if user is a collaborator
            collaborators = json.loads(document.get("collaborators", "[]"))
            if current_user.email not in collaborators:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Generate analytics
        analytics = analytics_service.analyze_document(document["content"], document_id)
        
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate analytics: {str(e)}"
        )

@router.get("/document/{document_id}/readability")
async def get_readability_score(
    document_id: str,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    """Get detailed readability analysis"""
    try:
        # Verify document access
        query = "SELECT content, user_id FROM documents WHERE id = :id"
        doc_result = await database.fetch_one(query, {"id": document_id})
        
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
        
        content = document["content"]
        readability_score = analytics_service._calculate_readability(content)
        
        return {
            "readability_score": readability_score,
            "grade_level": analytics_service._calculate_grade_level(content),
            "reading_time": analytics_service.calculate_reading_time(content),
            "recommendations": analytics_service._get_readability_recommendations(readability_score)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate readability: {str(e)}"
        )

@router.get("/document/{document_id}/keywords")
async def get_document_keywords(
    document_id: str,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    """Extract keywords from document content"""
    try:
        # Verify document access
        query = "SELECT content, user_id FROM documents WHERE id = :id"
        doc_result = await database.fetch_one(query, {"id": document_id})
        
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
        
        keywords = analytics_service.extract_keywords(document["content"], limit)
        
        return {
            "keywords": keywords,
            "total_keywords": len(keywords),
            "document_id": document_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract keywords: {str(e)}"
        )

@router.get("/user/stats")
async def get_user_writing_stats(
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    """Get user's overall writing statistics"""
    try:
        # Get all user documents
        query = "SELECT word_count, created_at, status FROM documents WHERE user_id = :user_id"
        docs_results = await database.fetch_all(query, {"user_id": current_user.id})
        
        documents = [dict(doc) for doc in docs_results]
        
        total_documents = len(documents)
        total_words = sum(doc["word_count"] for doc in documents)
        
        # Calculate documents by status
        status_counts = {}
        for doc in documents:
            status = doc["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Calculate writing streak (simplified)
        recent_docs = [doc for doc in documents if doc["created_at"]]
        writing_streak = min(len(recent_docs), 7)  # Simplified calculation
        
        # Average words per document
        avg_words_per_doc = total_words / total_documents if total_documents > 0 else 0
        
        return {
            "total_documents": total_documents,
            "total_words": total_words,
            "average_words_per_document": round(avg_words_per_doc, 1),
            "documents_by_status": status_counts,
            "writing_streak_days": writing_streak,
            "user_id": current_user.id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user stats: {str(e)}"
        )

@router.post("/document/{document_id}/compare")
async def compare_document_versions(
    document_id: str,
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    """Compare analytics between two versions of a document"""
    try:
        version1_content = request.get("version1_content", "")
        version2_content = request.get("version2_content", "")
        
        if not version1_content or not version2_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Both version contents are required"
            )
        
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
        
        # Analyze both versions
        analytics1 = analytics_service.analyze_document(version1_content, f"{document_id}_v1")
        analytics2 = analytics_service.analyze_document(version2_content, f"{document_id}_v2")
        
        # Calculate improvements
        improvements = {
            "readability_change": analytics2.readability_score - analytics1.readability_score,
            "clarity_change": analytics2.clarity_score - analytics1.clarity_score,
            "engagement_change": analytics2.engagement_score - analytics1.engagement_score,
            "vocabulary_change": analytics2.vocabulary_score - analytics1.vocabulary_score,
            "word_count_change": analytics2.writing_stats["total_words"] - analytics1.writing_stats["total_words"]
        }
        
        return {
            "version1_analytics": analytics1,
            "version2_analytics": analytics2,
            "improvements": improvements,
            "overall_improvement": sum(improvements.values()) / len(improvements)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare versions: {str(e)}"
        )