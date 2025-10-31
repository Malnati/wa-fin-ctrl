#!/bin/sh
# cloud/api/entrypoint.sh

set -e

# Guarantee extracted directory exists for wa-zip outputs
mkdir -p ./extracted

exec "$@"
