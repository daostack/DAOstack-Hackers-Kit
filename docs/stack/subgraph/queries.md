You can use GraphQL queries to get quick info from [DAOstack Subgraph](https://thegraph.com/explorer/subgraph/daostack/master) hosted on GraphExplorer.

This guide explains how to use GraphQL queries to get single or multiple Entities and sort, filter and paginate them.

The full list of `Subgraph Entities` cached by DAOstack subgraph can be found [here](../Entity)

## General Guidelines

  1. All queries must be wrapped inside `query {}` object.
  2. While querying, the Entity name is same as provided in [Entity list](../Entity) but starts with `lowerCase`.
  3. You can [query for single entity](#query-for-single-entity) by providing Entity `id`.
  4. You can [query for multiple Entities](#query-for-multiple-entities) by changing entity to plural. i.e. `proposal` -> `proposals`   
  5. The `complex-field` i.e. fields that are themselves an Entity such as *dao* and *proposals* in [below example](#query-for-single-entity), need to be proceeded with `{}` and provided with the subfield needed to be queried
  6. While you can Filter/Sort/Paginate complex subfield (Entity) array, the Top level Entity itself cannot be Filtered/Sorted/Paginated by complex fields.
  7. If no pagination limit is provided, by default a limit of *100* entities is used. Maximum pagination limit is 1000

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

#### Filter top level entity

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

<details>
  <summary> Genesis DAO proposals that contains word 'Reputation' in title
  </summary>

  <body>
```
query {
  proposals (
    where: {
      dao: "0x294f999356ed03347c7a23bcbcf8d33fa41dc830"
      title_contains: "Reputation"
    }
  ){
    title
    dao{
      name
    }
  }
}
```
  </body>
</details>

#### Filter complex subfield array

*Examples*

<details>
  <summary> Get rewards detail for all DAO where 250 GEN or more were awarded in DAO bounty </summary>

  <body>
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
  </body>
</details>

NOTE:
  
  - The suffix `_contains` in the above example is used for the comparison
  - Some suffixes are only supported for specific types. For example, Boolean only supports `_not`, `_in`, and `_not_in`.
  - <details>
    <summary> Complete list of suffix is </summary>
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

#### Sort complex subfield array

*Examples*

<details>
  <summary> Get all proposals from all the daos ordered by the date of submission </summary>

  <body>
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

NOTE: There is a limit of 1000 entities per query.

### Combine them all ...

You can combine the above parameters to create a more complex query

*Examples*

<details>
  <summary> Get top 6 boosted proposals that belong to either Genesis Alpha or DutchX  </summary>

  <body>
```
query{
  proposals(
    where: {
      dao_in: [
        "0x294f999356ed03347c7a23bcbcf8d33fa41dc830",
        "0x519b70055af55a007110b4ff99b0ea33071c720a"
      ]
      stage: "Boosted"
    }
    orderBy: createdAt
    orderDirection: asc
    first: 6
  ){
    title
    dao{
      name
    }
  }
}
```
  </body>
</details>


<details>
  <summary> Get top 3 reputation holders from all DAOstack </summary>

  <body>
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
  </body>
</details>
