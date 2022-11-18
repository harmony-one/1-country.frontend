# ERC20Recoverable





Contract is used to recover ERC20 tokens sent to the contract by mistake.



## Methods

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


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

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



