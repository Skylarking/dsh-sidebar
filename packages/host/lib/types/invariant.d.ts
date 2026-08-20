/** Package-owned invariant companion. @module @skylarking/dsh-host-workspace-console/invariant */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "host-workspace-console-invariant";
/** Service required before package ownership registration. */
export declare const inject: string[];
/** Register this package's invariant companion. */
export declare const apply: (ctx: Context) => Promise<() => void>;
//# sourceMappingURL=invariant.d.ts.map