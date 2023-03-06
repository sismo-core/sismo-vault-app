const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "attestationsRegistryAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "collectionIdFirst",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "collectionIdLast",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "pythia1VerifierAddress",
        type: "address",
      },
      {
        internalType: "uint256[2]",
        name: "commitmentSignerPubKey",
        type: "uint256[2]",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AttestationDeletionNotImplemented",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedChainId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
    ],
    name: "ChainIdMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "collectionId",
        type: "uint256",
      },
    ],
    name: "CollectionIdOutOfBound",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedX",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expectedY",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputX",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputY",
        type: "uint256",
      },
    ],
    name: "CommitmentSignerPubKeyMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "expectedDestination",
        type: "address",
      },
      {
        internalType: "address",
        name: "inputDestination",
        type: "address",
      },
    ],
    name: "DestinationMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedGroupId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "groupId",
        type: "uint256",
      },
    ],
    name: "GroupIdAndPropertiesMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedAccountsTreeValue",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputAccountsTreeValue",
        type: "uint256",
      },
    ],
    name: "GroupIdMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "InvalidGroth16Proof",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "expectedStrictness",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "strictNess",
        type: "bool",
      },
    ],
    name: "IsStrictMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedTicketIdentifier",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "ticketIdentifier",
        type: "uint256",
      },
    ],
    name: "TicketIdentifierMismatch",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "userTicket",
        type: "uint256",
      },
    ],
    name: "TicketUsed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "inputdestination",
        type: "address",
      },
    ],
    name: "UserShouldOwnItsDestination",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedValue",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "inputValue",
        type: "uint256",
      },
    ],
    name: "ValueMismatch",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "collectionId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "address",
            name: "issuer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "timestamp",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes",
          },
        ],
        indexed: false,
        internalType: "struct Attestation",
        name: "attestation",
        type: "tuple",
      },
    ],
    name: "AttestationDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "collectionId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "address",
            name: "issuer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "timestamp",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes",
          },
        ],
        indexed: false,
        internalType: "struct Attestation",
        name: "attestation",
        type: "tuple",
      },
    ],
    name: "AttestationGenerated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256[2]",
        name: "newCommitmentSignerPubKey",
        type: "uint256[2]",
      },
    ],
    name: "CommitmentSignerPubKeyUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "ticket",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "TicketDestinationUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "AUTHORIZED_COLLECTION_ID_FIRST",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "AUTHORIZED_COLLECTION_ID_LAST",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "IMPLEMENTATION_VERSION",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "groupId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "claimedValue",
                type: "uint256",
              },
              {
                internalType: "bytes",
                name: "extraData",
                type: "bytes",
              },
            ],
            internalType: "struct Claim[]",
            name: "claims",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "destination",
            type: "address",
          },
        ],
        internalType: "struct Request",
        name: "request",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "buildAttestations",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "collectionId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "address",
            name: "issuer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "timestamp",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes",
          },
        ],
        internalType: "struct Attestation[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "collectionIds",
        type: "uint256[]",
      },
      {
        internalType: "address",
        name: "attestationsOwner",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "proofData",
        type: "bytes",
      },
    ],
    name: "deleteAttestations",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "collectionId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "address",
            name: "issuer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "timestamp",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes",
          },
        ],
        internalType: "struct Attestation[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "uint256",
                name: "groupId",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "claimedValue",
                type: "uint256",
              },
              {
                internalType: "bytes",
                name: "extraData",
                type: "bytes",
              },
            ],
            internalType: "struct Claim[]",
            name: "claims",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "destination",
            type: "address",
          },
        ],
        internalType: "struct Request",
        name: "request",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "proofData",
        type: "bytes",
      },
    ],
    name: "generateAttestations",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "collectionId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "address",
            name: "issuer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "timestamp",
            type: "uint32",
          },
          {
            internalType: "bytes",
            name: "extraData",
            type: "bytes",
          },
        ],
        internalType: "struct Attestation[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAttestationRegistry",
    outputs: [
      {
        internalType: "contract IAttestationsRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCommitmentSignerPubKey",
    outputs: [
      {
        internalType: "uint256[2]",
        name: "",
        type: "uint256[2]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "userTicket",
        type: "uint256",
      },
    ],
    name: "getDestinationOfNullifier",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVerifier",
    outputs: [
      {
        internalType: "contract Pythia1Verifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "commitmentSignerPubKey",
        type: "uint256[2]",
      },
      {
        internalType: "address",
        name: "ownerAddress",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "commitmentSignerPubKey",
        type: "uint256[2]",
      },
    ],
    name: "updateCommitmentSignerPubKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default _abi;
