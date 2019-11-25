# Introduction

The core contracts required by a daostack DAO are already deployed by the DAOstack team on mainnet as well as testnet and the addresses are available in [Migration.json](https://github.com/daostack/migration/blob/master/migration.json).
  
Though, you will need to deploy following contracts:

  - **Avatar**: The DAO's account that holds its assets.
  - **Controller**: Access Control of the DAO.
  - **Native Reputation**: Voting in Arc is done mainly using Reputation.
  - **Native Token**: ERC20 token Can be used in any way DAO would like.
  - **Custom schemes** (if any): Any new universal or non-universal scheme.

  Refer [Structure of DAOstack DAO](../../stack/arc/arcIntro/).
 
## How to Deploy?
There are 2 recommended ways to deploy DAOstack DAO

  - using Migration package
  - using [dOrg DAOcreator](https://dorg.tech/#/dao-creator)
  
### dOrg DAOcreator

DAOcreator is a tool with user friendly guided interface to launch a new DAO created by [dOrg](https://dorg.tech/#/about).

Limitations of current version:
  - cannot deploy custom schemes
  - cannot add multiple generic actions using generic schemes
  - in alpha stage

#### Process
  - Follow the instructions through the app to deploy the DAO.
  - Copy the output of deployment process, along with a brief description of your DAO and its purpose, and send it to @shivgupt on Telegram or to the dOrg contact as displayed on the output screen.
  - We will submit a PR to `github.com/daostack/subgraph` on your behalf.

### Migration package

  Either from CLI or using javascript. Example and full reference guide can be found at [Migration Reame](https://github.com/daostack/migration#daostack-migration)

  You can also find some example deployment setup and script in the DAOstacker Hacker Kit examples - [Starter Template](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/starter-template) and [FireStarter Kit](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/firestarter-example)

  NOTE: Universal Controller and Universal Generic Scheme has been discontinued for arc Version > 33. Please make sure of the following:
  - Set `"useUController": false`
  - If registering Generic Scheme to the DAO mention it in Custom Scheme section.
