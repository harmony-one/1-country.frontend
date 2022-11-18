# RegistrarController







*A registrar controller for registering and renewing names at fixed cost.*

## Methods

### MIN_REGISTRATION_DURATION

```solidity
function MIN_REGISTRATION_DURATION() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### available

```solidity
function available(string name) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### commit

```solidity
function commit(bytes32 commitment) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| commitment | bytes32 | undefined |

### commitments

```solidity
function commitments(bytes32) external view returns (uint256)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### makeCommitment

```solidity
function makeCommitment(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint32 fuses, uint64 wrapperExpiry) external pure returns (bytes32)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| owner | address | undefined |
| duration | uint256 | undefined |
| secret | bytes32 | undefined |
| resolver | address | undefined |
| data | bytes[] | undefined |
| reverseRecord | bool | undefined |
| fuses | uint32 | undefined |
| wrapperExpiry | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### maxCommitmentAge

```solidity
function maxCommitmentAge() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### minCommitmentAge

```solidity
function minCommitmentAge() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### nameWrapper

```solidity
function nameWrapper() external view returns (contract INameWrapper)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract INameWrapper | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### prices

```solidity
function prices() external view returns (contract IPriceOracle)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IPriceOracle | undefined |

### recoverFunds

```solidity
function recoverFunds(address _token, address _to, uint256 _amount) external nonpayable
```

Recover ERC20 tokens sent to the contract by mistake.

*The contract is Ownable and only the owner can call the recover function.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _token | address | The address of the ERC20 token to recover |
| _to | address | The address to send the tokens to. |
| _amount | uint256 | The amount of tokens to recover. |

### register

```solidity
function register(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint32 fuses, uint64 wrapperExpiry) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| owner | address | undefined |
| duration | uint256 | undefined |
| secret | bytes32 | undefined |
| resolver | address | undefined |
| data | bytes[] | undefined |
| reverseRecord | bool | undefined |
| fuses | uint32 | undefined |
| wrapperExpiry | uint64 | undefined |

### renew

```solidity
function renew(string name, uint256 duration) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| duration | uint256 | undefined |

### renewWithFuses

```solidity
function renewWithFuses(string name, uint256 duration, uint32 fuses, uint64 wrapperExpiry) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| duration | uint256 | undefined |
| fuses | uint32 | undefined |
| wrapperExpiry | uint64 | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### rentPrice

```solidity
function rentPrice(string name, uint256 duration) external view returns (struct IPriceOracle.Price price)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |
| duration | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| price | IPriceOracle.Price | undefined |

### reverseRegistrar

```solidity
function reverseRegistrar() external view returns (contract ReverseRegistrar)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract ReverseRegistrar | undefined |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceID) external pure returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceID | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### valid

```solidity
function valid(string name) external pure returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### withdraw

```solidity
function withdraw() external nonpayable
```








## Events

### NameRegistered

```solidity
event NameRegistered(string name, bytes32 indexed label, address indexed owner, uint256 baseCost, uint256 premium, uint256 expires)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name  | string | undefined |
| label `indexed` | bytes32 | undefined |
| owner `indexed` | address | undefined |
| baseCost  | uint256 | undefined |
| premium  | uint256 | undefined |
| expires  | uint256 | undefined |

### NameRenewed

```solidity
event NameRenewed(string name, bytes32 indexed label, uint256 cost, uint256 expires)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name  | string | undefined |
| label `indexed` | bytes32 | undefined |
| cost  | uint256 | undefined |
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



## Errors

### CommitmentTooNew

```solidity
error CommitmentTooNew(bytes32 commitment)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| commitment | bytes32 | undefined |

### CommitmentTooOld

```solidity
error CommitmentTooOld(bytes32 commitment)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| commitment | bytes32 | undefined |

### DurationTooShort

```solidity
error DurationTooShort(uint256 duration)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| duration | uint256 | undefined |

### InsufficientValue

```solidity
error InsufficientValue()
```






### MaxCommitmentAgeTooHigh

```solidity
error MaxCommitmentAgeTooHigh()
```






### MaxCommitmentAgeTooLow

```solidity
error MaxCommitmentAgeTooLow()
```






### NameNotAvailable

```solidity
error NameNotAvailable(string name)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | undefined |

### ResolverRequiredWhenDataSupplied

```solidity
error ResolverRequiredWhenDataSupplied()
```






### Unauthorised

```solidity
error Unauthorised(bytes32 node)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| node | bytes32 | undefined |

### UnexpiredCommitmentExists

```solidity
error UnexpiredCommitmentExists(bytes32 commitment)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| commitment | bytes32 | undefined |


