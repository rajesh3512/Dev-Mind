
from typing import Literal
from pydantic import BaseModel, Field  ,ConfigDict
from datetime import datetime

# Supported programming languages
ProgrammingLanguage = Literal[
    "Python",
    "Java",
    "C++",
    "JavaScript"
]


# Incoming request structure
class ChatRequest(BaseModel):

    question: str = Field(
        min_length=3,
        max_length=2000
    )

    language: ProgrammingLanguage = "Python"


# Outgoing response structure
class ChatResponse(BaseModel):

    status: str
    question: str
    language: ProgrammingLanguage
    answer: str

class ChatHistoryResponse(BaseModel):

    id: int
    question: str
    language: str
    answer: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationCreate(BaseModel):

    title: str = Field(
        default="New Conversation",
        min_length=1,
        max_length=200
    )


class ConversationResponse(BaseModel):

    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
    is_pinned: bool


class MessageResponse(BaseModel):

    id: int
    conversation_id: int
    role: Literal["user", "assistant"]
    content: str
    language: ProgrammingLanguage
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationChatResponse(BaseModel):

    status: str
    conversation_id: int
    question: str
    language: ProgrammingLanguage
    answer: str

class ConversationSearchResult(BaseModel):

    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    match_type: Literal["title", "message"]

    matched_message_id: int | None = None

    matched_message_role: Literal["user", "assistant"] | None = None

    matched_message_preview: str | None = None

    model_config = ConfigDict(from_attributes=True)
    is_pinned: bool

class ConversationRename(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class ConversationPinUpdate(BaseModel):
    is_pinned: bool