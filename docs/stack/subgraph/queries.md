To get quick info running GraphQL queries in browser is very handy.

Say you want to get list of all regular proposals (with id, title, proposer) in Genesis DAO, you can run the following query in [Graph Explorer](https://thegraph.com/explorer/subgraph/daostack/v30_1)

    query {
      proposals
      (
        where: {
          dao: "0x294f999356ed03347c7a23bcbcf8d33fa41dc830",
          stage: "Queued"
        }
      ){
        id
        title
        proposer{ id }
      }
    }
