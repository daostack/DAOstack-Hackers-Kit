if [ ! -z "$access_token" ]; then
    # set for production
    export graph_node="https://api.thegraph.com/deploy/"
    export ipfs_node="https://api.thegraph.com/ipfs-daostack/"

    # deploy mainnet
    export network="mainnet"
    export subgraph="daostack/master"
    export start_block=7400000
    npm run deploy

    # deploy rinkeby
    export network="rinkeby"
    export subgraph="daostack/master_rinkeby"
    start_block=0
    npm run deploy

    # Switch to staging key
    export access_token=$staging_access_token

    # set for production
    export graph_node="https://api.staging.thegraph.com/deploy/"

    # deploy mainnet
    export network="mainnet"
    export subgraph="daostack/master"
    start_block=7400000
    npm run deploy

    # deploy rinkeby
    export network="rinkeby"
    export subgraph="daostack/master_rinkeby"
    start_block=0
    npm run deploy
fi
