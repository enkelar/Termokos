# Orari i punës (React + Supabase)

## 1. Supabase
1. Create a project at supabase.com.
2. SQL Editor → paste and run `supabase/schema.sql`.
3. Authentication → Users → "Add user" for each team lead (email + password). Copy each user's UUID.
4. SQL Editor → create their team (the commented `insert into teams` at the bottom of schema.sql).
5. Project Settings → API → copy the Project URL and the `anon` public key.

## 2. Run locally
```
cp .env.example .env     # paste the URL and anon key
npm install
npm run dev
```

## 3. Deploy
Push to GitHub, import in Vercel, add the two env vars. `vercel.json` already handles the /view/... links.

## How it works
- Each lead only sees their own team: enforced by Row Level Security.
- Share link = /view/<secret-token>. It calls `get_shared_report`, which only reads. Nobody can edit through it.
- Closing a month stores a snapshot of the workers and locks the entries (the database refuses writes).
- Save as PDF uses the browser's print dialog (landscape A4, choose "Save as PDF").
