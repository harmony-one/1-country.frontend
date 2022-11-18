# IAddrResolver





Interface for the legacy (ETH-only) addr function.



## Methods

### addr

```solidity
function addr(bytes32 node) external view returns (address payable)
```

Returns the address associated with an ENS node.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | The ENS node to query. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | The associated address. |



## Events

### AddrChanged

```solidity
event AddrChanged(bytes32 indexed node, address a)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| a  | address | undefined |



