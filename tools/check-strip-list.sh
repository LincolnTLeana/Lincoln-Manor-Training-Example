#!/usr/bin/env bash
# For IT: scans tracked and staged files for words that must never be committed.
# The word list lives in .strip-terms.txt (one term per line). That file is
# git-ignored on purpose, so the list itself (which includes people's names)
# never enters the repository.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
if [ ! -f .strip-terms.txt ]; then
  echo "Missing .strip-terms.txt: ask the project owner for the word list." >&2
  exit 2
fi
found=0
# reference/ holds the policy PDF, which is kept as-is with the project
# owner's approval, so it is skipped here.
files=$(git ls-files --cached --others --exclude-standard | grep -v '^reference/')
while IFS= read -r term; do
  [ -z "$term" ] && continue
  if hits=$(printf '%s\n' $files | xargs -r grep -n -i -F -- "$term" 2>/dev/null); then
    echo "FOUND \"$term\":"; echo "$hits"; found=1
  fi
done < .strip-terms.txt
if [ $found -eq 0 ]; then echo "Strip-list check: clean (reference/ skipped)"; else exit 1; fi
