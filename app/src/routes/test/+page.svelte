<script lang="ts">
  import { decode, encode } from "$lib/helpers/flat_tree";

  const input = [5, [6, 1], [7, 2, [5, 1]]];
  // const input = [5, [], [6, []], []];
  // const input = [52];

  console.log("INPUT");
  console.log(input);

  const encoded = encode(input);
  console.log("ENCODED");
  console.log(encoded);

  const decoded = decode(encoded);
  console.log("DECODED");
  console.log(decoded);

  console.log("EQUALS", JSON.stringify(input) === JSON.stringify(decoded));
</script>
