# 🚀 DevMind AI

### Your Personal AI Developer Assistant

DevMind AI is a project-based AI engineering application designed to help developers understand code, analyse programming errors and improve their programming skills.

The goal is to build an intelligent developer assistant that combines software engineering, artificial intelligence and agentic AI.

**Project Status:** 🟡 Under Development

---

## 🎯 Project Objectives

- Explain programming code.
- Analyse programming errors.
- Analyse source code.
- Support multiple programming languages.
- Maintain conversation history.
- Integrate Large Language Models (LLMs).
- Develop intelligent AI-powered developer tools.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Python | Backend development |
| FastAPI | REST API development |
| Pydantic | Data validation |
| Uvicorn | ASGI server |
| Git | Version control |
| GitHub | Source code management |

**Planned Technologies**

- Next.js
- TypeScript
- PostgreSQL
- PyTorch
- Large Language Models
- Retrieval-Augmented Generation (RAG)
- Agentic AI

---

## 📁 Project Structure

```text
DevMind/
│
├── README.md
├── .gitignore
│
└── backend/
    ├── app/
    │   ├── main.py
    │   │
    │   ├── models/
    │   │   ├── chat.py
    │   │   └── code_analysis.py
    │   │
    │   ├── routes/
    │   │   ├── chat_routes.py
    │   │   └── code_routes.py
    │   │
    │   └── services/
    │       ├── chat_service.py
    │       └── code_analysis_service.py
    │
    ├── requirements.txt
    └── venv/
```

---

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the backend

```bash
cd DevMind/backend
```

### 3. Create a virtual environment

```bash
python -m venv venv
```

### 4. Activate the environment (Windows)

```powershell
.\venv\Scripts\Activate.ps1
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Start the application

```bash
python -m uvicorn app.main:app --reload
```

The backend will run at:

http://127.0.0.1:8000

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Application information |
| GET | `/health` | Health check |
| GET | `/about` | Project information |
| POST | `/chat` | Submit programming questions |
| POST | `/analyse-code` | Analyse submitted source code |

### Interactive API Documentation

http://127.0.0.1:8000/docs

---

## 🧠 Current Development Progress

- [x] FastAPI application setup
- [x] Health check endpoint
- [x] Chat API endpoint
- [x] Modular backend architecture
- [x] Pydantic request validation
- [x] Basic code analysis API
- [ ] Advanced code analysis
- [ ] Database integration
- [ ] Chat history
- [ ] LLM integration
- [ ] AI-powered code explanation
- [ ] Error analysis
- [ ] AI agent integration
- [ ] Frontend development
- [ ] Cloud deployment

---

## 📚 Learning Approach

This project follows a practical engineering approach:

**Learn → Build → Test → Debug → Improve → Deploy**

Every feature is developed while learning the underlying software engineering and AI concepts.

---

## 🌱 Future Vision

The long-term goal is to transform DevMind AI into a comprehensive AI-powered developer platform with intelligent coding assistance, automated code analysis and agentic workflows.

---

## 👨‍💻 Developer

Built as part of my journey towards becoming an Applied AI / Agentic AI Engineer.

**GitHub:** YOUR_GITHUB_USERNAME

**LinkedIn:** YOUR_LINKEDIN_PROFILE

---

⭐ If you find this project interesting, feel free to explore the repository and follow its development.