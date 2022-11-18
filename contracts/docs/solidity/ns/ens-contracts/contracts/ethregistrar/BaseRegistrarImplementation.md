# BaseRegistrarImplementation









## Methods

### GRACE_PERIOD

```solidity
function GRACE_PERIOD() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### addController

```solidity
function addController(address controller) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| controller | address | undefined |

### approve

```solidity
function approve(address to, uint256 tokenId) external nonpayable
```



*See {IERC721-approve}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| to | address | undefined |
| tokenId | uint256 | undefined |

### available

```solidity
function available(uint256 id) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```



*See {IERC721-balanceOf}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### baseNode

```solidity
function baseNode() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### controllers

```solidity
function controllers(address) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### ens

```solidity
function ens() external view returns (contract ENS)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ENS | undefined |

### getApproved

```solidity
function getApproved(uint256 tokenId) external view returns (address)
```



*See {IERC721-getApproved}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### isApprovedForAll

```solidity
function isApprovedForAll(address owner, address operator) external view returns (bool)
```



*See {IERC721-isApprovedForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | undefined |
| operator | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### name

```solidity
function name() external view returns (string)
```



*See {IERC721Metadata-name}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### nameExpires

```solidity
function nameExpires(uint256 id) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```



*Gets the owner of the specified token ID. Names become unowned      when their registration expires.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | uint256 ID of the token to query the owner of |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address currently marked as the owner of the given token ID |

### reclaim

```solidity
function reclaim(uint256 id, address owner) external nonpayable
```



*Reclaim ownership of a name in ENS, if you own it in the registrar.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |
| owner | address | undefined |

### register

```solidity
function register(uint256 id, address owner, uint256 duration) external nonpayable returns (uint256)
```



*Register a name.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | The token ID (keccak256 of the label). |
| owner | address | The address that should own the registration. |
| duration | uint256 | Duration in seconds for the registration. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### registerOnly

```solidity
function registerOnly(uint256 id, address owner, uint256 duration) external nonpayable returns (uint256)
```



*Register a name, without modifying the registry.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | The token ID (keccak256 of the label). |
| owner | address | The address that should own the registration. |
| duration | uint256 | Duration in seconds for the registration. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### removeController

```solidity
function removeController(address controller) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| controller | address | undefined |

### renew

```solidity
function renew(uint256 id, uint256 duration) external nonpayable returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |
| duration | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*See {IERC721-safeTransferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### safeTransferFrom

```solidity
function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external nonpayable
```



*See {IERC721-safeTransferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |
| data | bytes | undefined |

### setApprovalForAll

```solidity
function setApprovalForAll(address operator, bool approved) external nonpayable
```



*See {IERC721-setApprovalForAll}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined |
| approved | bool | undefined |

### setResolver

```solidity
function setResolver(address resolver) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| resolver | address | undefined |

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

### symbol

```solidity
function symbol() external view returns (string)
```



*See {IERC721Metadata-symbol}.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tokenURI

```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```



*See {IERC721Metadata-tokenURI}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenId | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### transferFrom

```solidity
function transferFrom(address from, address to, uint256 tokenId) external nonpayable
```



*See {IERC721-transferFrom}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | undefined |
| to | address | undefined |
| tokenId | uint256 | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |



## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| approved `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |

### ApprovalForAll

```solidity
event ApprovalForAll(address indexed owner, address indexed operator, bool approved)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| operator `indexed` | address | undefined |
| approved  | bool | undefined |

### ControllerAdded

```solidity
event ControllerAdded(address indexed controller)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| controller `indexed` | address | undefined |

### ControllerRemoved

```solidity
event ControllerRemoved(address indexed controller)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| controller `indexed` | address | undefined |

### NameMigrated

```solidity
event NameMigrated(uint256 indexed id, address indexed owner, uint256 expires)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| owner `indexed` | address | undefined |
| expires  | uint256 | undefined |

### NameRegistered

```solidity
event NameRegistered(uint256 indexed id, address indexed owner, uint256 expires)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| owner `indexed` | address | undefined |
| expires  | uint256 | undefined |

### NameRenewed

```solidity
event NameRenewed(uint256 indexed id, uint256 expires)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| id `indexed` | uint256 | undefined |
| expires  | uint256 | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| tokenId `indexed` | uint256 | undefined |



