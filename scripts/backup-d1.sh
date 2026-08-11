#!/usr/bin/env bash
set -euo pipefail

backup_dir="${1:-backups}"
mkdir -p "$backup_dir"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output_path="$backup_dir/auradigital-db-$timestamp.sql"

npx wrangler d1 export auradigital-db --remote --output "$output_path"
chmod 600 "$output_path"
echo "Encrypted storage is recommended for: $output_path"
