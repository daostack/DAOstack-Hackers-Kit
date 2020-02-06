#!/bin/bash

CD=`pwd`
cd node_modules/@daostack/subgraph
npm i

opts='{ "migrationFile" : "'$CD'/data/migration.json", "subgraphName" : "daostack" }'

npm run deploy "$opts"

cd ../../../
