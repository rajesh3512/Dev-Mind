from typing import Literal
from pydantic import BaseModel, Field

class CodeRequest(BaseModel):

    code: str = Field(
        min_length=1,
        max_length=20000
    )

    language: Literal[
        "Python",
        "Java",
        "C++",
        "JavaScript"
    ]

class CodeAnalysisResponse(BaseModel):

    language: str
    lines: int
    characters: int
    status: str