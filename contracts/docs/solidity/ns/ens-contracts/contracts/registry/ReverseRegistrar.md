# ReverseRegistrar









## Methods

### claim

```solidity
function claim(address owner) external nonpayable returns (bytes32)
```



*Transfers ownership of the reverse ENS record associated with the      calling account.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | The address to set as the owner of the reverse record in ENS. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | The ENS node hash of the reverse record. |

### claimForAddr

```solidity
function claimForAddr(address addr, address owner, address resolver) external nonpayable returns (bytes32)
```



*Transfers ownership of the reverse ENS record associated with the      calling account.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | The reverse record to set |
| owner | address | The address to set as the owner of the reverse record in ENS. |
| resolver | address | The resolver of the reverse node |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | The ENS node hash of the reverse record. |

### claimWithResolver

```solidity
function claimWithResolver(address owner, address resolver) external nonpayable returns (bytes32)
```



*Transfers ownership of the reverse ENS record associated with the      calling account.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | The address to set as the owner of the reverse record in ENS. |
| resolver | address | The address of the resolver to set; 0 to leave unchanged. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | The ENS node hash of the reverse record. |

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

### defaultResolver

```solidity
function defaultResolver() external view returns (contract NameResolver)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract NameResolver | undefined |

### ens

```solidity
function ens() external view returns (contract ENS)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ENS | undefined |

### node

```solidity
function node(address addr) external pure returns (bytes32)
```



*Returns the node hash for a given account&#39;s reverse records.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | The address to hash |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | The ENS node hash. |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### setController

```solidity
function setController(address controller, bool enabled) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| controller | address | undefined |
| enabled | bool | undefined |

### setDefaultResolver

```solidity
function setDefaultResolver(address resolver) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| resolver | address | undefined |

### setName

```solidity
function setName(string name) external nonpayable returns (bytes32)
```



*Sets the `name()` record for the reverse ENS record associated with the calling account. First updates the resolver to the default reverse resolver if necessary.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | The name to set for this address. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | The ENS node hash of the reverse record. |

### setNameForAddr

```solidity
function setNameForAddr(address addr, address owner, address resolver, string name) external nonpayable returns (bytes32)
```



*Sets the `name()` record for the reverse ENS record associated with the account provided. Updates the resolver to a designated resolver Only callable by controllers and authorised users*

#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | The reverse record to set |
| owner | address | The owner of the reverse node |
| resolver | address | The resolver of the reverse node |
| name | string | The name to set for this address. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | The ENS node hash of the reverse record. |

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

### ControllerChanged

```solidity
event ControllerChanged(address indexed controller, bool enabled)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| controller `indexed` | address | undefined |
| enabled  | bool | undefined |

### DefaultResolverChanged

```solidity
event DefaultResolverChanged(contract NameResolver indexed resolver)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| resolver `indexed` | contract NameResolver | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### ReverseClaimed

```solidity
event ReverseClaimed(address indexed addr, bytes32 indexed node)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| addr `indexed` | address | undefined |
| node `indexed` | bytes32 | undefined |



