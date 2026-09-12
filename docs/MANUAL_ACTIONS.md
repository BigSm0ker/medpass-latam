# Manual actions

Keep unresolved actions as `PENDING`. Never paste secret keys into chat or commit them.

[HUMAN_REQUIRED]

Task: Authenticate GitHub CLI, then publish the repository
Why: Portable GitHub CLI 2.100.0 is installed under the ignored `.tools/` directory, but
`gh auth status` confirms no GitHub host is authenticated. Phase 0 therefore cannot create the
required public repository or configure its branches/settings automatically.
Exact action required: From a private terminal in this workspace, run
`.\.tools\bin\gh.exe auth login` and complete the browser/device flow. Then authorize an agent to
create public repository `medpass-latam`, push `main` and `develop`, and set `develop` as the
collaboration default. Do not paste a token into chat.
Cost: $0
Risk: Selecting the wrong GitHub account or accidentally exposing an authentication token
Status: PENDING

[HUMAN_REQUIRED]

Task: Configure Pollar TestNet credentials for Phase 1
Why: The technical spike requires the owner's dashboard application and current enabled auth/wallet
settings.
Exact action required: In the Pollar Dashboard, confirm TestNet mode and create/copy the documented
publishable and server keys. Place them locally in `.env.local` using `.env.example`. Do not paste
keys into chat and do not authorize Mainnet transactions.
Cost: $0 expected
Risk: Secret exposure if placed in a browser variable, chat, or Git
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
