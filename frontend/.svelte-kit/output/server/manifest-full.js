export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["svelte.svg","tauri.svg","vite.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {"start":"_app/immutable/entry/start.92os7lz4.js","app":"_app/immutable/entry/app.1QiIHMmL.js","imports":["_app/immutable/entry/start.92os7lz4.js","_app/immutable/chunks/entry.DSCOgCkx.js","_app/immutable/chunks/scheduler.DQZw9iDR.js","_app/immutable/chunks/index.CtlmB4aM.js","_app/immutable/entry/app.1QiIHMmL.js","_app/immutable/chunks/scheduler.DQZw9iDR.js","_app/immutable/chunks/index.D-4GBzMI.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
