# Arc

Arc is a solidity smart contract library for building DAOs, uses Infra to provide decentralized organizations with voting machines and voting rights management systems. Is the base layer of the DAO stack. It defines the basic building blocks and standard components that can be used to implement any DAO.

DAOs built with Arc have a few basic contract components:

- **Avatar**: The DAO's "account". This contract represents the address of the DAO and holds its assets.
- **Reputation**: Voting in Arc is done mainly using Reputation. Reputation can be distributed and redistributed only by DAO decision, and it is generally given (via vote) to an agent according to their performance and contribution to a DAO.
- **Token**: Each DAO have its own token, which can be used in any way the DAO would like.
- **Controller**: Is the "Access Control" of the DAO, managing who can interact with which DAO functions and enforcing the DAO's constraints.
- **Plugins**: Are a DAO's "actions". Anything a DAO should act upon needs to be written and authorized by the controller as a plugin. Plugins might be used to help a DAO: propose and make investments, give reputation to agents, upgrade the DAO's contracts, register new plugins and constraints, etc.
- **Global Constraints**: Are limitations on a DAO's actions. When executing a plugin, the controller checks the constraints to see if the action violates them, and blocks the execution if it does. Some examples for constraints might be: the token supply can't be increased over 1M tokens, the organization won't use more than 60% of its funds at once, etc.

It has been built from the ground up with these principles in mind:

1. **Scalable Decentralized Governance** - Implements game theory & economic techniques (such as: monetization of attention, staking on proposal results, and more) that, even as the number of the participants gets very large, ensures high:
    - **Resilience** - resistance to a disproportionate decision power in the hands of minorities.
    - **Bandwidth** - decision making rate of the organization.

2. **Security** - Is community audited and embodies the best security guidelines and is very well tested.
3. **Interoperability & Compositionality** - Can integrate with any other ethereum based framework with ease. Organizations can interact with each other and form hierarchies and other complex structures.
4. **Modularity** - Is built in a modular way allowing anyone to extend and expand the ecosystem to support new use-cases.
5. **General purpose** - Provides a single unified simple model for building any DAO imaginable.