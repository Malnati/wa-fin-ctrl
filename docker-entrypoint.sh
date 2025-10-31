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

# Processa cada arquivo de massa sequencialmente
echo "[entrypoint] Preparing mass datasets for processing..."
shopt -s nullglob
MASS_FILES=(massa/*.zip)
if (( ${#MASS_FILES[@]} == 0 )); then
  echo "[entrypoint] No mass data found under massa/. Continuing without preprocessing."
else
  first_run=1
  for mass_file in "${MASS_FILES[@]}"; do
    echo "[entrypoint] Processing mass file: ${mass_file}"
    rm -rf input/*
    cp -v "${mass_file}" input/

    if (( first_run )); then
      echo "[entrypoint] Running full processing pipeline (force mode)..."
      poetry run python wa-fin.py processar --force
      first_run=0
    else
      echo "[entrypoint] Running incremental processing..."
      poetry run python wa-fin.py processar
    fi
  done
  echo "[entrypoint] All mass files processed."
fi
shopt -u nullglob

echo "[entrypoint] Starting API server..."
exec "$@"
