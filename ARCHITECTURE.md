# Nodarium Architecture

The basic idea of nodarium is to use the advantages of WebAssembly to create a performant, secure and extandable visual programming language.

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
