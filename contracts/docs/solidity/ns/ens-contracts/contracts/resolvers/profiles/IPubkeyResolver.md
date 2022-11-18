# IPubkeyResolver









## Methods

### pubkey

```solidity
function pubkey(bytes32 node) external view returns (bytes32 x, bytes32 y)
```

Returns the SECP256k1 public key associated with an ENS node. Defined in EIP 619.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | The ENS node to query |

#### Returns

| Name | Type | Description |
|---|---|---|
| x | bytes32 | The X coordinate of the curve point for the public key. |
| y | bytes32 | The Y coordinate of the curve point for the public key. |



## Events

### PubkeyChanged

```solidity
event PubkeyChanged(bytes32 indexed node, bytes32 x, bytes32 y)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| x  | bytes32 | undefined |
| y  | bytes32 | undefined |



