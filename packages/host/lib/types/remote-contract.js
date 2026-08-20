/** Plugin-owned Typert descriptors for the external workspace-console package. */
import { z } from 'zod';
const sessionId = z.string();
const output = z.object({
    text: z.string(),
    nextOffset: z.number(),
    lossy: z.boolean(),
    exited: z.boolean(),
    exitCode: z.union([z.number(), z.null()]),
    signal: z.union([z.string(), z.null()]),
});
function parameter(name, schema) {
    return {
        name,
        wire: name,
        source: 'json',
        codec: { mode: 'strict', typeSymbol: `@skylarking/dsh-host-workspace-console#${name}`, schema },
    };
}
function invocation(method, parameters, schema, resultType) {
    return {
        id: `@skylarking/dsh-host-workspace-console#workspaceConsole/${method}`,
        service: 'workspaceConsole',
        namespace: 'workspaceConsole',
        method,
        invocation: { kind: 'direct' },
        parameters,
        result: { mode: 'strict', typeSymbol: resultType, schema },
    };
}
/** Host and Client descriptors shared by this plugin's two Typert artifacts. */
export const WORKSPACE_CONSOLE_INVOCATIONS = [
    invocation('open', [
        parameter('workspaceId', z.string()),
        parameter('cols', z.number()),
        parameter('rows', z.number()),
    ], z.object({ sessionId }), '@skylarking/dsh-host-workspace-console/types#WorkspaceConsoleOpenResult'),
    invocation('write', [parameter('sessionId', sessionId), parameter('data', z.string())], z.undefined(), 'void'),
    invocation('read', [parameter('sessionId', sessionId), parameter('fromByte', z.number())], output, '@skylarking/dsh-host-workspace-console/types#WorkspaceConsoleReadResult'),
    invocation('resize', [
        parameter('sessionId', sessionId),
        parameter('cols', z.number()),
        parameter('rows', z.number()),
    ], z.undefined(), 'void'),
    invocation('close', [parameter('sessionId', sessionId)], z.undefined(), 'void'),
];
//# sourceMappingURL=remote-contract.js.map