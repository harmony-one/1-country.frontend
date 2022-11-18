# INameResolver









## Methods

### name

```solidity
function name(bytes32 node) external view returns (string)
```

Returns the name associated with an ENS node, for reverse records. Defined in EIP181.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | The ENS node to query. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The associated name. |



## Events

### NameChanged

```solidity
event NameChanged(bytes32 indexed node, string name)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| name  | string | undefined |



