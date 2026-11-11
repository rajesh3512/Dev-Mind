from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.models.chat import ChatRequest, ChatResponse, ChatHistoryResponse
from app.services.chat_service import ChatService
from app.database.connection import get_db
from app.database.models import ChatHistory
from fastapi import HTTPException


router = APIRouter()

chat_service = ChatService()


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):

    # Generate the response
    response = chat_service.process_question(request)

    # Save the conversation in SQLite
    chat_service.save_chat(db, response)

    # Return the response
    return response

@router.get(
    "/chat/history",
    response_model=list[ChatHistoryResponse]
)
def get_chat_history(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):

    response = (
        db.query(ChatHistory)
        .order_by(ChatHistory.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return response

@router.get(
    "/chat/{chat_id}",
    response_model=ChatHistoryResponse
)
def get_chat(chat_id: int, db: Session = Depends(get_db)):

    # Search for the conversation using its ID
    chat = db.query(ChatHistory).filter(
        ChatHistory.id == chat_id
    ).first()

    # Check whether the conversation exists
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    # Return the conversation
    return chat

@router.delete("/chat/{chat_id}")
def delete_chat(
    chat_id: int,
    db: Session = Depends(get_db)
):

    # Find the conversation
    chat = db.query(ChatHistory).filter(
        ChatHistory.id == chat_id
    ).first()

    # Check whether it exists
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="Chat not found"
        )

    # Delete the conversation
    db.delete(chat)

    # Commit the transaction
    db.commit()

    return {"message": "Chat deleted successfully"}