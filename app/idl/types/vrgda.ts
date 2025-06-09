/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vrgda.json`.
 */
export type Vrgda = {
  "address": "9rUZoTzHGK7SJ9jfAzVLaYW9uMv1YkA6pQcby1tFGRZb",
  "metadata": {
    "name": "vrgda",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buy",
      "discriminator": [
        102,
        6,
        61,
        18,
        1,
        218,
        235,
        234
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "vrgda",
          "writable": true
        },
        {
          "name": "mint",
          "writable": true,
          "relations": [
            "vrgda"
          ]
        },
        {
          "name": "wsolMint"
        },
        {
          "name": "buyerWsolAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "buyerAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vrgdaVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vrgda"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vrgdaSolAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "authority",
          "relations": [
            "vrgda"
          ]
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "closeAuction",
      "discriminator": [
        225,
        129,
        91,
        48,
        215,
        73,
        203,
        172
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "vrgda"
          ]
        },
        {
          "name": "vrgda",
          "writable": true
        },
        {
          "name": "vrgdaVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vrgda"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vrgdaSolAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint",
          "writable": true
        },
        {
          "name": "wsolMint"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeVrgda",
      "discriminator": [
        103,
        185,
        37,
        247,
        54,
        41,
        172,
        213
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "vrgda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  114,
                  103,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "vrgdaVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vrgda"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "mint"
        },
        {
          "name": "vrgdaSolAta",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "wsolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "wsolMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "targetPrice",
          "type": "u128"
        },
        {
          "name": "decayConstantPercent",
          "type": "u64"
        },
        {
          "name": "vrgdaStartTimestamp",
          "type": "i64"
        },
        {
          "name": "totalSupply",
          "type": "u64"
        },
        {
          "name": "r",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "vrgda",
      "discriminator": [
        159,
        20,
        71,
        78,
        42,
        222,
        122,
        203
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "amountCantBeZero",
      "msg": "amount cant be zero"
    },
    {
      "code": 6001,
      "name": "amountExceedsTotalSupply",
      "msg": "Buyer amount exceeds total supply"
    },
    {
      "code": 6002,
      "name": "addressesDontMatch",
      "msg": "address mismatch"
    },
    {
      "code": 6003,
      "name": "exponentErrorInTMinusFInverse",
      "msg": "exponent error in T minus F inverse"
    },
    {
      "code": 6004,
      "name": "exponentError",
      "msg": "Exponent error"
    },
    {
      "code": 6005,
      "name": "exponentTooLarge",
      "msg": "exponent too large"
    },
    {
      "code": 6006,
      "name": "oneMinusKError",
      "msg": "One minus k error"
    },
    {
      "code": 6007,
      "name": "logError",
      "msg": "Log error"
    },
    {
      "code": 6008,
      "name": "divisionError",
      "msg": "division error"
    },
    {
      "code": 6009,
      "name": "mathOverflow",
      "msg": "math overflow"
    },
    {
      "code": 6010,
      "name": "invalidDecayConstant",
      "msg": "Invalid decay constant percentage"
    },
    {
      "code": 6011,
      "name": "auctionEnded",
      "msg": "Auction has ended"
    },
    {
      "code": 6012,
      "name": "nonNegativeDecayConstant",
      "msg": "Decay constant should be negative"
    }
  ],
  "types": [
    {
      "name": "schedule",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "linearSchedule",
            "fields": [
              {
                "name": "r",
                "type": "u64"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "vrgda",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "authority",
            "docs": [
              "The account that receives payments."
            ],
            "type": "pubkey"
          },
          {
            "name": "targetPrice",
            "docs": [
              "The target price for a token (wad)."
            ],
            "type": "u128"
          },
          {
            "name": "decayConstantPercent",
            "docs": [
              "The decay constant (wad) computed as ln(1 - price_decay_percent)."
            ],
            "type": "u64"
          },
          {
            "name": "tokensSold",
            "docs": [
              "Number of tokens sold so far."
            ],
            "type": "u64"
          },
          {
            "name": "createdAtTimestamp",
            "docs": [
              "The timestamp at which this account was initialized."
            ],
            "type": "i64"
          },
          {
            "name": "vrgdaStartTimestamp",
            "docs": [
              "Unix timestamp when the VRGDA began."
            ],
            "type": "i64"
          },
          {
            "name": "auctionEnded",
            "docs": [
              "ended?"
            ],
            "type": "bool"
          },
          {
            "name": "schedule",
            "type": {
              "defined": {
                "name": "schedule"
              }
            }
          },
          {
            "name": "currentPrice",
            "type": "u64"
          },
          {
            "name": "bump",
            "docs": [
              "Bump for PDA."
            ],
            "type": "u8"
          }
        ]
      }
    }
  ]
};
