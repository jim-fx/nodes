import { get, writable } from "svelte/store";

type Shortcut = {
  key: string | string[],
  shift?: boolean,
  ctrl?: boolean,
  alt?: boolean,
  description?: string,
  callback: (event: KeyboardEvent) => void
}

export function createKeyMap(keys: Shortcut[]) {

  const store = writable(keys);

  return {
    handleKeyboardEvent: (event: KeyboardEvent) => {
      const key = get(store).find(k => {
        if (Array.isArray(k.key) ? !k.key.includes(event.key) : k.key !== event.key) return false;
        if ("shift" in k && k.shift !== event.shiftKey) return false;
        if ("ctrl" in k && k.ctrl !== event.ctrlKey) return false;
        if ("alt" in k && k.alt !== event.altKey) return false;
        return true;
      });
      console.log({ keys: get(store), out: key, key: event.key });
      key?.callback(event);
    },
    addShortcut: (shortcut: Shortcut) => {
      if (Array.isArray(shortcut.key)) {
        for (const k of shortcut.key) {
          store.update(keys => {
            if (keys.find(kk => kk.key === k)) return keys;
            return [...keys, { ...shortcut, key: k }];
          });
        }
      } else {
        store.update(keys => [...keys, shortcut]);
      }
    },
    keys: store
  }

}
