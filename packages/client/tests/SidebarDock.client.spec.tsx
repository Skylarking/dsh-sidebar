// @vitest-environment jsdom

import { useEffect } from 'react'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SidebarDock } from '../src/client/SidebarDock.tsx'

afterEach(cleanup)

describe('SidebarDock', () => {
  it('adds either registered view type and keeps inactive tab instances mounted', async () => {
    const entries = [{ options: { id: 'terminal' } }, { options: { id: 'files' } }]
    const mounted = vi.fn()
    const unmounted = vi.fn()
    function View({ id, setTitle }: { id: string; setTitle(title: string): void }) {
      useEffect(() => {
        mounted(id)
        if (id === 'terminal') setTitle('Project')
        return () => { unmounted(id) }
      }, [id, setTitle])
      return <div>{id}-content</div>
    }
    const view = render(<SidebarDock
      close={vi.fn()}
      defaultView="terminal"
      renderView={(id, owner) => <View id={id} setTitle={owner.setTitle} />}
      t={((key: string) => key) as never}
      views={{ getSnapshot: () => entries, subscribe: () => () => {} }}
    />)

    await waitFor(() => { expect(view.getByText('terminal-content')).toBeDefined() })
    await waitFor(() => { expect(view.getByRole('button', { name: 'Project' })).toBeDefined() })
    fireEvent.click(view.getByRole('button', { name: 'action.add' }))
    fireEvent.click(view.getByRole('menuitem', { name: 'view.files' }))
    await waitFor(() => { expect(view.getByText('files-content')).toBeDefined() })
    expect(mounted).toHaveBeenCalledWith('terminal')
    expect(mounted).toHaveBeenCalledWith('files')
    expect(unmounted).not.toHaveBeenCalled()

    fireEvent.click(view.getByRole('button', { name: 'Project' }))
    expect(view.getByText('terminal-content')).toBeDefined()
    expect(unmounted).not.toHaveBeenCalled()
  })
})
