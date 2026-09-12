# Pollar integration instructions

- Read `docs/POLLAR_INTEGRATION.md` and ADR-004 before changing this boundary.
- Check official docs, repositories, examples, and installed TypeScript declarations.
- Keep `@pollar/core` and `@pollar/react` on matching compatible versions.
- Centralize SDK configuration and operations here; UI components call feature services.
- Default all development to TestNet. Mainnet transactions require explicit human approval.
- Publishable keys may reach the browser; secret keys never may.
- Do not infer or fabricate SDK methods. Record unresolved behavior before proceeding.
