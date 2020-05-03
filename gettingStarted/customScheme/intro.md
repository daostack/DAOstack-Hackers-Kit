# Custom Schemes
Scheme is an action a DAO on DAOstack platform can be enabled to take. Schemes might be used to help a DAO: propose and make investments, give reputation to agents, upgrade the DAO's contracts, register new schemes and constraints, etc.

Apart from the schemes already designed by DAOstack team - [Arc](https://github.com/daostack/arc/tree/master/contracts/), you can also deploy your own `Custom Schemes` and register them to the DAO.

A scheme could be,

  - **Universal**: inherit from [UniversalSchemeInterface](https://github.com/daostack/arc/blob/master/contracts/universalSchemes/UniversalSchemeInterface.sol) and are designed to be deployed once and any DAO can register to a universal scheme to enable the functionality offered by them.

  OR

  - **Non Universal**: do not follow any standard and do not inherit from UniversalSchemeInterface. A non universal scheme has to be deployed for each DAO separately.

## Which layer to customize

To Enable DAO with some custom actions, you might need to work on multiple layers of the stack

  - **Arc**: Design and Deploy the scheme contract which has the action DAO will execute.
  - **Migration**: deploy + register custom scheme to new DAO using migration script or deploy independently and register via another Scheme
  - **Subgraph**: develop subgraph tracker for your scheme for faster/efficient read access
  - **Client**: enable DAOstack client library to `write` to your `scheme contract` and `read` scheme data from `subgraph` using graphQL
  - **Alchemy**: enable user friendly interface for your scheme in Alchemy

## Tutorial
  
In following section we will see some sample code for adding a custom scheme to the DAO and enabling graph-node to cache the events from the scheme and client to interact with the scheme.

Depending on your requirements all or some parts of the tutorial might be useful for you.

### Overview

Choose the project setup from any of the [Hacker-kit Examples](https://github.com/daostack/DAOstack-Hackers-Kit)

  - Follow the tutorial for [Universal Scheme](../developCustomUniScheme/) or [Non-Universal Scheme](../developCustomNonUniScheme/)
  - Add your custom scheme contract to `contracts` folder. Compile using truffle

        npm run compile

  - **Deploy with [New DAO](../registerToNewDAO)**
        
    npm run migrate

OR

  - **Deploy and register to [Existing DAO](../registerToExistingDAO/)**

  - **Update subgraph and deploy**: Make changes to subgraph refer [Update subgraph](../subgraphForNewScheme/) tutorial and deploy graph

    npm run deploy:graph

  - **Update client and build**: Update client to interact with your scheme, refer [Update client](../clientForNewScheme/) tutorial

    npm run build:client
    npm run link:client

To develop on the client in tandem with alchemy, start watcher

    npm run watch:client

  - Work on your own front-end or update alchemy to support your scheme as you desire
