# `@skylarking/dsh-client-ui-workspace-console`

English | [中文](README.zh.md)

Browser package behind the installable Sidebar plugin. It occupies the layout-owned `shell.rightPanel` and `shell.bottomPanel` slots with generic tab hosts. The right dock defaults to files and the bottom dock defaults to a terminal, while both expose the same add menu and preserve inactive tab component identity. A new built-in view binds to the recent Workspace without rendering a second Workspace selector; terminal tabs replace their catalog title with the bound Workspace title.

The package mounts the `workspaceConsole` and `workspaceFiles` Remote contributions before registering its UI. Unloading removes both docks, their triggers and registered views, closes the layout regions, terminates mounted PTYs, and releases file-browser state.

## View extension

A view type contributes one catalog entry to `workspace-sidebar.view` and matching keyed renderers to `workspace-sidebar.right.view` and `workspace-sidebar.bottom.view`. The catalog entry's `id` is the dispatch key and its `label` is the add-menu text and default tab title. Each renderer receives `active`, which is false while its tab remains mounted but hidden, and `setTitle`, which replaces the title for that tab instance.

Register both keyed renderers before publishing the catalog entry, and dispose the catalog before the renderers. The dock rejects a catalog id that lacks either renderer. This symmetry guarantees that every listed view can open in both locations; a future Review plugin can register through these three slots without changing Sidebar.

## Model Experience

None, as this operator UI has no model-visible output.

#### KV Cache effect

None.

## Known Limitations and Deferred Work

- View instances persist across tab switches but not dock closure or plugin unload.
- Terminal-specific internal packages retain `workspace-console`; the installable project and bundle are `dsh-sidebar` and `@skylarking/dsh-sidebar`.
