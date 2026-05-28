#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${TMPDIR:-/tmp}/shattered_bytes_report_build"

mkdir -p "$BUILD_DIR"
cd "$SCRIPT_DIR"

latexmk -gg -pdf -interaction=nonstopmode -halt-on-error -outdir="$BUILD_DIR" shattered_bytes_report.tex
cp "$BUILD_DIR/shattered_bytes_report.pdf" "$SCRIPT_DIR/shattered_bytes_report.pdf"

echo "Built $SCRIPT_DIR/shattered_bytes_report.pdf"
