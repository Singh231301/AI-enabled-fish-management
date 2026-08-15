# FishFarm Vercel + Neon Deployment

This repo is set up as two Vercel projects:

- `fishfarm/backend` -> Express API as Vercel Serverless Functions
- `fishfarm/frontend` -> Vite React static frontend

## 1. Create Neon Database

Recommended path: create Neon from the Vercel Marketplace so Vercel can attach the env vars automatically.

1. In Vercel, create/import the backend project with root directory `fishfarm/backend`.
2. Open the backend project in Vercel.
3. Go to Storage/Marketplace and add Neon Postgres.
4. Connect the Neon database to the backend project.
5. Confirm Vercel has `DATABASE_URL` in Production, Preview, and Development environments.

Manual Neon path:

1. Create a Neon project at `https://console.neon.tech`.
2. Create a database, for example `fishfarm`.
3. Copy the pooled PostgreSQL connection string.
4. Add it to the Vercel backend project as `DATABASE_URL`.

Use a pooled Neon connection string for serverless traffic. It usually contains `-pooler` in the host.

## 2. Backend Project Settings

Vercel project root:

```txt
fishfarm/backend
```

Build settings can stay automatic because `fishfarm/backend/vercel.json` defines:

```txt
Install Command: npm install
Build Command: npm run build
```

Required backend environment variables:

```txt
DATABASE_URL=postgresql://...
JWT_SECRET=<at least 32 random characters>
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=...
NODE_ENV=production
FRONTEND_URL=https://your-frontend-project.vercel.app
CORS_ORIGIN=https://your-frontend-project.vercel.app
```

`PORT` is only needed for local development. Vercel does not use it for serverless functions.

After setting `DATABASE_URL`, create the Neon schema from your machine:

```bash
cd fishfarm/backend
npm install
npx prisma db push
```

Then deploy the backend. Its API base URL will be:

```txt
https://your-backend-project.vercel.app/api/v1
```

## 3. Frontend Project Settings

Vercel project root:

```txt
fishfarm/frontend
```

Build settings can stay automatic because `fishfarm/frontend/vercel.json` defines:

```txt
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Required frontend environment variable:

```txt
VITE_API_URL=https://your-backend-project.vercel.app/api/v1
```

Deploy the frontend after the backend URL is known.

## 4. Local Env Files

Backend:

```bash
cd fishfarm/backend
copy .env.example .env
```

Frontend:

```bash
cd fishfarm/frontend
copy .env.example .env
```

Do not commit real `.env` files.

## 5. Notes

- The Express API is exported from `backend/api/index.ts` for Vercel.
- The local backend server still uses `src/server.ts`.
- The local scheduler starts only from `src/server.ts`. It is intentionally not started in Vercel serverless request handlers.
- If production reminders/background jobs are required, convert those jobs to Vercel Cron endpoints before relying on them in production.
