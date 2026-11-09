from fastapi import FastAPI

from app.routes.chat_routes import router as chat_router
from app.routes.code_routes import router as code_router


# Step 1: Create FastAPI application
app = FastAPI(
    title="DevMind AI",
    description="Personal AI Developer Assistant",
    version="1.0.0"
)


# Step 2: Home endpoint
@app.get("/")
def home():
    return {
        "application": "DevMind AI",
        "status": "running",
        "message": "Welcome to DevMind AI!"
    }


# Step 3: Health endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# Step 4: About endpoint
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


# Step 5: Register routers
app.include_router(chat_router)
app.include_router(code_router)