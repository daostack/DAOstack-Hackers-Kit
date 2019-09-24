  If you created a custom scheme or used any of the new arc scheme that are not yet tracked by subgraph, then you will have to make changes to DAOstack caching layer. 

  NOTE: You can skip this step if you do not wish to take advantage of caching layer for faster access and would rather read data directly from blockchain. But would recommend not to.

## Pre Work

  1. Clone subgraph repo, if you have not already

        git clone git@github.com:daostack/subgraph.git
  
  2. Create a new directory with your `scheme-name` in mappings

        cd subgraph
        mkdir src/mappings/BuyInWithRageQuitOpt

  3. Add contract abi to abis/'version' folder i.e. `abis/0.0.1-rc.24/BuyInWithRageQuitOpt.json`

        [
          {
            "constant": true,
            "inputs": [],
            "name": "avatar",
            "outputs": [
              {
                "internalType": "contract Avatar",
                "name": "",
                "type": "address"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "reputation",
            "outputs": [
              {
                "internalType": "contract Reputation",
                "name": "",
                "type": "address"
              }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "_member",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "_rep",
                "type": "uint256"
              }
            ],
            "name": "buyIn",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "_member",
                "type": "address"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "_rep",
                "type": "uint256"
              }
            ],
            "name": "rageQuit",
            "type": "event"
          },
          {
            "constant": false,
            "inputs": [
              {
                "internalType": "contract Avatar",
                "name": "_avatar",
                "type": "address"
              }
            ],
            "name": "initialize",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "constant": false,
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "constant": false,
            "inputs": [],
            "name": "quit",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ]

## Add contract mappings
      
We will create following files in `src/mappings/BuyInWithRageQuitOpt`:

### datasource.yaml

File containing the subgraph manifest `src/mappings/BuyInWithRageQuitOpt/datasource.yaml`

    abis:
      - BuyInWithRageQuitOpt
    entities:
      - Deposit
      - Quit
    eventHandlers:
      - event: buyIn(indexed address,uint256,uint256)
        handler: handleBuyIn
      - event: rageQuit(indexed address,uint256,uint256)
        handler: handleRageQuit

### schema.graphql

Describe what data is stored for your subgraph and how to query it via GraphQL `src/mappings/BuyInWithRageQuitOpt/schema.graphql`

NOTE: types are generated during the build step based on the entities described in schema.graphQL. Import these types while writing handlers in `mapping.ts`
    
        type Deposit @entity {
          id: ID!
          memberAddress: Bytes!
          amount: BigInt!
          rep: BigInt!
        }

        type Quit @entity {
          id: ID!
          memberAddress: Bytes!
          amount: BigInt!
          rep: BigInt!
        }

### mapping.ts

Describe how blockchain events are processed and stored in entities defined in your schema `src/mappings/BuyInWithRageQuitOpt/mapping.ts`

        import 'allocator/arena';

        import {
          store,
        } from '@graphprotocol/graph-ts';

        import * as domain from '../../domain';

        import {
          Deposit,
          Quit
        } from '../../types/schema';

        import { concat, equalsBytes, eventId } from '../../utils';

        import {
          buyIn,
          rageQuit,
        } from '../../types/BuyInWithRageQuitOpt/BuyInWithRageQuitOpt';

        export function handleBuyIn(event: buyIn): void {
          let ent = new Deposit(eventId(event));
          ent.memberAddress = event.params._member;
          ent.amount = event.params._amount;
          ent.rep = event.params._rep;

          store.set('Deposit', ent.id, ent);
        }

        export function handleRageQuit(event: rageQuit): void {
          let ent = new Quit(eventId(event));
          ent.memberAddress = event.params._member;
          ent.amount = event.params._amount;
          ent.rep = event.params._rep;

          store.set('Quit', ent.id, ent);
        }

## Integration test (optional)

Add integration for the subgraph `test/integration/MyContractName.spec.ts`

## Update Ops

Add your contract to `ops/mappings.json`. Under the JSON object for the network your contract is located at, under the `"mappings"` JSON array, add the following.

  - If your contract information is in the `migration.json` file specified (default is the file under `@daostack/migration` folder, as defined in the `ops/settings.js` file)

        {
           "name": "<contract name as appears in `abis/arcVersion` folder>",
           "contractName": "<contract name as appears in migration.json file>",
           "dao": "<section label where contract is defined in migration.json file (base/ dao/ test/ organs)>",
           "mapping": "<contract name from step 2>",
           "arcVersion": "<contract arc version>"
        },

OR

  - If your contract does not appear in the migration file:

        {
           "name": "<contract name as appears in `abis/arcVersion` folder>",
           "dao": "address",
           "mapping": "<MyContractName>",
           "arcVersion": "<contract arc version under which the abi is located in the `abis` folder>",
           "address": "<the contract address>"
        },


