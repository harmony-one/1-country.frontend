# IETHRegistrarController









## Methods

### available

```solidity
function available(string) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### commit

```solidity
function commit(bytes32) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### makeCommitment

```solidity
function makeCommitment(string, address, uint256, bytes32, address, bytes[], bool, uint32, uint64) external nonpayable returns (bytes32)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |
| _1 | address | undefined |
| _2 | uint256 | undefined |
| _3 | bytes32 | undefined |
| _4 | address | undefined |
| _5 | bytes[] | undefined |
| _6 | bool | undefined |
| _7 | uint32 | undefined |
| _8 | uint64 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### register

```solidity
function register(string, address, uint256, bytes32, address, bytes[], bool, uint32, uint64) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |
| _1 | address | undefined |
| _2 | uint256 | undefined |
| _3 | bytes32 | undefined |
| _4 | address | undefined |
| _5 | bytes[] | undefined |
| _6 | bool | undefined |
| _7 | uint32 | undefined |
| _8 | uint64 | undefined |

### renew

```solidity
function renew(string, uint256) external payable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |
| _1 | uint256 | undefined |

### rentPrice

```solidity
function rentPrice(string, uint256) external nonpayable returns (struct IPriceOracle.Price)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |
| _1 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IPriceOracle.Price | undefined |




