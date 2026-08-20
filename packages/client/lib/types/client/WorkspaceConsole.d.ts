import '@xterm/xterm/css/xterm.css';
import type { WorkspaceConsoleReadResult, WorkspaceConsoleSessionId } from '@skylarking/dsh-host-workspace-console/types';
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-client-runtime/client';
import type { WorkspaceConsoleKey } from './locales.ts';
type Translate = (key: WorkspaceConsoleKey, vars?: Record<string, string | number>) => string;
interface WorkspaceConsoleRemote {
    open(workspaceId: WorkspaceId, cols: number, rows: number): Promise<WorkspaceConsoleSessionId>;
    write(sessionId: WorkspaceConsoleSessionId, data: string): Promise<void>;
    read(sessionId: WorkspaceConsoleSessionId, offset: number): Promise<WorkspaceConsoleReadResult>;
    resize(sessionId: WorkspaceConsoleSessionId, cols: number, rows: number): Promise<void>;
    close(sessionId: WorkspaceConsoleSessionId): Promise<void>;
}
export interface WorkspaceConsoleInjected {
    layout: {
        toggleBottomPanel: () => void;
    };
    workspaces: {
        getSnapshot: () => {
            items: readonly WorkspaceView[];
        };
        subscribe: (listener: () => void) => () => void;
    };
    terminal: WorkspaceConsoleRemote;
}
/** Conversation utility that toggles the bottom split panel. */
export declare function WorkspaceConsoleTrigger({ layout, t }: WorkspaceConsoleInjected & {
    t: Translate;
}): import("react").JSX.Element;
/** Bottom-docked interactive terminal panel. */
export declare function WorkspaceConsolePanel({ workspaces, terminal, t, close }: WorkspaceConsoleInjected & {
    t: Translate;
    close: () => void;
}): import("react").JSX.Element;
export {};
//# sourceMappingURL=WorkspaceConsole.d.ts.map