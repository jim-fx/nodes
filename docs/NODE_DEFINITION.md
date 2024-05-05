# Node Definition

Which arguments a node expects is defined in a single `.json` file that is embedded into our node. It consists of three main fields:

## id

`user-name/namespace/node-id`

## outputs

```json
"outputs": [
  "geometry"
]
```

## inputs

```json
"inputs": {
  "height": {
    "type": "float",
    "value": 2
  },
  "radius": {
    "type": "float",
    "value": 0.5
  }
}
```

## meta (optional)

The meta object is optional and can contain two other fields:

`title`

`description`
