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

# An event build builds only the event's decks; the generic build, every deck
if [ -n "${TRAINING_EVENT:-}" ]; then
    decks=$(node ./scripts/event-decks.mjs)
else
    decks=$(basename -a presentations/*/)
fi

for deck in $decks; do
    ./build.sh "presentations/${deck}/" "$repo_root"
done

node ./scripts/build-index.mjs

popd > /dev/null
