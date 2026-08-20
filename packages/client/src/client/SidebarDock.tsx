/** Generic tab host for one Sidebar dock location. */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  IconCloseOutline16,
  IconCodeOutline16,
  IconFolderOpen16,
  IconPanelLeftOutline16,
  IconPlusOutline16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsRenderSlots } from '@deepseek-ai/dsh-client-ui-slots'
import type { AuxiliaryPanelOwnerProps } from '@skylarking/dsh-client-ui-workspace-layout/client'
import type { SidebarKey } from './locales.ts'
import css from './SidebarDock.module.css'

type Translate = (key: SidebarKey) => string

/** Panel actions used by the Sidebar utility buttons. */
export interface SidebarTriggerInjected {
  layout: {
    toggleBottomPanel(): void
    toggleRightPanel(): void
  }
}

/** Open the two Sidebar dock locations without selecting a view type. */
export function SidebarTriggers({ layout, t }: SidebarTriggerInjected & { t: Translate }): ReactNode {
  return (
    <div className={css.triggers}>
      <Tooltip label={t('action.openBottom')} delayMs={500}>
        <button type="button" className={css.trigger} aria-label={t('action.openBottom')} onClick={layout.toggleBottomPanel}>
          <span className={css.bottomIcon}><IconPanelLeftOutline16 /></span>
        </button>
      </Tooltip>
      <Tooltip label={t('action.openRight')} delayMs={500}>
        <button type="button" className={css.trigger} aria-label={t('action.openRight')} onClick={layout.toggleRightPanel}>
          <span className={css.rightIcon}><IconPanelLeftOutline16 /></span>
        </button>
      </Tooltip>
    </div>
  )
}

/** State supplied by a dock to one registered view instance. */
export interface SidebarViewOwnerProps {
  /** True while this instance is the dock's selected tab. */
  active: boolean
  /** Replace the catalog label for this tab instance. */
  setTitle(title: string | undefined): void
}

interface ViewEntry {
  readonly options: { readonly id?: string; readonly label?: string | (() => string) }
}

/** Observable list of keyed view registrations for one dock location. */
export interface SidebarViewsSource {
  getSnapshot(): readonly ViewEntry[]
  subscribe(listener: () => void): () => void
}

interface SidebarDockProps {
  catalog?: ReactNode
  close(): void
  defaultView: string
  renderView(viewId: string, owner: SidebarViewOwnerProps): ReactNode
  t: Translate
  views: SidebarViewsSource
}

type RightDockProps = PropsRenderSlots<'workspace-sidebar.view' | 'workspace-sidebar.right.view'> & AuxiliaryPanelOwnerProps & {
  t: Translate
  views: SidebarViewsSource
}
type BottomDockProps = PropsRenderSlots<'workspace-sidebar.bottom.view'> & AuxiliaryPanelOwnerProps & {
  t: Translate
  views: SidebarViewsSource
}

/** Right dock wrapper authorized to dispatch right-view registrations. */
export function RightDock(props: RightDockProps): ReactNode {
  return <SidebarDock {...props} catalog={props.renderSlot('workspace-sidebar.view', {})} defaultView="files" renderView={(viewId, owner) => props.renderSlot('workspace-sidebar.right.view', owner, { entryKey: viewId })} />
}

/** Bottom dock wrapper authorized to dispatch bottom-view registrations. */
export function BottomDock(props: BottomDockProps): ReactNode {
  return <SidebarDock {...props} defaultView="terminal" renderView={(viewId, owner) => props.renderSlot('workspace-sidebar.bottom.view', owner, { entryKey: viewId })} />
}

interface DockTab {
  readonly id: number
  readonly viewId: string
  readonly title: string | undefined
}

function viewIcon(viewId: string): ReactNode {
  if (viewId === 'terminal') return <IconCodeOutline16 size={14} />
  if (viewId === 'files') return <IconFolderOpen16 size={14} />
  return <IconPanelLeftOutline16 size={14} />
}

function viewLabel(viewId: string, t: Translate): string {
  if (viewId === 'terminal') return t('view.terminal')
  if (viewId === 'files') return t('view.files')
  return viewId
}

function registeredLabel(label: string | (() => string) | undefined, viewId: string, t: Translate): string {
  const builtIn = viewLabel(viewId, t)
  return builtIn === viewId
    ? (typeof label === 'function' ? label() : label) ?? viewId
    : builtIn
}

/** Render mixed registered views while preserving every inactive tab's React identity. */
export function SidebarDock({ catalog, close, defaultView, renderView, t, views }: SidebarDockProps): ReactNode {
  const entries = useSyncExternalStore(views.subscribe, views.getSnapshot)
  const definitions = useMemo(() => entries.flatMap((entry) => {
    const id = entry.options.id
    return id === undefined ? [] : [{ id, label: registeredLabel(entry.options.label, id, t) }]
  }), [entries, t])
  const nextId = useRef(1)
  const titleSetters = useRef(new Map<number, (title: string | undefined) => void>())
  const [tabs, setTabs] = useState<readonly DockTab[]>([])
  const [activeId, setActiveId] = useState<number>()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (tabs.length !== 0 || definitions.length === 0) return
    const viewId = definitions.some(view => view.id === defaultView) ? defaultView : definitions[0]!.id
    const tab = { id: nextId.current++, viewId, title: undefined }
    setTabs([tab])
    setActiveId(tab.id)
  }, [defaultView, definitions, tabs.length])

  useEffect(() => {
    const available = new Set(definitions.map(view => view.id))
    setTabs(current => current.filter(tab => available.has(tab.viewId)))
  }, [definitions])

  const selectedId = tabs.some(tab => tab.id === activeId) ? activeId : tabs[0]?.id
  const titleSetter = (id: number): ((title: string | undefined) => void) => {
    const existing = titleSetters.current.get(id)
    if (existing !== undefined) return existing
    const setter = (title: string | undefined): void => {
      setTabs(current => {
        const target = current.find(tab => tab.id === id)
        if (target === undefined || target.title === title) return current
        return current.map(tab => tab.id === id ? { ...tab, title } : tab)
      })
    }
    titleSetters.current.set(id, setter)
    return setter
  }
  const add = (viewId: string): void => {
    const tab = { id: nextId.current++, viewId, title: undefined }
    setTabs(current => [...current, tab])
    setActiveId(tab.id)
    setMenuOpen(false)
  }
  const remove = (id: number): void => {
    const index = tabs.findIndex(tab => tab.id === id)
    const remaining = tabs.filter(tab => tab.id !== id)
    if (remaining.length === 0) {
      titleSetters.current.delete(id)
      close()
      return
    }
    titleSetters.current.delete(id)
    setTabs(remaining)
    if (selectedId === id) setActiveId(remaining[index]?.id ?? remaining[index - 1]?.id)
  }

  return (
    <section className={css.dock} aria-label={t('sidebar.title')}>
      <header className={css.tabBar}>
        <div className={css.tabCluster}>
          <div className={css.tabs}>
            {tabs.map(tab => (
              <div key={tab.id} className={css.tab} data-active={tab.id === selectedId || undefined}>
                <button type="button" className={css.tabSelect} onClick={() => { setActiveId(tab.id) }}>
                  {viewIcon(tab.viewId)}
                  <span>{tab.title ?? definitions.find(view => view.id === tab.viewId)?.label ?? viewLabel(tab.viewId, t)}</span>
                </button>
                <button type="button" className={css.iconButton} aria-label={t('action.closeTab')} onClick={() => { remove(tab.id) }}><IconCloseOutline16 size={13} /></button>
              </div>
            ))}
          </div>
          <div className={css.addWrap}>
            <Tooltip label={t('action.add')} delayMs={500}>
              <button type="button" className={css.iconButton} aria-label={t('action.add')} disabled={definitions.length === 0} onClick={() => { setMenuOpen(value => !value) }}><IconPlusOutline16 /></button>
            </Tooltip>
            {menuOpen && (
              <div className={css.menu} role="menu">
                {definitions.map(view => (
                  <button key={view.id} type="button" role="menuitem" onClick={() => { add(view.id) }}>
                    {viewIcon(view.id)}<span>{view.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={css.actions}>
          <button type="button" className={css.close} aria-label={t('action.close')} onClick={close}><IconCloseOutline16 /></button>
        </div>
      </header>
      {tabs.length === 0
        ? <div className={css.empty}>{t('empty.views')}</div>
        : <div className={css.panes}>{tabs.map(tab => (
          <div key={tab.id} className={css.pane} hidden={tab.id !== selectedId}>
            {renderView(tab.viewId, { active: tab.id === selectedId, setTitle: titleSetter(tab.id) })}
          </div>
        ))}</div>}
      <div hidden>{catalog}</div>
    </section>
  )
}
