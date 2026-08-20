/** Persistent PTY Remote for registered workspace directories. */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { WorkspaceConsoleSessionId, type WorkspaceConsoleOpenResult, type WorkspaceConsoleReadResult } from './types.ts';
export type * from './types.ts';
/** Validated resource bounds for the workspace terminal plugin. */
export interface Config {
    /** Terminal shell executable. */
    shell: string;
    /** Arguments passed to the terminal shell. */
    shellArgs: string[];
    /** TERM-to-KILL cleanup grace in milliseconds. */
    graceMs: number;
    /** Maximum UTF-8 bytes retained in each session's output tail. */
    maxOutputBytes: number;
    /** Maximum characters accepted by one input call. */
    maxInputChars: number;
    /** Maximum combined pending and published terminal sessions. */
    maxSessions: number;
}
/** Remote-only service owning persistent human workspace terminals. */
export declare class WorkspaceConsoleGateway extends TypertRemoteService {
    private readonly config;
    static inject: string[];
    static Config: z<Config>;
    private readonly sessions;
    private readonly pendingOpens;
    private disposing;
    constructor(ctx: Context, config: Config);
    /**
     * Allocate one persistent terminal rooted at a registered workspace.
     * @param workspaceId - Registered workspace id.
     * @param cols - Initial terminal columns.
     * @param rows - Initial terminal rows.
     * @returns the allocated terminal identity.
     */
    open(workspaceId: string, cols: number, rows: number): Promise<WorkspaceConsoleOpenResult>;
    private allocate;
    /**
     * Write raw keyboard data into a terminal.
     * @param sessionId - terminal identity returned by {@link open}.
     * @param data - raw xterm input without newline conversion.
     */
    write(sessionId: WorkspaceConsoleSessionId, data: string): Promise<void>;
    /**
     * Read terminal output after a caller-owned byte offset.
     * @param sessionId - terminal identity returned by {@link open}.
     * @param fromByte - byte offset returned by the previous read.
     * @returns incremental terminal output and current exit state.
     */
    read(sessionId: WorkspaceConsoleSessionId, fromByte: number): WorkspaceConsoleReadResult;
    /**
     * Resize a live terminal.
     * @param sessionId - terminal identity returned by {@link open}.
     * @param cols - terminal columns.
     * @param rows - terminal rows.
     */
    resize(sessionId: WorkspaceConsoleSessionId, cols: number, rows: number): Promise<void>;
    /**
     * Close one terminal. Repeating a close is a no-op.
     * @param sessionId - terminal identity returned by {@link open}.
     */
    close(sessionId: WorkspaceConsoleSessionId): Promise<void>;
    private session;
    private assertActive;
    private assertDimensions;
    private disposeAll;
    private terminate;
}
export default WorkspaceConsoleGateway;
//# sourceMappingURL=index.d.ts.map