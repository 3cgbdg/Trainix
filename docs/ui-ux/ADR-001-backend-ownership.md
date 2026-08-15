# ADR-001: Backend ownership during the UI rebuild

Status: Accepted for the UI migration

## Decision

The Express backend in `backend/` remains the canonical production API while the UI is rebuilt.

The frontend, README, route prefixes, authentication flow, and current tests all target the Express API. The NestJS implementation in `backend(NESTJS version)/` is treated as a separate migration candidate and must not introduce competing endpoint contracts during the UI work.

## Consequences

- New frontend work targets the Express `/api/*` contract through typed adapters.
- Endpoint names are normalized in the frontend adapter layer instead of being scattered through components.
- NestJS migration work must happen behind contract tests and outside UI pull requests.
- Body Scan job orchestration may be added to Express first, then ported after a separate backend migration decision.

## Revisit condition

Revisit after the new UI reaches feature parity and critical end-to-end tests cover the API contract.
