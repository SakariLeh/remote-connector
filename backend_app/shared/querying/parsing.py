from backend_app.shared.exception_handling import BadRequestException
from backend_app.shared.querying.models import (
    ALLOWED_DIRECTIONS,
    ALLOWED_LOGIC,
    ALLOWED_OPERATORS,
    FilterClause,
    FilterLogic,
    SortClause,
)


def parse_logic(raw: str | None) -> FilterLogic:
    value = (raw or "and").strip().lower()
    if value not in ALLOWED_LOGIC:
        raise BadRequestException(f"Invalid logic '{raw}'. Use 'and' or 'or'.")
    return value  # type: ignore[return-value]


def parse_filter_params(raw: list[str] | None) -> list[FilterClause]:
    if not raw:
        return []
    clauses: list[FilterClause] = []
    for item in raw:
        parts = item.split(":", 2)
        if len(parts) != 3:
            raise BadRequestException(
                f"Invalid filter '{item}'. Expected field:op:value."
            )
        field_name, op, value = parts[0].strip(), parts[1].strip().lower(), parts[2]
        if not field_name:
            raise BadRequestException(f"Invalid filter '{item}': empty field.")
        if op not in ALLOWED_OPERATORS:
            raise BadRequestException(
                f"Invalid operator '{op}' in filter '{item}'."
            )
        if value == "" and op != "contains":
            raise BadRequestException(f"Invalid filter '{item}': empty value.")
        clauses.append(FilterClause(field=field_name, op=op, value=value))
    return clauses


def parse_sort_params(raw: list[str] | None) -> list[SortClause]:
    if not raw:
        return []
    sorts: list[SortClause] = []
    for item in raw:
        parts = item.split(":", 1)
        if len(parts) != 2:
            raise BadRequestException(
                f"Invalid sort '{item}'. Expected field:asc|desc."
            )
        field_name, direction = parts[0].strip(), parts[1].strip().lower()
        if not field_name:
            raise BadRequestException(f"Invalid sort '{item}': empty field.")
        if direction not in ALLOWED_DIRECTIONS:
            raise BadRequestException(
                f"Invalid sort direction '{direction}' in '{item}'."
            )
        sorts.append(
            SortClause(field=field_name, direction=direction)  # type: ignore[arg-type]
        )
    return sorts


def coerce_scalar(value: str) -> int | float | str:
    stripped = value.strip()
    if stripped.isdigit() or (stripped.startswith("-") and stripped[1:].isdigit()):
        return int(stripped)
    try:
        return float(stripped)
    except ValueError:
        return stripped


def coerce_list(value: str) -> list[int | float | str]:
    parts = [part.strip() for part in value.split(",") if part.strip()]
    if not parts:
        raise BadRequestException("Operator 'in' requires at least one value.")
    return [coerce_scalar(part) for part in parts]
