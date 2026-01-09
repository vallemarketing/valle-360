"""
Stub mínimo do pacote `chromadb` para permitir importar `crewai` em produção
sem instalar a árvore gigante do ChromaDB (que estoura timeout no Railway).

IMPORTANTE:
- O Valle 360 usa RAG via Supabase/pgvector (`brand_memory_chunks`), não Chroma.
- Se você realmente precisar de ChromaDB no futuro, remova este stub e adicione
  `chromadb` (real) nas dependências.
"""

from __future__ import annotations

from typing import Any, Protocol, TypeAlias

# Tipos que o CrewAI importa em `EmbeddingConfigurator`
Documents: TypeAlias = list[Any]
Embeddings: TypeAlias = list[Any]


class EmbeddingFunction(Protocol):
    def __call__(self, input: Documents) -> Embeddings:  # noqa: A002
        ...

