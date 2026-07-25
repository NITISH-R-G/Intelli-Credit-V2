#!/bin/bash
git ls-remote https://github.com/$1.git refs/tags/$2^{} | awk '{print $1}'
