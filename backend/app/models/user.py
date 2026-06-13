from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="editor")
    is_active = Column(Boolean, nullable=False, default=True)
    phone = Column(String(30), nullable=True)
    company = Column(String(120), nullable=True)

    projects = relationship("Project", back_populates="client")