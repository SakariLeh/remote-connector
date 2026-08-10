from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


# TODO: вынести Base в generic db_context (общий DeclarativeBase для всех entity)
class Base(DeclarativeBase):
    pass


class UserEntity(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="unauthorized")
