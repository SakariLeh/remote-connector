from backend_app.shared.querying import FieldSpec
from backend_app.tasks_microservice.entities import TaskCategoryEntity, TaskEntity


def task_query_fields() -> dict[str, FieldSpec]:
    return {
        "search": FieldSpec(
            search_columns=(
                TaskEntity.title,
                TaskEntity.description,
                TaskCategoryEntity.name,
            ),
            operators=frozenset({"contains"}),
            sortable=False,
        ),
        "category_id": FieldSpec(
            column=TaskEntity.category_id,
            operators=frozenset({"eq", "in"}),
            sortable=True,
        ),
        "price": FieldSpec(
            column=TaskEntity.price,
            operators=frozenset({"eq", "gte", "lte"}),
            sortable=True,
        ),
        "created_at": FieldSpec(
            column=TaskEntity.created_at,
            operators=frozenset(),
            sortable=True,
        ),
    }
