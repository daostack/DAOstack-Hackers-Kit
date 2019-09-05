**[Client](https://github.com/daostack/client) is a library that facilitates access to Arc contracts without having to directly interact with the Ethereum blockchain.** It provides functions to interact with DAOstack contracts to vote, propose, stake and execute proposals.

Client library is also a wrapper around [DAOstack subgraph](https://github.com/daostack/sugbraph). It enable developers to interact with subgraph and execute various generic graph queries to access proposals, daos and other complex entities

Using Client, JavaScript/TypeScript developers can easily write scripts or applications which can interact with existing DAOs, submit proposals to DAOs, vote and stake on proposals, execute the resulting decisions, manage agent reputations. This is particularly helpful for developers who want to get the advantages of decentralized governance on the blockchain without dealing directly with a smart contract language.

### Should I work at this level?

You should use Client whenever you want to use JavaScript or TypeScript to interact with Arc contracts for voting, proposing etc or to execute generic GraphQL queries on subgraph for accessing blockchain data. If you are interacting with custom Arc contracts or custom subgraph, then you might have to write your own Web3 library to interact with contracts and/or query the subgraph.
