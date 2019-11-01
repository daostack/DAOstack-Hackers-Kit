You can use GraphQL queries to get quick info from [DAOstack Sunbgraph](https://thegraph.com/explorer/subgraph/daostack/v30_1) hosted on GraphExplorer.

This guide explains how to use GraphQL queries to get single or multiple Entities and sort, filter and paginate them.

The full list of `Subgraph Entities` cached by DAOstack subgraph can be found [here](../Entity)

## General Guidelines

  1. All queries must be wrapped inside `query {}` object.
  2. Entity name is same as provided in [Entity list](../Entity) but in `lower case`.
  3. You can [query for single entity](#query-for-single-entity) by providing Entity `id`.
  4. You can [query for multiple Entities](#query-for-multiple-entities) by changing entity to plural. i.e. `proposal` -> `proposals`   

## Query for single Entity

When you query for single Entity with all/some fields, you need to provide the Entity id.

*Examples*
<details>
  <summary> Details of Genesis DAO `0x294f999356ed03347c7a23bcbcf8d33fa41dc830` </summary>

  <body>
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
  </body>
</details>

<details>
  <summary> Details of Proposal `0x0025c38d987acba1f1d446d3690384327ebe06d15f1fa4171a4dc3467f8bd416` </summary>

<body>
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
</body>
</details>

NOTE:

  - The `complex-field` i.e. fields that are themselves an Entity such as *dao* and *proposals* in above example, need to be wrapped in `{}` and provided with the subfield needed to be queried

## Query for Multiple Entities
 
### Query all

Just change the entity name to plural to query for all the entities of that type

*Examples*
<details>
  <summary> Details of all `daos` indexed by the DAOstack subgraph </summary>

  <body>
```
query {
  daos{
    name
    id
    reputationHoldersCount
    proposals{
      id
      title
    }
  }
}
```
  </body>
</details>

<details>
  <summary> Details of all `Reputation Holders` in DAOstack DAOs </summary>

  <body>
```
query {
  reputationHolders {
    id
    address
    balance
    dao{
      name
    }
  }
}
```
  </body>
</details>

### Filter by fields

To query for a subset of Entities you can add `where: {}` parameter to filter for different properties. You can filter for single or multiple properties.

*Examples*

<details>
  <summary> To get all proposals submitted on 2019 Halloween, we can filter for the time interval on `createdAt` property </summary>

  <body>
```
query {
  proposals (
    where : {
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
  </body>
</details>

<details>
  <summary> Get all `daos` with more than 200 reputation holders </summary>

  <body>
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
  </body>
</details>

### Sort by field values

*Examples*

To query for a sorted list you can add `orderBy` parameter to sort by a specific property. Also, you can specify the direction of sort `asc` for ascending and `desc` for descending.

<details>
  <summary> Sort Reputation Holders by their reputation balance</summary>

  <body>
```
query {
  reputationHolders(
    orderBy: balance,
    orderDirection: desc
  ){
    address
    balance
  }
}
```
  </body>
</details>

<details>
  <summary> Sort DAOs by number of boosted proposals it has </summary>

  <body>
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
  </body>
</details>

### Paginate

You can also decrease the size of set queried by specifying the pagination limit

*Examples*

#### From the beginning

<details>
  <summary> Get first 3 DAOs based on highest number of reputation holders </summary>

  <body>
```
query{
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
  </body>
</details>

#### From the middle

<details>
  <summary> Get all DAOs except the first 5 </summary>

  <body>
```
query{
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
  </body>
</details>

<details>
  <summary> Get the next 3 DAOs after the top 3 </summary>

  <body>
```
query {
  daos (
    skip: 3
    first: 3
    orderBy: reputationHoldersCount
    orderDirection: desc
  ) {

    You
  	name
 		reputationHoldersCount
	}
}
```
  </body>
</details>

### Combine them all ...

You can combine the above parameters to create a more complex query

*Examples*

<details>
  <summary> Get top 3 boosted proposals from Genesis DAO </summary>

  <body>
```
query {
  proposals (
    where: {
      dao: "0x294f999356ed03347c7a23bcbcf8d33fa41dc830",
      stage: "Boosted"
    }
    orderBy: createdAt
    orderDirection: asc
    first: 3
  ) {

    title
  }
}
```
  </body>
</details>
