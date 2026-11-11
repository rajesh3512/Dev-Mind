from datetime import datetime, timezone

from fastapi import HTTPException

from app.models.chat import ChatRequest, ChatResponse
from app.models.chat import ConversationChatResponse

from app.database.models import (
    ChatHistory,
    Conversation,
    Message
)

from app.services.groq_client import generate_response


class ChatService:

    def __init__(self):
        self.application_name = "DevMind AI"

    # ==========================================
    # AUTOMATIC CONVERSATION TITLE GENERATOR
    # ==========================================

    def generate_conversation_title(
        self,
        question: str,
        max_length: int = 60
    ) -> str:

        title = " ".join(question.strip().split())

        if len(title) <= max_length:
            return title.rstrip(" .!?")

        truncated = title[:max_length - 3]

        # Avoid cutting a word in half
        if " " in truncated:
            truncated = truncated.rsplit(" ", 1)[0]

        return truncated.rstrip(" ,.!?;:") + "..."

    # ==========================================
    # NORMAL CHAT
    # ==========================================

    def process_question(
        self,
        request: ChatRequest
    ) -> ChatResponse:

        question = request.question
        language = request.language

        try:
            answer = generate_response(
                question,
                language
            )

        except RuntimeError as error:
            raise HTTPException(
                status_code=503,
                detail=str(error)
            )

        return ChatResponse(
            status="success",
            question=question,
            language=language,
            answer=answer
        )

    # ==========================================
    # SAVE CHAT HISTORY
    # ==========================================

    def save_chat(self, db, response: ChatResponse):

        try:
            new_chat = ChatHistory(
                question=response.question,
                language=response.language,
                answer=response.answer
            )

            db.add(new_chat)
            db.commit()
            db.refresh(new_chat)

            return new_chat

        except Exception:
            db.rollback()
            raise

    # ==========================================
    # CONVERSATION CHAT
    # ==========================================

    def process_conversation_question(
        self,
        db,
        conversation_id: int,
        request: ChatRequest
    ) -> ConversationChatResponse:

        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == conversation_id
            )
            .first()
        )

        if not conversation:
            raise ValueError("Conversation not found")

        try:

            # Retrieve the latest 20 messages
            previous_messages = (
                db.query(Message)
                .filter(
                    Message.conversation_id == conversation_id
                )
                .order_by(Message.id.desc())
                .limit(20)
                .all()
            )

            # Restore chronological order
            previous_messages.reverse()

            # Convert messages into LLM format
            history = [
                {
                    "role": message.role,
                    "content": message.content
                }
                for message in previous_messages
            ]

            # Generate AI response
            answer = generate_response(
                request.question,
                request.language,
                history
            )

            # ==================================
            # AUTOMATIC TITLE GENERATION
            # ==================================

            if len(previous_messages) == 0:

                conversation.title = (
                    self.generate_conversation_title(
                        request.question
                    )
                )

            # ==================================
            # SAVE USER MESSAGE
            # ==================================

            user_message = Message(
                conversation_id=conversation_id,
                role="user",
                content=request.question,
                language=request.language
            )

            # ==================================
            # SAVE AI RESPONSE
            # ==================================

            assistant_message = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=answer,
                language=request.language
            )

            db.add_all([
                user_message,
                assistant_message
            ])

            # Update conversation activity
            conversation.updated_at = datetime.now(
                timezone.utc
            )

            db.commit()

            return ConversationChatResponse(
                status="success",
                conversation_id=conversation_id,
                question=request.question,
                language=request.language,
                answer=answer
            )

        except Exception:
            db.rollback()
            raise