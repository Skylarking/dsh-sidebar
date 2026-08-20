/** Register Sidebar docks, built-in views, triggers, and Remote contributions. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type SidebarViewOwnerProps } from './SidebarDock.tsx';
import { type SidebarKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Sidebar controls and built-in view copy. */
        'workspace-sidebar': SidebarKey;
    }
    interface SlotMap {
        /** View labels exposed to both Sidebar add menus. */
        'workspace-sidebar.view': {
            kind: 'list';
            scope: 'root';
        };
        /** Keyed view types available to the right Sidebar dock. */
        'workspace-sidebar.right.view': {
            kind: 'keyed';
            scope: 'root';
            owner: SidebarViewOwnerProps;
        };
        /** Keyed view types available to the bottom Sidebar dock. */
        'workspace-sidebar.bottom.view': {
            kind: 'keyed';
            scope: 'root';
            owner: SidebarViewOwnerProps;
        };
    }
}
/** Required service for mounting both Sidebar Remote contributions. */
export declare const inject: string[];
/** Mount the terminal and file Remotes before registering their dock views. */
export declare function apply(ctx: ClientContext): Promise<void>;
//# sourceMappingURL=index.d.ts.map