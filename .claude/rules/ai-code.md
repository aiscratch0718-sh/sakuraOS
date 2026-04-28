---
paths:
 - "src/server/ai/**"
 - "src/server/llm/**"
 - "src/lib/ai/**"
---

# AI / LLM Code Rules

Applies to code that calls a Large Language Model, embeds vectors, runs
classifiers, or otherwise integrates ML inference into the product.

- Every LLM call is **bounded**: explicit timeout, max tokens, max retries,
  max cost per request. Long-running jobs go to a queue with progress
  reporting, never inline in a request handler
- Every LLM call has an **explicit prompt template** stored under version
  control (or in a prompt registry). Prompts are not concatenated string
  literals scattered across handlers
- Every LLM call has an **eval**: at least one regression-style fixture that
  proves the prompt still produces an acceptable answer when the model
  changes. Update the eval before changing the prompt; update the prompt
  after seeing eval results
- Every LLM call has a **fallback**: degraded behavior on timeout / quota /
  provider outage. The product never silently breaks because the model is
  down
- All inputs from the LLM are **validated before being trusted**. JSON-mode
  responses pass through Zod / `class-validator`. Free-text outputs are
  treated as untrusted user input downstream
- **Cost discipline**: log token usage per request; tag with feature name;
  surface to dashboards. Set per-tenant rate / cost limits where the LLM
  is user-facing
- **PII handling**: do not send PII to a third-party model unless the
  customer's contract permits it; redact otherwise. Log this decision per
  call so it is auditable
- **Determinism where possible**: pin model version explicitly; pin
  temperature (often 0 for extraction tasks); record the model + prompt
  hash with each output for reproducibility
- **Tool / function calls** from the model run through the same validation
  layer as any other inbound request — never give the model direct
  unmediated database write access
- **Embeddings**: pin the model; re-embed all rows when the model changes;
  never compare vectors from different model versions
