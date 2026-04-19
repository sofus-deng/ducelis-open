# Ducelis Open

Local-first AI rehearsal for high-stakes conversations.

Ducelis Open is the public reference edition of Ducelis. It is designed to help people rehearse difficult conversations in a structured, scenario-based format rather than use a generic chatbot.

## What it is

Ducelis Open is a local-first rehearsal product for scenario-driven dialogue practice, reflection, and reporting.

The initial proof lane focuses on high-stakes education conversations such as:

- teacher ↔ parent boundary pressure
- teacher ↔ student disruption and de-escalation
- teacher ↔ parent fairness or grading challenges

The product is intended to make three things clear:

1. the scenario has real stakes
2. the conversation is guided by a structured roleplay contract
3. the session produces useful reflection value after the interaction

## Core experience

A typical session is designed to follow this shape:

1. choose a scenario
2. review the situation, goals, and watch-outs
3. rehearse the conversation with an AI role
4. complete the session
5. review summary, evidence, and next-practice guidance

## Product principles

- **Local-first** - the default product posture is local use and user-controlled session data
- **Model-agnostic** - the architecture should not be permanently bound to one model family
- **Reference-quality** - the repo should stay understandable, public-safe, and reproducible
- **Rehearsal-first** - the product should feel like purposeful practice, not generic chat
- **Evidence-first** - summary and report value matter more than decorative surface area

## Model support direction

Ducelis Open is **initially validated with Gemma 4**, but the product is not intended to be hard-wired to a Gemma-only future.

The architecture should support configurable local runtimes and compatible model families over time through stable runtime and model adapter boundaries.

## Data direction

Ducelis Open is designed around **local-first session ownership**.

That means:

- sessions should remain under user control by default
- the public repository must not contain real user transcripts or raw private datasets
- future versions may support user-controlled export paths for evaluation or training workflows
- this repository should not imply default cloud upload or centralized data collection

## Current status

This repository is in the early foundation stage.

The current priority is to define a clean public-safe architecture and then build the smallest complete rehearsal loop with:

- a stable runtime boundary
- a text-first conversation flow
- local session persistence
- summary / evidence / report basics
- public-safe demo scenarios

This README does **not** claim that all of those pieces are already implemented.

## Intended project structure

The planned structure is expected to evolve around the following layers:

```text
/apps/open-web
/packages/open-core
/packages/open-runtime
/packages/open-content
/packages/open-reporting
/packages/open-data
/docs
```

## Public repo rules in plain language

This repository should only contain Ducelis Open public-safe materials.

It should **not** contain:

- private conversations
- customer data
- confidential business planning
- non-Open Ducelis strategy
- real user transcripts
- raw local exports or datasets unless they are clearly synthetic and public-safe

## Documentation map

- `AGENTS.md` - repository rules for AI coding agents
- `docs/product-scope.md` - current v1 scope and non-goals
- `docs/public-repo-guardrails.md` - public-safe writing and repo boundaries
- `docs/architecture-overview.md` - minimal architecture direction
- `docs/data-and-model-principles.md` - model abstraction and local data principles

## Contributing

Contributions should preserve the product-first, local-first, and public-safe direction of Ducelis Open.

Before contributing:

1. read the docs in `/docs`
2. avoid adding speculative enterprise or hosted features
3. avoid hard-coding the product to a single model vendor assumption
4. never commit real user data

## License

License and third-party dependency guidance should be documented explicitly in the repository before public release.

This repository is intended to cover original Ducelis Open materials only. Third-party runtimes, models, and package dependencies remain governed by their own upstream licenses and terms.
