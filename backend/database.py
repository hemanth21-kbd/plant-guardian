from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./plants.db")

print(f"🔍 Database URL configured: {DATABASE_URL[:30]}..." if DATABASE_URL else "🔍 No DATABASE_URL env var")

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        DATABASE_URL, connect_args=connect_args
    )
else:
    connect_args = {}
    try:
        engine = create_engine(
            DATABASE_URL, 
            connect_args=connect_args,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30
        )
        print("✅ PostgreSQL engine created successfully")
    except Exception as e:
        print(f"❌ Failed to create PostgreSQL engine: {e}")
        print("🔄 Falling back to SQLite...")
        DATABASE_URL = "sqlite:///./plants.db"
        connect_args = {"check_same_thread": False}
        engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
