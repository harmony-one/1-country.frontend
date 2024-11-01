import { ContractInterface } from '@ethersproject/contracts'

export default [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_reserveToken',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'winner',
        type: 'address',
      },
    ],
    name: 'DailyWinnerUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
    ],
    name: 'TokenAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cost',
        type: 'uint256',
      },
    ],
    name: 'TokensPurchased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'seller',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'refund',
        type: 'uint256',
      },
    ],
    name: 'TokensSold',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'buy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'uint256[]',
        name: '_supplies',
        type: 'uint256[]',
      },
      {
        internalType: 'uint256[]',
        name: '_prices',
        type: 'uint256[]',
      },
    ],
    name: 'createToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentWinner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'getCost',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCurrentDayTopLiquidityToken',
    outputs: [
      {
        internalType: 'address',
        name: 'topToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'maxLiquidity',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getCurrentPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
    ],
    name: 'getOwnerTokens',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'nameHash',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address',
          },
        ],
        internalType: 'struct BondingCurve.TokenInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'getRefund',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTokenList',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'nameHash',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address',
          },
        ],
        internalType: 'struct BondingCurve.TokenInfo[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTokenListWithPrice',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'name',
            type: 'string',
          },
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'currentPrice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'totalSupply',
            type: 'uint256',
          },
        ],
        internalType: 'struct BondingCurve.TokenInfoWithPrice[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getTokenStepAt',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'supply',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
        ],
        internalType: 'struct BondingCurve.Step',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getTokenStepCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'getTokenSteps',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'supply',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
        ],
        internalType: 'struct BondingCurve.Step[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'getTopLiquidityToken',
    outputs: [
      {
        internalType: 'address',
        name: 'topToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'maxLiquidity',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
    ],
    name: 'isNameTaken',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastUpdateTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
    ],
    name: 'normalizeAndHashName',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'reserveToken',
    outputs: [
      {
        internalType: 'contract IERC20',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'sell',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'tokenBond',
    outputs: [
      {
        internalType: 'uint256',
        name: 'reserveBalance',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'createdAt',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'tokenInfo',
    outputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'nameHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'tokens',
    outputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'nameHash',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256',
      },
    ],
    name: 'updateDailyWinner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as ContractInterface
