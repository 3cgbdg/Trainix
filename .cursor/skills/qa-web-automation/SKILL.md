---
name: qa-web-automation
description: Builds and maintains reliable Trainix browser automation with Playwright, including critical journeys, fixtures, network mocking, accessibility checks, and responsive UI coverage. Use for E2E tests, browser regression, or frontend workflow validation.
---

# QA Web Automation

## Project conventions

- Config: `frontend/playwright.config.ts`; specs: `frontend/tests/e2e/`.
- Use the configured `baseURL`; navigate with paths such as `page.goto('/auth/login')`.
- Run deterministic public smoke tests with `npm run qa:e2e:smoke`.
- List all E2E tests with `npm run qa:e2e:list`; run the full configured suite with `npm run qa:e2e`.
- Install the pinned Chromium browser once with `npm run qa:e2e:install` when Playwright reports a missing executable.
- For a focused test, use `npm --prefix frontend run test:e2e -- --grep "name"`.
- Use local/test services and non-secret environment variables for credentials. Never commit a live account.

## Reliable test workflow

1. Define the business outcome and keep each test independent.
2. Set up state through an API or fixture when the setup itself is not under test.
3. Prefer `getByRole`, `getByLabel`, and intentional `getByTestId` locators. Avoid CSS selectors coupled to styling.
4. Use Playwright web-first assertions and URL/response predicates. Never use `waitForTimeout` as synchronization.
5. Mock or control AI, Stripe, S3, email, and other slow/external systems for deterministic regression coverage. Keep separately tagged opt-in contract tests for live sandboxes.
6. Assert meaningful state after reload or navigation, not just a transient success message.
7. Preserve Playwright traces/screenshots/videos for failures; do not add arbitrary retries to conceal flakes.

## Minimum browser coverage

- Public landing and legal navigation.
- Signup, login validation, onboarding, logout, session refresh, and protected-route redirects.
- Dashboard empty/populated/error states.
- Fitness plan creation, workout progress/completion, duplicate submission, and persistence.
- Nutrition plan generation, meal/water updates, and failure recovery.
- Measurements/progress and photo upload validation.
- Profile changes and safe account deletion confirmation.
- Billing redirect boundaries using mocks or a test environment.
- Keyboard navigation, visible focus, accessible names, error association, and representative mobile/desktop viewports.

## Flake prevention checklist

- Unique test data and isolated state.
- No test depends on execution order or a previous test's account.
- No hard-coded sleeps, production URLs, or real third-party calls.
- Locators express user intent and remain unique.
- Assertions wait on the final user-observable outcome.
