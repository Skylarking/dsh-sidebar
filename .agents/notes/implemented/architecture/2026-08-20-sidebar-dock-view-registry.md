# Agent Note: Sidebar dock view registry

Status: implemented

## Problem

The Workspace terminal and file browser each owned one fixed layout location, so operators could not open either feature in the other location. Adding another workspace view would have required another panel-specific integration and repeated tab behavior.

## Decision

The installable `@skylarking/dsh-sidebar` bundle owns both auxiliary layout regions, both built-in Remotes, and one Client package. Each region hosts the same generic tab model while retaining independent tab instances and default selection.

View types register a list entry in `workspace-sidebar.view` and matching keyed renderers in `workspace-sidebar.right.view` and `workspace-sidebar.bottom.view`. The list entry publishes menu metadata and the default tab title. Keyed entries render one tab instance, receive its active state, and may replace that instance's title. The catalog is the commit point: Sidebar rejects a published id until both renderers exist.

Terminal and files are built-in registrations under this API. Each new instance binds to the recent Workspace without a second Workspace selector. Terminal replaces its tab title with the bound Workspace title; files retains its catalog title. Other plugins may add a view without changing the dock host or layout package.

The bundle patch inserts only its terminal Host, Files Host, and Client package. It does not override `ui-sidebar`; the embedded layout continues to render the official `sidebar` slot alongside the auxiliary docks.

## Alternatives considered

**Install layout and workspace features as separate plugins.** This allowed independent release cycles but created useful ordering only in one direction: the feature plugin could not render without the layout plugin, while the layout plugin alone exposed empty docks. One installed bundle gives users an atomic lifecycle while internal packages preserve role separation.

**Keep one fixed slot per feature.** This retained the smallest change but made location part of each feature and repeated tab behavior for every future view.

**Move one mounted renderer between docks.** This preserved a single instance but prevented simultaneous terminal or file tabs in both locations and complicated ownership during a move.

## Consequences

Every catalog view is available in both dock locations, and inactive tabs stay mounted. Closing a dock or unloading Sidebar releases its view instances; this includes PTY termination. The bundle embeds its layout support and Files Host, while compatibility paths under `plugins/` keep the parent repository's TypeScript references valid without a Desktop product-code change.
