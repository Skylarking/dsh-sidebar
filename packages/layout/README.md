# `@skylarking/dsh-client-ui-workspace-layout`

English | [中文](README.zh.md)

Private support package embedded in the Sidebar plugin. Desktop installs it under the profile-local `@deepseek-ai/dsh-client-ui-layout` dependency key while Sidebar is enabled. It preserves the official sidebar, conversation, details, overlay, theme, and `ctx.layout` behavior while adding resizable `shell.rightPanel`, `shell.bottomPanel`, and `shell.hero.utilities` regions.

This package is not independently manageable. Disabling Sidebar removes its profile-local alias and restores the layout package bundled with DSH.

## Model Experience

None, as this package changes only operator-controlled layout.

#### KV Cache effect

None.

## Known Limitations and Deferred Work

- The package replaces one profile-local dependency resolution and therefore shares the Sidebar plugin lifecycle.
