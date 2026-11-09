
from typing import Literal
from pydantic import BaseModel, Field


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
