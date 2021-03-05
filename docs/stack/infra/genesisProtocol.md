# Genesis Protocol

Genesis Protocol is an organization's voting machine implemented by DAOstack team. It leverages the **Holographic Consensus** mechanism for scaling the decentralized governance system.

You can find details on design principles and high level overview [here](https://medium.com/daostack/holographic-consensus-part-1-116a73ba1e1c)

In this article we will go through some technical details of Genesis Protocol

Each DAO can set the following Genesis Protocol parameters according to organization's need, while setting the scheme parameters:

  - **activationTime**: The point (represented in Unix time) in time when proposing and voting are activated.
  - **boostedVotePeriodLimit**: The length of time that voting is open for boosted proposals.
  - **daoBountyConst**: This is multiplied by the average downstake on boosted proposals to calculate how large the DAO’s automatic downstake should be.
  - **minimumDaoBounty**: The minimum amount of GEN a DAO will stake when automatically downstaking each proposal.
  - **preBoostedVotePeriodLimit**: The length of time that a proposal must maintain a confidence score higher than the boosting threshold to become eligible for boosting.
  - **proposingRepReward**: The amount of voting power given out as a reward for submitting a proposal that the DAO passes.
  - **queuedVotePeriodLimit**: The length of time that voting is open for non-boosted proposals.
  - **queuedVoteRequiredPercentage**: The quorum required to decide a vote on a non-boosted proposal.
  - **quietEndingPeriod**: The length of time a vote’s potential result needs to stay the same in order to be confirmed as the official result.
  - **thresholdConst**: Controls how quickly the required confidence score for boosting goes up as the number of currently boosted proposals rises.
  - **voteOnBehalf**:
  - **votersReputationLossRatio**: The percentage of a voter’s voting power they stand to lose if they vote against the DAO’s eventual decision on a non-boosted proposal.

  For more details and story around each param refer [this article](https://daostack.zendesk.com/hc/en-us/articles/360002000537-Genesis-Protocol-v0-2-Parameters-Explained)

## What is Staking?

For a proposal to pass with a relative majority, it must have sufficient stake in favor of the proposal.

You can use your **GEN** tokens to stake in favor of or against the proposal. Once the stakes in favor of the proposal reaches the bar it is ready to be boosted.

## How does proposal state changes after staking?

An open proposal (i.e. with pending decision) can be in one of the following stages:

  - **Queued**: All proposals when submitted are in _queued_ state and by default have downstake > 0. This is decided by `minimumDaoBounty` parameter. The proposal requires absolute majority (i.e. > 50% vote) to pass in this state.
  - **PreBoosted**: Once the stakes in favor of the proposal crosses the boosting bar it moves from _queued_ to _preboosted_ state. The boosting bar is decided by following genesis parameters and current dao state.

    ```
    stakes(For)/stakes(Against) > (thresholdConst)^(#aready-boosted-proposals)
    ```

    The proposal in this state is open for staking and can be moved back to _queued_ state if the stake against is increases and the above equation becomes false.

  - **Boosted**: Once the proposal has been in _preboosted_ state for period set `preBoostedVotePeriodLimit` parameter, the proposal moves to boosted state. The proposal in this state requires relative majority to pass (i.e votes(For) > votes(Against)).

    The proposal in this state is open for voting but cannot be staked on. Thus, once a proposal is boosted it cannot be moved back to _queued_ or _preboosted_ state.

    The proposal stays in this state until `boostedVotePeriodLimit` elapse.

  - **QuietEndingPeriod**: If the winning outcome of the proposal flips from 'pass' to 'fail' or vice-versa during the last period decided by `quietEndingPeriod` parameter, then the proposal voting get extended by `quietEndingPeriod` time and the proposal enters the _quietEndingPeriod_.

  The proposal's outcome must not change for the `quietEndingPeriod` amount of time for the decision to be made. Else the voting on proposal keeps getting increased by the `quietEndingPeriod` amount of time until the above condition is true.


## Staking Rewards

  Following are the possible outcomes of a proposal:

  - The proposal expires in queue without any decision: In this case all the stakes are returned to the respective staker.

  - The proposal passes: 

    ```
     Staker(stake(for) amount)*daoBounty/(total winning stake)
    ```

  - The proposal fails: Loosing stake is lost

## Caveats

- For a given proposal one can stake multiple times from the same address. In such a case all the subsequent stakes must in align with previous stake's vote i.e. if staked in favor of the proposal earlier you must stake in favor of the proposal in subsequent stakes

- While you can stake against the proposal in pre-boosted state, the staking stops once the proposal is in boosted state.
