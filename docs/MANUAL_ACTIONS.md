# Manual actions

Keep unresolved actions as `PENDING`. Never paste secret keys into chat or commit them.

[COMPLETED]

Task: Authenticate GitHub CLI and publish the repository
Why: Phase 0 required a public repository and remote branch workflow.
Exact action required: Completed. GitHub CLI is authenticated as `BigSm0ker`; public repository
<https://github.com/BigSm0ker/medpass-latam> contains `main` and `develop`; `develop` is the default
branch and `main` has lightweight protection.
Cost: $0
Risk: Selecting the wrong GitHub account or accidentally exposing an authentication token
Status: COMPLETED

[COMPLETED]

Task: Configure Pollar TestNet credentials for Phase 1
Why: The technical spike requires the owner's dashboard application and current enabled auth/wallet
settings.
Exact action required: Completed. `.env.local` contains `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` and
`POLLAR_SECRET_KEY` (presence verified by variable name only; no value was read, logged, or
committed). `.env.local` remains ignored by Git.
Cost: $0
Risk: Secret exposure if placed in a browser variable, chat, or Git
Status: COMPLETED

[COMPLETED]

Task: Allow the local development origin in the Pollar dashboard
Why: The SDK's first call, `GET /v2/applications/config`, is rejected with
`403 {"code":"ORIGIN_NOT_ALLOWED"}`. The login modal therefore renders "Could not load sign-in
options" and no authentication is possible. The publishable key, the network pin, and the client
construction are all confirmed correct — the application simply does not list the dev origin.
Exact action required: In the Pollar Dashboard, open this application's settings and add the
allowed origins `http://localhost:3000` and `http://127.0.0.1:3000`. Add the public Vercel origin
too when Phase 5 deploys. Then reload `/spike/pollar`; no code change or dev-server restart is
needed.
Cost: $0
Risk: None. Do not widen the allowlist to a wildcard.
Status: COMPLETED — verified 2026-09-12: `GET /applications/config` now returns 200 and the login
modal renders the application name plus email, Google and Wallet sign-in options.

[HUMAN_REQUIRED]

Task: Enable USDC and configure a TestNet distribution rule in the Pollar dashboard
Why: Authentication now works end to end, but the application has no assets and no faucet, so the
payment path cannot be exercised at all. Observed live on 2026-09-12 with an authenticated,
server-verified session:

GET /wallet/assets -> { chain: STELLAR, exists: false,
assets: [ { type: native, code: XLM, enabledInApp: false } ] }
GET /distribution/rules -> { rules: [] }
GET /wallet/balance -> { exists: false, balances: [] }

All three returned HTTP 200. There is no error to fix in this repository: the application simply
has no asset enabled (not even XLM) and no distribution rule defined. Without a USDC asset the
adapter correctly reports "not enabled for this app"; without a rule there is no supported way to
obtain test USDC from inside the application.

The wallet's `exists: false` is a consequence, not a separate fault. Pollar uses deferred funding,
so the Stellar account is created when the first asset arrives — which cannot happen until a
faucet or another funding path exists.

Exact action required: In the Pollar Dashboard, for this application on TestNet:

1. Enable USDC as an application asset (and XLM, which currently shows `enabledInApp: false`).
2. Create a distribution rule that pays test USDC to sdk-users, so `POST /distribution/claim`
   has something to claim.
3. If the dashboard offers no faucet rule, ask Pollar how a TestNet application is expected to
   obtain USDC, and record the answer here.
   Then reload `/spike/pollar`, press "Refresh assets", and a USDC issuer should appear.
   Cost: $0 (TestNet)
   Risk: None financial. Do not enable Mainnet assets while doing this.
   Status: PENDING

[HUMAN_REQUIRED]

Task: Run the Phase 1 TestNet spike and record the evidence
Why: The adapter and credential boundary are complete and validated, but an interactive Pollar
login cannot be completed by an agent. Phase 1's acceptance gate needs a real TestNet run.
Exact action required: Run `npm run dev`, open `/spike/pollar`, and work down the checklist in
`docs/STATUS.md`. Record the wallet custody type, the resolved USDC issuer, whether a distribution
rule was available, and the TestNet transaction hash in `docs/POLLAR_INTEGRATION.md`. Stay on
TestNet; do not switch the pinned network.
Cost: $0 (TestNet only)
Risk: None financial. Do not record keys or personal data alongside the evidence.
Status: PENDING

[HUMAN_REQUIRED]

Task: Push the `feature/pollar-spike` branch to GitHub
Why: This session reaches the repository through a Linux bridge that carries no GitHub
credentials, so `git push` fails with no authentication available. The commits exist locally.
Exact action required: From Windows, run `git push -u origin develop` and
`git push -u origin feature/pollar-spike`, then open a pull request into `develop`.
Cost: $0
Risk: None beyond normal review
Status: PENDING

[HUMAN_REQUIRED]

Task: Confirm Pollar Mainnet approval and account-reserve sponsorship before Phase 5
Why: The bounty requires a real Mainnet transaction, while approval and any Stellar reserve/funding
responsibility are unresolved.
Exact action required: Obtain written confirmation from Pollar about Mainnet access and whether
hackathon wallet reserves/funding are sponsored. Record the answer without credentials. Approve
the approximately 1 USDC transaction only at execution time after reviewing destination and cost.
Cost: Unknown reserve/funding requirement; eventual transaction approximately 1 USDC
Risk: Irreversible financial transfer and possible additional account funding requirement
Status: PENDING

[HUMAN_REQUIRED]

Task: Authorize Vercel and Supabase accounts when their phases begin
Why: Public deployment and private persistence require account/OAuth actions that an agent must not
approve on the owner's behalf.
Exact action required: In Phase 2/5, authorize the selected free-tier Supabase and Vercel projects,
then place credentials only in local/Vercel environment settings. Review any pricing prompt and stop
if a paid plan is required.
Cost: $0 expected on free tiers
Risk: OAuth/account authorization and accidental paid-plan selection
Status: PENDING
