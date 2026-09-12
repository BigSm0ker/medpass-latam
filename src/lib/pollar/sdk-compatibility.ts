import { POLLAR_CORE_VERSION } from "@pollar/core";
import type { PollarConfig } from "@pollar/react";

/**
 * Compile-time boundary proving the pinned official packages resolve together.
 * Phase 1 owns client creation, credentials, providers, and live TestNet calls.
 */
export const pollarCoreVersion = POLLAR_CORE_VERSION;
export type PollarReactConfig = PollarConfig;
