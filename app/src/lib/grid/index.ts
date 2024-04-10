import { withSubComponents } from "$lib/helpers";
import Grid from "./Grid.svelte";
import Row from "./Row.svelte";
import Cell from "./Cell.svelte";

export default withSubComponents(Grid, { Row, Cell });
