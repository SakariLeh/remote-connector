from sqlalchemy import MetaData


class ForeignKeyValidationError(ValueError):
    pass


def validate_foreign_keys(metadata: MetaData) -> None:
    """Ensure every ForeignKey target table is present in metadata."""
    table_names = set(metadata.tables.keys())
    missing: list[str] = []

    for table in metadata.tables.values():
        for fk in table.foreign_keys:
            colspec = fk._get_colspec()
            referred = colspec.split(".", 1)[0] if colspec else None
            parent_col = fk.parent.name if fk.parent is not None else "?"
            if referred is None or referred not in table_names:
                target = referred or colspec or "<unknown>"
                missing.append(f"{table.name}.{parent_col} -> {target}")

    if missing:
        details = "; ".join(missing)
        raise ForeignKeyValidationError(
            f"Foreign key target table(s) missing from metadata: {details}"
        )
