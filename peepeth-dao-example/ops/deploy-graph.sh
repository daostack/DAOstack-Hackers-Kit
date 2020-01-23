#!/bin/bash

#CD=`pwd`
CD='/Users/shivgupt/Documents/projects/Github/DAOstack/DAOstack-Hackers-Kit/daico'

cd subgraph
npm ci
opts='{ "migrationFile" : "'$CD'/data/migration.json", "subgraphName" : "daostack" }'
echo $opts
npm run deploy "$opts"
