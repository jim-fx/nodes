// Reexport your entry components here
import Input from './Input.svelte';

import Float from "./elements/Float.svelte";
import Integer from "./elements/Integer.svelte";
import Select from "./elements/Select.svelte";
import Checkbox from "./elements/Checkbox.svelte";
import Details from "./Details.svelte";

export const icons = import.meta.glob('./icons/*.svg?raw', { eager: true })

export { Float, Integer, Select, Checkbox, Input, Details };

export default Input;

export { default as ShortCut } from "./ShortCut.svelte";
