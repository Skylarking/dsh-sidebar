//#region lib/types/invariant.js
const PACKAGE_NAME = "@skylarking/dsh-client-ui-workspace-console";
/** Cordis companion plugin name. */
const name = "client-ui-workspace-console-invariant";
/** Service required before package ownership registration. */
const inject = ["invariants"];
/** No runtime invariant: slot ownership and unload cleanup are enforced by layout registration. */
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
