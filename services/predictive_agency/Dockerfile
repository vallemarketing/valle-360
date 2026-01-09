# Predictive Agency - CrewAI/FastAPI Service
# Railway (monorepo): use Build Context = repo root (.) and Dockerfile Path = services/predictive_agency/Dockerfile
# Cache-bust: 2026-01-09-v3

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

# Copy requirements (paths relative to repo root build context)
COPY services/predictive_agency/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Provide a tiny `chromadb` stub so `crewai` can import without installing ChromaDB.
COPY services/predictive_agency/chromadb ./chromadb

# Install CrewAI without pulling its full dependency tree (Railway build timeout).
# We only use core classes (Agent/Crew/Task) and our own tools/memory via Supabase.
RUN pip install --no-cache-dir --no-deps crewai==0.86.0 \
  && python -c "from crewai import Agent, Crew, Task; print('crewai-ok')"

# Copy application code (paths relative to repo root build context)
COPY services/predictive_agency/app ./app

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.api.server:app --host 0.0.0.0 --port ${PORT:-8000}"]
