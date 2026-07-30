#!/bin/bash
actions=(
  "actions/checkout@v4"
  "actions/setup-node@v4"
  "github/codeql-action@v3"
  "actions/dependency-review-action@v4"
  "actions/first-interaction@v1"
  "actions/labeler@v5"
  "release-drafter/release-drafter@v6"
  "actions/stale@v9"
  "actions/github-script@v7"
  "peter-evans/create-or-update-comment@v4"
  "thollander/actions-comment-pull-request@v3"
  "peter-evans/create-issue-from-file@v5"
  "actions/upload-artifact@v4"
  "actions/download-artifact@v4"
)

for action in "${actions[@]}"; do
  repo=$(echo $action | cut -d'@' -f1)
  tag=$(echo $action | cut -d'@' -f2)
  sha=$(git ls-remote "https://github.com/$repo.git" "refs/tags/$tag" | awk '{print $1}')
  if [ -z "$sha" ]; then
    # Sometimes it's a branch not a tag
    sha=$(git ls-remote "https://github.com/$repo.git" "refs/heads/$tag" | awk '{print $1}')
  fi
  # If still empty, grab HEAD of default branch
  if [ -z "$sha" ]; then
    sha=$(git ls-remote "https://github.com/$repo.git" HEAD | awk '{print $1}')
  fi
  echo "$repo@$sha"
done
