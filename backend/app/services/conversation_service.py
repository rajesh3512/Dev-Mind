from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.models import Conversation, Message


class ConversationService:

    # ==========================================
    # CREATE CONVERSATION
    # ==========================================

    def create_conversation(
        self,
        db: Session,
        title: str = "New Conversation"
    ):

        conversation = Conversation(title=title)

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    # ==========================================
    # GET SINGLE CONVERSATION
    # ==========================================

    def get_conversation(
        self,
        db: Session,
        conversation_id: int
    ):

        return (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )

    # ==========================================
    # RENAME CONVERSATION
    # ==========================================

    def rename_conversation(
        self,
        db: Session,
        conversation_id: int,
        new_title: str
    ):

        conversation = self.get_conversation(
            db,
            conversation_id
        )

        if not conversation:
            return None

        title = new_title.strip()

        if not title:
            raise ValueError("Conversation title cannot be empty")

        conversation.title = title

        db.commit()
        db.refresh(conversation)

        return conversation

    # ==========================================
    # PIN / UNPIN CONVERSATION
    # ==========================================

    def pin_conversation(
        self,
        db: Session,
        conversation_id: int,
        is_pinned: bool
    ):

        conversation = self.get_conversation(
            db,
            conversation_id
        )

        if not conversation:
            return None

        conversation.is_pinned = is_pinned

        db.commit()
        db.refresh(conversation)

        return conversation

    # ==========================================
    # ADD MESSAGE
    # ==========================================

    def add_message(
        self,
        db: Session,
        conversation_id: int,
        role: str,
        content: str,
        language: str
    ):

        conversation = self.get_conversation(
            db,
            conversation_id
        )

        if not conversation:
            raise ValueError("Conversation not found")

        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            language=language
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    # ==========================================
    # GET MESSAGES
    # ==========================================

    def get_messages(
        self,
        db: Session,
        conversation_id: int
    ):

        return (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id
            )
            .order_by(Message.id.asc())
            .all()
        )

    # ==========================================
    # GENERATE MESSAGE PREVIEW
    # ==========================================

    def generate_message_preview(
        self,
        content: str,
        search_term: str,
        context_length: int = 60
    ):

        lower_content = content.lower()
        lower_search = search_term.lower()

        match_position = lower_content.find(lower_search)

        if match_position == -1:
            return content[:150]

        start = max(0, match_position - context_length)

        end = min(
            len(content),
            match_position + len(search_term) + context_length
        )

        preview = content[start:end]

        if start > 0:
            preview = "..." + preview

        if end < len(content):
            preview += "..."

        return preview

    # ==========================================
    # SEARCH CONVERSATIONS
    # ==========================================

    def search_conversations(
        self,
        db: Session,
        query: str
    ):

        search_term = query.strip()

        if not search_term:
            return []

        search_pattern = f"%{search_term}%"

        conversations = (
            db.query(Conversation)
            .outerjoin(
                Message,
                Conversation.id == Message.conversation_id
            )
            .filter(
                or_(
                    Conversation.title.ilike(search_pattern),
                    Message.content.ilike(search_pattern)
                )
            )
            .distinct()
            .order_by(
                Conversation.is_pinned.desc(),
                Conversation.updated_at.desc()
            )
            .limit(50)
            .all()
        )

        results = []

        for conversation in conversations:

            matching_message = (
                db.query(Message)
                .filter(
                    Message.conversation_id == conversation.id,
                    Message.content.ilike(search_pattern)
                )
                .order_by(Message.id.desc())
                .first()
            )

            if matching_message:

                result = {
                    "id": conversation.id,
                    "title": conversation.title,
                    "is_pinned": conversation.is_pinned,
                    "created_at": conversation.created_at,
                    "updated_at": conversation.updated_at,
                    "match_type": "message",
                    "matched_message_id": matching_message.id,
                    "matched_message_role": matching_message.role,
                    "matched_message_preview":
                        self.generate_message_preview(
                            matching_message.content,
                            search_term
                        )
                }

            else:

                result = {
                    "id": conversation.id,
                    "title": conversation.title,
                    "is_pinned": conversation.is_pinned,
                    "created_at": conversation.created_at,
                    "updated_at": conversation.updated_at,
                    "match_type": "title",
                    "matched_message_id": None,
                    "matched_message_role": None,
                    "matched_message_preview": None
                }

            results.append(result)

        return results

    # ==========================================
    # DELETE CONVERSATION
    # ==========================================

    def delete_conversation(
        self,
        db: Session,
        conversation_id: int
    ):

        conversation = self.get_conversation(
            db,
            conversation_id
        )

        if not conversation:
            return False

        db.delete(conversation)
        db.commit()

        return True