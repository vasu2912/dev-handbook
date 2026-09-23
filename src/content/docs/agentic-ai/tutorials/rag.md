---
title: Build a small RAG system
description: Build a local Python retrieval and generation example with chunks, embeddings, cosine similarity, and visible citations.
---

This tutorial builds a small local RAG path. It uses an embedding model for retrieval and a small text-to-text model for generation. The models download on the first run.

## Install the libraries

Create a virtual environment, then install:

```sh
pip install sentence-transformers transformers torch numpy
```

## Create the documents

Create `rag_demo.py`:

```python
from dataclasses import dataclass

import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline


@dataclass(frozen=True)
class Chunk:
    source_id: str
    text: str


chunks = [
    Chunk("returns#damaged", "Damaged items may be returned within 30 days of delivery."),
    Chunk("returns#unused", "Unused items may be returned within 14 days of delivery."),
    Chunk("shipping#international", "International delivery takes 7 to 12 business days."),
]
```

The source identifier survives retrieval and later becomes a citation.

## Embed and rank the chunks

```python
embedder = SentenceTransformer("all-MiniLM-L6-v2")
document_vectors = embedder.encode(
    [chunk.text for chunk in chunks],
    normalize_embeddings=True,
)


def retrieve(query: str, limit: int = 2) -> list[tuple[Chunk, float]]:
    query_vector = embedder.encode([query], normalize_embeddings=True)[0]
    scores = document_vectors @ query_vector
    ranked_indexes = np.argsort(scores)[::-1][:limit]
    return [(chunks[index], float(scores[index])) for index in ranked_indexes]
```

Normalized vectors let the dot product rank by cosine similarity.

## Construct grounded context

```python
question = "How long do I have to return a damaged item?"
matches = retrieve(question)

context = "\n".join(
    f"[{chunk.source_id}] {chunk.text}"
    for chunk, _score in matches
)

prompt = f"""Answer only from the context below.
If the context does not answer the question, say that the answer is unavailable.
Include the supporting source ID in square brackets.

Context:
{context}

Question: {question}
Answer:"""
```

The prompt carries only the selected chunks, not the full collection.

## Generate the answer

```python
generator = pipeline("text2text-generation", model="google/flan-t5-small")
result = generator(prompt, max_new_tokens=80, do_sample=False)[0]["generated_text"]

print(result)
print("\nRetrieved:")
for chunk, score in matches:
    print(f"{score:.3f} {chunk.source_id}")
```

Generated wording varies by library and model version. Inspect both the answer and retrieved source IDs.

## Test a missing answer

Change the question to one about warranty length. None of the documents contains that fact. The desired behavior is an unavailable answer, not a guess.

This tiny example omits parsing, chunk overlap, access filters, reranking, evaluation, and index updates. The [retrieval pipeline](/agentic-ai/rag/retrieval-pipeline/) explains those production responsibilities.
