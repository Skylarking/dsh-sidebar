import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type WorkspaceConsoleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'workspace-console': WorkspaceConsoleKey;
    }
}
/** Required service for mounting the plugin-owned Remote contribution. */
export declare const inject: string[];
/** Mount the terminal Remote before starting its UI consumer. */
export declare function apply(ctx: ClientContext): Promise<void>;
//# sourceMappingURL=index.d.ts.map