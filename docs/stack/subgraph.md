# Subgraph

**[Subgraph](https://github.com/daostack/subgraph) indexes the blockchain data and stores it in postgres database for easy and quick access.** The subgraph runs on a Graph Node which is a server that developers can run local or remote. The data store can be queried by GraphQL endpoints. [DAOstack subgraph](https://subgraph.daostack.io/) is based on graphprotocol, checkout [The Graph documentation](https://thegraph.com/docs/quick-start) for more details. The Graph opens their server to others and you can find [daostack subgraph](https://thegraph.com/explorer/subgraph/daostack/master) at Graph Explorer.

You can use GraphQL queries to get quick info from [DAOstack Subgraph](https://thegraph.com/explorer/subgraph/daostack/master) hosted on GraphExplorer.

This guide explains how to use GraphQL queries to get single or multiple Entities and sort, filter and paginate them.

The full list of `Subgraph Entities` cached by DAOstack subgraph can be found [here](https://subgraph.daostack.io/)

## General Guidelines

1. All queries must be wrapped inside `query {}` object.
2. While querying, the Entity name is same as provided in [the schema of the subgraph](https://subgraph.daostack.io/)
3. You can [query for single entity](#query-for-single-entity) by providing Entity `id`.
4. You can [query for multiple Entities](#query-for-multiple-entities) by changing entity to plural. i.e. `proposal` -> `proposals`
5. The `complex-field` i.e. fields that are themselves an Entity such as _dao_ and _proposals_ in [below example](#query-for-single-entity), need to be proceeded with `{}` and provided with the subfield needed to be queried
6. While you can Filter/Sort/Paginate complex subfield (Entity) array, the Top level Entity itself cannot be Filtered/Sorted/Paginated by complex fields.
7. If no pagination limit is provided, by default a limit of _100_ entities is used. Maximum pagination limit is 1000

### Query for single Entity

When you query for single Entity with all/some fields, you need to provide the Entity id.

_**Examples**_
Details of Genesis DAO `0x294f999356ed03347c7a23bcbcf8d33fa41dc830`

```
query {
  dao (id: "0x294f999356ed03347c7a23bcbcf8d33fa41dc830") {
    name
    numberOfQueuedProposals
    numberOfBoostedProposals
    numberOfPreBoostedProposals
    proposals{
      title
    }
    reputationHoldersCount
  }
}
```

Details of Proposal `0x0025c38d987acba1f1d446d3690384327ebe06d15f1fa4171a4dc3467f8bd416`

```
query {
  proposal (id: "0x0025c38d987acba1f1d446d3690384327ebe06d15f1fa4171a4dc3467f8bd416") {
    proposer
    createdAt
    expiresInQueueAt
    title
    votesFor
    votesAgainst
    dao {
      id
      name
    }
  }
}
```

### Query for Multiple Entities

#### Query all

Just change the entity name to plural to query for all the entities of that type

_**Examples**_
Details of all `daos` indexed by the DAOstack subgraph

```
query {
  daos {
    name
    id
    reputationHoldersCount
    proposals {
      id
      title
    }
  }
}
```

Details of all `Reputation Holders` in DAOstack DAOs

```
query {
  reputationHolders {
    id
    address
    balance
    dao {
      name
    }
  }
}
```

### Filter by fields

To query for a subset of Entities you can add `where: {}` parameter to filter for different properties. You can filter for single or multiple properties.

#### Filter top level entity

_**Examples**_

To get all proposals submitted on 2019 Halloween, we can filter for the time interval on `createdAt` property

```
query {
  proposals (
    where: {
      createdAt_gt: 1572480000,
      createdAt_lt: 1572566400
    }
  ) {
    id
    title
    dao {
      name
    }
  }
}
```

Get all `daos` with more than 200 reputation holders

```
query {
  daos (
    where: {
      reputationHoldersCount_gt: 200
  }) {
    name
    reputationHoldersCount
  }
}
```

Genesis DAO proposals that contains word 'Reputation' in titl

```
query {
  proposals (
    where: {
      dao: "0x294f999356ed03347c7a23bcbcf8d33fa41dc830"
      title_contains: "Reputation"
    }
  ){
    title
    dao {
      name
    }
  }
}
```

#### Filter complex subfield array

_**Examples**_
Get rewards detail for all DAO where 250 GEN or more were awarded in DAO bounty

```
query {
  daos {
    name
    rewards (
      where: {
        daoBountyForStaker_gte: "250000000000000000000"
      }
    ){
      proposal {
        id
      }
      daoBountyForStaker
    }
  }
}
```

NOTE:

- The suffix `_contains` in the above example is used for the comparison
- Some suffixes are only supported for specific types. For example, Boolean only supports `_not`, `_in`, and `_not_in`.
- <details>
   Complete list of suffix is
    - _not
    - _gt
    - _lt
    - _gte
    - _lte
    - _in
    - _not_in
    - _contains
    - _not_contains
    - _starts_with
    - _ends_with
    - _not_starts_with
    - _not_ends_with
  </details>

### Sort by field values

#### Sort top level entity

_**Examples**_

To query for a sorted list you can add `orderBy` parameter to sort by a specific property. Also, you can specify the direction of sort `asc` for ascending and `desc` for descending.
Sort Reputation Holders by their reputation balanc

```
query {
  reputationHolders (
    orderBy: balance,
    orderDirection: desc
  ){
    address
    balance
  }
}
```

Sort DAOs by number of boosted proposals it has

```
query {
  daos (
    orderBy: numberOfBoostedProposals,
    orderDirection: asc
  ) {
    name
    numberOfBoostedProposals
  }
}
```

#### Sort complex subfield array

_**Examples**_
Get all proposals from all the daos ordered by the date of submission

```
query {
  daos {
  	proposals (
      orderBy: createdAt,
      orderDirection: desc
    ){
      title
    }
  }
}
```

#### Paginate

You can also decrease the size of set queried by specifying the pagination limit

_**Examples**_

#### From the beginning

Get first 3 DAOs based on highest number of reputation holders

```
query {
  daos (
    first: 3
    orderBy: reputationHoldersCount
    orderDirection: desc
  ) {
    name
    numberOfBoostedProposals
  }
}
```

#### From the middle

Get all DAOs except the first 5

```
query {
  daos (
    skip: 5
    orderBy: reputationHoldersCount
    orderDirection: desc
  ) {
    name
    numberOfBoostedProposals
  }
}
```

Get the next 3 DAOs after the top 3

```
query {
  daos (
    skip: 3
    first: 3
    orderBy: reputationHoldersCount
    orderDirection: desc
  ) {
    name
    reputationHoldersCount
  }
}
```

NOTE: There is a limit of 1000 entities per query.

### Combine them all ...

You can combine the above parameters to create a more complex query

_Examples_
Get top 6 boosted proposals that belong to either Genesis Alpha or DutchX

```gql
query {
  proposals(
    where: {
      dao_in: [
        "0x294f999356ed03347c7a23bcbcf8d33fa41dc830"
        "0x519b70055af55a007110b4ff99b0ea33071c720a"
      ]
      stage: "Boosted"
    }
    orderBy: createdAt
    orderDirection: asc
    first: 6
  ) {
    title
    dao {
      name
    }
  }
}
```

Get top 3 reputation holders from all DAOstack

```
query {
  daos {
    name
    reputationHolders (
      orderBy: balance
      orderDirection: desc
      first: 3
    ){
      address
      balance
    }
  }
}
```
