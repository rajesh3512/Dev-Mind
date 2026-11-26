from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Folder, Conversation

from app.models.chat import (
    FolderCreate,
    FolderRename,
    FolderResponse,
    ConversationMove
)


router = APIRouter(
    prefix="/folders",
    tags=["Folders"]
)


# ==========================================
# CREATE FOLDER
# ==========================================

@router.post("/", response_model=FolderResponse)
def create_folder(
    request: FolderCreate,
    db: Session = Depends(get_db)
):

    name = request.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Folder name cannot be empty"
        )

    folder = Folder(name=name)

    db.add(folder)
    db.commit()
    db.refresh(folder)

    return folder


# ==========================================
# LIST FOLDERS
# ==========================================

@router.get("/", response_model=list[FolderResponse])
def list_folders(
    db: Session = Depends(get_db)
):

    return (
        db.query(Folder)
        .order_by(Folder.created_at.desc())
        .all()
    )


# ==========================================
# RENAME FOLDER
# ==========================================

@router.patch("/{folder_id}/rename", response_model=FolderResponse)
def rename_folder(
    folder_id: int,
    request: FolderRename,
    db: Session = Depends(get_db)
):

    folder = db.query(Folder).filter(
        Folder.id == folder_id
    ).first()

    if not folder:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    name = request.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Folder name cannot be empty"
        )

    folder.name = name

    db.commit()
    db.refresh(folder)

    return folder


# ==========================================
# MOVE CONVERSATION
# folder_id = null means Unassigned
# ==========================================

@router.patch("/move-conversation")
def move_conversation(
    request: ConversationMove,
    db: Session = Depends(get_db)
):

    conversation = db.query(Conversation).filter(
        Conversation.id == request.conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    if request.folder_id is not None:

        folder = db.query(Folder).filter(
            Folder.id == request.folder_id
        ).first()

        if not folder:
            raise HTTPException(
                status_code=404,
                detail="Destination folder not found"
            )

    conversation.folder_id = request.folder_id

    db.commit()
    db.refresh(conversation)

    return {
        "message": "Conversation moved successfully",
        "conversation_id": conversation.id,
        "folder_id": conversation.folder_id
    }


# ==========================================
# DELETE FOLDER
# Conversations remain safe
# ==========================================

@router.delete("/{folder_id}")
def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db)
):

    folder = db.query(Folder).filter(
        Folder.id == folder_id
    ).first()

    if not folder:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    # Return conversations to Unassigned
    db.query(Conversation).filter(
        Conversation.folder_id == folder_id
    ).update(
        {Conversation.folder_id: None},
        synchronize_session=False
    )

    db.delete(folder)
    db.commit()

    return {
        "message": "Folder deleted successfully. Conversations moved to Unassigned."
    }