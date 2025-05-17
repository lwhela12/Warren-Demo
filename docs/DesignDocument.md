# Warren – Demo Design & Implementation Plan (v0.4)

> **Scope**: Build a self‑contained **local-host demo (no Docker)** to validate Warren’s AI‑assisted survey workflow and recruit partner schools for the cloud build.

---

## 1. Demo Vision & Success Criteria

| Goal                                     | Success Metric                                                    |
| ---------------------------------------- | ----------------------------------------------------------------- |
| **Showcase AI‑assisted survey creation** | Teacher builds a 5‑question survey in < 3 min on the demo laptop. |
| **Collect anonymous student voice**      | ≥ 20 responses stored with *no PII*.                              |
| **Generate insights & Slides deck**      | One‑click PDF + Google Slides export summarising results.         |
| **Recruit partners**                     | ≥ 3 schools sign MoU for Phase 2 co‑development.                  |

---

## 2. Core Demo Flow

1. **Landing / Sign‑in** → email magic‑link (local MailHog binary)
2. **“Dig New Burrow” wizard** → Claude 3.7 proposes 5–8 questions + rubric tags
3. **Question review / edit**
4. **Deploy** → share‑link & QR (served from localhost; optional ngrok tunnel)
5. **Student view** → mobile‑first anonymous form
6. **Analysis** → Claude summarises sentiment & key themes
7. **Export** → PDF report + Google Slides deck

---

## 3. Feature Cut‑List (Demo vs Full)

| Area              | Demo (local)                               | Future (cloud)                      |
| ----------------- | ------------------------------------------ | ----------------------------------- |
| Auth              | Email magic link (MailHog)                 | Clever / ClassLink SSO              |
| Response identity | Anonymous only                             | Roster & anon toggle                |
| Deployment        | Localhost link / QR (ngrok)                | LMS push, kiosk mode                |
| Analysis          | Sentiment + themes                         | Dashboards, longitudinal trends     |
| Exports           | PDF + Slides                               | CSV, PowerPoint, raw API            |
| Security          | Local TLS via mkcert                       | Full FERPA/GDPR, encryption at rest |
| STT / TTS         | n/a                                        | Speech‑to‑text, voice prompts       |
| Hosting           | **Node & React dev servers (npm scripts)** | AWS/GCP multi‑tenant                |

---

## 4. Local Architecture (No Docker)

```
📦 warren-demo
├─ /server          # Node/Express  (port 5001)
│    ├─ /routes
│    ├─ /controllers
│    ├─ /db          # SQLite file via Prisma
│    └─ index.ts
├─ /client          # React + Vite (port 3000)
│    └─ ...
├─ /scripts
│    ├─ start-dev.sh     # concurrently "npm --prefix server run dev" and client
│    ├─ tunnel.sh        # ngrok http 3000
│    └─ mailhog.sh       # start MailHog binary
└─ package.json (workspaces)
```

* **Dev start**: `npm run dev` → spins up Express API, React Vite server, MailHog.
* **Database**: single `data/warren.db` SQLite file (pragma WAL for concurrency).
* **MailHog**: download binary via script if absent; runs on port 8025.
* **Claude proxy**: `/server/services/claude.ts` with API key from `.env`.
* **Optional TLS**: `mkcert localhost` → `npm run dev:https`.

---

## 5. Methodology Integration

* Inject *Survey Methodology Framework* prompt so generated questions meet developmental criteria (Exemplary / Advanced / Proficient) citeturn0file0.
* Badge indicators rendered in question list.

---

## 6. Demo Roadmap (6 Weeks)

| Week | Focus                       | Deliverables                                                            |
| ---- | --------------------------- | ----------------------------------------------------------------------- |
| 0    | **Setup**                   | Monorepo, workspace scripts (`dev`, `mailhog`, `tunnel`), SQLite schema |
| 1    | **Question Generation**     | Claude prompt, Step 1‑2 UI                                              |
| 2    | **Review & Editing**        | Inline editor, rubric badges                                            |
| 3    | **Deployment & Student UI** | Share‑link, QR, ngrok helper                                            |
| 4    | **Analysis & Exports**      | Claude summariser, PDF & Slides deck                                    |
| 5    | **Polish & Pilot**          | Demo script, teacher tests, bug‑fixes                                   |

---

## 7. Open Items

1. **Google Slides API quota** – requires GCP project + OAuth consent (internal use).
2. **Branding assets** – final logo/colours for landing/demo deck.
3. **Pilot outreach** – identify contacts, craft pitch email.
4. **Data purge** – auto‑delete demo DB on shutdown / nightly.

---

*Updated: 2025‑05‑15 – Docker removed; local npm workflow adopted.*
