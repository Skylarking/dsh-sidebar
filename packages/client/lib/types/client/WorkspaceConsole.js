import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Sidebar terminal trigger and bottom-docked persistent PTY. */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { IconCloseOutline16, IconCodeOutline16, IconPanelLeftOutline16, IconPlusOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './WorkspaceConsole.module.css';
/** Conversation utility that toggles the bottom split panel. */
export function WorkspaceConsoleTrigger({ layout, t }) {
    return _jsx(Tooltip, { label: t('action.open'), delayMs: 500, children: _jsx("button", { type: "button", className: css.trigger, "aria-label": t('action.open'), onClick: layout.toggleBottomPanel, children: _jsx("span", { className: css.bottomPanelIcon, children: _jsx(IconPanelLeftOutline16, {}) }) }) });
}
function cssColor(element, name, fallback) {
    return getComputedStyle(element).getPropertyValue(name).trim() || fallback;
}
function xterm(element) {
    const terminal = new Terminal({
        allowProposedApi: false,
        convertEol: false,
        cursorBlink: true,
        fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 12,
        lineHeight: 1.3,
        scrollback: 10_000,
        theme: {
            background: cssColor(element, '--dsw-alias-bg-base', '#ffffff'),
            foreground: cssColor(element, '--dsw-alias-label-primary', '#171717'),
            cursor: cssColor(element, '--dsw-alias-label-primary', '#171717'),
            cursorAccent: cssColor(element, '--dsw-alias-bg-base', '#ffffff'),
            selectionBackground: cssColor(element, '--dsw-alias-interactive-bg-selected', '#dbeafe'),
        },
    });
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(element);
    fit.fit();
    return { terminal, fit };
}
function TerminalViewport({ active, workspaceId, remote, t }) {
    const elementRef = useRef(null);
    const viewRef = useRef();
    const translateRef = useRef(t);
    translateRef.current = t;
    useEffect(() => {
        const element = elementRef.current;
        if (element === null)
            return;
        const lifecycle = new AbortController();
        let sessionId;
        let offset = 0;
        let pollTimer;
        let writeQueue = Promise.resolve();
        const view = xterm(element);
        viewRef.current = view;
        const report = (error) => {
            if (lifecycle.signal.aborted)
                return;
            const message = error instanceof Error ? error.message : String(error);
            view.terminal.write(`\r\n\x1b[31m${translateRef.current('error')}: ${message}\x1b[0m\r\n`);
        };
        const poll = async () => {
            if (lifecycle.signal.aborted || sessionId === undefined)
                return;
            try {
                const result = await remote.read(sessionId, offset);
                // React cleanup may abort this lifecycle while the Remote read is in flight.
                if (lifecycle.signal.aborted)
                    return;
                offset = result.nextOffset;
                if (result.lossy)
                    view.terminal.write(`\r\n\x1b[33m${translateRef.current('truncated')}\x1b[0m\r\n`);
                if (result.text !== '')
                    view.terminal.write(result.text);
                if (!result.exited)
                    pollTimer = setTimeout(() => { void poll(); }, 40);
            }
            catch (error) {
                report(error);
            }
        };
        const data = view.terminal.onData((value) => {
            const opened = sessionId;
            if (opened === undefined)
                return;
            writeQueue = writeQueue.then(() => remote.write(opened, value)).catch(report);
        });
        const resize = view.terminal.onResize(({ cols, rows }) => {
            if (sessionId !== undefined)
                void remote.resize(sessionId, cols, rows).catch(report);
        });
        const observer = new ResizeObserver(() => { view.fit.fit(); });
        observer.observe(element);
        void remote.open(workspaceId, view.terminal.cols, view.terminal.rows).then((opened) => {
            if (lifecycle.signal.aborted) {
                void remote.close(opened);
                return;
            }
            sessionId = opened;
            if (active)
                view.terminal.focus();
            void poll();
        }).catch(report);
        return () => {
            lifecycle.abort();
            if (pollTimer !== undefined)
                clearTimeout(pollTimer);
            observer.disconnect();
            data.dispose();
            resize.dispose();
            view.terminal.dispose();
            viewRef.current = undefined;
            if (sessionId !== undefined) {
                const opened = sessionId;
                void writeQueue.then(() => remote.close(opened));
            }
        };
    }, [remote, workspaceId]); // active visibility must not restart the PTY
    useEffect(() => {
        if (!active)
            return;
        viewRef.current?.fit.fit();
        viewRef.current?.terminal.focus();
    }, [active]);
    return _jsx("div", { ref: elementRef, className: css.terminal, onMouseDown: () => { elementRef.current?.querySelector('.xterm-helper-textarea')?.focus(); } });
}
/** Bottom-docked interactive terminal panel. */
export function WorkspaceConsolePanel({ workspaces, terminal, t, close }) {
    const items = useSyncExternalStore(workspaces.subscribe, () => workspaces.getSnapshot().items);
    const nextTabId = useRef(1);
    const [tabs, setTabs] = useState([]);
    const [activeTabId, setActiveTabId] = useState();
    useEffect(() => {
        setTabs((current) => {
            const fallback = items[0]?.workspaceId;
            if (fallback === undefined)
                return [];
            if (current.length === 0)
                return [{ id: nextTabId.current++, workspaceId: fallback }];
            return current.map(tab => items.some(item => item.workspaceId === tab.workspaceId)
                ? tab
                : { ...tab, workspaceId: fallback });
        });
    }, [items]);
    const selectedTabId = tabs.some(tab => tab.id === activeTabId) ? activeTabId : tabs[0]?.id;
    const addTab = () => {
        const source = tabs.find(tab => tab.id === selectedTabId) ?? tabs[0];
        if (source === undefined)
            return;
        const tab = { id: nextTabId.current++, workspaceId: source.workspaceId };
        setTabs(current => [...current, tab]);
        setActiveTabId(tab.id);
    };
    const closeTab = (id) => {
        if (tabs.length === 1) {
            close();
            return;
        }
        const index = tabs.findIndex(tab => tab.id === id);
        const remaining = tabs.filter(tab => tab.id !== id);
        setTabs(remaining);
        if (selectedTabId === id)
            setActiveTabId(remaining[index]?.id ?? remaining[index - 1]?.id);
    };
    const setWorkspace = (id, workspaceId) => {
        setActiveTabId(id);
        setTabs(current => current.map(tab => tab.id === id ? { ...tab, workspaceId } : tab));
    };
    return (_jsxs("section", { className: css.panel, "aria-label": t('title'), children: [_jsxs("header", { className: css.tabBar, children: [_jsxs("div", { className: css.tabs, children: [tabs.map(tab => (_jsxs("label", { className: css.tab, "data-active": tab.id === selectedTabId, onMouseDown: () => { setActiveTabId(tab.id); }, children: [_jsx(IconCodeOutline16, { size: 14 }), _jsx("span", { className: css.srOnly, children: t('workspace') }), _jsx("select", { value: tab.workspaceId, "aria-label": t('workspace'), onChange: (event) => { setWorkspace(tab.id, event.target.value); }, children: items.map(item => _jsx("option", { value: item.workspaceId, children: item.title }, item.workspaceId)) }), _jsx("button", { type: "button", className: css.tabClose, "aria-label": t('action.closeTab'), onClick: (event) => { event.preventDefault(); closeTab(tab.id); }, children: _jsx(IconCloseOutline16, { size: 13 }) })] }, tab.id))), _jsx(Tooltip, { label: t('action.new'), delayMs: 500, children: _jsx("button", { type: "button", className: css.add, "aria-label": t('action.new'), disabled: tabs.length === 0, onClick: addTab, children: _jsx(IconPlusOutline16, {}) }) })] }), _jsx("button", { type: "button", className: css.close, "aria-label": t('action.close'), onClick: close, children: _jsx(IconCloseOutline16, {}) })] }), tabs.length === 0
                ? _jsx("div", { className: css.empty, children: t('noWorkspace') })
                : _jsx("div", { className: css.terminals, children: tabs.map(tab => (_jsx("div", { className: css.terminalPane, hidden: tab.id !== selectedTabId, children: _jsx(TerminalViewport, { active: tab.id === selectedTabId, workspaceId: tab.workspaceId, remote: terminal, t: t }) }, tab.id))) })] }));
}
//# sourceMappingURL=WorkspaceConsole.js.map