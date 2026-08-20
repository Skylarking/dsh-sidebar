/** Register Sidebar docks, built-in views, triggers, and Remote contributions. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@skylarking/dsh-client-ui-workspace-layout/client'
import workspaceConsoleRemote from '@skylarking/dsh-host-workspace-console/remote'
import type { WorkspaceConsoleOpenResult, WorkspaceConsoleReadResult } from '@skylarking/dsh-host-workspace-console/types'
import workspaceFilesRemote from '@skylarking/dsh-host-workspace-files/remote'
import {
  BottomDock,
  RightDock,
  SidebarTriggers,
  type SidebarTriggerInjected,
  type SidebarViewOwnerProps,
  type SidebarViewsSource,
} from './SidebarDock.tsx'
import { bindWorkspaceTerminalView, type WorkspaceConsoleInjected } from './WorkspaceConsole.tsx'
import { bindWorkspaceFilesView, type WorkspaceFilesInjected } from './WorkspaceFiles.tsx'
import { en, zh, type SidebarKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Sidebar controls and built-in view copy. */
    'workspace-sidebar': SidebarKey
  }
  interface SlotMap {
    /** View labels exposed to both Sidebar add menus. */
    'workspace-sidebar.view': { kind: 'list'; scope: 'root' }
    /** Keyed view types available to the right Sidebar dock. */
    'workspace-sidebar.right.view': { kind: 'keyed'; scope: 'root'; owner: SidebarViewOwnerProps }
    /** Keyed view types available to the bottom Sidebar dock. */
    'workspace-sidebar.bottom.view': { kind: 'keyed'; scope: 'root'; owner: SidebarViewOwnerProps }
  }
}

const NS = 'workspace-sidebar'
const UI_INJECT = [
  'slots', 'locale', 'layout', 'remote', 'remote.workspaceConsole', 'remote.workspaceFiles', 'workspaces',
]
type RemoteResult<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } }

function views(ctx: ClientContext): SidebarViewsSource {
  return {
    getSnapshot: () => {
      const catalog = ctx.slots.entries('workspace-sidebar.view')
      const right = new Set(ctx.slots.entries('workspace-sidebar.right.view').map(entry => entry.options.key))
      const bottom = new Set(ctx.slots.entries('workspace-sidebar.bottom.view').map(entry => entry.options.key))
      for (const entry of catalog) {
        const id = entry.options.id
        if (id !== undefined && (!right.has(id) || !bottom.has(id))) {
          throw new Error(`workspace-sidebar view '${id}' must register matching right and bottom renderers`)
        }
      }
      return catalog
    },
    subscribe: (listener) => {
      const offCatalog = ctx.slots.subscribe('workspace-sidebar.view', listener)
      const offRight = ctx.slots.subscribe('workspace-sidebar.right.view', listener)
      const offBottom = ctx.slots.subscribe('workspace-sidebar.bottom.view', listener)
      return () => { offBottom(); offRight(); offCatalog() }
    },
  }
}

function unwrap<T>(operation: string, result: RemoteResult<T>): T {
  if (!result.ok) throw new Error(`${operation} failed: ${result.error.code}: ${result.error.message}`)
  return result.value
}

function registerSidebar(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-sidebar: dictionaries')
  const terminal: WorkspaceConsoleInjected['terminal'] = {
    open: async (workspaceId, cols, rows) => unwrap<WorkspaceConsoleOpenResult>('workspaceConsole.open', await ctx.remote.workspaceConsole.open(workspaceId, cols, rows)).sessionId,
    write: async (sessionId, data) => { unwrap<void>('workspaceConsole.write', await ctx.remote.workspaceConsole.write(sessionId, data)) },
    read: async (sessionId, offset) => unwrap<WorkspaceConsoleReadResult>('workspaceConsole.read', await ctx.remote.workspaceConsole.read(sessionId, offset)),
    resize: async (sessionId, cols, rows) => { unwrap<void>('workspaceConsole.resize', await ctx.remote.workspaceConsole.resize(sessionId, cols, rows)) },
    close: async (sessionId) => { unwrap<void>('workspaceConsole.close', await ctx.remote.workspaceConsole.close(sessionId)) },
  }
  const files: Pick<WorkspaceFilesInjected, 'list' | 'read'> = {
    list: async (workspaceId, path) => unwrap('workspaceFiles.list', await ctx.remote.workspaceFiles.list(workspaceId, path)),
    read: async (workspaceId, path) => unwrap('workspaceFiles.read', await ctx.remote.workspaceFiles.read(workspaceId, path)),
  }
  const common = { workspaces: ctx.workspaces.list }
  const triggerInjected = (): SidebarTriggerInjected => ({
    layout: {
      toggleBottomPanel: () => { ctx.layout.toggleBottomPanel() },
      toggleRightPanel: () => { ctx.layout.toggleRightPanel() },
    },
  })

  ctx.slots.inject('shell.hero.utilities', () => ctx.slots.register({ name: 'shell.hero.utilities', id: 'workspace-sidebar', order: 20, locale: NS, inject: triggerInjected }, SidebarTriggers))
  ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({ name: 'conversation.session.header.utilities', id: 'workspace-sidebar', order: 20, locale: NS, inject: triggerInjected }, SidebarTriggers))
  ctx.slots.inject('shell.rightPanel', () => ctx.slots.register({
    name: 'shell.rightPanel',
    locale: NS,
    children: {
      'workspace-sidebar.view': { kind: 'list', scope: 'root' },
      'workspace-sidebar.right.view': { kind: 'keyed', scope: 'root' },
    },
    inject: () => ({ views: views(ctx) }),
  }, RightDock))
  ctx.slots.inject('shell.bottomPanel', () => ctx.slots.register({
    name: 'shell.bottomPanel',
    locale: NS,
    children: { 'workspace-sidebar.bottom.view': { kind: 'keyed', scope: 'root' } },
    inject: () => ({ views: views(ctx) }),
  }, BottomDock))

  const TerminalView = bindWorkspaceTerminalView({ ...common, terminal })
  const FilesView = bindWorkspaceFilesView({ ...common, ...files })
  const translate = ctx.locale.bind(NS)
  ctx.slots.inject('workspace-sidebar.right.view', () => [
    ctx.slots.register({ name: 'workspace-sidebar.right.view', key: 'terminal', locale: NS }, TerminalView),
    ctx.slots.register({ name: 'workspace-sidebar.right.view', key: 'files', locale: NS }, FilesView),
  ])
  ctx.slots.inject('workspace-sidebar.bottom.view', () => [
    ctx.slots.register({ name: 'workspace-sidebar.bottom.view', key: 'terminal', locale: NS }, TerminalView),
    ctx.slots.register({ name: 'workspace-sidebar.bottom.view', key: 'files', locale: NS }, FilesView),
  ])
  ctx.slots.inject('workspace-sidebar.view', () => [
    ctx.slots.register({ name: 'workspace-sidebar.view', id: 'terminal', order: 10, label: () => translate('view.terminal') }, () => null),
    ctx.slots.register({ name: 'workspace-sidebar.view', id: 'files', order: 20, label: () => translate('view.files') }, () => null),
  ])

  ctx.effect(() => () => {
    ctx.layout.closeRightPanel()
    ctx.layout.closeBottomPanel()
  }, 'ui-sidebar: close docks on unload')
}

/** Required service for mounting both Sidebar Remote contributions. */
export const inject = ['remote']

/** Mount the terminal and file Remotes before registering their dock views. */
export async function apply(ctx: ClientContext): Promise<void> {
  await ctx.remote.$mount(workspaceConsoleRemote)
  await ctx.remote.$mount(workspaceFilesRemote)
  await ctx.inject(UI_INJECT, registerSidebar)
}
