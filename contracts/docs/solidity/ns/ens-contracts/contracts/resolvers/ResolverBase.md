# ResolverBase









## Methods

### clearRecords

```solidity
function clearRecords(bytes32 node) external nonpayable
```

Increments the record version associated with an ENS node. May only be called by the owner of that node in the ENS registry.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | The node to update. |

### recordVersions

```solidity
function recordVersions(bytes32) external view returns (uint64)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint64 | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceID) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceID | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### VersionChanged

```solidity
event VersionChanged(bytes32 indexed node, uint64 newVersion)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| newVersion  | uint64 | undefined |



