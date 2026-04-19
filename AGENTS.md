# AGENTS.md

This repository is for **Ducelis Open only**.

It is a public repository. Treat all changes as public-facing by default.

## 1. Repository identity

Ducelis Open is:

- a local-first public reference edition
- a rehearsal product for high-stakes conversations
- initially validated with Gemma 4
- architected to remain model-agnostic over time

Ducelis Open is **not**:

- the entire Ducelis product family
- a dump of private planning
- a place for confidential business context
- a place for customer data
- a competition-only identity branch

## 2. Public-safety rules

Never add any of the following to this repository:

- private conversations
- internal business strategy
- non-Open Ducelis planning
- customer data
- real user transcripts
- raw local datasets
- internal support logs
- confidential roadmap details
- secrets, keys, tokens, or deployment credentials

Use synthetic or clearly public-safe examples only.

## 3. Product-direction rules

Keep the product:

- product-first
- local-first
- rehearsal-first
- evidence-first
- public-safe

Do not turn the repo into:

- a hosted SaaS control plane
- a billing or subscription system
- a governance-heavy enterprise surface
- a full content marketplace
- a full authoring platform
- an appliance ops repository

## 4. Model and runtime rules

Do not hard-wire the product to Gemma-only assumptions in code structure or naming.

Preferred direction:

- provider/runtime/model abstractions
- stable adapter contracts
- explicit configuration boundaries
- honest wording such as "initially validated with Gemma 4"

Avoid:

- vendor-locked naming in core modules
- product copy that implies permanent single-model exclusivity
- fake claims of multi-model support that do not exist yet

## 5. Data rules

Treat local session data as user-owned.

That means:

- do not commit real transcripts
- do not commit raw local exports
- do not commit real evaluation or training datasets
- do not create examples from private conversations
- use synthetic fixtures only

When designing persistence, prefer structures that can later support:

- transcript storage
- evidence annotations
- rubric metadata
- user-controlled export
- anonymization or redaction hooks

Do not imply default upload or centralized collection unless such behavior is explicitly implemented and documented.

## 6. Documentation rules

Docs must stay:

- clear
- conservative
- implementation-aware
- free of confidential context

Do not make the main docs competition-centric.
Do not present short-term event context as the core product identity.

When a future restricted or hosted direction must be mentioned, use generic wording only, such as:

> future hosted or restricted editions may extend from stable interfaces

Do not explain private product plans in this repository.

## 7. Commit message rules

Commit messages must be public-safe and implementation-focused.

Good examples:

- `docs: add public repo guardrails and product scope`
- `feat(runtime): add adapter contract and local model config`
- `feat(dialogue): add text-first rehearsal screen`
- `feat(report): add summary and evidence baseline`

Avoid commit messages that mention:

- private strategy
- customer context
- confidential roadmap decisions
- non-public product family details
- internal conversation summaries

## 8. Change-management rules

Prefer:

- small, reviewable changes
- truthful status wording
- docs and code staying aligned
- explicit boundaries and non-goals

Do not:

- invent implemented features
- overstate current product maturity
- add extra files without a clear reason
- expand scope without updating the relevant docs

## 9. If uncertain

If a proposed change might expose private context, remove that detail.

If a proposed change might lock the product to one vendor unnecessarily, abstract it.

If a proposed change might introduce real user data, stop and replace it with synthetic data.
