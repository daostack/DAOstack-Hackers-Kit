# How to launch a new DAO?

  The core contracts required by a daostack DAO are already deployed by the DAOstack team on mainnet as well as testnet and the addresses are available in [Migration.json](https://github.com/daostack/migration/blob/master/migration.json). Though you need to deploy an Avatar, custom schemes (optional), native reputation and native token contract. Checkout [Structure of DAO](https://github.com/daostack/arc#arc) for details on Avatar, scheme, rep and token
 
  DAO can be deployed using Migration package either from CLI or using javascript. Example deployment setup and scripts are available in [Starter-template](https://github.com/daostack/DAOstack-Hackers-Kit/tree/master/starter-template)

  - Choose a name for your DAO and the native token and its symbol
  - Do you want to use DAOcreator contract?
      Deploying a DAO with DAOcreator contract saves number of transactions to be signed by bundling up founder rep and token distribution (upto 100 members) in single tx and initial scheme registration in single tx

  - Which schemes to include in the DAO?

    Schemes are the actions a DAOstack DAO can take when a proposal passes/fails. Currently supported schemes in Migrations package are:

    - ContributionReward: Enables fund management proposals that distribute funds to beneficiary once the proposal passes
    - GenericScheme: Enables Avatar to make arbitrary function calls to a specific contract. For eg use Avatar to submit a proposal to Genesis Alpha on behalf of your DAO
    - SchemeRegistrar: Lets you submit a proposal to register more schemes (apart from initial schemes set at time of deployment) to the DAO
    - GlobalConstraintRegistrar: Lets you submit a proposal to register more GlobalConstraints
    - UpgradeScheme: Lets you upgrade the controller. Since Controller is not a Scheme it cannot be changed via SchemeRegistrar

    Find detailed documentation re Schemes in [Arc Repo](https://github.com/daostack/arc)

  - Ucontroller vs Controller?
    Refer to documentation on Controllers
        
  - Decide on which Voting Machine to use and the parameters
    Set the voting machine parameters according to the needs of the organization. Currently you can deploy a DAO using migrations with only GenesisProtocol voting machine, which allows decision at timeout according to higher relative vote. You can find details about different voting machines supported by arc at https://github.com/daostack/arc/tree/master/docs/contracts/VotingMachines

  - Who gets the initial rep and token in DAO?
    Edit the list of founder members’ address along with the rep and/or token to be distributed initially. You may choose to give equal rep to all or have differentiated rep.

    Once you have decided on *dao-params* follow the instruction in *Migrations* or one of the examples to deploy your dao


