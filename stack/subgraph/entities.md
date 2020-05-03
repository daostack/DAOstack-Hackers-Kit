There are two types of Entities tracked by DAOstack subgraph

  - _**Base Entity**_: Entity composed be indexing individual events emitted by multiple DAOstack core contracts
  - _**Domain Entity**_: High level complex Entity that infer information and consolidates `Base Entities`.

## **Domain Entity**
  
Following is the list of all top level Domain Entities

<details>
  <summary>
    DAO
  </summary>

  - id: ID!<br/>
  - name: String!<br/>
  - nativeToken: Token!<br/>
  - nativeReputation: Rep!<br/>
  - proposals: [Proposal!]<br/>
  - reputationHolders: [ReputationHolder!]<br/>
  - reputationHoldersCount: BigInt!<br/>
  - rewards: [GPReward!]<br/>
  - register: String!<br/>
  - schemes: [ControllerScheme!]<br/>
  - gpQueues: [GPQueue!]<br/>
  - numberOfQueuedProposals: BigInt!<br/>
  - numberOfPreBoostedProposals: BigInt!<br/>
  - numberOfBoostedProposals: BigInt!<br/>
  - numberOfExpiredInQueueProposals: BigInt!<br/>

</details>

<details>
  <summary>
    GPQueue
  </summary>

  - id: ID!<br/>
  - threshold: BigInt!<br/>
  - scheme: ControllerScheme<br/>
  - dao: DAO!<br/>
  - votingMachine: Bytes!<br/>

</details>

<details>
  <summary>
    Rep
  </summary>

  - id: ID!<br/>
  - dao: DAO<br/>
  - totalSupply: BigInt!<br/>
</details>

<details>
  <summary>
    Token
  </summary>

	- id: ID!<br/>
	- dao: DAO<br/>
	- name: String!<br/>
	- symbol: String!<br/>
	- totalSupply: BigInt!<br/>
</details>

<details>
  <summary>
    Proposal
  </summary>

	- id: ID!<br/>
	- dao: DAO!<br/>
	- proposer: Bytes!<br/>
	- stage: String!<br/>
	- createdAt: BigInt!<br/>
	- preBoostedAt: BigInt<br/>
	- boostedAt: BigInt<br/>
	- quietEndingPeriodBeganAt: BigInt<br/>
	- closingAt: BigInt<br/>
	- executedAt: BigInt<br/>
	- totalRepWhenExecuted: BigInt<br/>
	- totalRepWhenCreated: BigInt<br/>
	- votingMachine: Bytes!<br/>
	- executionState: String!<br/>
	- paramsHash: Bytes!<br/>
	- organizationId: Bytes!<br/>
	- confidenceThreshold: BigInt!<br/>
 <br/>
	- descriptionHash: String!<br/>
	- title: String<br/>
	- description: String<br/>
	- url: String<br/>
	- fulltext: [String!]<br/>
 <br/>
	- gpRewards: [GPReward!] @derivedFrom(field: "proposal")<br/>
	- accountsWithUnclaimedRewards: [Bytes!]<br/>
	- expiresInQueueAt: BigInt!<br/>
 <br/>
	- votes: [ProposalVote!] @derivedFrom(field: "proposal")<br/>
	- votesFor: BigInt!<br/>
	- votesAgainst: BigInt!<br/>
	- winningOutcome: Outcome!<br/>
 <br/>
	- stakes: [ProposalStake!] @derivedFrom(field: "proposal")<br/>
	- stakesFor: BigInt!<br/>
	- stakesAgainst: BigInt!<br/>
	- confidence: BigDecimal!<br/>
 <br/>
	- gpQueue: GPQueue!<br/>
 <br/>
	- scheme: ControllerScheme<br/>
 <br/>
	- contributionReward: ContributionRewardProposal<br/>
 <br/>
	- genericScheme : GenericSchemeProposal<br/>
 <br/>
  	- schemeRegistrar : SchemeRegistrarProposal<br/>
 <br/>
	- genesisProtocolParams : GenesisProtocolParam!<br/>
</details>

<details>
  <summary>
    Tag
  </summary>

  <body>
  </body>
</details>

<details>
  <summary>
    ProposalStake
  </summary>

	- id: ID!<br/>
	- createdAt: BigInt!<br/>
	- staker: Bytes!<br/>
	- proposal: Proposal!<br/>
	- dao: DAO!<br/>
	- outcome: Outcome!<br/>
	- amount: BigInt!<br/>
</details>

<details>
  <summary>
    ProposalVote
  </summary>

	- id: ID!<br/>
	- createdAt: BigInt!<br/>
	- voter: Bytes!<br/>
	- proposal: Proposal!<br/>
	- dao: DAO!<br/>
	- outcome: Outcome!<br/>
	- reputation: BigInt!<br/>
</details>

<details>
  <summary>
    GPRewardsHelper
  </summary>

   	- id: ID!<br/>
    - gpRewards: [PreGPReward!]<br/>
</details>

<details>
  <summary>
    PreGPReward
  </summary>

	- id: ID!<br/>
	- beneficiary: Bytes!<br/>
</details>

<details>
  <summary>
    GPReward
  </summary>

	- id: ID!<br/>
	- createdAt: BigInt!<br/>
	- dao: DAO!<br/>
	- beneficiary: Bytes!<br/>
	- proposal: Proposal!<br/>
	- reputationForVoter: BigInt<br/>
	- tokensForStaker: BigInt<br/>
	- daoBountyForStaker: BigInt<br/>
	- reputationForProposer: BigInt<br/>
	- tokenAddress: Bytes<br/>
	- # timestamps of the redeem events<br/>
	- reputationForVoterRedeemedAt: BigInt!<br/>
	- tokensForStakerRedeemedAt: BigInt!<br/>
	- reputationForProposerRedeemedAt: BigInt!<br/>
	- daoBountyForStakerRedeemedAt: BigInt!<br/>
</details>

<details>
  <summary>
    FirstRegisterSchemeFlag
  </summary>

	- id: ID!<br/>
</details>

<details>
  <summary>
    ContractInfo
  </summary>

	- id: ID!<br/>
	- name: String!<br/>
	- alias: String!<br/>
	- version: String!<br/>
	- address: Bytes!<br/>
</details>

## **Base Entity**

Following is the list of base entities

### **Avatar**

<details>
  <summary>
    AvatarContract
  </summary>

	- id: ID!<br/>
	- address: Bytes!<br/>
	- name: String!<br/>
	- nativeToken: Bytes!<br/>
	- nativeReputation: Bytes!<br/>
	- balance: BigInt!<br/>
	- owner: Bytes!<br/>
</details>

### **ContributionReward**

<details>
  <summary>
    ContributionRewardRedeemReputation
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- beneficiary: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- amount: BigInt!<br/>
</details>

<details>
  <summary>
    ContributionRewardRedeemNativeToken
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- beneficiary: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- amount: BigInt!<br/>
</details>

<details>
  <summary>
    ContributionRewardRedeemExternalToken
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- beneficiary: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- amount: BigInt!<br/>
</details>

<details>
  <summary>
    ContributionRewardRedeemEther
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- beneficiary: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- amount: BigInt!<br/>
</details>

<details>
  <summary>
    ContributionRewardProposalResolved
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- passed: Boolean<br/>
</details>

<details>
  <summary>
    ContributionRewardNewContributionProposal
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- beneficiary: Bytes!<br/>
	- descriptionHash: String!<br/>
	- externalToken: Bytes!<br/>
	- votingMachine: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- reputationReward: BigInt!<br/>
	- nativeTokenReward: BigInt!<br/>
	- ethReward: BigInt!<br/>
	- externalTokenReward: BigInt!<br/>
	- periods: BigInt!<br/>
	- periodLength: BigInt!<br/>
</details>

<details>
  <summary>
    ContributionRewardProposal
  </summary>

	- id: ID!<br/>
	- proposalId: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- beneficiary: Bytes!<br/>
	- descriptionHash: String!<br/>
	- externalToken: Bytes!<br/>
	- votingMachine: Bytes!<br/>
	- reputationReward: BigInt!<br/>
	- nativeTokenReward: BigInt!<br/>
	- ethReward: BigInt!<br/>
	- externalTokenReward: BigInt!<br/>
	- periods: BigInt!<br/>
	- periodLength: BigInt!<br/>
	- executedAt: BigInt<br/>
	- alreadyRedeemedReputationPeriods: BigInt<br/>
	- alreadyRedeemedNativeTokenPeriods: BigInt<br/>
	- alreadyRedeemedEthPeriods: BigInt<br/>
	- alreadyRedeemedExternalTokenPeriods: BigInt<br/>
</details>

### **Controller**

<details>
  <summary>
    ControllerOrganization
  </summary>

	- id: ID!<br/>
	- avatarAddress: Bytes!<br/>
	- nativeToken: TokenContract!<br/>
	- nativeReputation: ReputationContract!<br/>
	- controller: Bytes!<br/>
</details>

<details>
  <summary>
    ControllerScheme
  </summary>

	- id: ID!<br/>
	- dao: DAO!<br/>
	- paramsHash: Bytes!<br/>
	- canRegisterSchemes: Boolean<br/>
	- canManageGlobalConstraints: Boolean<br/>
	- canUpgradeController: Boolean<br/>
	- canDelegateCall: Boolean<br/>
	- gpQueue: GPQueue<br/>
	- address: Bytes!<br/>
	- name: String<br/>
	- version: String<br/>
	- alias: String<br/>
	- contributionRewardParams: ContributionRewardParam<br/>
	- schemeRegistrarParams: SchemeRegistrarParam<br/>
	- uGenericSchemeParams: UGenericSchemeParam<br/>
	- genericSchemeParams: GenericSchemeParam<br/>
	- numberOfQueuedProposals: BigInt!<br/>
	- numberOfPreBoostedProposals: BigInt!<br/>
	- numberOfBoostedProposals: BigInt!<br/>
	- numberOfExpiredInQueueProposals: BigInt!<br/>
</details>

<details>
  <summary>
    ControllerGlobalConstraint
  </summary>

	- id: ID!<br/>
	- address: Bytes!<br/>
	- paramsHash: Bytes!<br/>
	- type: String!<br/>
</details>

<details>
  <summary>
    ControllerRegisterScheme
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- controller: Bytes!<br/>
	- contract: Bytes!<br/>
	- scheme: Bytes!<br/>
</details>

<details>
  <summary>
    ControllerUnregisterScheme
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- controller: Bytes!<br/>
	- contract: Bytes!<br/>
	- scheme: Bytes!<br/>
</details>

<details>
  <summary>
    ControllerUpgradeController
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- controller: Bytes!<br/>
	- newController: Bytes!<br/>
</details>

<details>
  <summary>
    ControllerAddGlobalConstraint
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- controller: Bytes!<br/>
	- globalConstraint: Bytes!<br/>
	- paramsHash: Bytes!<br/>
	- type: String!<br/>
</details>

<details>
  <summary>
    ControllerRemoveGlobalConstraint
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- controller: Bytes!<br/>
	- globalConstraint: Bytes!<br/>
	- isPre: Boolean<br/>
</details>

<details>
  <summary>
    ContributionRewardParam
  </summary>

	- id: ID!<br/>
	- votingMachine : Bytes!<br/>
	- voteParams: GenesisProtocolParam!<br/>
</details>

<details>
  <summary>
    SchemeRegistrarParam
  </summary>

	- id: ID!<br/>
	- votingMachine : Bytes!<br/>
	- voteRegisterParams : GenesisProtocolParam!<br/>
	- voteRemoveParams : GenesisProtocolParam!<br/>
</details>

<details>
  <summary>
    UGenericSchemeParam
  </summary>

	- id: ID!<br/>
	- votingMachine : Bytes!<br/>
	- voteParams: GenesisProtocolParam!<br/>
	- contractToCall: Bytes!<br/>
</details>

<details>
  <summary>
    GenericSchemeParam
  </summary>

	- id: ID!<br/>
	- votingMachine : Bytes!<br/>
	- voteParams: GenesisProtocolParam!<br/>
	- contractToCall: Bytes!<br/>
</details>

<details>
  <summary>
    GenesisProtocolParam
  </summary>

	- id: ID!<br/>
	- queuedVoteRequiredPercentage: BigInt!<br/>
	- queuedVotePeriodLimit: BigInt!<br/>
	- boostedVotePeriodLimit: BigInt!<br/>
	- preBoostedVotePeriodLimit: BigInt!<br/>
	- thresholdConst: BigInt!<br/>
	- limitExponentValue: BigInt!<br/>
	- quietEndingPeriod: BigInt!<br/>
	- proposingRepReward: BigInt!<br/>
	- votersReputationLossRatio: BigInt!<br/>
	- minimumDaoBounty: BigInt!<br/>
	- daoBountyConst: BigInt!<br/>
	- activationTime: BigInt!<br/>
	- voteOnBehalf: Bytes!<br/>
</details>

<details>
  <summary>
    FirstRegisterScheme
  </summary>

	- id: ID!<br/>
</details>

### **DAORegistry**

<details>
  <summary>
    DAORegistryContract
  </summary>

	- id: ID!<br/>
	- address: Bytes!<br/>
	- owner: Bytes!<br/>
</details>

### **DAOToken**

<details>
  <summary>
    TokenContract
  </summary>

	- id: ID!<br/>
	- address: Bytes!<br/>
	- totalSupply: BigInt!<br/>
	- owner: Bytes!<br/>
	- tokenHolders: [String!]<br/>
</details>

<details>
  <summary>
    TokenHolder
  </summary>

	- id: ID!<br/>
	- contract: Bytes!<br/>
	- address: Bytes!<br/>
	- balance: BigInt!<br/>
</details>

<details>
  <summary>
    Allowance
  </summary>

	- id: ID!<br/>
	- token: Bytes!<br/>
	- owner: Bytes!<br/>
	- spender: Bytes!<br/>
	- amount: BigInt!<br/>
</details>

<details>
  <summary>
    TokenTransfer
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- from: Bytes!<br/>
	- to: Bytes!<br/>
	- value: BigInt!<br/>
</details>

<details>
  <summary>
    TokenApproval
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- owner: Bytes!<br/>
	- spender: Bytes!<br/>
	- value: BigInt!<br/>
</details>

### GenesisProtocol

<details>
  <summary>
    GenesisProtocolProposal
  </summary>

	- id: ID!<br/>
	- proposalId: Bytes!<br/>
	- submittedTime: BigInt!<br/>
	- proposer: Bytes!<br/>
	- daoAvatarAddress: Bytes!<br/>
	- numOfChoices: BigInt<br/>
	- executionState: Int<br/>
	- state: Int<br/>
	- decision: BigInt<br/>
	- executionTime: BigInt<br/>
	- totalReputation: BigInt<br/>
	- paramsHash: Bytes!<br/>
	- address: Bytes!<br/>
</details>

<details>
  <summary>
    GenesisProtocolVote
  </summary>

	- id: ID!<br/>
	- avatarAddress: Bytes!<br/>
	- voterAddress: Bytes!<br/>
	- reputation: BigInt!<br/>
	- voteOption: BigInt!<br/>
	- proposalId: GenesisProtocolProposal!<br/>
</details>

<details>
  <summary>
    GenesisProtocolStake
  </summary>

	- id: ID!<br/>
	- avatarAddress: Bytes!<br/>
	- stakerAddress: Bytes!<br/>
	- prediction: BigInt!<br/>
	- stakeAmount: BigInt!<br/>
	- proposalId: GenesisProtocolProposal!<br/>
</details>

<details>
  <summary>
    GenesisProtocolRedemption
  </summary>

	- id: ID!<br/>
	- rewardId: GenesisProtocolReward!<br/>
	- proposalId: ID!<br/>
	- redeemer: Bytes!<br/>
</details>

<details>
  <summary>
    GenesisProtocolReward
  </summary>

	- id: ID!<br/>
	- type: GenesisProtocolRewardType<br/>
	- amount: BigInt!<br/>
</details>

<details>
  <summary>
    GenesisProtocolExecuteProposal
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- organization: Bytes!<br/>
	- decision: BigInt!<br/>
	- totalReputation: BigInt!<br/>
</details>

<details>
  <summary>
    GenesisProtocolGPExecuteProposal
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- executionState: Int<br/>
</details>

### **Reputation**

<details>
  <summary>
    ReputationContract
  </summary>

	- id: ID!<br/>
	- address: Bytes!<br/>
	- totalSupply: BigInt!<br/>
	- reputationHolders: [String!]<br/>
</details>

<details>
  <summary>
    ReputationHolder
  </summary>

	- id: ID!<br/>
	- contract: Bytes!<br/>
	- address: Bytes!<br/>
	- balance: BigInt!<br/>
	- dao: DAO<br/>
	- createdAt: BigInt!<br/>
</details>

<details>
  <summary>
    ReputationMint
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- address: Bytes!<br/>
	- amount: BigInt!<br/>
</details>

<details>
  <summary>
    ReputationBurn
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- address: Bytes!<br/>
	- amount: BigInt!<br/>
</details>

### **SchemeRegistrar**

<details>
  <summary>
    SchemeRegistrarNewSchemeProposal
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- votingMachine: Bytes!<br/>
	- scheme: Bytes!<br/>
	- paramsHash: Bytes!<br/>
	- permission: Bytes!<br/>
	- descriptionHash: String!<br/>
</details>

<details>
  <summary>
    SchemeRegistrarRemoveSchemeProposal
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- votingMachine: Bytes!<br/>
	- scheme: Bytes!<br/>
	- descriptionHash: String!<br/>
</details>

<details>
  <summary>
    SchemeRegistrarProposalExecuted
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatar: Bytes!<br/>
	- proposalId: Bytes!<br/>
	- decision : BigInt!<br/>
</details>

<details>
  <summary>
    SchemeRegistrarProposal
  </summary>

	- id: ID!<br/>
	- dao: DAO!<br/>
	- schemeToRegister: Bytes<br/>
	- schemeToRegisterParamsHash: Bytes<br/>
	- schemeToRegisterPermission: Bytes<br/>
  - schemeToRemove: Bytes<br/>
  - decision: BigInt<br/>
  - schemeRegistered: Boolean<br/>
  - schemeRemoved: Boolean<br/>
</details>

### **UController**

<details>
  <summary>
    UControllerOrganization
  </summary>

	- id: ID!<br/>
	- avatarAddress: Bytes!<br/>
	- nativeToken: TokenContract!<br/>
	- nativeReputation: ReputationContract!<br/>
	- controller: Bytes!<br/>
</details>

<details>
  <summary>
    UControllerGlobalConstraint
  </summary>

	- id: ID!<br/>
	- avatarAddress: Bytes!<br/>
	- address: Bytes!<br/>
	- paramsHash: Bytes!<br/>
	- type: String!<br/>
</details>

<details>
  <summary>
    UControllerRegisterScheme
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- controller: Bytes!<br/>
	- contract: Bytes!<br/>
	- avatarAddress: Bytes!<br/>
	- scheme: Bytes!<br/>
</details>

<details>
  <summary>
    UControllerUnregisterScheme
  </summary>

	- id: ID!
	- txHash: Bytes!
	- controller: Bytes!
	- contract: Bytes!
	- avatarAddress: Bytes!
	- scheme: Bytes!
</details>

<details>
  <summary>
    UControllerUpgradeController
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- controller: Bytes!<br/>
	- avatarAddress: Bytes!<br/>
	- newController: Bytes!<br/>
</details>

<details>
  <summary>
    UControllerAddGlobalConstraint
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- controller: Bytes!<br/>
	- avatarAddress: Bytes!<br/>
	- globalConstraint: Bytes!<br/>
	- paramsHash: Bytes!<br/>
	- type: String!<br/>
</details>

<details>
  <summary>
    UControllerRemoveGlobalConstraint
  </summary>

	- id: ID!<br/>
	- txHash: Bytes!<br/>
	- controller: Bytes!<br/>
	- avatarAddress: Bytes!<br/>
	- globalConstraint: Bytes!<br/>
	- isPre: Boolean<br/>
</details>

### **UGenericScheme**

<details>
  <summary>
    GenericSchemeProposal
  </summary>

    - id: ID!<br/>
 	  - dao: DAO!<br/>
 	  - contractToCall: Bytes!<br/>
    - callData: Bytes!<br/>
    - value: BigInt!<br/>
    - executed: Boolean!<br/>
    - returnValue: Bytes<br/>
</details>
