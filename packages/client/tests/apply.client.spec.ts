import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { apply as applyGateway, inject as gatewayInject } from '@deepseek-ai/dsh-api-gateway/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'
import { apply, inject } from '../src/client/index.ts'

async function bench() {
  const ctx = new Context()
  await ctx.plugin(TypertRegistry)
  const call = vi.fn(async (_path: string, method: string) => method === 'workspaceFiles/list'
    ? { ok: true, value: { path: '', entries: [], truncated: false } }
    : { ok: true, value: { sessionId: 'terminal-1' } })
  ctx.provide('connection', { rpc: { call } } as never)
  await ctx.plugin({ inject: gatewayInject, apply: applyGateway })
  await ctx.plugin(SlotRegistry).await()
  ctx.slots.register({
    name: 'root',
    children: {
      'shell.hero.utilities': { kind: 'list', scope: 'root' },
      'conversation.session.header.utilities': { kind: 'list', scope: 'session' },
      'shell.rightPanel': { kind: 'single', scope: 'root' },
      'shell.bottomPanel': { kind: 'single', scope: 'root' },
    },
  } as never, () => null)
  ctx.provide('locale', new LocaleRuntime(ctx))
  const layout = {
    toggleBottomPanel: vi.fn(), closeBottomPanel: vi.fn(),
    toggleRightPanel: vi.fn(), closeRightPanel: vi.fn(),
  }
  ctx.provide('layout', layout as never)
  ctx.provide('workspaces', { list: { getSnapshot: () => ({ items: [] }), subscribe: () => () => {} } } as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { ctx, fiber, layout, call }
}

describe('Sidebar client apply', () => {
  it('owns both docks and registers terminal and files in each keyed view slot', async () => {
    const { ctx, fiber, layout, call } = await bench()
    expect(ctx.slots.entries('shell.hero.utilities').map(entry => entry.options.id)).toContain('workspace-sidebar')
    expect(ctx.slots.entries('conversation.session.header.utilities').map(entry => entry.options.id)).toContain('workspace-sidebar')
    expect(ctx.slots.entries('shell.rightPanel')).toHaveLength(1)
    expect(ctx.slots.entries('shell.bottomPanel')).toHaveLength(1)
    expect(ctx.slots.spec('workspace-sidebar.right.view')).toEqual({ kind: 'keyed', scope: 'root' })
    expect(ctx.slots.spec('workspace-sidebar.bottom.view')).toEqual({ kind: 'keyed', scope: 'root' })
    expect(ctx.slots.entries('workspace-sidebar.view').map(entry => entry.options.id)).toEqual(['terminal', 'files'])
    expect(ctx.slots.entries('workspace-sidebar.right.view').map(entry => entry.options.key)).toEqual(['terminal', 'files'])
    expect(ctx.slots.entries('workspace-sidebar.bottom.view').map(entry => entry.options.key)).toEqual(['terminal', 'files'])

    const trigger = ctx.slots.entries('shell.hero.utilities')[0]!
    const triggerProps = (trigger.inject as () => { layout: { toggleBottomPanel(): void; toggleRightPanel(): void } })()
    triggerProps.layout.toggleBottomPanel()
    triggerProps.layout.toggleRightPanel()
    expect(layout.toggleBottomPanel).toHaveBeenCalledOnce()
    expect(layout.toggleRightPanel).toHaveBeenCalledOnce()

    await expect(ctx.remote.workspaceFiles.list('workspace-1', '')).resolves.toMatchObject({ ok: true })
    expect(call).toHaveBeenCalledWith('/api', 'workspaceFiles/list', {
      args: { workspaceId: 'workspace-1', path: '' },
    }, expect.any(AbortSignal))

    const rightPanel = ctx.slots.entries('shell.rightPanel')[0]!
    const source = (rightPanel.inject as () => { views: { getSnapshot(): unknown } })().views
    const disposeIncomplete = ctx.slots.register({ name: 'workspace-sidebar.view', id: 'review', label: 'Review' }, () => null)
    expect(() => source.getSnapshot()).toThrow("view 'review' must register matching right and bottom renderers")
    disposeIncomplete()

    const disposeRightReview = ctx.slots.register({ name: 'workspace-sidebar.right.view', key: 'review' }, () => null)
    const disposeBottomReview = ctx.slots.register({ name: 'workspace-sidebar.bottom.view', key: 'review' }, () => null)
    const disposeReview = ctx.slots.register({ name: 'workspace-sidebar.view', id: 'review', label: 'Review' }, () => null)
    expect(source.getSnapshot()).toEqual(expect.arrayContaining([
      expect.objectContaining({ options: expect.objectContaining({ id: 'review' }) }),
    ]))
    disposeReview()
    disposeBottomReview()
    disposeRightReview()

    await fiber.dispose()
    expect(ctx.get('remote.workspaceConsole')).toBeUndefined()
    expect(ctx.get('remote.workspaceFiles')).toBeUndefined()
    expect(ctx.slots.entries('shell.hero.utilities')).toHaveLength(0)
    expect(ctx.slots.entries('shell.rightPanel')).toHaveLength(0)
    expect(ctx.slots.entries('shell.bottomPanel')).toHaveLength(0)
    expect(ctx.slots.spec('workspace-sidebar.right.view')).toBeUndefined()
    expect(ctx.slots.spec('workspace-sidebar.bottom.view')).toBeUndefined()
    expect(ctx.slots.spec('workspace-sidebar.view')).toBeUndefined()
    expect(layout.closeRightPanel).toHaveBeenCalledOnce()
    expect(layout.closeBottomPanel).toHaveBeenCalledOnce()
  })
})
