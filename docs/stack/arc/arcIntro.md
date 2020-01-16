**[Arc](https://github.com/daostack/arc) is a Solidity smart contract library for building DAOs.** To get a good understanding of how the Arc framework is built, you can go to [this blog post](https://medium.com/daostack/the-arc-platform-2353229a32fc). Arc uses Infra to provide decentralized organizations with voting machines and voting rights management systems.

DAOs built with Arc have a few basic contract components:

- **Avatar** - The DAO's "account." This contract represents the address of the DAO and holds its assets.
- **Reputation** - Voting in Arc is done mainly using Reputation. Reputation can be distributed and redistributed only by DAO decision, and it is generally given (via vote) to an agent according to their performance and contribution to a DAO.
- Token - Each DAO may have its own token, which can be used in any way the DAO would like.
- **Controller** - The controller is the "Access Control" of the DAO, managing who can interact with which DAO functions and enforcing the DAO's constraints.
- **Schemes** - Schemes are a DAO's "actions": anything a DAO should act upon needs to be written and authorized by the controller as a scheme. Schemes might be used to help a DAO: propose and make investments, give reputation to agents, upgrade the DAO's contracts, register new schemes and constraints, etc.
- **Global Constraints** - Global constraints are limitations on a DAO's actions. When executing a scheme, the controller checks the constraints to see if the action violates them, and blocks the execution if it does. Some examples for constraints might be: the token supply can't be increased over 1M tokens, the organization won't use more than 60% of its funds at once, etc.

**Arc utilizes the concept of "Universal" contracts**: contracts which are deployed once, and then can be used by any number of DAOs simultaneously, saving gas and deployment costs. Schemes and constraints can both be used in this way. To use the already deployed contracts, you can either use Client, which maintains easy access to all universal Arc contracts, or you can use [Migration.json](https://github.com/daostack/migration/blob/master/migration.json) to view the addresses of the universal contracts of the latest arc version on the mainnet, Kovan, Rinkeby and Ganache\*
All contracts listed in the file are universal, meaning that users should use them when needed and not redeploy them.

_\* Please note that the Ganache addresses are based on the DAOstack commands for running and deploying Arc to a local Ganache network, which means those addresses might change if you are using a different method to run Ganache or deploy Arc._

### Should I work at this level?

Using Arc is not necessary to deploy a DAO (you can do this with [Migrations](https://github.com/daostack/migration) currently and in the future as an end user of Dapps), but you might want to work on this layer if you need your DAO to have a unique action, constraint, or voting process that is not yet implemented on Arc.

You can find the complete Arc docs here: [https://daostack.github.io/arc](https://daostack.github.io/arc)
