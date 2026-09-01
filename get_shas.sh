#!/bin/bash
get_sha() {
  repo=$1
  tag=$2
  sha=$(curl -s "https://api.github.com/repos/$repo/git/refs/tags/$tag" | grep '"sha"' | cut -d '"' -f 4)
  if [ -z "$sha" ]; then
    sha=$(curl -s "https://api.github.com/repos/$repo/commits/$tag" | grep '"sha"' | head -1 | cut -d '"' -f 4)
  fi
  echo "$repo@$sha"
}

get_sha "actions/checkout" "v4"
get_sha "actions/setup-node" "v4"
get_sha "peter-evans/create-or-update-comment" "v4"
get_sha "peter-evans/create-issue-from-file" "v5"
get_sha "peter-evans/create-pull-request" "v7"
get_sha "thollander/actions-comment-pull-request" "v3"
