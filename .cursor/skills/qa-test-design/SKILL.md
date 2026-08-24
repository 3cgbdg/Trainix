---
name: qa-test-design
description: Creates risk-based QA test plans, test cases, exploratory charters, traceability, and release coverage for Trainix. Use when analyzing requirements, planning feature tests, defining acceptance coverage, or deciding what to automate.
---

# QA Test Design

## Workflow

1. Translate the request, issue, or diff into observable behaviors. Record assumptions instead of silently inventing requirements.
2. Identify affected users, data, routes, components, integrations, and failure consequences.
3. Rank risk using impact and likelihood: critical, high, medium, or low.
4. Build coverage from the test heuristics below.
5. Assign each check to unit/component, API integration, browser E2E, or exploratory testing. Prefer the cheapest reliable level.
6. Define data, environment, preconditions, cleanup, and objective expected results.
7. Mark critical-path checks as smoke candidates; mark stable repeatable checks for automation.

## Coverage heuristics

For every changed behavior consider:

- Happy path and the most likely alternate path.
- Required, empty, malformed, minimum, maximum, and just-outside-boundary values.
- Authentication, authorization, expired session, and cross-user data isolation.
- Initial, loading, empty, success, partial, retry, and error states.
- Duplicate requests, refresh/reload, back navigation, and interrupted operations.
- Network timeout, unavailable dependency, and safe error messaging.
- Keyboard use, focus, labels, semantic roles, contrast-sensitive states, and small screens.
- Dates, time zones, ordering, rounding, units, and persistence when relevant.

## Trainix risk map

- **Critical:** auth/session handling, account deletion, billing webhooks, user isolation.
- **High:** workout completion/streaks, plan generation and persistence, measurements, AI/photo flows.
- **Medium:** nutrition interactions, notifications, profile updates, reports.
- **Low:** non-interactive presentation and copy unless it blocks accessibility or navigation.

## Test case format

Use `qa/templates/test-plan.md` for a feature plan. Each test case must contain a stable ID, risk, level, preconditions, data, steps, expected result, and automation status. Expected results must be measurable; avoid “works correctly.”

## Exit criteria

A plan is ready when every critical/high risk has coverage, external dependencies have a strategy, negative cases are represented, test data is safe, and any deliberately untested risk is explicit.
