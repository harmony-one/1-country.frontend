# IDNSRecordResolver









## Methods

### dnsRecord

```solidity
function dnsRecord(bytes32 node, bytes32 name, uint16 resource) external view returns (bytes)
```

Obtain a DNS record.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | the namehash of the node for which to fetch the record |
| name | bytes32 | the keccak-256 hash of the fully-qualified name for which to fetch the record |
| resource | uint16 | the ID of the resource as per https://en.wikipedia.org/wiki/List_of_DNS_record_types |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | the DNS record in wire format if present, otherwise empty |



## Events

### DNSRecordChanged

```solidity
event DNSRecordChanged(bytes32 indexed node, bytes name, uint16 resource, bytes record)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| name  | bytes | undefined |
| resource  | uint16 | undefined |
| record  | bytes | undefined |

### DNSRecordDeleted

```solidity
event DNSRecordDeleted(bytes32 indexed node, bytes name, uint16 resource)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| name  | bytes | undefined |
| resource  | uint16 | undefined |



