## Installation

Install the package with npm or yarn
```sh
npm install @daostack/client

# Or

yarn add @daostack/client
```

## Import

Once installed, import the module in your project

```js
import { Arc } from '@daostack/client'

//Or

const { Arc } = require('@daostack/client')
```

## General Structure

The client library provides a number of [Classes](https://daostack.github.io/client/docs/globals.html#classes) that represent the DAOstack entities and configuration.

- [Configuration](#initialization-arc-configuration)
    - [Arc](https://daostack.github.io/client/docs/classes/arc.html): holds the basic configuration i.e. which services to connect to. Any use of the library will start with instantiating a new Arc instance
- [Entities](#entities-dao-proposals-vote-etc) represents information of DAOstack basic blocks.
    - [DAO](https://daostack.github.io/client/docs/classes/dao.html): the DAOstack DAO and all its information.
    - [Reputation](https://daostack.github.io/client/docs/classes/reputation.html): native reputation contract of the DAO.
    - [Token](https://daostack.github.io/client/docs/classes/token.html): token contracts, including the native token of the DAO.
    - [Member](https://daostack.github.io/client/docs/classes/member.html): holders of reputation i.e. who have voting power in the DAO.
    - [Proposal](https://daostack.github.io/client/docs/classes/proposal.html): Proposal made in the DAO. Proposals belong to Schemes registered in the DAO.
    - [Vote](https://daostack.github.io/client/docs/classes/vote.html): votes made on the proposal.
    - [Stake](https://daostack.github.io/client/docs/classes/stake.html): stake made on the outcome of a proposal.
    - [Reward](https://daostack.github.io/client/docs/classes/reward.html): rewards awarded by the DAO for a given proposal.
    - [Scheme](https://daostack.github.io/client/docs/classes/scheme.html): the various schemes (ContributionReward, SchemeRegistrar, GenericScheme etc) registered to the DAO and to which a proposal can be made. Scheme determines the conditions and effects of executing the proposal.
    - [Queue](https://daostack.github.io/client/docs/classes/queue.html): queues for each scheme registered to the DAO. The proposal is ordered in queue upon submission.

Follow the [How to use](../howToUseClient) guide for working details of client library.
