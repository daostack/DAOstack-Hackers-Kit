#!/bin/bash

current_directory=`pwd`

cd subgraph
#npm i
opts='{ "migrationFile" : "'$current_directory'/data/migration.json", "subgraphName" : "daostack" }'
npm run deploy "$opts"
