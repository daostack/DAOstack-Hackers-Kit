#!/bin/bash

CD=`pwd`

cd subgraph
npm i
opts='{ "migrationFile" : "'$CD'/data/migration.json", "subgraphName" : "daostack" }'
echo $opts
npm run deploy "$opts"
