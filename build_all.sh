#!/usr/bin/env bash
set -euo pipefail

repo_root="${1:-}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ ! -d "${script_dir}/presentations" ]; then
  >&2 echo "Error: 'presentations' directory not found."
  >&2 echo "It should be present in a normal checkout of this repository."
  exit 1
fi

pushd "$(dirname "$0")" > /dev/null

rm -rf dist
mkdir -p dist

for dir in presentations/*/; do
    ./build.sh "$dir" "$repo_root"
done

node ./scripts/build-index.mjs

popd > /dev/null
