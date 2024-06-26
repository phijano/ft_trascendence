#!/bin/sh

pg_ctl start -D $DATABASE_PATH

psql --command="CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';"
psql --command="CREATE DATABASE $DB_NAME;"
psql --command="ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

pg_ctl stop -D $DATABASE_PATH

exec postmaster -D $DATABASE_PATH
