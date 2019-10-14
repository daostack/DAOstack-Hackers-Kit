You might want to update client library while working on Alchemy integration if you added new contract or updated subgraph

## Pre Work

  1. Make sure you have cloned client submodule, if you have not already

        git submodule update --init
  
## Update Client
  1. Add source code
    -Class: Scheme `client/src/schemes.ts`
    - *ISchemeStaticState*:

## Integration Tests
  1. Create test spec
  2. Start test watcher while you update the client

        npm run test:watch:client -- test/scheme-buyInWithRageQuitOpt.spec.ts

## Build and Link new client
    
From main alchemy starter folder

      npm run build:client
      npm run link:client
