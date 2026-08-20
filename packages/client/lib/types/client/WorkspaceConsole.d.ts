/** Persistent terminal view registered in both Sidebar docks. */
import { type ReactNode } from 'react';
import '@xterm/xterm/css/xterm.css';
import type { WorkspaceConsoleReadResult, WorkspaceConsoleSessionId } from '@skylarking/dsh-host-workspace-console/types';
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-client-runtime/client';
import type { SidebarViewOwnerProps } from './SidebarDock.tsx';
import type { SidebarKey } from './locales.ts';
type Translate = (key: SidebarKey) => string;
interface WorkspaceConsoleRemote {
    open(workspaceId: WorkspaceId, cols: number, rows: number): Promise<WorkspaceConsoleSessionId>;
    write(sessionId: WorkspaceConsoleSessionId, data: string): Promise<void>;
    read(sessionId: WorkspaceConsoleSessionId, offset: number): Promise<WorkspaceConsoleReadResult>;
    resize(sessionId: WorkspaceConsoleSessionId, cols: number, rows: number): Promise<void>;
    close(sessionId: WorkspaceConsoleSessionId): Promise<void>;
}
/** Services used by one terminal view instance. */
export interface WorkspaceConsoleInjected {
    workspaces: {
        getSnapshot: () => {
            items: readonly WorkspaceView[];
            recentWorkspaceId: WorkspaceId | undefined;
        };
        subscribe: (listener: () => void) => () => void;
    };
    terminal: WorkspaceConsoleRemote;
}
/**
 * Bind shared terminal services to a keyed Sidebar view registration.
 * @param injected - Workspace and terminal services shared by all instances.
 * @returns a component whose PTY lifecycle belongs to one dock tab.
 */
export declare function bindWorkspaceTerminalView(injected: WorkspaceConsoleInjected): (props: SidebarViewOwnerProps & {
    t: Translate;
}) => ReactNode;
/**
 * Render one Sidebar terminal tab bound to one Workspace and PTY lifecycle.
 * @param props - active state plus shared Workspace and terminal services.
 * @returns the mounted terminal view.
 */
export declare function WorkspaceTerminalView({ active, setTitle, terminal, t, workspaces }: WorkspaceConsoleInjected & SidebarViewOwnerProps & {
    t: Translate;
}): ReactNode;
export {};
//# sourceMappingURL=WorkspaceConsole.d.ts.map