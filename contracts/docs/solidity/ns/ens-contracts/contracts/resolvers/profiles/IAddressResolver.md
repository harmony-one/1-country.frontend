# IAddressResolver





Interface for the new (multicoin) addr function.



## Methods

### addr

```solidity
function addr(bytes32 node, uint256 coinType) external view returns (bytes)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| coinType | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined |



## Events

### AddressChanged

```solidity
event AddressChanged(bytes32 indexed node, uint256 coinType, bytes newAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| coinType  | uint256 | undefined |
| newAddress  | bytes | undefined |



