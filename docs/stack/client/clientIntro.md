**[Client](https://github.com/daostack/client) is a nodejs library that provides a helpful set of tools to interact with the DAOstack ecosystem.**

In particular, the  library provides an interface to

 - [DAOstack contracts](https://github.com/daostack/arc) and
 - [DAOstack subgraph](https://github.com/daostack/subgraph) (an index of on-chain data).


 The client package can be used

 As a dependency for developing a client application (we are using it to build our [React dApp](https://github.com/daostack/alchemy) - [Alchemy](https://alchemy.daostack.io))

 or

 It can be used for writing nodejs scripts that interact with the contracts or for querying data from the subgraph.


### Should I work at this level?

If you are interacting with *Arc contracts* that are not yet supported by *Client.js* or *Modifying subgraph*, then you will have to extend/update the client library.
