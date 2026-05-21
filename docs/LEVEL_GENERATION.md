# Level Generation

This document explains how Shattered Bytes levels are generated and where the generated files are used.

## Goal

A level is a deterministic JSON file containing a raw hexadecimal dump, metadata, validation data, and the forensic clues needed by the game. The player sees the dump through the hex editor and interacts with it through selection, stash, compose, carve, XOR, and terminal commands.

The generated data must support a logical investigative path. The player should be able to reason through the level using signatures, descriptors, offsets, markers, or obfuscation clues. A level should not require blind brute force.

## Official Campaign Levels

The official six-act campaign is generated with:

```bash
npm run levels:build
```

This runs:

```bash
python3 scripts/level_generation/build_levels.py
```

The generated JSON files are written to:

```text
public/levels/
```

The production build copies those files into:

```text
dist/levels/
```

## Level Data

A generated level normally includes:

- level identifier and difficulty metadata;
- target extension or recovery type when appropriate;
- expected target size;
- hex dump shown in the editor;
- solution offsets used by automatic validation;
- mission-specific metadata such as markers, fragment descriptors, XOR keys, MBR values, or protected regions.

The solution data is not meant to be exposed directly to the player. It exists so the game can validate selections, carving attempts, and reports.

## Level Design Rules

Each level should introduce one primary forensic complication.

Act 1 teaches contiguous carving and false lead rejection.

Act 2 teaches fragmented recovery through descriptors.

Act 3 teaches relevance triage among multiple valid artefacts.

Act 4 teaches MBR and little-endian offset reasoning.

Act 5 teaches XOR obfuscation and partial recovery.

Act 6 combines fragmentation, decoys, XOR, and incident correlation.

The generated dump should contain enough clues for a defensible solution path. If the only possible strategy is trying random offsets until something works, the level design should be revised.

## Custom Legacy Generation

The legacy generator can still be used for experiments:

```bash
python3 scripts/level_generation/generate_level.py \
  --input assets/evidence_chat_tiny.png \
  --output public/levels/level_custom.json \
  --difficulty triage \
  --noise 1024
```

This is useful for quick tests, but the official campaign should be regenerated through `npm run levels:build`.

## Asset Constraints

Use small source files for embedded evidence. Very large images or documents can make the hex editor heavy and reduce playability.

As a practical rule, source evidence should stay compact enough to support a 10 to 15 minute play session and responsive browser rendering.

## Validation

After changing level generation logic, run:

```bash
npm run levels:build
npm run build
```

Then verify that:

- `public/levels/level_1.json` through `level_6.json` exist;
- `dist/levels/` contains the same campaign levels after build;
- the game can load the campaign without missing asset or JSON errors;
- each act still has a logical path from briefing to recovery.
