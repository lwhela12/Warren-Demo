# Warren Demo

# A local monorepo demo for AI-assisted survey creation: Express API + React client.

## Getting Started

Prerequisites:
- Node.js >= 18
- npm (works with pnpm or yarn)

Install dependencies from the workspace root:
```
npm install
```

Copy `.env.example` to `server/.env` before running the development server:
```
cp .env.example server/.env
```

Ensure there is a `data` directory at the repo root (for the SQLite database):
```
mkdir -p data
touch data/.gitkeep
```

### Database setup

Generate the Prisma client and apply the schema to your new SQLite database:
```bash
cd server
npx prisma generate
npx prisma db push --schema=prisma/schema.prisma
cd ..
```

Seed the database with sample data:
```bash
npm run db:seed        # seed sample survey & responses
npm run demo:seed      # seed demo survey objectives
npm --prefix server run db:seed:llm-responses  # optional: seed LLM responses
```

Create a `client/.env` file and set the API URL used by the React app:

```
echo "VITE_API_URL=http://localhost:5001" > client/.env
```

### Scripts
- `npm run dev`  
  Start server (Express on port 5001) and client (Vite on port 3000).
- `npm run mailhog`  
  Launch MailHog (SMTP: 1025, HTTP UI: 8025).
- `npm run tunnel`  
  Start an ngrok tunnel for external access (requires `NGROK_AUTH_TOKEN`).
- `npm run demo:seed`  
  Seed canned survey objectives into the database (`data/warren.db`).
- `npm run db:seed`  
  Create/update SQLite schema and seed sample data (`data/warren.db`).
- `npm --prefix server run db:seed:llm-responses`  
  Seed AI-generated student responses via LLM stub (optional).
- `npm run lint`  
  Run ESLint.
- `npm run test`  
  Run Vitest tests.

### Environment Variables
- `PORT`  - server port (default: 5001)
- `DATABASE_URL`  - Prisma SQLite URL (default: file:../data/warren.db)
- `CLIENT_URL`  - client base URL for magic-link (default: http://localhost:3000)
- `JWT_SECRET` - secret for signing magic-link tokens (default: demo-secret)
- `MAILHOG_SMTP_HOST` - SMTP host for MailHog (default: localhost)
- `MAILHOG_SMTP_PORT` - SMTP port for MailHog (default: 1025)
- `MAILHOG_HTTP_PORT` - HTTP UI port for MailHog (default: 8025)
- `NGROK_AUTH_TOKEN` - auth token for ngrok tunneling (optional)
- `VITE_API_URL` - API base URL for the React app (default: http://localhost:5001)
- `CLAUDE_API_KEY` - Anthropic Claude API key for question generation (optional)
- `CLAUDE_MODEL` - Claude model name (default: claude-3-haiku-20240307)
- `CLAUDE_TIMEOUT_MS` - timeout for Claude API calls (default: 10000)

### Project Structure
```
/README.md
/package.json         # root workspace
/pnpm-workspace.yaml
/docs                  # design docs and methodology framework
/data                  # SQLite file
/server                # Express API + Prisma
/client                # React + Vite app
/scripts               # helper scripts (mailhog, tunnel)
/tests                 # Vitest tests
/.github               # CI workflows
```

## Continuous Integration
GitHub Actions runs ESLint and Vitest on PRs to `main`.

## Login Flow
1. Start the dev server with `npm run dev` and `npm run mailhog` in another terminal.
2. When the app loads, enter your email and submit the form.
3. MailHog (http://localhost:8025) will receive an email containing a magic link.
4. Clicking the link verifies the token and stores a JWT in `localStorage`, unlocking the survey wizard.

## API Endpoints

### Health Check

`GET /api/health`

Returns `OK` if the server is running.

### Authentication

`POST /api/auth/magic-link`
Request body: `{ "email": "string" }`
Sends a magic link to the provided email address.

`POST /api/auth/verify`
Request body: `{ "token": "string" }`
Verifies the magic link token and returns a JWT: `{ "jwt": "string" }`.

### Question Generation

`POST /api/claude`
Request body: `{ "objective": "string" }`
Returns generated questions with rubric tags: `{ "questions": [ { "text": "...", "rubric": [ ... ] }, ... ] }`.

`POST /api/claude/regenerate`
Request body: `{ "objective": "string", "question": "string", "feedback": "string" }`
Regenerates a question based on feedback: `{ "question": { "text": "...", "rubric": [ ... ] } }`.

### Survey Management

`POST /api/survey`
Request body: `{ "objective": "string", "questions": [ { "text": "string" }, ... ] }`
Creates a survey and persists questions: `{ "survey": { "id": "string", "questions": [ { "id": "string", "text": "string" }, ... ] } }`.

`PATCH /api/survey/:id/question/:qid`
Request body: `{ "text": "string" }`
Updates the text of a question: `{ "question": { "id": "string", "text": "string" } }`.

`POST /api/survey/:id/deploy`
Marks the survey as deployed (sets `deployedAt` timestamp): `{ "survey": { "id": "string", "deployedAt": "Date" } }`.

`GET /api/survey/active`
Fetches the most recently deployed survey with questions: `{ "survey": { "id": "string", "questions": [ { "id": "string", "text": "string" }, ... ] } }`.

### Branching Surveys

`POST /api/survey/branching`
Request body: `{ "objective": "string" }`
Creates and stores a branching survey graph.

`PUT /api/survey/branching/:id`
Request body: full graph `{ nodes: [...], edges: [...] }`
Updates the nodes and edges of a survey.

`GET /api/survey/branching/:id/start`
Returns the entry node object `{ "node": {...} }`.

`POST /api/survey/branching/:id/next`
Request body: `{ "currentNodeId": "string", "answer": "string" }`
Returns the next node based on the provided answer.

### Student Responses

`POST /api/responses`
Request body: `{ "responses": [ { "questionId": "string", "answer": "string" }, ... ] }`
Saves student responses: `{ "message": "Saved" }`.

### Analysis & Sentiment

`POST /api/survey/:id/analyze`
Triggers AI analysis of responses and sentiment scoring: `{ "analysis": "string" }`.

`GET /api/survey/analyzed`
Lists surveys with analysis available: `{ "surveys": [ { "id": "string", "objective": "string", "createdAt": "Date" }, ... ] }`.

`GET /api/survey/:id/analysisResult`
Retrieves stored AI analysis text: `{ "analysis": "string" }`.

`GET /api/survey/:id/sentiment`
Retrieves sentiment scores per question: `{ "questions": [ { "id": "string", "text": "string", "sentimentScore": number }, ... ] }`.

### Documentation

`GET /api/docs/methodology`
Serves the Survey Methodology Framework markdown used in prompts.
