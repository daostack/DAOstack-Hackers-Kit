#!/bin/bash
set -e

npm run ganache & pid=$!
./wait-for-it.sh localhost:8545
node migrations/deployDao.js
wait $pid
