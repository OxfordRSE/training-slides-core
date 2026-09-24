#!/usr/bin/env bash

set -euo pipefail

pushd "$(dirname "$0")" > /dev/null

if [ $# -lt 1 ]; then
    echo "Usage: $0 <presentation_directory> [repo_root]" >&2
    exit 1
fi

dir="$1"
repo_root="${2:-}"

presentation_name=$(basename "$dir")
echo "Presentation name: $presentation_name"

# compute base path correctly whether repo_root is empty or not
if [ -n "$repo_root" ]; then
  base="/${repo_root}/${presentation_name}/"
else
  base="/${presentation_name}/"
fi

# Build straight from presentations/: shared components, layouts and styles
# come from the addon in common/addon, which every deck loads
npx slidev build --out "${PWD}/dist/${presentation_name}" --base "${base}" "presentations/${presentation_name}/slides.md"

# Slidev leaves a cache in node_modules/.slidev next to the entry file
rm -rf "presentations/${presentation_name}/node_modules"

popd > /dev/null
