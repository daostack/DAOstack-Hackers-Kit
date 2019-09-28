# Designing a new voting machine

## What are the voting options

Decide on what kind of voting mechanism does your voting machine offer.

The IntVoteInterface works for when you have integer options
  e.g. What is DAO's favourite color? - Option: Red, Blue or White

But if your problem can have a float vote you may need say FloatVoteInterface
  e.g. How much % of DAO's wealth should be in Eth? - Options any positve floating number i.e. 0.00 - 100.00%

Or maybe it falls in neither of above two and you have something more creative in mind

## Create the Interface

An interface describes the basic structure any voting machine offering the said vote options should implement. IntVoteInterface already exists but anything other would need to be implemented.

Note: implementing interface is not really important but falls into Object Oriented Programming practices

## Create the voting Logic

Even if your voting machine offers say Integer voting option, it is not necessary it has the similar voting mechanism as say GenesisProtocol.

So inherent the relevant voting interface and implement the logic for its structure (methods).

## Create the Machine specific logic

Apart from the voting mechanism your voting machine could use the DAOstack's staking token or DAO's native token or any other creative stuff you think of. Since this is not core voting logic, again by the principles of OOP (modular approach), it is advisable to put this in a separate file.

## Summary

You can design a new voting machine other that GenesisProtocol, by inheriting voting logic and interface that already exists or start from the scratch based on your needs.

You can also have every thing in just one file - MyVotingMachine.sol and not inherit from IntVoteInterface or VotingMachineLogic, but for better programming practices (refer to OOP concept for details) it is advisable to separate it.

Hope this is helpful 😄
