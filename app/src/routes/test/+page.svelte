<script lang="ts">
  import {
    decodeFloat,
    encodeFloat,
    decode,
    encode,
    concat_encoded,
  } from "@nodes/utils";

  console.clear();

  {
    const encodedPositions = new Int32Array([
      encodeFloat(1.1),
      encodeFloat(2.0),
      encodeFloat(3.0),
      encodeFloat(4.0),
      encodeFloat(5.0),
      encodeFloat(6.0),
      encodeFloat(7.0),
      encodeFloat(8.0),
      encodeFloat(9.0),
    ]);

    // Create a Float32Array using the same buffer that backs the Int32Array
    const floatView = new Float32Array(encodedPositions.buffer);
    console.log({ encodedPositions, floatView });
  }

  if (false) {
    const input_a = encode([1, 2, 3]);
    const input_b = 2;
    const input_c = 89;
    const input_d = encode([4, 5, 6]);

    const output = concat_encoded([input_a, input_b, input_c, input_d]);

    const decoded = decode(output);
    console.log("CONCAT", [input_a, input_b, input_c, input_d]);
    console.log(output);
    console.log(decoded);
  }

  if (false) {
    let maxError = 0;
    new Array(10_000).fill(null).forEach((v, i) => {
      const input = i < 5_000 ? i : Math.random() * 100;
      const encoded = encodeFloat(input);
      const output = decodeFloat(encoded[0], encoded[1]);

      const error = Math.abs(input - output);
      if (error > maxError) {
        maxError = error;
      }
    });

    console.log("DECODE FLOAT");
    console.log(maxError);
    console.log(encodeFloat(2.0));
    console.log("----");
  }

  if (false) {
    console.log("Turning Int32Array into Array");
    const test_size = 2_000_000;
    const a = new Int32Array(test_size);
    let t0 = performance.now();
    for (let i = 0; i < test_size; i++) {
      a[i] = Math.floor(Math.random() * 100);
    }
    console.log("TIME", performance.now() - t0);
    t0 = performance.now();
    const b = [...a.slice(0, test_size)];
    console.log("TIME", performance.now() - t0);
    console.log(typeof b, Array.isArray(b), b instanceof Int32Array);
  }

  if (false) {
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
  }
</script>
