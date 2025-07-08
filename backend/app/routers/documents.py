from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from datetime import datetime
import uuid
import json

from app.models.document import Document, DocumentCreate, DocumentUpdate, DocumentVersion
from app.models.user import User
from app.database import get_database
from app.routers.auth import get_current_user
from app.services.analytics_service import AnalyticsService
from databases import Database

router = APIRouter()
analytics_service = AnalyticsService()

@router.post("/", response_model=Document)
async def create_document(
    document: DocumentCreate,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    document_id = str(uuid.uuid4())
    word_count = len(document.content.split()) if document.content else 0
    reading_time = analytics_service.calculate_reading_time(document.content)
    
    try:
        query = """
        INSERT INTO documents (id, title, content, user_id, created_at, updated_at, word_count, reading_time, tags, language, writing_goal, is_public, status, version, collaborators)
        VALUES (:id, :title, :content, :user_id, :created_at, :updated_at, :word_count, :reading_time, :tags, :language, :writing_goal, :is_public, :status, :version, :collaborators)
        """
        await database.execute(query, {
            "id": document_id,
            "title": document.title,
            "content": document.content,
            "user_id": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "word_count": word_count,
            "reading_time": reading_time,
            "tags": json.dumps(document.tags),
            "language": document.language,
            "writing_goal": document.writing_goal,
            "is_public": document.is_public,
            "status": "draft",
            "version": 1,
            "collaborators": json.dumps([])
        })
        
        # Fetch the created document
        query = "SELECT * FROM documents WHERE id = :id"
        result = await database.fetch_one(query, {"id": document_id})
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create document"
            )
        
        doc_data = dict(result)
        doc_data["tags"] = json.loads(doc_data["tags"])
        doc_data["collaborators"] = json.loads(doc_data["collaborators"])
        
        return Document(**doc_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create document: {str(e)}"
        )

@router.get("/", response_model=List[Document])
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    try:
        query = "SELECT * FROM documents WHERE user_id = :user_id"
        params = {"user_id": current_user.id}
        
        if search:
            query += " AND (title LIKE :search OR content LIKE :search)"
            params["search"] = f"%{search}%"
        
        query += " ORDER BY updated_at DESC LIMIT :limit OFFSET :offset"
        params["limit"] = limit
        params["offset"] = skip
        
        results = await database.fetch_all(query, params)
        
        documents = []
        for result in results:
            doc_data = dict(result)
            doc_data["tags"] = json.loads(doc_data["tags"])
            doc_data["collaborators"] = json.loads(doc_data["collaborators"])
            documents.append(Document(**doc_data))
        
        return documents
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch documents: {str(e)}"
        )

@router.get("/{document_id}", response_model=Document)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    try:
        query = "SELECT * FROM documents WHERE id = :id"
        result = await database.fetch_one(query, {"id": document_id})
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        doc_data = dict(result)
        
        # Check if user has access to this document
        if doc_data["user_id"] != current_user.id and not doc_data["is_public"]:
            collaborators = json.loads(doc_data["collaborators"])
            if current_user.email not in collaborators:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        doc_data["tags"] = json.loads(doc_data["tags"])
        doc_data["collaborators"] = json.loads(doc_data["collaborators"])
        
        return Document(**doc_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch document: {str(e)}"
        )

@router.put("/{document_id}", response_model=Document)
async def update_document(
    document_id: str,
    document_update: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    try:
        # First, get the existing document
        query = "SELECT * FROM documents WHERE id = :id"
        existing_result = await database.fetch_one(query, {"id": document_id})
        
        if not existing_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        existing_doc = dict(existing_result)
        
        # Check permissions
        if existing_doc["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Prepare update data
        update_fields = ["updated_at = :updated_at"]
        update_params = {"updated_at": datetime.utcnow(), "id": document_id}
        
        # Only update provided fields
        if document_update.title is not None:
            update_fields.append("title = :title")
            update_params["title"] = document_update.title
        if document_update.content is not None:
            update_fields.append("content = :content")
            update_fields.append("word_count = :word_count")
            update_fields.append("reading_time = :reading_time")
            update_params["content"] = document_update.content
            update_params["word_count"] = len(document_update.content.split())
            update_params["reading_time"] = analytics_service.calculate_reading_time(document_update.content)
        if document_update.tags is not None:
            update_fields.append("tags = :tags")
            update_params["tags"] = json.dumps(document_update.tags)
        if document_update.language is not None:
            update_fields.append("language = :language")
            update_params["language"] = document_update.language
        if document_update.writing_goal is not None:
            update_fields.append("writing_goal = :writing_goal")
            update_params["writing_goal"] = document_update.writing_goal
        if document_update.is_public is not None:
            update_fields.append("is_public = :is_public")
            update_params["is_public"] = document_update.is_public
        if document_update.status is not None:
            update_fields.append("status = :status")
            update_params["status"] = document_update.status
        
        # Increment version if content changed
        if document_update.content is not None:
            update_fields.append("version = :version")
            update_params["version"] = existing_doc["version"] + 1
        
        query = f"UPDATE documents SET {', '.join(update_fields)} WHERE id = :id"
        await database.execute(query, update_params)
        
        # Fetch updated document
        query = "SELECT * FROM documents WHERE id = :id"
        result = await database.fetch_one(query, {"id": document_id})
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update document"
            )
        
        doc_data = dict(result)
        doc_data["tags"] = json.loads(doc_data["tags"])
        doc_data["collaborators"] = json.loads(doc_data["collaborators"])
        
        return Document(**doc_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update document: {str(e)}"
        )

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    try:
        # Check if document exists and user has permission
        query = "SELECT user_id FROM documents WHERE id = :id"
        existing_result = await database.fetch_one(query, {"id": document_id})
        
        if not existing_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if existing_result["user_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Delete the document
        query = "DELETE FROM documents WHERE id = :id"
        await database.execute(query, {"id": document_id})
        
        return {"message": "Document deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )

@router.post("/{document_id}/duplicate", response_model=Document)
async def duplicate_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    database: Database = Depends(get_database)
):
    try:
        # Get original document
        query = "SELECT * FROM documents WHERE id = :id"
        original_result = await database.fetch_one(query, {"id": document_id})
        
        if not original_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        original_doc = dict(original_result)
        
        # Check permissions
        if original_doc["user_id"] != current_user.id and not original_doc["is_public"]:
            collaborators = json.loads(original_doc["collaborators"])
            if current_user.email not in collaborators:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Create duplicate
        new_document_id = str(uuid.uuid4())
        query = """
        INSERT INTO documents (id, title, content, user_id, created_at, updated_at, word_count, reading_time, tags, language, writing_goal, is_public, status, version, collaborators)
        VALUES (:id, :title, :content, :user_id, :created_at, :updated_at, :word_count, :reading_time, :tags, :language, :writing_goal, :is_public, :status, :version, :collaborators)
        """
        await database.execute(query, {
            "id": new_document_id,
            "title": f"{original_doc['title']} (Copy)",
            "content": original_doc["content"],
            "user_id": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "word_count": original_doc["word_count"],
            "reading_time": original_doc["reading_time"],
            "tags": original_doc["tags"],
            "language": original_doc["language"],
            "writing_goal": original_doc["writing_goal"],
            "is_public": False,  # Duplicates are private by default
            "status": "draft",
            "version": 1,
            "collaborators": json.dumps([])
        })
        
        # Fetch the created document
        query = "SELECT * FROM documents WHERE id = :id"
        result = await database.fetch_one(query, {"id": new_document_id})
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to duplicate document"
            )
        
        doc_data = dict(result)
        doc_data["tags"] = json.loads(doc_data["tags"])
        doc_data["collaborators"] = json.loads(doc_data["collaborators"])
        
        return Document(**doc_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to duplicate document: {str(e)}"
        )