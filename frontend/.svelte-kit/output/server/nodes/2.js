

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.Yb2uPOo9.js","_app/immutable/chunks/scheduler.DQZw9iDR.js","_app/immutable/chunks/index.D-4GBzMI.js","_app/immutable/chunks/index.CtlmB4aM.js"];
export const stylesheets = ["_app/immutable/assets/2.CkmNU14M.css"];
export const fonts = [];
