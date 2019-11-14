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

const client = require('@daostack/client')
```

## General Structure

The client library provides a number of [Classes](https://daostack.github.io/client/docs/globals.html#classes) that represents the DAOstack entities and configuration.

- [Configuration](#initialization-arc-configuration)
    - [Arc](https://daostack.github.io/client/docs/classes/arc.html): holds the basic configuration i.e. which services to connect. Any use of the library will start with instantiating a new Arc instance
- [Entities](#entities-dao-proposals-vote-etc)
    - [DAO](https://daostack.github.io/client/docs/classes/dao.html): represents the DAOstack DAO and has all the informations about it.
    - [Reputation](https://daostack.github.io/client/docs/classes/reputation.html): represents native reputation contract of the DAO and its details
    - [Token](https://daostack.github.io/client/docs/classes/token.html): represents native token contract of the DAO and its details
    - [Member](https://daostack.github.io/client/docs/classes/member.html): represents holders of reputation i.e. voting power in the DAO
    - [Proposal](https://daostack.github.io/client/docs/classes/proposal.html): represents Proposal made in the DAO, they can belong to any of the Scheme's registered in the DAO
    - [Vote](https://daostack.github.io/client/docs/classes/vote.html): represents votes made on the proposal
    - [Stake](https://daostack.github.io/client/docs/classes/stake.html): represents stake made on the outcome of a proposal
    - [Reward](https://daostack.github.io/client/docs/classes/reward.html): represents rewards awarded by the DAO for a given proposal
    - [Scheme](https://daostack.github.io/client/docs/classes/scheme.html): represents the various schemes (ContributionReward, SchemeRegistrar, GenericScheme etc) registered to the DAO and to which a proposal can be made. Scheme determines the conditions and effects of executing the proposal
    - [Queue](https://daostack.github.io/client/docs/classes/queue.html): represents queues for each scheme registered to the DAO. The proposal is ordered in queue upon submission

