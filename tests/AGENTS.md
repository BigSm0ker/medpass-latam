# Test-area instructions

- Read `docs/TESTING.md` before changing tests.
- Use synthetic fixtures only; never copy real health or identity data into tests.
- Tests must be deterministic and must not spend money or submit Mainnet transactions.
- Keep the default unit and build pipeline independent of external credentials.
- Mark truly external TestNet tests explicitly and document how to skip them.
