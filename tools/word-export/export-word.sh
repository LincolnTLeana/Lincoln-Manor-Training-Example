#!/usr/bin/env bash
# For IT: rebuilds the Word copies in exports/word from the Markdown documents.
# Needs pandoc. Uses reference.docx for fonts and margins.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
for f in docs/*.md docs/templates/*.md; do
  pandoc "$f" -f gfm -t docx --reference-doc=tools/word-export/reference.docx -o "exports/word/$(basename "$f" .md).docx"
done
echo "Word exports rebuilt."
