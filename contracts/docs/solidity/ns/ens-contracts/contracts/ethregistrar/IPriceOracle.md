# IPriceOracle









## Methods

### price

```solidity
function price(string name, uint256 expires, uint256 duration) external view returns (struct IPriceOracle.Price)
```



*Returns the price to register or renew a name.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| name | string | The name being registered or renewed. |
| expires | uint256 | When the name presently expires (0 if this is a new registration). |
| duration | uint256 | How long the name is being registered or extended for, in seconds. |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IPriceOracle.Price | base premium tuple of base price + premium price |




