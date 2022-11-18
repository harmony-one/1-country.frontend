# IDNSZoneResolver









## Methods

### zonehash

```solidity
function zonehash(bytes32 node) external view returns (bytes)
```

zonehash obtains the hash for the zone.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | The ENS node to query. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | The associated contenthash. |



## Events

### DNSZonehashChanged

```solidity
event DNSZonehashChanged(bytes32 indexed node, bytes lastzonehash, bytes zonehash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| lastzonehash  | bytes | undefined |
| zonehash  | bytes | undefined |



