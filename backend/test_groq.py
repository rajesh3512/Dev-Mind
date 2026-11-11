from unittest.mock import patch
from app.services.groq_client import generate_response
import pytest
from groq import APIConnectionError
from groq import RateLimitError
import httpx
from unittest.mock import patch



@patch("app.services.chat_service.generate_response")
def test_chat_not_saved_when_ai_fails(mock_ai, client):

    mock_ai.side_effect = RuntimeError(
        "Unable to connect to the AI service."
    )

    response = client.post(
        "/chat",
        json={
            "question": "Explain Python functions",
            "language": "Python"
        }
    )

    assert response.status_code == 503

    history_response = client.get("/chat/history")

    assert history_response.status_code == 200
    assert len(history_response.json()) == 0

@patch("app.services.groq_client.client.chat.completions.create")
def test_generate_response_rate_limit(mock_groq):

    request = httpx.Request(
        "POST",
        "https://api.groq.com/openai/v1/chat/completions"
    )

    response = httpx.Response(
        status_code=429,
        request=request
    )

    mock_groq.side_effect = RateLimitError(
        message="Rate limit exceeded",
        response=response,
        body={"error": "Rate limit exceeded"}
    )

    with pytest.raises(
        RuntimeError,
        match="AI service rate limit reached"
    ):
        generate_response(
            "Explain Python functions",
            "Python"
        )

@patch("app.services.groq_client.client.chat.completions.create")
def test_generate_response_connection_error(mock_groq):

    mock_groq.side_effect = APIConnectionError(
        request=None
    )

    with pytest.raises(
        RuntimeError,
        match="Unable to connect to the AI service"
    ):
        generate_response(
            "Explain Python functions",
            "Python"
        )


@patch("app.services.groq_client.client.chat.completions.create")
def test_generate_response_empty(mock_groq):

    mock_groq.return_value.choices = [
        type(
            "Choice",
            (),
            {
                "message": type(
                    "Message",
                    (),
                    {
                        "content": ""
                    }
                )()
            }
        )()
    ]

    with pytest.raises(
        RuntimeError,
        match="AI model returned an empty response"
    ):
        generate_response("Explain Python", "Python")

@patch("app.services.groq_client.client.chat.completions.create")
def test_generate_response_success(mock_groq):

    mock_groq.return_value.choices = [
        type(
            "Choice",
            (),
            {
                "message": type(
                    "Message",
                    (),
                    {
                        "content": "A Python function is a reusable block of code."
                    }
                )()
            }
        )()
    ]

    response = generate_response(
        "Explain Python functions",
        "Python"
    )

    assert response == "A Python function is a reusable block of code."

    mock_groq.assert_called_once()