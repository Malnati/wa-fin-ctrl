#!/bin/bash
set -euo pipefail

echo "[entrypoint] Initializing WA Finance Control workspace..."

# Always start from a clean slate
echo "[entrypoint] Removing previously generated artefacts..."
if make remove-all; then
  echo "[entrypoint] Clean-up completed."
else
  echo "[entrypoint] Clean-up step reported issues, continuing with initialization."
fi

# Ensure required directories exist again
echo "[entrypoint] Recreating required directories..."
make create-directories

# Copy every available mass dataset into the input folder
echo "[entrypoint] Copying mass datasets into input/"
shopt -s nullglob
MASS_FILES=(massa/*.zip)
if (( ${#MASS_FILES[@]} > 0 )); then
  cp -v "${MASS_FILES[@]}" input/
else
  echo "[entrypoint] No mass data found under massa/. Continuing without copy."
fi
shopt -u nullglob

# Force a full processing so docs/index.html is regenerated before the API starts
echo "[entrypoint] Running full processing pipeline..."
poetry run python wa-fin.py processar --force
echo "[entrypoint] Processing finished."

echo "[entrypoint] Starting API server..."
exec "$@"
