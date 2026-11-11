from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# ==========================================
# DATABASE CONFIGURATION
# ==========================================

# Locate the backend directory
BASE_DIR = Path(__file__).resolve().parents[2]

# Permanent database location
DATABASE_PATH = BASE_DIR / "devmind.db"

DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"

# ==========================================
# DATABASE ENGINE
# ==========================================

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# ==========================================
# SESSION FACTORY
# ==========================================

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)

# ==========================================
# DATABASE BASE
# ==========================================

class Base(DeclarativeBase):
    pass


# ==========================================
# DATABASE SESSION
# ==========================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()