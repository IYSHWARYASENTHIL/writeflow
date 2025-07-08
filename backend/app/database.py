from sqlalchemy import create_engine, MetaData, Column, String, Text, Integer, Boolean, DateTime, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./writeflow.db")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Async database for FastAPI
database = Database(DATABASE_URL)

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    subscription_tier = Column(String, default="free")
    preferences = Column(JSON, default=dict)

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    user_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    word_count = Column(Integer, default=0)
    reading_time = Column(Integer, default=0)
    tags = Column(JSON, default=list)
    language = Column(String, default="en-US")
    writing_goal = Column(String, default="professional")
    is_public = Column(Boolean, default=False)
    status = Column(String, default="draft")
    version = Column(Integer, default=1)
    collaborators = Column(JSON, default=list)

class Suggestion(Base):
    __tablename__ = "suggestions"
    
    id = Column(String, primary_key=True)
    document_id = Column(String, nullable=False)
    type = Column(String, nullable=False)
    text = Column(String, nullable=False)
    suggestion = Column(String, nullable=False)
    explanation = Column(String, nullable=False)
    position = Column(JSON, nullable=False)
    severity = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_applied = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    applied_at = Column(DateTime, nullable=True)
    dismissed_at = Column(DateTime, nullable=True)

class DocumentVersion(Base):
    __tablename__ = "document_versions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    version_number = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    changes_summary = Column(String, default="")

async def init_db():
    """Initialize database tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        # Connect to async database
        await database.connect()
        
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

async def close_db():
    """Close database connection"""
    await database.disconnect()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_database():
    return database