# Resolver





A generic resolver interface which includes all the functions including the ones deprecated



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

### content

```solidity
function content(bytes32 node) external view returns (bytes32)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

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

### multicall

```solidity
function multicall(bytes[] data) external nonpayable returns (bytes[] results)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | bytes[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| results | bytes[] | undefined |

### multicallWithNodeCheck

```solidity
function multicallWithNodeCheck(bytes32 nodehash, bytes[] data) external nonpayable returns (bytes[] results)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| nodehash | bytes32 | undefined |
| data | bytes[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| results | bytes[] | undefined |

### multihash

```solidity
function multihash(bytes32 node) external view returns (bytes)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined |

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

### resolve

```solidity
function resolve(bytes name, bytes data) external view returns (bytes, address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | bytes | undefined |
| data | bytes | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined |
| _1 | address | undefined |

### setABI

```solidity
function setABI(bytes32 node, uint256 contentType, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| contentType | uint256 | undefined |
| data | bytes | undefined |

### setAddr

```solidity
function setAddr(bytes32 node, uint256 coinType, bytes a) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| coinType | uint256 | undefined |
| a | bytes | undefined |

### setAddr

```solidity
function setAddr(bytes32 node, address addr) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| addr | address | undefined |

### setContent

```solidity
function setContent(bytes32 node, bytes32 hash) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| hash | bytes32 | undefined |

### setContenthash

```solidity
function setContenthash(bytes32 node, bytes hash) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| hash | bytes | undefined |

### setDnsrr

```solidity
function setDnsrr(bytes32 node, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| data | bytes | undefined |

### setInterface

```solidity
function setInterface(bytes32 node, bytes4 interfaceID, address implementer) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| interfaceID | bytes4 | undefined |
| implementer | address | undefined |

### setMultihash

```solidity
function setMultihash(bytes32 node, bytes hash) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| hash | bytes | undefined |

### setName

```solidity
function setName(bytes32 node, string _name) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| _name | string | undefined |

### setPubkey

```solidity
function setPubkey(bytes32 node, bytes32 x, bytes32 y) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| x | bytes32 | undefined |
| y | bytes32 | undefined |

### setText

```solidity
function setText(bytes32 node, string key, string value) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| key | string | undefined |
| value | string | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*Returns true if this contract implements the interface defined by `interfaceId`. See the corresponding https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section] to learn more about how these ids are created. This function call must use less than 30 000 gas.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### text

```solidity
function text(bytes32 node, string key) external view returns (string)
```

Returns the text data associated with an ENS node and key.



#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | The ENS node to query. |
| key | string | The text data key to query. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The associated text data. |

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

### ABIChanged

```solidity
event ABIChanged(bytes32 indexed node, uint256 indexed contentType)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| contentType `indexed` | uint256 | undefined |

### AddrChanged

```solidity
event AddrChanged(bytes32 indexed node, address a)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| a  | address | undefined |

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

### ContentChanged

```solidity
event ContentChanged(bytes32 indexed node, bytes32 hash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| hash  | bytes32 | undefined |

### ContenthashChanged

```solidity
event ContenthashChanged(bytes32 indexed node, bytes hash)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| hash  | bytes | undefined |

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

### NameChanged

```solidity
event NameChanged(bytes32 indexed node, string name)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| name  | string | undefined |

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

### TextChanged

```solidity
event TextChanged(bytes32 indexed node, string indexed indexedKey, string key, string value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| indexedKey `indexed` | string | undefined |
| key  | string | undefined |
| value  | string | undefined |



