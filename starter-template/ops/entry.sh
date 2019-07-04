#!/bin/bash
set -e

npm run ganache & pid=$!
./wait-for-it.sh localhost:8545
npm run truffle-migrate
wait $pid
