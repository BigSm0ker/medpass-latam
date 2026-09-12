# Deployment

One Next.js application on Vercel plus one Supabase project. No Docker, no queues, no separate API.

## Why this is urgent rather than final polish

A public URL where judges can try the application is bounty requirement 5 — a participation
requirement, not a finishing touch. It is also among the cheapest tasks remaining, so it should not
be left until the last hours.

## Step 1 — Import the repository into Vercel

- [ ] Sign in to Vercel and import `BigSm0ker/medpass-latam`
- [ ] Framework preset detects Next.js; no build settings need changing
- [ ] Deploy from `develop` (or `main` once the branches are merged)

This step requires the owner's account authorization and cannot be done by an agent.

## Step 2 — Environment variables

Set these in Vercel → Project → Settings → Environment Variables, for Production and Preview:

| Variable                               | Notes                                 |
| -------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY`   | Browser-safe                          |
| `POLLAR_SECRET_KEY`                    | Server-only                           |
| `NEXT_PUBLIC_SUPABASE_URL`             | Browser-safe                          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe                          |
| `SUPABASE_SECRET_KEY`                  | Server-only                           |
| `SESSION_SECRET`                       | **Generate a new one for production** |

Generate the session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

It must differ from the local one. A session secret that leaks lets anyone forge a session cookie
for any wallet address, so it should never be shared between environments.

The application validates all of these at startup and refuses to run with a `SESSION_SECRET`
shorter than 32 characters.

## Step 3 — The trap that will otherwise cost an hour

**Add the Vercel production domain to the Pollar dashboard's allowed origins**, and the preview
domain too if judges will be sent one.

This already happened once on `localhost`. The symptom is a login modal that says _"Could not load
sign-in options. Check your connection and try again."_ — which reads like a network fault. It is
not. `GET /v2/applications/config` is returning `403 {"code":"ORIGIN_NOT_ALLOWED"}`.

If sign-in fails on the deployed site, check this before checking anything else.

## Step 4 — Supabase

- [ ] `supabase/migrations/0001_medical_passport.sql` applied
- [ ] `supabase/migrations/0002_encounters.sql` applied
- [ ] Verification query at the end of 0002 shows four tables, RLS enabled, zero policies

Both migrations are idempotent and safe to re-run.

## Step 5 — Smoke test in a clean browser

Use a private window with no existing session.

- [ ] `/` renders and explains the product
- [ ] Sign-in modal opens and lists the auth methods (if not, go back to step 3)
- [ ] `/passport` reaches the sign-in gate, and a passport saves after signing in
- [ ] `/charge` creates a charge and renders a QR
- [ ] Scanning that QR on a phone opens `/c/<token>` and shows the request
- [ ] A second account can approve a subset and the provider sees exactly that subset
- [ ] `/spike/pollar` returns 404 in production, as intended

## Note on the demo path

A judge arriving cold has no funded wallet. They can sign in, create a passport, create a charge,
scan it and approve a scope — everything except the final payment, which needs USDC. Say so on the
submission rather than letting them hit a wall: the payment is evidenced by the transaction hash
and the explorer link.
