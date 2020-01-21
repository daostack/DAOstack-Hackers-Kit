# Deployment

## Preparing the project

Open a new terminal session, clone the subgraph repository and get into the folder, you can do it by typing the following commands:

- `git clone https://github.com/daostack/subgraph.git`
- `cd subgraph`
- `npm install`

## Running on a Local Testing Environment

1. To run a local Graph Node instance, use the command: `npm run docker:run`. This will start the DAOstack ready Ganache container and all necessary Graph Node containers.

2. Run `npm run docker:logs graph-node` to view the logs of the Graph Node, wait for it to say it's waiting for Ethereum blocks (usually takes a few seconds). You can just leave it open for now and open a new terminal session at the same folder.

3. To deploy the subgraph into your local Graph Node, use the command: `npm run deploy`.

4. After the deploy finishes, you can monitor the indexing status of your subgraph by going to this URL: `http://localhost:8000/subgraphs/graphql` and running the following query:

    ```graphql
    {
      subgraphs {
        name
        currentVersion {
          deployment {
            synced # Is the subgraph synced
            failed # Did the subgraph failed while indexing
            latestEthereumBlockNumber # The latest block the the subgraph knows to exists
            totalEthereumBlocksCount # The latest block the finished indexing
          }
        }
      }
    }
    ```

5. To stop the containers use the command: `npm run docker:stop`.

### Switching an Ethereum Provider

If you'd like to use a different network you can do so either using our script (simpler) or by manually editing the `docker-compose.yml` file (more flexible). Here's how to use the script:

1. Create a `.env` file and add it an `ethereum_node` property equal to your Ethereum node URL. For example:

    ```bash
    ethereum_node="https://rinkeby.infura.io/v3/<YOUR_INFURA_KEY>"
    ```

2. Follow the deployment process, only instead of using `npm run docker:run`, use one of the options below according to the Ethereum network you use:
    - `npm run docker:run-rinkeby`
    - `npm run docker:run-kovan`
    - `npm run docker:run-mainnet`

## Indexing a new DAO

To index a new DAO:

1. Open the `daos` folder.

2. Inside it open the folder according to the network you use.

3. Inside that folder, create a new JSON file, which you can name after your DAO, and write into it the following information:

    ```json
    {
      "name": "<YOUR_DAO_NAME>",
      "Avatar": "<YOUR_DAO_AVATAR_ADDRESS>",
      "DAOToken": "<YOUR_DAO_DAOTOKEN_ADDRESS>",
      "Reputation": "<YOUR_DAO_REPUTATION_ADDRESS>",
      "Controller": "<YOUR_DAO_CONTROLLER_ADDRESS>",
      "arcVersion": "<THE_ARC_VERSION_YOUR_DAO_USE>"
    }
    ```

    Here's an example for how a completed file might look:

    ```json
    {
      "name": "Endemic Bunny",
      "Avatar": "0x0DB24A927FFC3622884B7A3B6f1C694ED8092A01",
      "DAOToken": "0x97681569c1007380DEc7075E5aCb6020Be36eC83",
      "Reputation": "0x06ef7018Af25ec846aDe8f8B5cB591A914a46347",
      "Controller": "0x141e94d9888F9399891f070aFc8eE76eA08B6DbB",
      "arcVersion": "0.0.1-rc.19"
    }
    ```

4. Restart your Graph Node (if you're running it locally) and follow the deployment process.
