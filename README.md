# EcoSphere

ESG management platform: carbon ingestion, E/S/G scoring, governance, social/CSR, and gamification.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **PostgreSQL** + Prisma
- **Auth.js (NextAuth v5)** — credentials + Google OAuth
- **Groq** (AI extraction / advisor)
- **googleapis** (Gmail invoice sync)

## Quick start (local)

### 1. Postgres

```bash
# Uses docker-compose.yml (Postgres 15 on :5432)
npm run docker:up
# or: docker compose up -d db
```

### 2. Environment

Copy `.env.example` → `.env` and fill keys. Your project already has a `.env` with:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Session signing |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3000/api/gmail/callback` |
| `GROQ_API_KEY` | Document AI + advisor |

### 3. Google Cloud Console (required for Google login + Gmail)

If you see **`Error 403: access_denied`** on Gmail connect, the app code is fine — Google is refusing consent. Fix Cloud Console as below.

#### A. Enable APIs

[Google Cloud Console → APIs & Services → Library](https://console.cloud.google.com/apis/library)

- Enable **Gmail API**
- Enable **Google+ API** / ensure people/openid are available (usually automatic)

#### B. OAuth consent screen

[APIs & Services → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)

1. User type: **External** (or Internal if Workspace-only).
2. Publishing status: **Testing** is fine for local dev.
3. **Test users** — **add the exact Google account** you use to click Connect Gmail  
   (e.g. `you@gmail.com`). Without this, Google returns `403 access_denied` for sensitive scopes.
4. **Scopes** → Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
   - `https://www.googleapis.com/auth/gmail.readonly` ← required for invoice sync  
     (`gmail.readonly` is a **restricted** scope; only **Test users** can grant it until the app is verified.)

#### C. Credentials (OAuth client)

[APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client ID → type **Web application**

**Authorized JavaScript origins**

- `http://localhost:3000`

**Authorized redirect URIs** (both required)

1. `http://localhost:3000/api/auth/callback/google` — Sign in with Google  
2. `http://localhost:3000/api/gmail/callback` — Gmail invoice sync  

Copy Client ID / Secret into `.env` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

```env
GOOGLE_REDIRECT_URI="http://localhost:3000/api/gmail/callback"
NEXTAUTH_URL="http://localhost:3000"
```

#### D. After changing Console settings

- Wait 1–2 minutes, then try again in an **incognito** window (or clear Google site cookies).
- Sign in as an account listed under **Test users**.
- Click **Allow** on the consent screen (denying also shows `access_denied`).

### 4. Install, migrate, seed, run

```bash
npm install --legacy-peer-deps
npx prisma db push   # or: npm run db:migrate
npm run db:seed      # demo users (skip if already seeded)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo login:** `admin@ecocorp.com` / `password123`  
Or use **Continue with Google**.

### Gmail sync

1. Sign in as **ADMIN** or **MANAGER**
2. Environmental → **Connect Gmail** (or Sync Gmail when not connected)
3. Approve `gmail.readonly` → tokens stored on your user
4. **Sync Gmail** scans for invoice/utility attachments

## Full stack in Docker

```bash
docker compose up --build
```

App: [http://localhost:3000](http://localhost:3000)  
DB only: `npm run docker:up`

When the app runs **inside** Docker, `DATABASE_URL` is overridden to `postgresql://admin:password123@db:5432/ecosphere`.

## Auth notes

- **Credentials:** password users from seed (and any user with `passwordHash`).
- **Google sign-in:** creates `EMPLOYEE` if email is new; links if email already exists; can store refresh tokens for Gmail when Google grants them.
- **Gmail connect:** separate flow at `/api/gmail/connect` using `GOOGLE_REDIRECT_URI` for `gmail.readonly` scope.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run docker:up` | Start Postgres only |
| `npm run docker:app` | Build & run app + DB |
| `npm run db:seed` | Seed demo data |
