# Architecture Overview - Ducelis Open

This document describes the minimal architecture direction for Ducelis Open.

It is intentionally conservative.
It describes the intended structure and boundaries, not a claim that every module already exists.

## 1. Architecture goals

The architecture should support:

- a clear local-first rehearsal flow
- a stable runtime and model boundary
- public-safe scenario content
- local session persistence
- useful reporting and evidence
- future-friendly extension without oversharing private product plans

## 2. Main layers

## 2.1 App shell

The app shell is responsible for the visible product flow:

- landing or entry page
- scenario selection
- scenario brief
- rehearsal conversation
- completion and report views

This layer should stay focused on the user experience, not on vendor-specific model behavior.

## 2.2 Scenario and content layer

This layer defines the structured content needed for rehearsal:

- scenario identity
- role descriptions
- stakes and goals
- success criteria
- rubric hints
- coaching definitions

The content layer should stay public-safe and reproducible.

## 2.3 Runtime and model adapter layer

This layer isolates model execution concerns from the rest of the product.

It should define:

- a runtime adapter contract
- provider/runtime/model configuration
- request and response shapes
- error handling boundaries
- an initial Gemma-validated path
- future seams for other compatible local runtimes or model families

The key principle is that the product should not be permanently hard-wired to one model family.

## 2.4 Session state layer

This layer tracks the rehearsal itself.

It should capture:

- session identity
- scenario identity
- timestamps
- turn sequence
- role attribution
- completion state

This layer is also where local-first persistence should begin.

## 2.5 Data and transcript layer

This layer stores the durable artifacts of a session.

Likely artifacts include:

- transcript text
- event timeline
- evidence markers
- rubric annotations
- derived summary metadata

The design should support future user-controlled export without requiring the whole persistence model to be rebuilt later.

## 2.6 Reporting and evidence layer

This layer turns raw session artifacts into useful reflection output.

Likely responsibilities include:

- summary generation
- evidence extraction
- improvement suggestions
- report formatting

The report should not just replay text.
It should help the user understand what happened and what to practice next.

## 3. Suggested package direction

A future-friendly structure may look like this:

```text
/apps/open-web
/packages/open-core
/packages/open-runtime
/packages/open-content
/packages/open-reporting
/packages/open-data
```

### `open-core`
Shared session contracts, turn models, schema, and orchestration logic.

### `open-runtime`
Runtime adapter interfaces, config, and the initial validated local model path.

### `open-content`
Public-safe scenarios, prompt assets, and rubric definitions.

### `open-reporting`
Summary, evidence, and coaching formatting.

### `open-data`
Local session storage, transcript serialization, export contracts, and anonymization hooks.

## 4. Data and export hooks

Ducelis Open should be designed with future readiness for:

- user-controlled export
- redaction or anonymization
- structured evaluation datasets
- structured training-ready datasets

That does **not** mean the current public repo should contain real user data.
It means the architecture should make that future work possible without redesigning the whole system.

## 5. Boundary rules

The public reference architecture should include:

- product flow
- content schema
- runtime/model contracts
- local session contracts
- reporting contracts

It should not include:

- private deployment internals
- enterprise governance systems
- hosted control-plane details
- appliance ops systems
- real customer data

## 6. Guiding principle

Ducelis Open should define a stable, public-safe base.
Future hosted or restricted editions may extend from stable interfaces, but this repository should stay focused on the Open reference product itself.
