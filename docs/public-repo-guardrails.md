# Public Repo Guardrails

This document defines what is allowed and not allowed in the Ducelis Open public repository.

## 1. What belongs here

Allowed materials include:

- original Ducelis Open source code
- public-safe documentation
- public-safe scenario content
- schema and type definitions
- runtime and model adapter contracts
- synthetic fixtures
- clearly fake examples
- screenshots or media that do not expose private information

## 2. What does not belong here

Do not put any of the following in this repository:

- private conversations
- non-Open Ducelis planning
- confidential strategy notes
- customer information
- real user transcripts
- raw local session exports
- internal support logs
- secrets or credentials
- private deployment instructions
- restricted commercial content packs

## 3. Public-safe writing rules

When writing docs, comments, examples, issues, or pull requests:

- write as if the content may be read by the public
- keep the text product-first and implementation-aware
- avoid internal storytelling that depends on private context
- avoid event-centric identity language in the main docs
- avoid naming the product as if it were permanently tied to one model vendor
- use conservative, truthful wording about what is implemented

Preferred wording:

- `initially validated with Gemma 4`
- `local-first reference edition`
- `future hosted or restricted editions may extend from stable interfaces`
- `user-controlled export` or `evaluation/training workflow readiness`

Avoid wording such as:

- `the full Ducelis roadmap is...`
- `this came from our private strategy...`
- `all user sessions will become training data`
- `Gemma-only architecture forever`

## 4. Code comment rules

Code comments should explain:

- technical intent
- interface boundaries
- assumptions that matter for maintenance

Code comments should **not** explain:

- confidential business reasoning
- private commercial plans
- internal conversations or decision trails that are not public-safe

## 5. Commit message rules

Commit messages must stay:

- short
- public-safe
- implementation-focused

Good patterns:

- `docs: add architecture overview and guardrails`
- `feat(runtime): add runtime adapter contract`
- `feat(data): add local session schema`
- `feat(report): add evidence annotations`

Do not mention:

- private strategy
- customer specifics
- internal discussion details
- non-public product family context

## 6. Example and fixture rules

Examples and fixtures must be:

- synthetic
- clearly fake
- stripped of private or identifying details

Never commit:

- real classroom transcripts
- real parent or student conversations
- raw exports from local user sessions
- customer support cases

## 7. Screenshot and media rules

Screenshots, videos, and media used in docs or review materials must not expose:

- private prompts or notes
- local file paths with sensitive information
- credentials
- customer names
- real user conversation data
- unrelated private planning

## 8. Issue and PR language rules

In issues and pull requests:

- describe the problem and change clearly
- avoid revealing private strategy
- avoid talking about non-public commercial decisions
- avoid using sensitive customer or internal examples

## 9. Data sample rules

If the repo needs sample session data, it must be:

- synthetic
- labeled as synthetic
- structurally representative
- safe to publish

Do not use raw local data as sample content.

## 10. Final rule

When in doubt, prefer less detail over exposing private context.

A public repo should explain the product and the implementation.
It should not leak the company's private planning or the user's real data.
