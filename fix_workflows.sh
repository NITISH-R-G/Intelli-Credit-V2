#!/bin/bash
# AI PR review line 16 has an issue reported by sonarcloud, likely because checking out `base.ref` is unsafe or some other reason. Let's check Sonar rules.
# Wait, SonarCloud says "See more on https://sonarcloud.io/project/issues?id=NITISH-R-G_Intelli-Credit-V2&issues=AaDZq7CqAmSfjuFc7dly&open=AaDZq7CqAmSfjuFc7dly&pullRequest=205"
# Usually it's because checking out untrusted code. But we explicitly used `github.event.pull_request.base.ref`.
# Ah! "Make sure that this 'checkout' action is secure" -> `ref: ${{ github.event.pull_request.base.ref }}` might be flagged because github contexts can be maliciously manipulated. Wait. Sonar might not like `${{ github.event.pull_request.base.ref }}`? Or maybe it needs to be set via env var? No, `actions/checkout` with `pull_request_target` is generally fine if checking out `base` but maybe we should just remove `ref:` since by default `actions/checkout` on `pull_request_target` checks out the base branch anyway!
