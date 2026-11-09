
from app.models.chat import ChatRequest, ChatResponse


class ChatService:

    def __init__(self):
        self.application_name = "DevMind AI"

    def process_question(
        self,
        request: ChatRequest
    ) -> ChatResponse:

        question = request.question
        language = request.language

        answer = (
            f"You asked: {question}. "
            f"Programming language: {language}. "
            "AI integration will be added soon."
        )

        return ChatResponse(
            status="success",
            question=question,
            language=language,
            answer=answer
        )
