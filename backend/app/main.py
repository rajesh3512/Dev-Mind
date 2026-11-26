from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import inspect, text

from app.database.connection import Base, engine
from app.database import models as database_models

from app.routes.chat_routes import router as chat_router
from app.routes.code_routes import router as code_router
from app.routes.conversation_routes import router as conversation_router
from app.routes.folder_routes import router as folder_router


# ==========================================
# DATABASE INITIALIZATION AND MIGRATION
# ==========================================

def initialize_database():

    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)

    conversation_columns = [
        column["name"]
        for column in inspector.get_columns("conversations")
    ]

    # Add folder_id to an existing database.
    # Existing conversations remain unassigned.

    if "folder_id" not in conversation_columns:

        with engine.begin() as connection:

            connection.execute(
                text(
                    """
                    ALTER TABLE conversations
                    ADD COLUMN folder_id INTEGER
                    REFERENCES folders(id) ON DELETE SET NULL
                    """
                )
            )

    # Ensure the index exists for both new and existing databases.

    with engine.begin() as connection:

        connection.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS
                ix_conversations_folder_id
                ON conversations (folder_id)
                """
            )
        )


# ==========================================
# APPLICATION LIFESPAN
# ==========================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    initialize_database()

    yield


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="DevMind AI",
    description="Personal AI Developer Assistant",
    version="1.0.0",
    lifespan=lifespan
)


# ==========================================
# CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# HOME ENDPOINT
# ==========================================

@app.get("/")
def home():

    return {
        "application": "DevMind AI",
        "status": "running",
        "message": "Welcome to DevMind AI!"
    }


# ==========================================
# HEALTH ENDPOINT
# ==========================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# ==========================================
# ABOUT ENDPOINT
# ==========================================

@app.get("/about")
def about():

    return {
        "name": "DevMind AI",
        "version": "1.0.0",
        "languages": [
            "Python",
            "Java",
            "C++",
            "JavaScript"
        ],
        "status": "Development"
    }


# ==========================================
# REGISTER ROUTES
# ==========================================

app.include_router(chat_router)
app.include_router(code_router)
app.include_router(conversation_router)
app.include_router(folder_router)