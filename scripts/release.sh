#!/bin/bash
set -e

# Release decy: bump the version, commit, tag, push. The pushed tag triggers the GitHub "Release"
# workflow, which checks, tests, builds and publishes to npm.
#
# Usage:   ./scripts/release.sh <version>
# Example: ./scripts/release.sh 1.0.0   or   ./scripts/release.sh 1.0.0-alpha.1

usage() {
  echo "Usage: ./scripts/release.sh <version>"
  echo "  example: ./scripts/release.sh 1.0.0"
  exit 1
}

VERSION="$1"
[ -z "$VERSION" ] && usage

# semver: 1.2.3 or 1.2.3-alpha.1
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-.+)?$ ]]; then
  echo "Error: version must be semver (e.g. 1.0.0 or 1.0.0-alpha.1)"
  exit 1
fi

NPM_NAME=$(node -p "require('./package.json').name")
TAG="v${VERSION}"

# Release ONLY from an up-to-date `main` (learned in jasy): a feature branch strands the bump commit,
# a stale main bumps the wrong base.
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
  echo "Error: releases must run on 'main', but you are on '$BRANCH'."
  echo "Run:  git checkout main && git pull"
  exit 1
fi

# The fetch only refreshes the remote ref for this check. If you are behind, YOU pull.
git fetch --quiet origin main || { echo "Error: could not fetch origin/main to verify you are up to date."; exit 1; }
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
  echo "Error: local 'main' is not in sync with origin/main - pull (or push) first, then re-run."
  echo "  local:  $LOCAL"
  echo "  origin: $REMOTE"
  exit 1
fi

# The working tree must be clean: we commit and tag exactly the version bump.
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: working tree not clean. Commit or stash first."
  exit 1
fi

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "Error: tag $TAG already exists."
  exit 1
fi

echo "Release $NPM_NAME v$VERSION  (tag: $TAG)"
read -r -p "Push the tag and let CI publish to npm? [y/N] " ok
[ "$ok" = "y" ] || [ "$ok" = "Y" ] || { echo "Aborted."; exit 1; }

node -e "
const fs = require('fs');
const j = JSON.parse(fs.readFileSync('package.json', 'utf8'));
j.version = '$VERSION';
fs.writeFileSync('package.json', JSON.stringify(j, null, 2) + '\n');
"

git add package.json
git commit -m "release: $NPM_NAME v$VERSION"
git tag "$TAG"
git push origin HEAD
git push origin "$TAG"

echo ""
echo "Done. The Release workflow will publish $NPM_NAME v$VERSION to npm."
