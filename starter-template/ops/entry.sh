#!/bin/bash
set -e

npm run ganache & ./wait-for-it.sh localhost:8545
npm run truffle-migrate
