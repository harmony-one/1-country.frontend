# IABIResolver









## Methods

### ABI

```solidity
function ABI(bytes32 node, uint256 contentTypes) external view returns (uint256, bytes)
```

Returns the ABI associated with an ENS node. Defined in EIP205.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | The ENS node to query |
| contentTypes | uint256 | A bitwise OR of the ABI formats accepted by the caller. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | contentType The content type of the return value |
| _1 | bytes | data The ABI data |



## Events

### ABIChanged

```solidity
event ABIChanged(bytes32 indexed node, uint256 indexed contentType)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| contentType `indexed` | uint256 | undefined |



