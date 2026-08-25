# Trainix QA Toolkit

This repository includes matching project QA agents, skills, and safety hooks for Cursor/Codex under `.cursor/` and Claude Code under `.claude/`. Universal QA behavior is generated from the versioned [qa-agent-kit](https://github.com/3cgbdg/qa-agent-kit); `.qa-agent/profile.json` is Trainix's only project-specific source. Generated adapters are committed for offline use and verified against `.qa-agent/manifest.json`.

## Quality gates

| Command | Coverage | External services |
| --- | --- | --- |
| `npm run qa:agent:check` | Generated QA source/version, hashes, platform parity, and hook skill references | None |
| `npm run qa:types` | Backend and frontend TypeScript | None |
| `npm run qa:frontend` | Jest component tests | Mocked/local |
| `npm run qa:api` | Jest + Supertest + in-memory MongoDB | Must be mocked |
| `npm run qa:e2e:smoke` | Public landing/auth Playwright smoke | Local frontend only |
| `npm run qa:e2e` | Full signup → AI contract → workout → nutrition → refresh/logout Playwright journey | Disposable local MongoDB and AI contract double; no remote services |
| `npm run qa:providers:live` | Bounded signup, Stripe readiness, password-reset, production AI, Unsplash/S3, CDN, and account-cleanup smoke | Live services; requires explicit opt-in and authorized provider accounts |
| `npm run qa` | Type, component, API, and deterministic browser smoke gates | Local/test only |
| `npm run qa:all` | All deterministic and isolated full-flow gates | Local/test only |

Use Node.js 20 or later and install dependencies with `npm ci` in both `backend/` and `frontend/`.
Run `npm run qa:e2e:install` once to install the pinned Playwright Chromium browser.
Playwright uses port `3100` by default so it cannot silently reuse a developer app on port `3000`; override it with `QA_WEB_PORT` or provide an authorized `QA_WEB_BASE_URL`.

## Suggested workflow

1. Create a risk-based plan with `.cursor/skills/qa-test-strategy/SKILL.md` and `qa/templates/test-plan.md`.
2. Add deterministic API/component tests first.
3. Add Playwright only for critical user journeys that cross layers.
4. Run the focused test, then the affected-area regression gate.
5. Record defects with `qa/templates/bug-report.md` and make a go/conditional-go/no-go recommendation.

## Updating the agent

Edit `.qa-agent/profile.json` for Trainix-only facts. Edit the upstream kit for universal QA behavior, then render from a checkout of `qa-agent-kit`:

```bash
node /path/to/qa-agent-kit/scripts/render.mjs --profile .qa-agent/profile.json --target .
npm run qa:agent:check
```

Do not edit generated agent or skill files directly.

## External-service coverage

`npm run qa:e2e` starts the real Next.js and Express applications against disposable MongoDB plus a local AI contract double. It proves browser → AI contract → API → persistence → UI behavior without using remote credentials. Stripe, SMTP, S3/Unsplash, and notification side effects remain covered through mocked backend integration tests; a live-provider certification requires explicit authorization and dedicated sandbox accounts.

Run the live-provider probe only against an authorized environment:

```bash
TRAINIX_LIVE_TEST=1 \
TRAINIX_API_URL=https://your-api.example.com \
TRAINIX_AI_URL=https://your-ai.example.com \
npm run qa:providers:live
```

The command creates and deletes a disposable Trainix account. A successful Stripe checkout probe creates a customer and an uncompleted Checkout Session, and image probes can leave uniquely named shared image-cache objects because the application has no provider-side cleanup endpoint.
