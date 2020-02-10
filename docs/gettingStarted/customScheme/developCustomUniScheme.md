## Design Principle

*Universal* scheme is more **complex** than a non-universal one, since it serves multiple DAO (avatar)

Only single instance of universal scheme is deployed and it can be used by multiple DAOs with different parameters as registered with DAO's controller.

Recommended design principle :

  - should inherit the [Universal Scheme Interface](https://github.com/daostack/arc/blob/master/contracts/universalSchemes/UniversalSchemeInterface.sol)
  - should maintain a `bytes32 => Parameters` mapping
  - should emit `Avatar` address in the events.
  - should take `Avatar` as the parameter for scheme's proposal.

## Example

Refer to the universal schemes developed by the DAOstack team [here](https://github.com/daostack/arc/tree/master/contracts/universalSchemes)
