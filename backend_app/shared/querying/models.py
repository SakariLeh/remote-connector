from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Any, Literal

FilterLogic = Literal["and", "or"]
SortDirection = Literal["asc", "desc"]

ALLOWED_OPERATORS = frozenset({"eq", "in", "gte", "lte", "contains"})
ALLOWED_LOGIC = frozenset({"and", "or"})
ALLOWED_DIRECTIONS = frozenset({"asc", "desc"})


@dataclass(frozen=True)
class FieldSpec:
    """Whitelist entry: which column(s), operators, and sort are allowed."""

    column: Any | None = None
    search_columns: Sequence[Any] | None = None
    operators: frozenset[str] = field(default_factory=frozenset)
    sortable: bool = False


@dataclass(frozen=True)
class FilterClause:
    field: str
    op: str
    value: str


@dataclass(frozen=True)
class SortClause:
    field: str
    direction: SortDirection
