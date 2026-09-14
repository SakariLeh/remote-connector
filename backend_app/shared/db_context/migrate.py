from pathlib import Path

from alembic import command
from alembic.config import Config

from backend_app.shared.db_context.database import Base
from backend_app.shared.db_context.fk_validation import validate_foreign_keys
from backend_app.shared.db_context.models import import_all_models

_REPO_ROOT = Path(__file__).resolve().parents[3]
_ALEMBIC_INI = _REPO_ROOT / "alembic.ini"


def run_migrations() -> None:
    """Apply Alembic migrations to head (sync; call via asyncio.to_thread)."""
    import_all_models()
    validate_foreign_keys(Base.metadata)

    cfg = Config(str(_ALEMBIC_INI))
    command.upgrade(cfg, "head")
