# Arc 2.0

> What's new on the latest version of DAOstack architecture?

## Overview

- Arc 2.0 significantly eases DAO deployment, plugin management, and general gas costs, all this while increasing security.
- Its main objectives is to improve security, flexibility, user experience, and developer accessibility.

## The changes
1. **None universal plugins**  
- All plugins are none universal which means a separate plugin instance per DAO. 
- This reduces complexity at the contract level and increases security.

2. **All contracts are proxy upgradable contracts.**
- Enable upgrades to DAO contracts implementations while maintaining addresses and storage.
- The DAO serves as the proxy admin of its own contracts.
- This increases security, UX, and enables upgradability.

3. **Arc.Hive**  
- ArcHive is an on-chain repository of all approved (Registered) DAOstack contract implementations.  
- Contract/DAOs which have been registered / verified in the ArcHive will be automatically indexed and show up in Alchemy (higher layers of the stack)
- Plugins which would like to be added to the ArcHive need to be approved and verified by DAOstack. We aspire to have this managed by the community in the future.
- The ArcHive architecture increases security via a tool that validates contracts and implementation in a trust-minimized way.
4. DAOFactory
- DAO deployment in a seamless process, in a single transacation
- DAO deployment cost is reduced by a factor of 10.
- Use ArcHive contracts to create a DAO
- DAO Factory DAOs will be indexed and will be shown in alchemy.
- DAO creation is made fast, Cheap and with far better UX.
5. PluginFactory
- Simplified process of the “Plugin Manager” in updating / adding of plugins to the DAO.
- Plugin parameters are passed via the plugin add proposal.
- A new Plugin instance is created and deployed upon execution.
- GenesisProtocol parameters are set upon plugin Init, no need to pre-deploy governance parameters
- Easy and friendly UX
5. Tx Cost
- Optimization was done to genesis protocol and plugins structure to reduce gas required for proposing/voting/staking.
6. Subgraph auto indexing
- All Arc.Hive plugins/DAOs are automatically indexed by subgraph (no need to manually index).
7. Misc
- NFT management plugin - send/mint/list
- Arc.react - enable easy custom react ui components on top of subgraph and arc.js
- JoinAndQuit and funding request
- Token Trade - Send and receive tokens from/to the organization.
- Key value on chain database
- Etherscan/blockscout contract verification upon DAO deployment.
- Full xDAI support with ERC20 token contract bridge.