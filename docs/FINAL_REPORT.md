# Shattered Bytes - Final Project Report

## 1. Project Overview

Shattered Bytes is a serious game about manual data carving and digital evidence recovery. The player acts as a junior forensic analyst assigned to Operation Shattered Meridian, an investigation into a ransomware group whose traces are scattered across seized digital media.

The game is not designed as a generic cybersecurity quiz. Its purpose is to turn several Computer Forensics and Cyber Crime Analysis concepts into short, concrete investigative actions: preserving evidence, reading byte-level structures, identifying file signatures, rejecting false positives, reconstructing fragments, handling partial recovery, and producing a defensible final report.

The target duration is about 10 to 15 minutes. The campaign contains six linked acts, plus two procedural gameplay sections:

- an evidence intake phase before the investigation starts;
- a final incident timeline board after the technical recovery work is complete.

Together, these sections connect byte-level recovery with forensic methodology, chain of custody, and reporting discipline.

## 2. Educational Problem

Many introductory forensic exercises teach signature matching as if recovery were only a matter of finding a magic number. That is useful, but too narrow. In real investigations, a valid signature may be a decoy, a file may be fragmented, a useful artefact may be incomplete, or a payload may be lightly obfuscated. The analyst must also explain how the evidence was handled and why the conclusion is defensible.

The project addresses this gap by making the player move through increasingly complex recovery scenarios. Each act introduces one new difficulty while still requiring the skills learned earlier.

## 3. Course Alignment

The game maps to several core topics normally covered in Computer Forensics and Cyber Crime Analysis:

Digital evidence handling is represented by the evidence intake stage, where the player must place the seized drive, write blocker, forensic workstation, and hash verification in the correct acquisition order. This reinforces the idea that evidence should be preserved before analysis begins.

File signature analysis appears in the early acts, but it is deliberately limited. The player learns that signatures are useful entry points, not final proof. Later acts hide, fragment, or obfuscate the relevant artefact so that signature matching alone is insufficient.

File system and low-level storage concepts appear through MBR parsing, little-endian interpretation, byte offsets, slack-like noise, and hidden regions. Act 4 in particular forces the player to derive an offset instead of jumping directly to a visible PNG signature.

Anti-forensics is introduced through XOR obfuscation, decoys, false markers, and partial recovery. The player must use known-plaintext reasoning and report uncertainty when the recovered artefact is incomplete.

Reporting and assessment are represented by terminal conclusions, a final mastery report, and the incident timeline board. The game evaluates not only whether the player recovered the object, but also how precise and disciplined the process was.

## 4. Gameplay Structure

### Evidence Intake

Before Act 1, the player must reconstruct the forensic preparation chain. The items are intentionally shuffled and must be placed in the correct order:

1. sealed evidence drive;
2. write blocker;
3. forensic workstation;
4. hash verification.

This is a non-textual procedure check. It avoids quiz fatigue and makes the player perform a simplified version of evidence handling before byte analysis starts.

### Six Investigation Acts

The campaign is structured as a single narrative investigation:

| Act | Title | Main competency | Design role |
|-----|-------|-----------------|-------------|
| 1 | Intake and False Lead | Basic carving and decoy rejection | Introduces signature-based recovery without making it sufficient forever |
| 2 | The Fracture | Fragment reconstruction | Adds descriptors and fragment ordering |
| 3 | Signal and Noise | Multi-signature triage | Forces relevance assessment between valid artefacts |
| 4 | Partition Archaeology | MBR and little-endian offsets | Moves from pattern matching to storage reasoning |
| 5 | The Obscured Tail | XOR obfuscation and partial recovery | Introduces known-plaintext reasoning and uncertainty |
| 6 | Ransomware Aftermath | Multi-fragment XOR recovery | Combines fragmentation, decoys, obfuscation, and incident correlation |

### Final Timeline Board

After the last recovery act, the player must arrange the recovered artefacts into an incident chain. This final task connects the technical objects to a broader investigative narrative: ransom communication, identity abuse, ATM cash-out, credential exposure, and malware payload recovery.

The purpose is to show that carving is not the end of the forensic process. Recovered bytes become useful only when they support a coherent and defensible reconstruction of events.

## 5. Level Design Rationale

Each level is designed around a logical path. The player should not be forced to brute-force the dump or guess blindly.

Act 1 uses a valid PNG and a false lead. The player learns to select the exact contiguous range and verify the recovered object.

Act 2 adds fragment descriptors. The descriptors do not directly solve the level, but they give the player a structured way to find the fragments and infer their boundaries.

Act 3 removes explicit signature guidance. The player must determine which artefact is relevant to the case narrative rather than simply recover the first valid file.

Act 4 blocks direct search inside encrypted memory. The player must use partition information, interpret little-endian values, calculate the byte offset, and unlock the relevant sector before recovery becomes possible.

Act 5 uses markers and XOR-obfuscated candidates. The marker narrows the search space, while the XOR step requires known-plaintext reasoning. The decoy is intentionally plausible, so the player must validate content rather than trust location alone.

Act 6 combines previous mechanics. The player must find multiple fragments, derive or apply the XOR key, reject decoys, reconstruct the evidence, and connect the result to the incident story.

## 6. Assessment Model

The assessment system is meant to measure process quality, not only completion.

The score is built from the following dimensions:

- base recovery points for completing each act;
- precision bonuses when the selected byte range exactly matches the expected evidence;
- time bonuses for efficient work;
- penalties for bad leads, incorrect ranges, useless carve attempts, and excessive hint usage;
- procedure risk penalties from the evidence intake and timeline stages.

At the end of the campaign, the game generates a mastery profile across several competencies:

- signature recognition;
- offset precision;
- fragment reconstruction;
- trial-and-error discipline;
- obfuscation handling;
- forensic reasoning;
- reporting quality.

This final report is important because two players can both finish the game while demonstrating different levels of forensic maturity. A player who finishes through repeated guessing receives a weaker profile than a player who follows a precise and explainable path.

## 7. Procedure Checks

Procedure checks replaced the earlier knowledge-check quiz system. The reason is that quizzes interrupted the flow and risked duplicating the same assessment already performed by gameplay.

The new procedure checks are interactive:

- evidence intake asks the player to arrange a correct acquisition chain;
- the final timeline board asks the player to reconstruct the incident sequence.

These checks are still educational, but they are embedded in the investigation rather than presented as detached multiple-choice questions.

## 8. Feedback and Hints

Hints are available on demand and carry a score penalty. Random pop-up hints were removed because they felt intrusive and reduced player agency.

Briefings were standardized across acts. They give enough operational context to begin reasoning, but they avoid revealing the key insight of the level. More explicit guidance is moved into optional hints or terminal commands, so the player can decide when help is worth the penalty.

## 9. Technical Implementation

The project is implemented with React and Vite. The main gameplay components are organized under `src/components`, while level and campaign data live in `src/data` and `public/levels`.

The hex editor supports:

- byte selection;
- drag-based range selection with edge navigation;
- manual range entry;
- stash and carve operations;
- XOR decryption workflow;
- terminal commands for search, navigation, hints, and reporting.

The levels are generated as JSON artefacts. This keeps the game deterministic and makes it possible to inspect or regenerate the forensic dumps without hard-coding the entire experience inside React components.

## 10. Development Choices

The project evolved through several design corrections.

The early version was too close to a signature-matching exercise, so later acts were strengthened with fragmentation, MBR reasoning, XOR obfuscation, partial recovery, and decoy validation.

The first assessment model was too quiz-oriented, so the knowledge checks were removed and replaced by procedural interactions. This made the course alignment stronger without making the game feel like a written test.

Several usability issues were also corrected: byte selection now supports long ranges, the asset viewer renders recovered files more reliably, the terminal command guide is accessible in-game, drag-and-drop ordering gives clearer feedback, and the final report layout adapts better to the default browser zoom.

## 11. Contribution Beyond Existing Exercises

The main contribution of Shattered Bytes is not the invention of a new forensic algorithm. Its contribution is the packaging of a coherent learning path where the player must perform small but meaningful forensic actions under constraints.

Compared with a static lab handout, the game provides immediate feedback, process-based scoring, decoy handling, and a final competence profile. Compared with a simple CTF challenge, it emphasizes evidence handling, defensible reasoning, and reporting rather than only finding a flag.

## 12. Conclusion

Shattered Bytes is intended as a compact serious game for reinforcing forensic reasoning. It starts from accessible byte-level carving and gradually moves toward more realistic complications: fragmented evidence, false positives, low-level offsets, obfuscation, partial recovery, and incident reconstruction.

The final result is a playable learning object that supports both demonstration and discussion: the professor can inspect the mechanics, the scoring model, the documentation, and the design rationale behind each level.
