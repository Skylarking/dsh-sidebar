# `@skylarking/dsh-sidebar`

English | [中文](README.zh.md)

Installable Sidebar plugin for DeepSeek Harness Desktop. One plugin lifecycle mounts the resizable right and bottom docks, the persistent terminal and bounded file Remotes, and their browser views. The bottom dock initially opens a terminal and the right dock initially opens files; either dock can add terminal or file tabs from its plus menu, and switching tabs keeps inactive view state mounted.

Install it from **Settings > Plugins > Plugin list > Install local plugin** by selecting `plugins/dsh-sidebar`. The package and installed plugin identity are `@skylarking/dsh-sidebar`.

The Client package owns the [view registration API](packages/client/README.md#view-extension). Terminal, files, and future external views use the same catalog plus keyed renderers; the dock layout does not import view implementations.

## Security and limits

Both built-in views accept only registered Workspace ids. File operations enforce Workspace containment and bounded previews. The terminal starts in the selected Workspace but retains the Host user's filesystem and process authority; Workspace selection is not a sandbox.

## Model Experience

None, as Sidebar interactions do not alter prompts, tools, messages, or provider requests.

#### KV Cache effect

None.

## Known Limitations and Deferred Work

- Terminal output uses bounded polling rather than a streaming Remote subscription.
- Dock tabs and geometry are transient; closing a dock disposes its mounted view instances.
