#!/bin/sh

user=$(whoami)
repo="$IPFS_PATH"

# Test whether the mounted directory is writable for us
if [ ! -w "$repo" 2>/dev/null ]; then
  echo "error: $repo is not writable for user $user (uid=$(id -u $user))"
  exit 1
fi

ipfs version

if [ -e "$repo/config" ]; then
  echo "Found IPFS fs-repo at $repo"
else
  ipfs init
fi

ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
# ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
  
# For the love of Krishna, do not use `--debug`!
# You can modify them later, けど. See
# https://ipfs.io/docs/commands/#ipfs-log-level
exec env IPFS_LOGGING=info ipfs daemon
