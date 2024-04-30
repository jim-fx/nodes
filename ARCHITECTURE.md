# Nodarium Architecture

The basic idea of nodarium is to use the advantages of WebAssembly to create a performant, secure and extandable visual programming language.

The visual programming language consists of so called `Nodes` which are stored and distributed as single `.wasm` files. Each `node` receives some arguments and generates some output.

## What is a node?

```typescript
type Node = {
  id: string,
  outputs: string[],
  inputs: {
    [key:string]: NodeInput
  }
}
```

## How are the nodes executed?

## How are the nodes stored?
