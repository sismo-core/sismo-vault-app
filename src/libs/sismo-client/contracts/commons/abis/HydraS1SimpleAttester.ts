const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "attestationsRegistryAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "hydraS1VerifierAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "availableRootsRegistryAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "commitmentMapperAddress",
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
    ],
    stateMutability: "nonpayable",
    type: "constructor",
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
    name: "AccountsTreeValueMismatch",
    type: "error",
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
        name: "claimLength",
        type: "uint256",
      },
    ],
    name: "ClaimsLengthDifferentThanOne",
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
    name: "CommitmentMapperPubKeyMismatch",
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
        name: "expectedExternalNullifier",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "externalNullifier",
        type: "uint256",
      },
    ],
    name: "ExternalNullifierMismatch",
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
        name: "nullifier",
        type: "uint256",
      },
    ],
    name: "NullifierUsed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "inputRoot",
        type: "uint256",
      },
    ],
    name: "RegistryRootMismatch",
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
        indexed: false,
        internalType: "uint256",
        name: "nullifier",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "NullifierDestinationUpdated",
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
    name: "getAvailableRootsRegistry",
    outputs: [
      {
        internalType: "contract IAvailableRootsRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCommitmentMapperRegistry",
    outputs: [
      {
        internalType: "contract ICommitmentMapperRegistry",
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
        internalType: "uint256",
        name: "nullifier",
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
    inputs: [
      {
        internalType: "bytes",
        name: "extraData",
        type: "bytes",
      },
    ],
    name: "getNullifierFromExtraData",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getVerifier",
    outputs: [
      {
        internalType: "contract HydraS1Verifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export default _abi;
