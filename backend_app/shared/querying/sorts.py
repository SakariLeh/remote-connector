from typing import Any

from sqlalchemy import Select, asc, desc

from backend_app.shared.exception_handling import BadRequestException
from backend_app.shared.querying.models import FieldSpec, SortClause


def apply_sorts(
    stmt: Select[Any],
    sorts: list[SortClause],
    fields: dict[str, FieldSpec],
) -> Select[Any]:
    if not sorts:
        return stmt

    order_by = []
    for sort in sorts:
        spec = fields.get(sort.field)
        if spec is None or not spec.sortable or spec.column is None:
            raise BadRequestException(f"Field '{sort.field}' is not sortable.")
        order_by.append(
            asc(spec.column) if sort.direction == "asc" else desc(spec.column)
        )
    return stmt.order_by(*order_by)
