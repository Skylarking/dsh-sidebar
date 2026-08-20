import workspaceConsoleRemote from '@skylarking/dsh-host-workspace-console/remote';
import workspaceFilesRemote from '@skylarking/dsh-host-workspace-files/remote';
import { BottomDock, RightDock, SidebarTriggers, } from "./SidebarDock.js";
import { bindWorkspaceTerminalView } from "./WorkspaceConsole.js";
import { bindWorkspaceFilesView } from "./WorkspaceFiles.js";
import { en, zh } from "./locales.js";
const NS = 'workspace-sidebar';
const UI_INJECT = [
    'slots', 'locale', 'layout', 'remote', 'remote.workspaceConsole', 'remote.workspaceFiles', 'workspaces',
];
function views(ctx) {
    return {
        getSnapshot: () => {
            const catalog = ctx.slots.entries('workspace-sidebar.view');
            const right = new Set(ctx.slots.entries('workspace-sidebar.right.view').map(entry => entry.options.key));
            const bottom = new Set(ctx.slots.entries('workspace-sidebar.bottom.view').map(entry => entry.options.key));
            for (const entry of catalog) {
                const id = entry.options.id;
                if (id !== undefined && (!right.has(id) || !bottom.has(id))) {
                    throw new Error(`workspace-sidebar view '${id}' must register matching right and bottom renderers`);
                }
            }
            return catalog;
        },
        subscribe: (listener) => {
            const offCatalog = ctx.slots.subscribe('workspace-sidebar.view', listener);
            const offRight = ctx.slots.subscribe('workspace-sidebar.right.view', listener);
            const offBottom = ctx.slots.subscribe('workspace-sidebar.bottom.view', listener);
            return () => { offBottom(); offRight(); offCatalog(); };
        },
    };
}
function unwrap(operation, result) {
    if (!result.ok)
        throw new Error(`${operation} failed: ${result.error.code}: ${result.error.message}`);
    return result.value;
}
function registerSidebar(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sidebar: dictionaries');
    const terminal = {
        open: async (workspaceId, cols, rows) => unwrap('workspaceConsole.open', await ctx.remote.workspaceConsole.open(workspaceId, cols, rows)).sessionId,
        write: async (sessionId, data) => { unwrap('workspaceConsole.write', await ctx.remote.workspaceConsole.write(sessionId, data)); },
        read: async (sessionId, offset) => unwrap('workspaceConsole.read', await ctx.remote.workspaceConsole.read(sessionId, offset)),
        resize: async (sessionId, cols, rows) => { unwrap('workspaceConsole.resize', await ctx.remote.workspaceConsole.resize(sessionId, cols, rows)); },
        close: async (sessionId) => { unwrap('workspaceConsole.close', await ctx.remote.workspaceConsole.close(sessionId)); },
    };
    const files = {
        list: async (workspaceId, path) => unwrap('workspaceFiles.list', await ctx.remote.workspaceFiles.list(workspaceId, path)),
        read: async (workspaceId, path) => unwrap('workspaceFiles.read', await ctx.remote.workspaceFiles.read(workspaceId, path)),
    };
    const common = { workspaces: ctx.workspaces.list };
    const triggerInjected = () => ({
        layout: {
            toggleBottomPanel: () => { ctx.layout.toggleBottomPanel(); },
            toggleRightPanel: () => { ctx.layout.toggleRightPanel(); },
        },
    });
    ctx.slots.inject('shell.hero.utilities', () => ctx.slots.register({ name: 'shell.hero.utilities', id: 'workspace-sidebar', order: 20, locale: NS, inject: triggerInjected }, SidebarTriggers));
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: 'workspace-sidebar', order: 20, locale: NS, inject: triggerInjected }, SidebarTriggers));
    ctx.slots.inject('shell.rightPanel', () => ctx.slots.register({
        name: 'shell.rightPanel',
        locale: NS,
        children: {
            'workspace-sidebar.view': { kind: 'list', scope: 'root' },
            'workspace-sidebar.right.view': { kind: 'keyed', scope: 'root' },
        },
        inject: () => ({ views: views(ctx) }),
    }, RightDock));
    ctx.slots.inject('shell.bottomPanel', () => ctx.slots.register({
        name: 'shell.bottomPanel',
        locale: NS,
        children: { 'workspace-sidebar.bottom.view': { kind: 'keyed', scope: 'root' } },
        inject: () => ({ views: views(ctx) }),
    }, BottomDock));
    const TerminalView = bindWorkspaceTerminalView({ ...common, terminal });
    const FilesView = bindWorkspaceFilesView({ ...common, ...files });
    const translate = ctx.locale.bind(NS);
    ctx.slots.inject('workspace-sidebar.right.view', () => [
        ctx.slots.register({ name: 'workspace-sidebar.right.view', key: 'terminal', locale: NS }, TerminalView),
        ctx.slots.register({ name: 'workspace-sidebar.right.view', key: 'files', locale: NS }, FilesView),
    ]);
    ctx.slots.inject('workspace-sidebar.bottom.view', () => [
        ctx.slots.register({ name: 'workspace-sidebar.bottom.view', key: 'terminal', locale: NS }, TerminalView),
        ctx.slots.register({ name: 'workspace-sidebar.bottom.view', key: 'files', locale: NS }, FilesView),
    ]);
    ctx.slots.inject('workspace-sidebar.view', () => [
        ctx.slots.register({ name: 'workspace-sidebar.view', id: 'terminal', order: 10, label: () => translate('view.terminal') }, () => null),
        ctx.slots.register({ name: 'workspace-sidebar.view', id: 'files', order: 20, label: () => translate('view.files') }, () => null),
    ]);
    ctx.effect(() => () => {
        ctx.layout.closeRightPanel();
        ctx.layout.closeBottomPanel();
    }, 'ui-sidebar: close docks on unload');
}
/** Required service for mounting both Sidebar Remote contributions. */
export const inject = ['remote'];
/** Mount the terminal and file Remotes before registering their dock views. */
export async function apply(ctx) {
    await ctx.remote.$mount(workspaceConsoleRemote);
    await ctx.remote.$mount(workspaceFilesRemote);
    await ctx.inject(UI_INJECT, registerSidebar);
}
//# sourceMappingURL=index.js.map