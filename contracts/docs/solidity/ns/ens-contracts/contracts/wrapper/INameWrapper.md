# INameWrapper









## Methods

### allFusesBurned

```solidity
function allFusesBurned(bytes32 node, uint32 fuseMask) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| fuseMask | uint32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### balanceOf

```solidity
function balanceOf(address account, uint256 id) external view returns (uint256)
```



*Returns the amount of tokens of token type `id` owned by `account`. Requirements: - `account` cannot be the zero address.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |
| id | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### balanceOfBatch

```solidity
function balanceOfBatch(address[] accounts, uint256[] ids) external view returns (uint256[])
```



*xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {balanceOf}. Requirements: - `accounts` and `ids` must have the same length.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| accounts | address[] | undefined |
| ids | uint256[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256[] | undefined |

### ens

```solidity
function ens() external view returns (contract ENS)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ENS | undefined |

### getData

```solidity
function getData(uint256 id) external nonpayable returns (address, uint32, uint64)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | uint32 | undefined |
| _2 | uint64 | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address account, address operator) external view returns (bool)
```



*Returns true if `operator` is approved to transfer ``account``&#39;s tokens. See {setApprovalForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isTokenOwnerOrApproved

```solidity
function isTokenOwnerOrApproved(bytes32 node, address addr) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| addr | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### isWrapped

```solidity
function isWrapped(bytes32 node) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### metadataService

```solidity
function metadataService() external view returns (contract IMetadataService)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IMetadataService | undefined |

### names

```solidity
function names(bytes32) external view returns (bytes)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes | undefined |

### ownerOf

```solidity
function ownerOf(uint256 id) external nonpayable returns (address owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

### registerAndWrapETH2LD

```solidity
function registerAndWrapETH2LD(string label, address wrappedOwner, uint256 duration, address resolver, uint32 fuses, uint64 expiry) external nonpayable returns (uint256 registrarExpiry)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| label | string | undefined |
| wrappedOwner | address | undefined |
| duration | uint256 | undefined |
| resolver | address | undefined |
| fuses | uint32 | undefined |
| expiry | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| registrarExpiry | uint256 | undefined |

### registrar

```solidity
function registrar() external view returns (contract IBaseRegistrar)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IBaseRegistrar | undefined |

### renew

```solidity
function renew(uint256 labelHash, uint256 duration, uint32 fuses, uint64 expiry) external nonpayable returns (uint256 expires)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| labelHash | uint256 | undefined |
| duration | uint256 | undefined |
| fuses | uint32 | undefined |
| expiry | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| expires | uint256 | undefined |

### safeBatchTransferFrom

```solidity
function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data) external nonpayable
```



*xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {safeTransferFrom}. Emits a {TransferBatch} event. Requirements: - `ids` and `amounts` must have the same length. - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the acceptance magic value.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| ids | uint256[] | undefined |
| amounts | uint256[] | undefined |
| data | bytes | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external nonpayable
```



*Transfers `amount` tokens of token type `id` from `from` to `to`. Emits a {TransferSingle} event. Requirements: - `to` cannot be the zero address. - If the caller is not `from`, it must have been approved to spend ``from``&#39;s tokens via {setApprovalForAll}. - `from` must have a balance of tokens of type `id` of at least `amount`. - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the acceptance magic value.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| id | uint256 | undefined |
| amount | uint256 | undefined |
| data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```



*Grants or revokes permission to `operator` to transfer the caller&#39;s tokens, according to `approved`, Emits an {ApprovalForAll} event. Requirements: - `operator` cannot be the caller.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| approved | bool | undefined |

### setChildFuses

```solidity
function setChildFuses(bytes32 parentNode, bytes32 labelhash, uint32 fuses, uint64 expiry) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| parentNode | bytes32 | undefined |
| labelhash | bytes32 | undefined |
| fuses | uint32 | undefined |
| expiry | uint64 | undefined |

### setFuses

```solidity
function setFuses(bytes32 node, uint32 fuses) external nonpayable returns (uint32 newFuses)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| fuses | uint32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| newFuses | uint32 | undefined |

### setRecord

```solidity
function setRecord(bytes32 node, address owner, address resolver, uint64 ttl) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| owner | address | undefined |
| resolver | address | undefined |
| ttl | uint64 | undefined |

### setResolver

```solidity
function setResolver(bytes32 node, address resolver) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| resolver | address | undefined |

### setSubnodeOwner

```solidity
function setSubnodeOwner(bytes32 node, string label, address newOwner, uint32 fuses, uint64 expiry) external nonpayable returns (bytes32)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| label | string | undefined |
| newOwner | address | undefined |
| fuses | uint32 | undefined |
| expiry | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### setSubnodeRecord

```solidity
function setSubnodeRecord(bytes32 node, string label, address owner, address resolver, uint64 ttl, uint32 fuses, uint64 expiry) external nonpayable returns (bytes32)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| label | string | undefined |
| owner | address | undefined |
| resolver | address | undefined |
| ttl | uint64 | undefined |
| fuses | uint32 | undefined |
| expiry | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### setTTL

```solidity
function setTTL(bytes32 node, uint64 ttl) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| ttl | uint64 | undefined |

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

### unwrap

```solidity
function unwrap(bytes32 node, bytes32 label, address owner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |
| label | bytes32 | undefined |
| owner | address | undefined |

### unwrapETH2LD

```solidity
function unwrapETH2LD(bytes32 label, address newRegistrant, address newController) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| label | bytes32 | undefined |
| newRegistrant | address | undefined |
| newController | address | undefined |

### wrap

```solidity
function wrap(bytes name, address wrappedOwner, address resolver) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | bytes | undefined |
| wrappedOwner | address | undefined |
| resolver | address | undefined |

### wrapETH2LD

```solidity
function wrapETH2LD(string label, address wrappedOwner, uint32 fuses, uint64 _expiry, address resolver) external nonpayable returns (uint64 expiry)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| label | string | undefined |
| wrappedOwner | address | undefined |
| fuses | uint32 | undefined |
| _expiry | uint64 | undefined |
| resolver | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| expiry | uint64 | undefined |



## Events

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed account, address indexed operator, bool approved)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| account `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### FusesSet

```solidity
event FusesSet(bytes32 indexed node, uint32 fuses, uint64 expiry)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| fuses  | uint32 | undefined |
| expiry  | uint64 | undefined |

### NameUnwrapped

```solidity
event NameUnwrapped(bytes32 indexed node, address owner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| owner  | address | undefined |

### NameWrapped

```solidity
event NameWrapped(bytes32 indexed node, bytes name, address owner, uint32 fuses, uint64 expiry)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node `indexed` | bytes32 | undefined |
| name  | bytes | undefined |
| owner  | address | undefined |
| fuses  | uint32 | undefined |
| expiry  | uint64 | undefined |

### TransferBatch

```solidity
event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| ids  | uint256[] | undefined |
| values  | uint256[] | undefined |

### TransferSingle

```solidity
event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| operator `indexed` | address | undefined |
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| id  | uint256 | undefined |
| value  | uint256 | undefined |

### URI

```solidity
event URI(string value, uint256 indexed id)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| value  | string | undefined |
| id `indexed` | uint256 | undefined |



