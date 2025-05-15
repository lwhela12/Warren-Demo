# Warren Demo – Sprint Plan (6‑Week Time‑Box)

*Aligned with **Demo Design & Implementation Plan v0.4** (local‑host, no Docker)*

---
## Sprint Cadence
- **Sprint length**: 1 week (Mon–Fri)
- **Ceremonies**:
  - **Planning**: Monday 10 AM (1 hr)
  - **Daily Stand‑up**: 15 min
  - **Review & Demo**: Friday 3 PM (30 min)
  - **Retro**: Friday 3:30 PM (30 min)

Effort estimates use **Story Points (SP)** on a Fibonacci sequence (1, 2, 3, 5, 8). Initial velocity target: **18 SP/week**.

---
## Sprint 0 – *Project Setup (No Docker)*
| #   | User Story | Tasks | Owner | SP | Acceptance Criteria |
|-----|------------|-------|-------|----|---------------------|
| 0.1 | As a developer, I can start both server and client with one command. | • Scaffold pnpm monorepo workspaces<br>• Add `npm run dev` script using `concurrently` to run Express (nodemon) + Vite | Dev A | 5 | `npm run dev` opens React on <http://localhost:3000> and API on 5000 |
| 0.2 | As a developer, I have a local database ready for queries. | • Init Prisma schema (`Survey`, `Question`, `Response`)<br>• Automate SQLite migration<br>• Seed sample data script | Dev B | 3 | `npm run db:seed` creates `data/warren.db` and inserts samples |
| 0.3 | As a developer, I receive magic‑link emails during dev. | • Download MailHog binary via post‑install<br>• Add `npm run mailhog` script<br>• Wire nodemailer transport to MailHog | Dev A | 3 | Visiting <http://localhost:8025> shows captured magic‑link email |
| 0.4 | As PM, I need automated lint/test gates for all PRs. | • ESLint + Prettier config<br>• Vitest sample<br>• GitHub Actions workflow | Dev B | 2 | PR blocked on lint or failing tests |
| **Capacity** | | | | **13** | |

---
## Sprint 1 – *Question Generation*
| # | User Story | Tasks | Owner | SP | Acceptance Criteria |
|---|------------|-------|-------|----|---------------------|
| 1.1 | As a teacher, I can enter my survey objective and receive draft questions. | • Create `/api/claude` proxy<br>• Prompt engineering (insert methodology rubric)<br>• Timeout + error handling | Dev A | 5 | POST objective returns ≥5 questions + rubric tags JSON |
| 1.2 | As a teacher, I see a form to submit my objective. | • React Step 1 component (textarea, submit)<br>• Validation & loading state | Dev B | 3 | Submitting advances to Step 2 with results |
| 1.3 | As QA, I have seed objectives for demo scripts. | • Create YAML/JSON of 5 canned objectives<br>• `npm run demo:seed` inserts them | QA | 1 | Seed command populates objectives table |
| **Capacity** | | | | **9** | |

---
## Sprint 2 – *Review & Editing*
| # | User Story | Tasks | Owner | SP | Acceptance Criteria |
|---|------------|-------|-------|----|---------------------|
| 2.1 | As a teacher, I can edit a question inline and save changes. | • Question list component<br>• Inline editable textarea<br>• PATCH `/api/survey/:id/question` | Dev A | 5 | Edits persist after page refresh |
| 2.2 | I see rubric badges for each question. | • Badge component colour‑coded by score | Dev B | 2 | Badges render per question |
| 2.3 | I can regenerate an individual question. | • ‘Regenerate’ button → Claude<br>• Replace in list<br>• Audit console | Dev A | 3 | New question replaces old |
| **Capacity** | | | | **10** | |

---
## Sprint 3 – *Deployment & Student UI*
| # | User Story | Tasks | Owner | SP | Acceptance Criteria |
|---|------------|-------|-------|----|---------------------|
| 3.1 | As a teacher, I generate a share link and QR code. | • Generate UUID token<br>• Store in SQLite<br>• QR via `qrcode.react` | Dev B | 5 | QR scans to student form |
| 3.2 | As a student, I complete the survey comfortably on mobile. | • Responsive form components<br>• Progress bar<br>• POST `/api/response` | Dev A | 5 | Works iOS Safari, Android Chrome |
| 3.3 | I can tunnel the demo externally when needed. | • `npm run tunnel` → ngrok http 3000, print URL | Dev B | 2 | External phone hits student form |
| **Capacity** | | | | **12** | |

---
## Sprint 4 – *Analysis & Exports*
| # | User Story | Tasks | Owner | SP | Acceptance Criteria |
|---|------------|-------|-------|----|---------------------|
| 4.1 | As a teacher, I get an AI summary of results. | • Batch responses to Claude summariser<br>• Save summary | Dev A | 5 | Summary paragraph on results page |
| 4.2 | I can download a PDF report. | • Puppeteer template<br>• `/report/pdf` route | Dev B | 3 | PDF downloads with questions + charts |
| 4.3 | I can export to Google Slides. | • Service account setup<br>• Slides API templating | Dev B | 5 | Slides URL opens populated deck |
| **Capacity** | | | | **13** | |

---
## Sprint 5 – *Polish & Pilot*
| # | User Story | Tasks | Owner | SP | Acceptance Criteria |
|---|------------|-------|-------|----|---------------------|
| 5.1 | The demo has branded landing & marketing page. | • Implement final colours/logo<br>• Hero section & CTA | Dev B | 3 | Brand checklist passes |
| 5.2 | We run teacher usability tests and gather feedback. | • Recruit 3 teachers<br>• Conduct sessions<br>• Feedback doc | PM | 3 | Feedback doc completed |
| 5.3 | Critical bugs fixed, performance optimised. | • Triage & resolve P1 issues | Dev A | 5 | All P1 bugs closed |
| 5.4 | Demo script & walkthrough video recorded. | • Draft script<br>• Record Loom video | PM | 2 | Video link shared |
| **Capacity** | | | | **13** | |

---
## Backlog (Post‑Demo)
- Student roster integration & non‑anonymous mode
- Comparative dashboards & longitudinal trends
- FERPA/GDPR compliance (encryption at rest, DPA templates)
- SSO via Clever/ClassLink
- Speech‑to‑text student input
- Multi‑tenant cloud deploy (AWS/GCP)

---
*Updated: 2025‑05‑15 – Sprint 0 reworked to remove Docker & use local npm workflow.*
