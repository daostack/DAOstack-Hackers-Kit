Scheme is an action a DAO deployed with DAOstack can be enabled to take.

A scheme could be,

  - **Universal**: inherit from [UniversalSchemeInterface](https://github.com/daostack/arc/blob/master/contracts/universalSchemes/UniversalSchemeInterface.sol) and are supposed to be deployed once

  OR

  - **Non Universal**: do not follow any standard and do not inherit from UniversalSchemeInterface

Arc repo have examples of some [Universal Scheme]("https://github.com/daostack/arc/tree/master/contracts/universalSchemes") and [Non Universal Scheme](https://github.com/daostack/arc/tree/master/contracts/schemes) developed by DAOstack team. Apart from the actions/schemes already designed by DAOstack, you can also deploy your Universal/Non-universal `Custom Schemes` and register them to the DAO.

## Add Custom Scheme

To Enable DAO with some custom actions, you will have to work on multiple layers of the stack

  - **Arc**: Deploy the scheme contract which has the action DAO will execute and how the proposal will be created.
  - **Subgraph**: For faster/efficient read access you will have to develop subgraph tracker for your scheme.
  - **Client**: To enable interaction with your scheme, update client library to `write` to you `scheme contract` and `read` scheme data from `subgraph` using graphQL.
  - **Alchemy**: Create user friendly interface for your scheme.

### Arc: Deploy Scheme Contract

#### Scheme design
