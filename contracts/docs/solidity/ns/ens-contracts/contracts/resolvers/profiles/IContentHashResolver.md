# IContentHashResolver









## Methods

### contenthash

```solidity
function contenthash(bytes32 node) external view returns (bytes)
```

Returns the contenthash associated with an ENS node.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | The ENS node to query. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | The associated contenthash. |



## Events

### ContenthashChanged

```solidity
event ContenthashChanged(bytes32 indexed node, bytes hash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| hash  | bytes | undefined |



