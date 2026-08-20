/** Persistent terminal view registered in both Sidebar docks. */
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import type {
  WorkspaceConsoleReadResult,
  WorkspaceConsoleSessionId,
} from '@skylarking/dsh-host-workspace-console/types'
import type { WorkspaceId, WorkspaceView } from '@deepseek-ai/dsh-client-runtime/client'
import type { SidebarViewOwnerProps } from './SidebarDock.tsx'
import type { SidebarKey } from './locales.ts'
import css from './WorkspaceConsole.module.css'

type Translate = (key: SidebarKey) => string

interface WorkspaceConsoleRemote {
  open(workspaceId: WorkspaceId, cols: number, rows: number): Promise<WorkspaceConsoleSessionId>
  write(sessionId: WorkspaceConsoleSessionId, data: string): Promise<void>
  read(sessionId: WorkspaceConsoleSessionId, offset: number): Promise<WorkspaceConsoleReadResult>
  resize(sessionId: WorkspaceConsoleSessionId, cols: number, rows: number): Promise<void>
  close(sessionId: WorkspaceConsoleSessionId): Promise<void>
}

/** Services used by one terminal view instance. */
export interface WorkspaceConsoleInjected {
  workspaces: { getSnapshot: () => { items: readonly WorkspaceView[]; recentWorkspaceId: WorkspaceId | undefined }; subscribe: (listener: () => void) => () => void }
  terminal: WorkspaceConsoleRemote
}

/**
 * Bind shared terminal services to a keyed Sidebar view registration.
 * @param injected - Workspace and terminal services shared by all instances.
 * @returns a component whose PTY lifecycle belongs to one dock tab.
 */
export function bindWorkspaceTerminalView(injected: WorkspaceConsoleInjected): (props: SidebarViewOwnerProps & { t: Translate }) => ReactNode {
  return function BoundWorkspaceTerminalView(props: SidebarViewOwnerProps & { t: Translate }) {
    return <WorkspaceTerminalView {...injected} {...props} />
  }
}

function cssColor(element: HTMLElement, name: string, fallback: string): string {
  return getComputedStyle(element).getPropertyValue(name).trim() || fallback
}

function xterm(element: HTMLElement): { terminal: Terminal; fit: FitAddon } {
  const terminal = new Terminal({
    allowProposedApi: false,
    convertEol: false,
    cursorBlink: true,
    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 12,
    lineHeight: 1.3,
    scrollback: 10_000,
    theme: {
      background: cssColor(element, '--dsw-alias-bg-base', '#ffffff'),
      foreground: cssColor(element, '--dsw-alias-label-primary', '#171717'),
      cursor: cssColor(element, '--dsw-alias-label-primary', '#171717'),
      cursorAccent: cssColor(element, '--dsw-alias-bg-base', '#ffffff'),
      selectionBackground: cssColor(element, '--dsw-alias-interactive-bg-selected', '#dbeafe'),
    },
  })
  const fit = new FitAddon()
  terminal.loadAddon(fit)
  terminal.open(element)
  fit.fit()
  return { terminal, fit }
}

function TerminalViewport({ active, remote, t, workspaceId }: {
  active: boolean
  remote: WorkspaceConsoleRemote
  t: Translate
  workspaceId: WorkspaceId
}) {
  const elementRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<ReturnType<typeof xterm>>()
  const translateRef = useRef(t)
  translateRef.current = t

  useEffect(() => {
    const element = elementRef.current
    if (element === null) return
    const lifecycle = new AbortController()
    let sessionId: WorkspaceConsoleSessionId | undefined
    let offset = 0
    let pollTimer: ReturnType<typeof setTimeout> | undefined
    let writeQueue = Promise.resolve()
    const view = xterm(element)
    viewRef.current = view

    const report = (error: unknown): void => {
      if (lifecycle.signal.aborted) return
      const message = error instanceof Error ? error.message : String(error)
      view.terminal.write(`\r\n\x1b[31m${translateRef.current('terminal.error')}: ${message}\x1b[0m\r\n`)
    }
    const poll = async (): Promise<void> => {
      if (lifecycle.signal.aborted || sessionId === undefined) return
      try {
        const result = await remote.read(sessionId, offset)
        if (lifecycle.signal.aborted) return
        offset = result.nextOffset
        if (result.lossy) view.terminal.write(`\r\n\x1b[33m${translateRef.current('terminal.truncated')}\x1b[0m\r\n`)
        if (result.text !== '') view.terminal.write(result.text)
        if (!result.exited) pollTimer = setTimeout(() => { void poll() }, 40)
      } catch (error: unknown) {
        report(error)
      }
    }
    const data = view.terminal.onData((value) => {
      const opened = sessionId
      if (opened === undefined) return
      writeQueue = writeQueue.then(() => remote.write(opened, value)).catch(report)
    })
    const resize = view.terminal.onResize(({ cols, rows }) => {
      if (sessionId !== undefined) void remote.resize(sessionId, cols, rows).catch(report)
    })
    const observer = new ResizeObserver(() => { view.fit.fit() })
    observer.observe(element)
    void remote.open(workspaceId, view.terminal.cols, view.terminal.rows).then((opened) => {
      if (lifecycle.signal.aborted) {
        void remote.close(opened)
        return
      }
      sessionId = opened
      if (active) view.terminal.focus()
      void poll()
    }).catch(report)

    return () => {
      lifecycle.abort()
      if (pollTimer !== undefined) clearTimeout(pollTimer)
      observer.disconnect()
      data.dispose()
      resize.dispose()
      view.terminal.dispose()
      viewRef.current = undefined
      if (sessionId !== undefined) {
        const opened = sessionId
        void writeQueue.then(() => remote.close(opened))
      }
    }
  }, [remote, workspaceId])

  useEffect(() => {
    if (!active) return
    viewRef.current?.fit.fit()
    viewRef.current?.terminal.focus()
  }, [active])

  return <div ref={elementRef} className={css.terminal} onMouseDown={() => { elementRef.current?.querySelector<HTMLTextAreaElement>('.xterm-helper-textarea')?.focus() }} />
}

/**
 * Render one Sidebar terminal tab bound to one Workspace and PTY lifecycle.
 * @param props - active state plus shared Workspace and terminal services.
 * @returns the mounted terminal view.
 */
export function WorkspaceTerminalView({ active, setTitle, terminal, t, workspaces }: WorkspaceConsoleInjected & SidebarViewOwnerProps & { t: Translate }): ReactNode {
  const snapshot = useSyncExternalStore(workspaces.subscribe, workspaces.getSnapshot)
  const items = snapshot.items
  const [workspaceId, setWorkspaceId] = useState<WorkspaceId>()

  useEffect(() => {
    if (workspaceId !== undefined && items.some(item => item.workspaceId === workspaceId)) return
    const recent = snapshot.recentWorkspaceId
    setWorkspaceId(recent !== undefined && items.some(item => item.workspaceId === recent) ? recent : items[0]?.workspaceId)
  }, [items, snapshot.recentWorkspaceId, workspaceId])

  const selectedWorkspace = items.find(item => item.workspaceId === workspaceId)
  useEffect(() => { setTitle(selectedWorkspace?.title) }, [selectedWorkspace?.title, setTitle])

  return (
    <section className={css.view} aria-label={t('view.terminal')}>
      {workspaceId === undefined
        ? <div className={css.empty}>{t('empty.workspaces')}</div>
        : <TerminalViewport active={active} workspaceId={workspaceId} remote={terminal} t={t} />}
    </section>
  )
}
