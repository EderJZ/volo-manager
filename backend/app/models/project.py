from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(160), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="orcamento")
    budget = Column(Float, nullable=True)
    start_date = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)

    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)

    client = relationship("Client")