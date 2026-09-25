#!/bin/bash
get_sha() {
  repo=$1
  tag=$2
  if [ -z "$tag" ]; then
      git ls-remote https://github.com/$repo.git refs/heads/main 2>/dev/null | awk '{print $1}'
  else
      git ls-remote --tags https://github.com/$repo.git "refs/tags/$tag" | awk '{print $1}'
  fi
}

echo "actions/checkout@v4: $(get_sha actions/checkout v4.2.2)"
echo "actions/setup-node@v4: $(get_sha actions/setup-node v4.1.0)"
echo "github/codeql-action/init@v3: $(get_sha github/codeql-action v3.28.10)"
echo "github/codeql-action/autobuild@v3: $(get_sha github/codeql-action v3.28.10)"
echo "github/codeql-action/analyze@v3: $(get_sha github/codeql-action v3.28.10)"
echo "peter-evans/create-or-update-comment@v4: $(get_sha peter-evans/create-or-update-comment v4.0.0)"
echo "thollander/actions-comment-pull-request@v3: $(get_sha thollander/actions-comment-pull-request v3.0.1)"
echo "peter-evans/create-issue-from-file@v5: $(get_sha peter-evans/create-issue-from-file v5.0.1)"
echo "peter-evans/create-pull-request@v7: $(get_sha peter-evans/create-pull-request v7.0.6)"
