export function localState<T>(key: string, defaultValue: T): T {
  const stored = localStorage.getItem(key)
  const state = $state(stored ? JSON.parse(stored) : defaultValue)
  $effect.root(() => {
    $effect(() => {
      const value = $state.snapshot(state);
      localStorage.setItem(key, JSON.stringify(value));
    });
  });
  return state;
}
