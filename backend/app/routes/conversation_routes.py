from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Conversation

from app.models.chat import (
    ConversationCreate,
    ConversationResponse,
    ConversationSearchResult,
    MessageResponse,
    ChatRequest,
    ConversationChatResponse,
    ConversationRename,
    ConversationPinUpdate
)

from app.services.conversation_service import ConversationService
from app.services.chat_service import ChatService


router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)

conversation_service = ConversationService()
chat_service = ChatService()


# ==========================================
# CREATE CONVERSATION
# ==========================================

@router.post("/", response_model=ConversationResponse)
def create_conversation(
    request: ConversationCreate,
    db: Session = Depends(get_db)
):

    return conversation_service.create_conversation(
        db,
        request.title
    )


# ==========================================
# SEARCH CONVERSATIONS
# Keep before /{conversation_id}
# ==========================================

@router.get(
    "/search",
    response_model=list[ConversationSearchResult]
)
def search_conversations(
    q: str = Query(..., min_length=1, max_length=100),
    db: Session = Depends(get_db)
):

    return conversation_service.search_conversations(
        db,
        q
    )


# ==========================================
# LIST CONVERSATIONS
# PINNED CONVERSATIONS FIRST
# ==========================================

@router.get("/", response_model=list[ConversationResponse])
def list_conversations(
    db: Session = Depends(get_db)
):

    return (
        db.query(Conversation)
        .order_by(
            Conversation.is_pinned.desc(),
            Conversation.updated_at.desc()
        )
        .all()
    )


# ==========================================
# RENAME CONVERSATION
# ==========================================

@router.patch(
    "/{conversation_id}/rename",
    response_model=ConversationResponse
)
def rename_conversation(
    conversation_id: int,
    request: ConversationRename,
    db: Session = Depends(get_db)
):

    try:
        conversation = conversation_service.rename_conversation(
            db,
            conversation_id,
            request.title
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    return conversation


# ==========================================
# PIN / UNPIN CONVERSATION
# ==========================================

@router.patch(
    "/{conversation_id}/pin",
    response_model=ConversationResponse
)
def pin_conversation(
    conversation_id: int,
    request: ConversationPinUpdate,
    db: Session = Depends(get_db)
):

    conversation = conversation_service.pin_conversation(
        db,
        conversation_id,
        request.is_pinned
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    return conversation


# ==========================================
# GET SINGLE CONVERSATION
# ==========================================

@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse
)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db)
):

    conversation = conversation_service.get_conversation(
        db,
        conversation_id
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    return conversation


# ==========================================
# GET CONVERSATION MESSAGES
# ==========================================

@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse]
)
def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db)
):

    conversation = conversation_service.get_conversation(
        db,
        conversation_id
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    return conversation_service.get_messages(
        db,
        conversation_id
    )


# ==========================================
# DELETE CONVERSATION
# ==========================================

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db)
):

    deleted = conversation_service.delete_conversation(
        db,
        conversation_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    return {
        "message": "Conversation deleted successfully"
    }


# ==========================================
# CHAT WITHIN CONVERSATION
# ==========================================

@router.post(
    "/{conversation_id}/chat",
    response_model=ConversationChatResponse
)
def conversation_chat(
    conversation_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db)
):

    try:
        return chat_service.process_conversation_question(
            db,
            conversation_id,
            request
        )

    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error)
        )