---
name: qa-api-testing
description: Designs, implements, and runs Trainix API tests with Jest, Supertest, and mongodb-memory-server. Use for Express routes, request validation, authentication, authorization, contracts, webhooks, and backend integration testing.
---

# QA API Testing

## Project conventions

- Express app: `backend/app.ts`; routes: `backend/routes/`; tests: `backend/tests/*.test.ts`.
- Import `app` and use Supertest. Do not start `backend/server.ts` inside integration tests.
- Follow existing `mongodb-memory-server` setup and isolate database state between tests.
- Mock AI, email, Stripe, S3, sockets, and other network boundaries. Test the adapter contract separately.
- Run one suite with `npm --prefix backend test -- --runInBand <test-file>`.
- Run the API regression suite with `npm run qa:api` from the repository root.

## Workflow

1. Read the route, middleware, controller, model, and closest existing test before designing cases.
2. Write a small contract table: method/path, auth, input, success status/body, error statuses, and side effects.
3. Cover the successful request plus meaningful failures:
   - unauthenticated, expired/invalid token, and forbidden cross-user access;
   - missing, wrong-type, malformed, boundary, and unexpected input;
   - missing resource, invalid identifier, duplicate or conflicting state;
   - dependency rejection/timeout and internal error mapping;
   - response shape, headers/cookies, and absence of secret fields;
   - persisted state and idempotency or duplicate submission where relevant.
4. Assert status, response contract, and observable side effects. Avoid assertions tied to implementation details.
5. Use factories/helpers for repeated setup and unique values for emails and IDs.
6. Run the focused suite, then `npm run qa:api`. Diagnose open handles instead of hiding them.

## Endpoint-specific checks

- Auth: cookie flags, refresh rotation, logout invalidation, password policy, reset-token expiry/reuse, enumeration resistance, and rate limits.
- User resources: prove one user cannot read or mutate another user's data.
- Fitness/nutrition/measurements: boundary indexes, duplicate completion, numeric limits, ordering, and persistence.
- Billing webhook: raw body, signature validation, replay/idempotency, and no authenticated middleware dependency.
- Files/AI: MIME and size validation, failed upload cleanup, timeout handling, and no live service calls in regression tests.

## Quality rules

Do not test only HTTP status codes. Do not snapshot large dynamic payloads. Never hard-code real tokens or accounts. A test that can pass without executing the intended controller behavior is not sufficient evidence.
