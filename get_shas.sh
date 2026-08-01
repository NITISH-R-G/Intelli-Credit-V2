#!/bin/bash
repos=(
  "actions/checkout@v4"
  "actions/setup-node@v4"
  "github/codeql-action@v3"
  "actions/dependency-review-action@v4"
  "peter-evans/create-issue-from-file@v5"
  "peter-evans/create-or-update-comment@v4"
  "thollander/actions-comment-pull-request@v3"
  "actions/upload-artifact@v4"
  "actions/download-artifact@v4"
)

for repo_tag in "${repos[@]}"; do
  repo=$(echo $repo_tag | cut -d'@' -f1)
  tag=$(echo $repo_tag | cut -d'@' -f2)
  sha=$(git ls-remote "https://github.com/${repo}.git" "refs/tags/${tag}" | awk '{print $1}')
  if [ -z "$sha" ]; then
    sha=$(git ls-remote "https://github.com/${repo}.git" "refs/heads/${tag}" | awk '{print $1}')
  fi
  if [ -z "$sha" ]; then
    # if tag is just v3, it might be refs/tags/v3 or refs/heads/releases/v3
    sha=$(git ls-remote "https://github.com/${repo}.git" | grep "refs/tags/${tag}$" | awk '{print $1}')
  fi
  echo "$repo@$sha"
done
