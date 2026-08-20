/** Package-owned invariant companion for the Workspace console bundle. @module @skylarking/dsh-workspace-console/invariant */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "workspace-console-bundle-invariant";
/** Service required before the companion can register. */
export declare const inject: string[];
/**
 * Register this static bundle's invariant companion.
 * @param ctx - Cordis context carrying the invariant service.
 * @returns the registration disposer after setup succeeds.
 */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map