# Data and Model Principles

This document defines the core principles for model abstraction and local data handling in Ducelis Open.

## 1. Model abstraction principle

Ducelis Open should be designed around stable runtime and model adapter boundaries.

That means:

- product logic should not depend on one permanent vendor assumption
- provider, runtime, and model configuration should be explicit
- the rest of the product should not need to know model-specific implementation details unless truly necessary

## 2. Initial Gemma-validated path

Gemma 4 is the initial validated path for the first public milestone.

This means:

- it is a practical first route for proving the product
- it may be the first well-tested adapter
- it can appear in setup documentation as an initial supported path

This does **not** mean:

- the whole architecture should be named around Gemma
- the product should be permanently vendor-locked
- every future version must use the same model family

## 3. Local-first data ownership principle

Session data should belong to the user by default.

This principle implies:

- local session records stay under user control
- the public repo should not assume centralized collection
- real transcripts and raw private exports do not belong in the repository
- future data workflows should be explicit and user-directed

## 4. Evaluation and training readiness principle

The most valuable future data asset is not a pile of raw conversation logs.

The valuable asset is structured interaction data such as:

- transcript turns
- scenario identifiers
- role context
- completion outcomes
- evidence markers
- rubric annotations
- improvement suggestions
- accepted or rejected revisions where available

Therefore, Ducelis Open should be shaped toward **evaluation/training workflow readiness** rather than vague claims about "collecting training data."

## 5. Public repo data safety principle

The public repository may define:

- schema
- export contracts
- anonymization hooks
- synthetic examples

The public repository must not contain:

- real user transcripts
- raw local datasets
- customer interaction logs
- sensitive support or classroom records

## 6. Recommended language

Prefer:

- `initially validated with Gemma 4`
- `model-agnostic architecture`
- `local-first session ownership`
- `user-controlled export`
- `evaluation/training workflow readiness`
- `training-ready data pipeline`

Avoid:

- `all conversations become training data`
- `Gemma-only forever`
- `default centralized collection`
- `public repo as data warehouse`

## 7. Implementation implication

Even in early versions, persistence and reporting should be structured so that future export, redaction, anonymization, and dataset building can be added without rewriting the entire foundation.
