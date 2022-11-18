# IInterfaceResolver









## Methods

### interfaceImplementer

```solidity
function interfaceImplementer(bytes32 node, bytes4 interfaceID) external view returns (address)
```

Returns the address of a contract that implements the specified interface for this name. If an implementer has not been set for this interfaceID and name, the resolver will query the contract at `addr()`. If `addr()` is set, a contract exists at that address, and that contract implements EIP165 and returns `true` for the specified interfaceID, its address will be returned.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | The ENS node to query. |
| interfaceID | bytes4 | The EIP 165 interface ID to check for. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address that implements this interface, or 0 if the interface is unsupported. |



## Events

### InterfaceChanged

```solidity
event InterfaceChanged(bytes32 indexed node, bytes4 indexed interfaceID, address implementer)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| interfaceID `indexed` | bytes4 | undefined |
| implementer  | address | undefined |



