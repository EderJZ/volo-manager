from pydantic import BaseModel, EmailStr


class ClientBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None


class ClientCreate(ClientBase):
    password: str


class ClientUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    company: str | None = None
    is_active: bool | None = None


class ClientResponse(ClientBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True