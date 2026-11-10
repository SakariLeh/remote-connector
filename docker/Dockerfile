FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DATABASE_PATH=/app/data/identity.db \
    ALEMBIC_INI=/app/alembic.ini

WORKDIR /app

COPY pyproject.toml .
COPY backend_app ./backend_app
COPY alembic.ini .
COPY alembic ./alembic

RUN pip install --no-cache-dir .

EXPOSE 8001 8002

CMD ["uvicorn", "backend_app.tasks_microservice.main:app", "--host", "0.0.0.0", "--port", "8002"]
