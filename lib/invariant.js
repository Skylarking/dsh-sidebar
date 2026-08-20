//#region lib/types/invariant.js
/** Package-owned invariant companion for the Workspace console bundle. @module @skylarking/dsh-workspace-console/invariant */
const PACKAGE_NAME = "@skylarking/dsh-workspace-console";
/** Cordis companion plugin name. */
const name = "workspace-console-bundle-invariant";
/** Service required before the companion can register. */
const inject = ["invariants"];
const install = () => {};
/**
* Register this static bundle's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the registration disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
