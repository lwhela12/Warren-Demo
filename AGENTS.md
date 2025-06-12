AGENTS.md

A tactical field‐guide for developers working on Warren. Last updated: 2025‑06‑12

1  Project Snapshot

Area

Status

Dev environment

Monorepo with workspaces; `npm run dev` launches Express API (port 5001) and React/Vite client (port 3000). MailHog and ngrok helper scripts available.

Database

SQLite via Prisma. Models: Survey, Question, Response; seed and demoSeed scripts in place.

Auth

Magic-link email authentication (via MailHog); basic client login with JWT-based auth implemented.

AI question generation

/api/claude endpoint returns 5 questions with rubric tags, using the Claude API when `CLAUDE_API_KEY` is set; falls back to a static stub otherwise.

Teacher UI

Two-step wizard: enter objective → view questions with rubric badges; supports inline editing, debounced save, and regeneration via feedback.

Persistence

Generated surveys and questions are persisted in the database via Prisma; survey creation and question updates handled server-side.

Student + Results

Student app renders a mobile-first survey form, saves responses, and provides AI-driven analysis with sentiment charts; exports (PDF/Slides) and share link/QR still to be implemented.

CI / lint / tests

ESLint and Vitest in place; GitHub Actions CI runs lint and tests on PRs to `main`.

High‑level

Sprints 0–2 complete (dev env, auth, AI gen, persistence); Sprint 3 student flow and analysis UI implemented; remaining: share link/QR, PDF/Slides exports, branding, end-to-end tests.

2  Coding Standards

2.1  General Principles

Simplicity over ceremony. This is a demo; avoid needless abstractions.

Small, composable modules. Route files delegate to service functions; services contain business logic; Prisma handles DB.

Typed everywhere. Use TypeScript for both server and client; define explicit interfaces/DTOs.

Fail loudly, log clearly. Validate all input; return 4xx for client mistakes, 5xx for unhandled exceptions; log stack traces server‑side.

Environment first. All secrets/ports/config live in .env; never commit real keys.

2.2  Backend (Express + Prisma)

Practice

Details

Routes

Grouped under /api; one file per concern (auth.ts, survey.ts, etc.). Use an asyncHandler wrapper to pass errors to global middleware.

Services

Pure functions; no req/res objects. Unit‑testable. E.g. generateQuestions, sendMagicLink, summarizeResponses.

DB Access

Only through Prisma Client. No raw SQL unless unavoidable. Prefer include/select to limit result sizes.

Error Handling

Central errorMiddleware returns JSON { message, stack? }. Never leak secrets.

Testing

Vitest for pure logic; supertest for route smoke tests. Cover happy path + common failure cases.

2.3  Frontend (React + Vite)

Practice

Details

Components

Functional components + Hooks. Keep each file <250 LOC.

State

Local hook state for small flows; React Context for cross‑page auth; avoid Redux unless complexity explodes.

Styling

Utility classes or small CSS modules; consistent palette from theme.ts. Inline styles only for dynamic one‑offs.

Fetching

fetch wrapped by a helper that injects base URL and handles JSON/401s.

Routing

React‑Router v6; lazy‑load routes (Login, Wizard, StudentSurvey, Results).

Accessibility

Label all controls, use semantic HTML; test with keyboard only.

2.4  Tooling

ESLint + Prettier: npm run lint --fix before every commit.

Commit style: Conventional Commits (feat:, fix:, chore:…).

CI: GitHub Actions workflow runs npm ci, npm run lint, npm test on PRs; blocks merge on failure.

3  Roadmap – Recommended Next Steps

Authentication Loop (Sprint 2 finish)

Build Login component (email → POST /api/auth/magic-link).

Implement /api/auth/verify and client handler storing JWT/token.

Gate wizard behind auth.

Survey Persistence & Editing

Add surveyService.createWithQuestions when AI returns questions.

PATCH /api/survey/:id/question/:qid and UI inline edit + debounce save.

“Regenerate” button → call real AI or improved stub.

Share Link & QR (Sprint 3)

Add shareCode (UUID) to Survey.

POST /api/survey/:id/deploy → returns URL + QR PNG (via qrcode.react on client).

Student Response Flow

Public route /survey/:code renders mobile‑first form.

POST /api/response saves answers; redirect to thank‑you.

AI Summary & Teacher Results Screen (Sprint 4)

analysisService.summarizeResponses using Claude/OpenAI; cache result.

Results page shows charts + AI narrative.
Sentiment analysis stored per question via sentimentService; GET /api/survey/:id/sentiment powers new ResultsCharts UI toggle.

Exports

PDF: Puppeteer screenshot of results page.

Slides: Google Slides API template fill (optional v1 if time allows).

Polish, Branding, CI

Apply logo/colors, add landing page.

Write Cypress happy‑path test.

Add GitHub Actions workflow.

Demo Packaging

Scripted seed + walkthrough markdown.

Record Loom video of 3‑minute flow.

4  Contribution Checklist

Fork → feature branch → PR → code review.

Include or update unit tests for any new service/function.

Run npm run lint && npm test locally before pushing.

Update this AGENTS.md when you add a significant architectural piece or alter coding standards.

Happy building! 🚀