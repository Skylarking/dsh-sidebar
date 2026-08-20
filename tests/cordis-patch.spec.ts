import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

interface PatchEntry {
  readonly id?: string
  readonly disabled?: boolean
}

describe('Sidebar Cordis patch', () => {
  it('leaves the official navigation sidebar enabled', async () => {
    const path = fileURLToPath(new URL('../cordis.patch.yml', import.meta.url))
    const patch = load(await readFile(path, 'utf8')) as PatchEntry[]

    expect(patch.filter(entry => entry.id === 'ui-sidebar')).toEqual([])
  })
})
