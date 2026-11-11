from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine
from app.database import models as database_models

from app.routes.chat_routes import router as chat_router
from app.routes.code_routes import router as code_router
from app.routes.conversation_routes import router as conversation_router


# ==========================================
# APPLICATION LIFESPAN
# ==========================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    Base.metadata.create_all(bind=engine)

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