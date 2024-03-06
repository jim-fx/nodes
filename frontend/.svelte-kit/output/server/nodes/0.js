import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.COd8Lg7a.js","_app/immutable/chunks/scheduler.DQZw9iDR.js","_app/immutable/chunks/index.D-4GBzMI.js"];
export const stylesheets = [];
export const fonts = [];
