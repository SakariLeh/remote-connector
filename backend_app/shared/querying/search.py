from collections.abc import Sequence
from typing import Any

from sqlalchemy import ColumnElement, or_


def _escape_like(term: str) -> str:
    return term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def search_contains(columns: Sequence[Any], term: str) -> ColumnElement[bool]:
    """Case-insensitive substring match across columns joined with OR."""
    pattern = f"%{_escape_like(term.strip())}%"
    clauses = [column.ilike(pattern, escape="\\") for column in columns]
    if not clauses:
        raise ValueError("search_contains requires at least one column")
    if len(clauses) == 1:
        return clauses[0]
    return or_(*clauses)
