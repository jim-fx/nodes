<script lang="ts">
  import { decode, encode } from "$lib/helpers/flat_tree";

  // const input = [5, [6, 1], [7, 2, [5, 1]]];
  // const input = [5, [], [6, []], []];
  // const input = [52];
  const input = [0, 0, [0, 2, 0, 128, 0, 128], 0, 128];

  console.log("INPUT");
  console.log(input);

  let encoded = encode(input);
  // encoded = [];
  console.log("ENCODED");
  console.log(encoded);

  encoded = [0, 2, 1, 0, 4, 4, 2, 4, 1, 2, 2, 0, 3, 2, 3, 1, 1, 1, 1];

  const decoded = decode(encoded);
  console.log("DECODED");
  console.log(decoded);

  console.log("EQUALS", JSON.stringify(input) === JSON.stringify(decoded));
</script>
