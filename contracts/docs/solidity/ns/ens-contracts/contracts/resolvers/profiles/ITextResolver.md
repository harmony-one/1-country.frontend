# ITextResolver









## Methods

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



## Events

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



