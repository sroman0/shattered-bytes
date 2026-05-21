# Shattered Bytes

![Game Logo/Banner Placeholder]

**Shattered Bytes** is a Serious Game developed for the *Computer Forensics and Cyber Crime Analysis (CFCA)* course. It is designed to immerse players in the role of a Junior Digital Forensic Analyst, challenging them to recover, reconstruct, and analyze evidence from raw binary data.

The game focuses on teaching fundamental low-level disk forensics, data carving techniques, MBR analysis, and evidence reporting within a realistic, simulated forensic environment.

---

## Pedagogical Goals

The curriculum of Shattered Bytes is strictly aligned with the CFCA course syllabus, focusing on:
- **File System Forensics & Data Carving:** Identifying file signatures (magic numbers) and carving files directly from hex dumps, ignoring file system abstraction.
- **Data Fragmentation:** Understanding how TRIM and fragmentation scatter data across sectors and how to reconstruct it using file run descriptors.
- **MBR Analysis:** Parsing the Master Boot Record partition table manually to calculate LBA offsets using Little-Endian byte ordering.
- **Anti-Forensics & Obfuscation:** Recognizing decoys, truncated headers, and breaking single-byte XOR obfuscation using known-plaintext attacks.
- **Defensible Reporting:** Learning to report accurately on findings, distinguishing between fully recovered evidence and partial recoveries to maintain the integrity of the evidence chain.

## Key Features

- **Integrated Forensic Toolset:** 
  - **Terminal:** Execute commands like `search`, `go`, `select`, `xorcalc`, and `report`.
  - **Hex Editor:** Explore raw memory dumps, select byte ranges, and identify patterns.
  - **Workbench:** Stash, reorder, and assemble fragments before carving.
  - **Asset Viewer:** Visualize carved PNGs, JPEGs, and text files.
- **Visual Forensic Workflow:** A drag-and-drop evidence intake sequence asks the player to place the sealed drive, write blocker, workstation, and hash verification step before the first investigation begins.
- **Final Incident Reconstruction Board:** Before the final report, the player must arrange the recovered artefacts into the correct incident chain, linking the ransom chat, mule identity, ATM frame, bank transfer, malware payload, and credentials.
- **Progressive Hint System:** Contextual hints available via the `hint` terminal command, with score penalties to encourage independent problem-solving.
- **Objective Tracking & Toast Notifications:** Real-time feedback on sub-objective completion.
- **Investigation Timeline:** Automatically logs all player actions to simulate a forensic chain of custody.
- **Cinematic Intro:** A short intro video sets the investigation context; audio is available through an explicit browser-compatible "Enable Audio" action.
- **Dynamic Campaign:** A 6-act story-driven campaign tracing a ransomware incident ("Night Meridian").

## Gameplay and Assessment

The player's performance is continuously evaluated throughout the campaign. The assessment is intentionally process-oriented: the game rewards precise, defensible forensic work and penalizes trial-and-error.

Each act starts from a fixed `maxScore` proportional to difficulty. The final score is computed as:

```text
levelScore =
  maxScore
  - 15 * hintsUsed
  - 25 * badSelections
  - 30 * extraCarveAttempts
  - 40 * wrongReportAttempts
  - 15 * procedureMistakes
  + timeBonus
```

Where:

- **Bad selections** include unsupported byte ranges, decoys, and selections that overlap real evidence but include missing or extra bytes.
- **Extra carve attempts** count repeated carving after the first attempt, discouraging carving before validating boundaries and fragment order.
- **Wrong report attempts** penalize overclaiming or misclassifying the recovery status, especially in partial-recovery scenarios.
- **Hints used** are allowed but costly, modelling support from a senior analyst rather than independent mastery.
- **Procedure mistakes** come from embedded forensic decision checks after critical actions such as fragment carving, MBR unlocking, anti-forensics diagnosis, or incident correlation.
- **Time bonus** awards up to 35 extra points when the act is completed under its configured `timeBonusThreshold`.

At the end of the campaign, the final report summarizes both score and mastery across eight dimensions: signature recognition, offset precision, fragment reconstruction, trial-and-error discipline, obfuscation handling, procedure discipline, forensic reasoning, and reporting quality. The mastery level is classified as `Forensic-ready`, `Competent examiner`, `Developing analyst`, or `Needs remediation`.

The **Investigation Timeline** records commands, searches, selections, stash operations, XOR transforms, carve attempts, hints, and final reports. This provides a readable trace of the player's method, allowing an instructor to inspect not only whether the player succeeded, but how the recovery was achieved.

## Technology Stack

- **Frontend:** React, Vite
- **Styling:** Tailwind CSS (with custom UI elements simulating a forensic workstation)
- **Data:** Deterministically generated JSON levels representing raw memory dumps

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sroman0/shattered-bytes.git
   cd shattered-bytes
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build the project for production:
   ```bash
   npm run build
   ```

5. Preview the production build:
   ```bash
   npm run preview
   ```

### Level Generation

If you modify the level scripts or source assets, you can regenerate the JSON level dumps:
```bash
npm run levels:build
```

## Live Demo Deployment

The project is ready for GitHub Pages deployment through the workflow in `.github/workflows/deploy.yml`.

Expected demo URL for the current repository:

```text
https://sroman0.github.io/shattered-bytes/
```

See [Live Demo Deployment](docs/DEPLOYMENT.md) for the exact GitHub Pages setup steps.

## Project Structure

- `src/` - React application source code (Components, Hooks, Data, Utils).
- `public/` - Static assets served directly by the browser, including the pre-generated JSON levels (`public/levels/`) and intro videos.
- `assets/` - Source assets used to generate the level dumps.
- `scripts/level_generation/` - Node.js scripts for deterministic generation of the hex dumps.
- `docs/` - Project documentation, walkthroughs, design directives, and course alignment notes.

## The Campaign: Operation Shattered Meridian

You are assigned to assist Agent Root in tracking the "Night Meridian" ransomware cell. Over 6 acts, each artefact you recover feeds the next phase of the investigation:

| Act | Title | CFCA Topic | Core Skill | Difficulty |
|-----|-------|-----------|------------|------------|
| 1 | Intake & False Lead | File Signatures & Carving | Recognize PNG header/footer; reject decoy | Triage |
| 2 | The Fracture | Fragmentation & TRIM | Reassemble 2 fragments from run descriptors (FR01/FR02) | Fragmented |
| 3 | Signal & Noise | Multi-Signature Triage | Select the relevant artefact among valid but irrelevant files | Multi-sig |
| 4 | Partition Archaeology | MBR & Partition Tables | Parse Little-Endian LBA, calculate byte offset, unlock sector | MBR |
| 5 | The Obscured Tail | Anti-Forensics (XOR) | Known-plaintext attack; partial recovery; defensible reporting | Partial |
| 6 | Ransomware Aftermath | Incident Response | Multi-fragment XOR recovery; decoy rejection; incident correlation | Ransomware |

Each act adds exactly one new competency while preserving those from previous acts. Act 6 is a synthesis requiring fragmentation (Act 2), decoy triage (Act 3), and XOR (Act 5) in a single challenge.

## Full Project Report

For detailed documentation on context analysis, development process, design motivations, and syllabus alignment, see the **[Final Report](docs/FINAL_REPORT.md)**.

---

*Developed as a Master's degree project for the Computer Forensics and Cyber Crime Analysis course.*
