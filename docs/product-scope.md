# Product Scope - Ducelis Open v1

## Product goal

Ducelis Open v1 aims to prove a clear, useful, local-first rehearsal product for high-stakes conversations.

The product goal is not broad platform coverage.
The product goal is a coherent end-to-end loop that is understandable, reproducible, and valuable.

## Core proof lane

The primary proof lane is high-stakes education dialogue rehearsal, especially teacher conversations with parents or students.

## In-scope

The initial version should include:

- a local-first product surface
- a configurable runtime and model boundary
- an initially validated Gemma 4 path
- scenario selection
- scenario brief and success criteria
- a text-first rehearsal conversation loop
- local session persistence
- summary, evidence, and next-practice guidance
- public-safe demo scenarios
- honest setup and documentation

## Out-of-scope

The initial version should not include:

- billing, pricing, or subscription lifecycle
- team or tenant management
- enterprise governance surfaces
- full authoring systems
- marketplace mechanics
- appliance provisioning or fleet operations
- full realtime voice orchestration
- default cloud sync or centralized transcript collection

## Design principles

### 1. Rehearsal-first
The product should feel like structured practice, not generic chat.

### 2. Model-agnostic core
Product logic should target stable runtime and model contracts rather than a permanent single-model assumption.

### 3. Local-first data ownership
Session records should remain under user control by default.

### 4. Evidence-first value
The post-session report should show useful evidence and improvement guidance, not just replay text.

### 5. Public-safe reference quality
The repo should stay readable and reproducible without exposing private business or user data.

### 6. Future-ready data shape
Session artifacts should be structured so they can later support evaluation or training workflows under explicit user control.

## Non-goals

This version is not trying to be:

- the full Ducelis product family
- a hosted SaaS product
- a polished enterprise console
- a broad content platform
- a complete model-training product
- a public repository of real user interaction data

## Notes on model direction

Gemma 4 is the initial validated model path for the first public milestone.

That does not mean:

- Gemma is the only model family the architecture may ever support
- the product name should include Gemma
- the core code structure should be permanently vendor-locked

## Notes on data direction

Future evaluation or training workflows should be based on:

- structured transcripts
- metadata
- evidence markers
- rubric annotations
- user-controlled export
- anonymization or redaction steps where needed

This does **not** mean that real user conversations belong in the public repository.
