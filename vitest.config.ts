import { fileURLToPath } from 'node:url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { standardDecoratorPlugin, vitestExecArgv } from '../../vitest.shared.ts'

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url))

/** Sidebar-local test discovery for a project name outside the root workspace glob. */
export default defineConfig({
  root: repositoryRoot,
  plugins: [
    tsconfigPaths({ projects: [`${repositoryRoot}/tsconfig.base.json`] }),
    standardDecoratorPlugin(),
  ],
  test: {
    execArgv: vitestExecArgv,
    pool: 'forks',
    setupFiles: [`${repositoryRoot}/scripts/test-invariants.ts`],
    include: [
      'plugins/dsh-sidebar/tests/**/*.spec.ts',
      'plugins/dsh-sidebar/packages/*/tests/**/*.spec.{ts,tsx}',
    ],
  },
})
