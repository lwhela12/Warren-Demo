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

Create a `client/.env` file and set the API URL used by the React app:

```
echo "VITE_API_URL=http://localhost:5001" > client/.env
```

### Scripts
- `npm run dev`  
  Start server (Express on port 5001) and client (Vite on port 3000).
 - `npm run mailhog`  
   Launch MailHog (SMTP: 1025, HTTP UI: 8025).
- `npm run demo:seed`  
  Seed canned survey objectives into the database (`data/warren.db`).
- `npm run db:seed`  
  Create/update SQLite schema and seed sample data (`data/warren.db`).
- `npm run lint`  
  Run ESLint.
- `npm run test`  
  Run Vitest tests.

### Environment Variables
- `PORT`  - server port (default: 5001)
- `DATABASE_URL`  - Prisma SQLite URL (default: file:../data/warren.db)
- `CLIENT_URL`  - client base URL for magic-link (default: http://localhost:3000)
- `VITE_API_URL` - API base URL for the React app (default: http://localhost:5001)

### Project Structure
```
/README.md
/package.json         # root workspace
/pnpm-workspace.yaml
/data                  # SQLite file
/server                # Express API + Prisma
/client                # React + Vite app
/scripts               # helper scripts (mailhog, tunnel)
/tests                 # Vitest tests
/.github               # CI workflows
```

## Continuous Integration
GitHub Actions runs ESLint and Vitest on PRs to `main`.