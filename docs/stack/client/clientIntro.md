**[Client](https://github.com/daostack/client) is a nodejs library that provides a helpful set of tools to interact with the DAOstack ecosystem.**

In particular, the  library provides an interface to

 - [DAOstack contracts](https://github.com/daostack/arc) and
 - [DAOstack subgraph](https://github.com/daostack/subgraph) (an index of on-chain data).

### Should I work at this level?

**Import client package as a dependency, if you are**

- developing a dApp in DAOstack platform (we are using it to build our [React App](https://github.com/daostack/alchemy) - [Alchemy](https://alchemy.daostack.io)) 
- writing nodejs scripts that interact with the [Arc Contracts](https://github.com/daostack/arc) and query data from the [subgraph](https://github.com/daostack/subgraph)

**Extend the client package, if you are** 

  - interacting with Arc contracts that are not yet supported by *Client.js*
  - modifying/Extending DAOstack subgraph
