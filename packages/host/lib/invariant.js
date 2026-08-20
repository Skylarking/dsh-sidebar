//#region lib/types/invariant.js
const PACKAGE_NAME = "@skylarking/dsh-host-workspace-console";
/** Cordis companion plugin name. */
const name = "host-workspace-console-invariant";
/** Service required before package ownership registration. */
const inject = ["invariants"];
/** No runtime invariant: the private session registry has no independent authoritative relationship to assert. */
const install = () => {};
/** Register this package's invariant companion. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
