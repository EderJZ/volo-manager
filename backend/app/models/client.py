from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False)
    phone = Column(String(30), nullable=True)
    company = Column(String(120), nullable=True)

    projects = relationship("Project", back_populates="client")