---
name: qa-regression-triage
description: Runs Trainix regression gates, investigates failures, detects flaky tests, and produces evidence-based QA reports and bug reports. Use before release, after code changes, when CI fails, or when a test behaves inconsistently.
---

# QA Regression and Triage

## Select the gate

- Type safety: `npm run qa:types`.
- Frontend component tests: `npm run qa:frontend`.
- Backend/API integration: `npm run qa:api`.
- Local deterministic browser smoke tests: `npm run qa:e2e:smoke`.
- Full browser integration suite: `npm run qa:e2e` (requires configured test dependencies).
- Full gate: `npm run qa:all`.

Start with the narrowest command that reproduces the risk. Run the broader affected-area gate after it passes. Do not run browser tests that require unavailable live dependencies and report them as product failures.

## Failure triage

1. Capture the exact command, environment, first failing assertion, stack trace, logs, and artifact paths.
2. Re-run the single failure without changing code.
3. Classify it with evidence:
   - **Product defect:** actual behavior violates a requirement or established contract.
   - **Test defect:** locator, fixture, assertion, cleanup, or assumption is wrong.
   - **Environment defect:** dependency, configuration, port, credentials, or test data is unavailable.
   - **Flaky/unknown:** outcome changes without a relevant state change; continue investigation.
4. Reduce to the smallest reliable reproduction and inspect the application path it exercises.
5. Fix only the classified root cause. Do not lower assertions or add sleeps as a shortcut.
6. Run the focused reproduction repeatedly when flakiness was suspected, then the affected regression gate.

## Report format

Use `qa/templates/bug-report.md` for defects. For a test run report include commit, environment, commands, pass/fail/skip counts, duration when available, defects by severity, artifacts, blocked coverage, and release recommendation.

Release status is one of:

- **Go:** all critical/high affected risks passed; no unresolved blocker.
- **Conditional go:** understood non-critical gaps have owners and mitigations.
- **No-go:** a critical path fails, evidence is missing for a high risk, or the environment invalidates the result.
