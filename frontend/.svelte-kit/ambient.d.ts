
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const TAURI_ENV_PLATFORM: string;
	export const npm_package_dependencies__tauri_apps_plugin_shell: string;
	export const USER: string;
	export const npm_config_user_agent: string;
	export const npm_package_dependencies__tauri_apps_api: string;
	export const FZF_DEFAULT_OPTS: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const npm_package_devDependencies_vite: string;
	export const npm_node_execpath: string;
	export const SHLVL: string;
	export const ASDF_DIR: string;
	export const HOME: string;
	export const LESS: string;
	export const OLDPWD: string;
	export const ASDF_DEFAULT_TOOL_VERSIONS_FILENAME: string;
	export const TERM_PROGRAM_VERSION: string;
	export const LSCOLORS: string;
	export const npm_package_dependencies_three: string;
	export const npm_package_devDependencies__sveltejs_adapter_static: string;
	export const FPATH: string;
	export const PAGER: string;
	export const npm_package_devDependencies_svelte_check: string;
	export const npm_package_scripts_check: string;
	export const npm_package_scripts_tauri: string;
	export const P9K_TTY: string;
	export const TAURI_ENV_TARGET_TRIPLE: string;
	export const COLORTERM: string;
	export const WSL_DISTRO_NAME: string;
	export const npm_package_dependencies__sveltejs_kit: string;
	export const npm_package_devDependencies_typescript: string;
	export const WAYLAND_DISPLAY: string;
	export const npm_package_scripts_dev: string;
	export const LOGNAME: string;
	export const npm_package_type: string;
	export const npm_package_devDependencies__tauri_apps_cli: string;
	export const NAME: string;
	export const PULSE_SERVER: string;
	export const WSL_INTEROP: string;
	export const _P9K_SSH_TTY: string;
	export const npm_package_private: string;
	export const npm_config_registry: string;
	export const TERM: string;
	export const ASDF_CONFIG_FILE: string;
	export const TAURI_ENV_DEBUG: string;
	export const WASMTIME_HOME: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const NODE: string;
	export const TAURI_ENV_PLATFORM_VERSION: string;
	export const npm_package_name: string;
	export const XDG_RUNTIME_DIR: string;
	export const npm_package_dependencies__types_three: string;
	export const npm_config_frozen_lockfile: string;
	export const DISPLAY: string;
	export const LANG: string;
	export const MACOSX_DEPLOYMENT_TARGET: string;
	export const TAURI_ENV_ARCH: string;
	export const LS_COLORS: string;
	export const TERM_PROGRAM: string;
	export const npm_lifecycle_script: string;
	export const npm_package_devDependencies__tsconfig_svelte: string;
	export const NODE_PATH: string;
	export const SHELL: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const npm_package_scripts_build: string;
	export const npm_package_dependencies__threlte_core: string;
	export const npm_package_devDependencies_svelte: string;
	export const npm_package_devDependencies_tslib: string;
	export const P9K_SSH: string;
	export const ASDF_DATA_DIR: string;
	export const TAURI_ENV_FAMILY: string;
	export const npm_package_dependencies__threlte_extras: string;
	export const FZF_DEFAULT_COMMAND: string;
	export const PWD: string;
	export const npm_execpath: string;
	export const _P9K_TTY: string;
	export const npm_package_dependencies__threlte_flex: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const npm_package_devDependencies_internal_ip: string;
	export const npm_package_devDependencies_vite_plugin_glsl: string;
	export const npm_command: string;
	export const npm_package_scripts_preview: string;
	export const HOSTTYPE: string;
	export const WSL2_GUI_APPS_ENABLED: string;
	export const EDITOR: string;
	export const INIT_CWD: string;
	export const WSLENV: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		TAURI_ENV_PLATFORM: string;
		npm_package_dependencies__tauri_apps_plugin_shell: string;
		USER: string;
		npm_config_user_agent: string;
		npm_package_dependencies__tauri_apps_api: string;
		FZF_DEFAULT_OPTS: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		npm_package_devDependencies_vite: string;
		npm_node_execpath: string;
		SHLVL: string;
		ASDF_DIR: string;
		HOME: string;
		LESS: string;
		OLDPWD: string;
		ASDF_DEFAULT_TOOL_VERSIONS_FILENAME: string;
		TERM_PROGRAM_VERSION: string;
		LSCOLORS: string;
		npm_package_dependencies_three: string;
		npm_package_devDependencies__sveltejs_adapter_static: string;
		FPATH: string;
		PAGER: string;
		npm_package_devDependencies_svelte_check: string;
		npm_package_scripts_check: string;
		npm_package_scripts_tauri: string;
		P9K_TTY: string;
		TAURI_ENV_TARGET_TRIPLE: string;
		COLORTERM: string;
		WSL_DISTRO_NAME: string;
		npm_package_dependencies__sveltejs_kit: string;
		npm_package_devDependencies_typescript: string;
		WAYLAND_DISPLAY: string;
		npm_package_scripts_dev: string;
		LOGNAME: string;
		npm_package_type: string;
		npm_package_devDependencies__tauri_apps_cli: string;
		NAME: string;
		PULSE_SERVER: string;
		WSL_INTEROP: string;
		_P9K_SSH_TTY: string;
		npm_package_private: string;
		npm_config_registry: string;
		TERM: string;
		ASDF_CONFIG_FILE: string;
		TAURI_ENV_DEBUG: string;
		WASMTIME_HOME: string;
		npm_config_node_gyp: string;
		PATH: string;
		NODE: string;
		TAURI_ENV_PLATFORM_VERSION: string;
		npm_package_name: string;
		XDG_RUNTIME_DIR: string;
		npm_package_dependencies__types_three: string;
		npm_config_frozen_lockfile: string;
		DISPLAY: string;
		LANG: string;
		MACOSX_DEPLOYMENT_TARGET: string;
		TAURI_ENV_ARCH: string;
		LS_COLORS: string;
		TERM_PROGRAM: string;
		npm_lifecycle_script: string;
		npm_package_devDependencies__tsconfig_svelte: string;
		NODE_PATH: string;
		SHELL: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		npm_package_scripts_build: string;
		npm_package_dependencies__threlte_core: string;
		npm_package_devDependencies_svelte: string;
		npm_package_devDependencies_tslib: string;
		P9K_SSH: string;
		ASDF_DATA_DIR: string;
		TAURI_ENV_FAMILY: string;
		npm_package_dependencies__threlte_extras: string;
		FZF_DEFAULT_COMMAND: string;
		PWD: string;
		npm_execpath: string;
		_P9K_TTY: string;
		npm_package_dependencies__threlte_flex: string;
		PNPM_SCRIPT_SRC_DIR: string;
		npm_package_devDependencies_internal_ip: string;
		npm_package_devDependencies_vite_plugin_glsl: string;
		npm_command: string;
		npm_package_scripts_preview: string;
		HOSTTYPE: string;
		WSL2_GUI_APPS_ENABLED: string;
		EDITOR: string;
		INIT_CWD: string;
		WSLENV: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
