type RandomParameter = {
  type: "random";
  min: Parameter;
  max: Parameter;
  seed: number;
}


type MathParameter = {
  type: "math";
  op_type: number;
  a: Parameter;
  b: Parameter;
}


type NoiseParameter = {
  type: "noise";
  frequency: Parameter;
  amplitude: Parameter;
  seed: number;
}


type Parameter = number | RandomParameter | MathParameter | NoiseParameter;

