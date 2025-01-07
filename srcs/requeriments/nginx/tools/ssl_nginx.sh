#!/bin/sh

DATA="/C=ES/L=MA/O=42/OU=phijano/CN=$DOMAIN_NAME"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $NG_KEY_PATH -out $NG_CERT_PATH -subj $DATA

exec nginx -g "daemon off;"
