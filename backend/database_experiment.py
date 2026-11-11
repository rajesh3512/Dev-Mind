from app.database.connection import SessionLocal
from app.database.models import ChatHistory

db = SessionLocal()

try:
    # Accept user input
    question = input("Enter your question: ")
    language = input("Enter programming language: ")
    answer = input("Enter the answer: ")

    # Create a new chat history object
    new_chat = ChatHistory(
        question=question,
        language=language,
        answer=answer
    )

    # Save the record
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    print("\nChat saved successfully!")
    print("Record ID:", new_chat.id)

    # Retrieve all saved conversations
    records = db.query(ChatHistory).all()

    print("\n========== DEV MIND CHAT HISTORY ==========")

    for record in records:
        print(f"\nID: {record.id}")
        print(f"Question: {record.question}")
        print(f"Language: {record.language}")
        print(f"Answer: {record.answer}")
        print("------------------------------------------")

finally:
    db.close()