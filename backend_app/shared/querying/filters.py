from typing import Any

from sqlalchemy import Select, and_, or_
from sqlalchemy.sql import ColumnElement

from backend_app.shared.exception_handling import BadRequestException
from backend_app.shared.querying.models import FieldSpec, FilterClause, FilterLogic
from backend_app.shared.querying.parsing import coerce_list, coerce_scalar
from backend_app.shared.querying.search import search_contains


def _compile_clause(clause: FilterClause, fields: dict[str, FieldSpec]) -> ColumnElement[bool]:
    spec = fields.get(clause.field)
    if spec is None:
        raise BadRequestException(f"Unknown filter field '{clause.field}'.")
    if clause.op not in spec.operators:
        raise BadRequestException(
            f"Operator '{clause.op}' is not allowed for field '{clause.field}'."
        )

    if clause.op == "contains":
        columns = list(spec.search_columns or ())
        if not columns and spec.column is not None:
            columns = [spec.column]
        if not columns:
            raise BadRequestException(
                f"Field '{clause.field}' does not support contains."
            )
        return search_contains(columns, clause.value)

    if spec.column is None:
        raise BadRequestException(
            f"Field '{clause.field}' does not support operator '{clause.op}'."
        )

    column = spec.column
    if clause.op == "eq":
        return column == coerce_scalar(clause.value)
    if clause.op == "in":
        return column.in_(coerce_list(clause.value))
    if clause.op == "gte":
        return column >= coerce_scalar(clause.value)
    if clause.op == "lte":
        return column <= coerce_scalar(clause.value)

    raise BadRequestException(f"Unsupported operator '{clause.op}'.")


def apply_filters(
    stmt: Select[Any],
    clauses: list[FilterClause],
    logic: FilterLogic,
    fields: dict[str, FieldSpec],
) -> Select[Any]:
    if not clauses:
        return stmt
    compiled = [_compile_clause(clause, fields) for clause in clauses]
    combined = and_(*compiled) if logic == "and" else or_(*compiled)
    return stmt.where(combined)
