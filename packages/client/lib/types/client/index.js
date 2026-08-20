import workspaceConsoleRemote from '@skylarking/dsh-host-workspace-console/remote';
import { en, zh } from "./locales.js";
import { WorkspaceConsolePanel, WorkspaceConsoleTrigger } from "./WorkspaceConsole.js";
const NS = 'workspace-console';
const UI_INJECT = ['slots', 'locale', 'layout', 'remote', 'remote.workspaceConsole', 'workspaces'];
/** Install Hero and Session triggers after the mounted terminal Remote is injectable. */
function registerWorkspaceConsole(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-workspace-console: dictionaries');
    const layout = ctx.layout;
    const unwrap = (operation, result) => {
        if (!result.ok)
            throw new Error(`workspaceConsole.${operation} failed: ${result.error.code}: ${result.error.message}`);
        return result.value;
    };
    const terminal = {
        open: async (workspaceId, cols, rows) => {
            const result = await ctx.remote.workspaceConsole.open(workspaceId, cols, rows);
            return unwrap('open', result).sessionId;
        },
        write: async (sessionId, data) => { unwrap('write', await ctx.remote.workspaceConsole.write(sessionId, data)); },
        read: async (sessionId, offset) => unwrap('read', await ctx.remote.workspaceConsole.read(sessionId, offset)),
        resize: async (sessionId, cols, rows) => { unwrap('resize', await ctx.remote.workspaceConsole.resize(sessionId, cols, rows)); },
        close: async (sessionId) => { unwrap('close', await ctx.remote.workspaceConsole.close(sessionId)); },
    };
    const injected = () => ({
        layout: { toggleBottomPanel: () => { layout.toggleBottomPanel(); } },
        workspaces: ctx.workspaces.list,
        terminal,
    });
    ctx.slots.inject('shell.hero.utilities', () => ctx.slots.register({ name: 'shell.hero.utilities', id: 'workspace-console', order: 20, locale: NS, inject: injected }, WorkspaceConsoleTrigger));
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: 'workspace-console', order: 20, locale: NS, inject: injected }, WorkspaceConsoleTrigger));
    ctx.slots.inject('shell.bottomPanel', () => ctx.slots.register({ name: 'shell.bottomPanel', locale: NS, inject: injected }, WorkspaceConsolePanel));
    ctx.effect(() => () => { layout.closeBottomPanel(); }, 'ui-workspace-console: restore bottom split on unload');
}
/** Required service for mounting the plugin-owned Remote contribution. */
export const inject = ['remote'];
/** Mount the terminal Remote before starting its UI consumer. */
export async function apply(ctx) {
    await ctx.remote.$mount(workspaceConsoleRemote);
    await ctx.inject(UI_INJECT, registerWorkspaceConsole);
}
//# sourceMappingURL=index.js.map