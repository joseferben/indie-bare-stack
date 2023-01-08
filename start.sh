#!/bin/sh
set -ex

# set up swap
fallocate -l 512M /swapfile
chmod 0600 /swapfile
mkswap /swapfile
echo 10 > /proc/sys/vm/swappiness
swapon /swapfile

# restore the database if it does not already exist
if [ -f $DATABASE_URL ]; then
  echo "Database already exists, skipping restore"
else
  echo "No database found, restoring from replica if exists"
  litestream restore -v -if-replica-exists -o $DATABASE_URL "${REPLICA_URL}"
fi

npm run migrate

litestream replicate -exec "npm run start" $DB_FILE "${REPLICA_URL}"



