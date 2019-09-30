Scheme is an action a DAO on DAOstack platform can be enabled to take. Schemes might be used to help a DAO: propose and make investments, give reputation to agents, upgrade the DAO's contracts, register new schemes and constraints, etc.

Apart from the schemes already designed by DAOstack team - [Arc](https://github.com/daostack/arc/tree/master/contracts/), you can also deploy your own `Custom Schemes` and register them to the DAO.

A scheme could be,

  - **Universal**: inherit from [UniversalSchemeInterface](https://github.com/daostack/arc/blob/master/contracts/universalSchemes/UniversalSchemeInterface.sol) and are designed to be deployed once and any DAO can register to a universal scheme to enable the functionality offered by them.

  OR

  - **Non Universal**: do not follow any standard and do not inherit from UniversalSchemeInterface. A non universal scheme has to be deployed for each DAO separately.

## Which layer to customize

To Enable DAO with some custom actions, you will have to work on multiple layers of the stack

  - **Arc**: Design and Deploy the scheme contract which has the action DAO will execute.
  - **Migration**: deploy + register custom scheme to new DAO using migration script or deploy independently and register via another Scheme
  - **Subgraph**: develop subgraph tracker for your scheme for faster/efficient read access
  - **Client**: enable DAOstack client library to `write` to your `scheme contract` and `read` scheme data from `subgraph` using graphQL
  - **Alchemy**: enable user friendly interface for your scheme in Alchemy

## Tutorial
  
In following section we will see some sample code for adding a custom scheme to the DAO and enable Alchemy to interact with it.
We will be using [Alchemy-starter](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/alchemy-starter) for this tutorial

Depending on your requirements all or some parts of the tutorial might be useful for you.
