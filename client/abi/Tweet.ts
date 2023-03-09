import { AbiItem } from 'web3-utils';

export default [
{
    inputs: [
    {
        components: [
        {
            internalType: "uint256",
            name: "baseRentalPrice",
            type: "uint256"
        },
        {
            internalType: "address",
            name: "revenueAccount",
            type: "address"
        },
        {
            internalType: "address",
            name: "dc",
            type: "address"
        }
        ],
        internalType: "struct Tweet.InitConfiguration",
        name: "_initConfig",
        type: "tuple"
    }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
},
{
    anonymous: false,
    inputs: [
    {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
    },
    {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
    }
    ],
    name: "OwnershipTransferred",
    type: "event"
},
{
    anonymous: false,
    inputs: [
    {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
    }
    ],
    name: "Paused",
    type: "event"
},
{
    anonymous: false,
    inputs: [
    {
        indexed: false,
        internalType: "address",
        name: "from",
        type: "address"
    },
    {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address"
    }
    ],
    name: "RevenueAccountChanged",
    type: "event"
},
{
    anonymous: false,
    inputs: [
    {
        indexed: true,
        internalType: "string",
        name: "name",
        type: "string"
    }
    ],
    name: "TweetActivated",
    type: "event"
},
{
    anonymous: false,
    inputs: [
    {
        indexed: true,
        internalType: "string",
        name: "name",
        type: "string"
    },
    {
        indexed: true,
        internalType: "address",
        name: "renter",
        type: "address"
    },
    {
        indexed: false,
        internalType: "string",
        name: "url",
        type: "string"
    }
    ],
    name: "URLAdded",
    type: "event"
},
{
    anonymous: false,
    inputs: [
    {
        indexed: true,
        internalType: "string",
        name: "name",
        type: "string"
    },
    {
        indexed: true,
        internalType: "address",
        name: "renter",
        type: "address"
    }
    ],
    name: "URLCleared",
    type: "event"
},
{
    anonymous: false,
    inputs: [
    {
        indexed: true,
        internalType: "string",
        name: "name",
        type: "string"
    },
    {
        indexed: true,
        internalType: "address",
        name: "renter",
        type: "address"
    },
    {
        indexed: false,
        internalType: "string",
        name: "url",
        type: "string"
    },
    {
        indexed: false,
        internalType: "uint256",
        name: "position",
        type: "uint256"
    }
    ],
    name: "URLRemoved",
    type: "event"
},
{
    anonymous: false,
    inputs: [
    {
        indexed: true,
        internalType: "string",
        name: "name",
        type: "string"
    },
    {
        indexed: true,
        internalType: "address",
        name: "renter",
        type: "address"
    },
    {
        indexed: false,
        internalType: "string",
        name: "oldUrl",
        type: "string"
    },
    {
        indexed: false,
        internalType: "string",
        name: "newUrl",
        type: "string"
    }
    ],
    name: "URLUpdated",
    type: "event"
},
{
    anonymous: false,
    inputs: [
    {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address"
    }
    ],
    name: "Unpaused",
    type: "event"
},
{
    inputs: [
    {
        internalType: "string",
        name: "name",
        type: "string"
    }
    ],
    name: "activate",
    outputs: [],
    stateMutability: "payable",
    type: "function"
},
{
    inputs: [
    {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
    }
    ],
    name: "activated",
    outputs: [
    {
        internalType: "bool",
        name: "",
        type: "bool"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [
    {
        internalType: "string",
        name: "name",
        type: "string"
    },
    {
        internalType: "string",
        name: "url",
        type: "string"
    }
    ],
    name: "addURL",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [],
    name: "baseRentalPrice",
    outputs: [
    {
        internalType: "uint256",
        name: "",
        type: "uint256"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [
    {
        internalType: "string",
        name: "name",
        type: "string"
    }
    ],
    name: "clearUrls",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [],
    name: "dc",
    outputs: [
    {
        internalType: "contract IDC",
        name: "",
        type: "address"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [],
    name: "finishInitialization",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [
    {
        internalType: "string",
        name: "name",
        type: "string"
    }
    ],
    name: "getAllUrls",
    outputs: [
    {
        internalType: "string[]",
        name: "",
        type: "string[]"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [
    {
        internalType: "bytes32[]",
        name: "keys",
        type: "bytes32[]"
    }
    ],
    name: "initializeActivation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [
    {
        internalType: "bytes32",
        name: "key",
        type: "bytes32"
    },
    {
        internalType: "string[]",
        name: "_urls",
        type: "string[]"
    }
    ],
    name: "initializeUrls",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [],
    name: "initialized",
    outputs: [
    {
        internalType: "bool",
        name: "",
        type: "bool"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [
    {
        internalType: "string",
        name: "name",
        type: "string"
    }
    ],
    name: "numUrls",
    outputs: [
    {
        internalType: "uint256",
        name: "",
        type: "uint256"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [],
    name: "owner",
    outputs: [
    {
        internalType: "address",
        name: "",
        type: "address"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [],
    name: "paused",
    outputs: [
    {
        internalType: "bool",
        name: "",
        type: "bool"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [
    {
        internalType: "string",
        name: "name",
        type: "string"
    },
    {
        internalType: "uint256",
        name: "pos",
        type: "uint256"
    }
    ],
    name: "removeUrl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [],
    name: "revenueAccount",
    outputs: [
    {
        internalType: "address",
        name: "",
        type: "address"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [
    {
        internalType: "uint256",
        name: "_baseRentalPrice",
        type: "uint256"
    }
    ],
    name: "setBaseRentalPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [
    {
        internalType: "address",
        name: "_dc",
        type: "address"
    }
    ],
    name: "setDC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [
    {
        internalType: "address",
        name: "_revenueAccount",
        type: "address"
    }
    ],
    name: "setRevenueAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [
    {
        internalType: "address",
        name: "newOwner",
        type: "address"
    }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
},
{
    inputs: [
    {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
    },
    {
        internalType: "uint256",
        name: "",
        type: "uint256"
    }
    ],
    name: "urls",
    outputs: [
    {
        internalType: "string",
        name: "",
        type: "string"
    }
    ],
    stateMutability: "view",
    type: "function"
},
{
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
}
] as AbiItem[];