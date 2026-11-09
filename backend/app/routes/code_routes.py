from fastapi import APIRouter

from app.models.code_analysis import (
    CodeRequest,
    CodeAnalysisResponse
)

from app.services.code_analysis_service import (
    CodeAnalysisService
)

router = APIRouter()

code_service = CodeAnalysisService()

@router.post(
    "/analyse-code",
    response_model=CodeAnalysisResponse
)
def analyse_code(request: CodeRequest):

    result = code_service.analyse_code(
        request.code,
        request.language
    )

    return result