from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import SessionLocal
from app.database.models import ChatHistory

client = TestClient(app)


def test_root_endpoint(client):

    response = client.get("/")

    assert response.status_code == 200


def test_chat_endpoint(client):

    response = client.post(
        "/chat",
        json={
            "question": "Explain recursion",
            "language": "Python"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["question"] == "Explain recursion"
    assert data["language"] == "Python"
    assert "answer" in data


def test_chat_persistence(client):

    response = client.post(
        "/chat",
        json={
            "question": "What is machine learning?",
            "language": "Python"
        }
    )

    assert response.status_code == 200

    history = client.get("/chat/history")

    assert history.status_code == 200

    data = history.json()

    assert len(data) == 1
    assert data[0]["question"] == "What is machine learning?"
    assert data[0]["language"] == "Python"

def test_get_chat_history(client):

    client.post(
        "/chat",
        json={
            "question": "What is Python?",
            "language": "Python"
        }
    )

    client.post(
        "/chat",
        json={
            "question": "Explain recursion",
            "language": "Python"
        }
    )

    response = client.get("/chat/history")

    assert response.status_code == 200
    assert len(response.json()) == 2

def test_chat_history_pagination(client):

    for i in range(3):
        client.post(
            "/chat",
            json={
                "question": f"Question {i + 1}",
                "language": "Python"
            }
        )

    response = client.get("/chat/history?limit=2&offset=0")

    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["question"] == "Question 3"

def test_get_individual_chat(client):

    client.post(
        "/chat",
        json={
            "question": "Explain inheritance",
            "language": "Java"
        }
    )

    response = client.get("/chat/1")

    assert response.status_code == 200
    assert response.json()["question"] == "Explain inheritance"

def test_chat_not_found(client):

    response = client.get("/chat/9999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Chat not found"

def test_delete_chat(client):

    client.post(
        "/chat",
        json={
            "question": "What is an API?",
            "language": "Python"
        }
    )

    response = client.delete("/chat/1")

    assert response.status_code == 200

    deleted_chat = client.get("/chat/1")

    assert deleted_chat.status_code == 404

def create_test_conversation(client):
    response = client.post(
        "/conversations/",
        json={"title": "Testing Conversation"}
    )

    assert response.status_code == 200

    return response.json()["id"]


def test_conversation_chat(client, monkeypatch):
    from app.services import chat_service

    monkeypatch.setattr(
        chat_service,
        "generate_response",
        lambda question, language, history=None: "This is a test AI response."
    )

    conversation_id = create_test_conversation(client)

    response = client.post(
        f"/conversations/{conversation_id}/chat",
        json={
            "question": "Explain inheritance",
            "language": "Java"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"
    assert data["conversation_id"] == conversation_id
    assert data["answer"] == "This is a test AI response."

    messages = client.get(
        f"/conversations/{conversation_id}/messages"
    )

    assert messages.status_code == 200
    assert len(messages.json()) == 2


def test_conversation_context(client, monkeypatch):
    from app.services import chat_service

    captured_history = []

    def mock_generate_response(question, language, history=None):
        captured_history.extend(history or [])
        return "Follow-up response"

    monkeypatch.setattr(
        chat_service,
        "generate_response",
        mock_generate_response
    )

    conversation_id = create_test_conversation(client)

    # First question
    client.post(
        f"/conversations/{conversation_id}/chat",
        json={
            "question": "What is inheritance?",
            "language": "Java"
        }
    )

    # Follow-up question
    response = client.post(
        f"/conversations/{conversation_id}/chat",
        json={
            "question": "Give me an example",
            "language": "Java"
        }
    )

    assert response.status_code == 200

    assert len(captured_history) == 2

    assert captured_history[0]["role"] == "user"
    assert captured_history[0]["content"] == "What is inheritance?"

    assert captured_history[1]["role"] == "assistant"
    assert captured_history[1]["content"] == "Follow-up response"


def test_conversation_not_found(client):

    response = client.post(
        "/conversations/9999/chat",
        json={
            "question": "Explain Python",
            "language": "Python"
        }
    )

    assert response.status_code == 404


def test_conversation_ai_failure(client, monkeypatch):
    from app.services import chat_service

    def mock_generate_response(question, language, history=None):
        raise RuntimeError("AI service unavailable")

    monkeypatch.setattr(
        chat_service,
        "generate_response",
        mock_generate_response
    )

    conversation_id = create_test_conversation(client)

    response = client.post(
        f"/conversations/{conversation_id}/chat",
        json={
            "question": "Explain recursion",
            "language": "Python"
        }
    )

    assert response.status_code == 503

    messages = client.get(
        f"/conversations/{conversation_id}/messages"
    )

    assert messages.status_code == 200
    assert messages.json() == []