# 🔍 Shattered Bytes

![Game Logo/Banner Placeholder]

**Shattered Bytes** is a Serious Game developed for the *Computer Forensics and Cyber Crime Analysis (CFCA)* course. It is designed to immerse players in the role of a Junior Digital Forensic Analyst, challenging them to recover, reconstruct, and analyze evidence from raw binary data.

The game focuses on teaching fundamental low-level disk forensics, data carving techniques, MBR analysis, and evidence reporting within a realistic, simulated forensic environment.

---

## 🎯 Pedagogical Goals

The curriculum of Shattered Bytes is strictly aligned with the CFCA course syllabus, focusing on:
- **File System Forensics & Data Carving:** Identifying file signatures (magic numbers) and carving files directly from hex dumps, ignoring file system abstraction.
- **Data Fragmentation:** Understanding how TRIM and fragmentation scatter data across sectors and how to reconstruct it using file run descriptors.
- **MBR Analysis:** Parsing the Master Boot Record partition table manually to calculate LBA offsets using Little-Endian byte ordering.
- **Anti-Forensics & Obfuscation:** Recognizing decoys, truncated headers, and breaking single-byte XOR obfuscation using known-plaintext attacks.
- **Defensible Reporting:** Learning to report accurately on findings, distinguishing between fully recovered evidence and partial recoveries to maintain the integrity of the evidence chain.

## ✨ Key Features

- **Integrated Forensic Toolset:** 
  - **Terminal:** Execute commands like `search`, `go`, `select`, `xorcalc`, and `report`.
  - **Hex Editor:** Explore raw memory dumps, select byte ranges, and identify patterns.
  - **Workbench:** Stash, reorder, and assemble fragments before carving.
  - **Asset Viewer:** Visualize carved PNGs, JPEGs, and text files.
- **Contextual Guidance (Nudge System):** A non-punitive, timed hint system that assists players who are stuck without breaking immersion.
- **Objective Tracking & Toast Notifications:** Real-time feedback on sub-objective completion.
- **Investigation Timeline:** Automatically logs all player actions to simulate a forensic chain of custody.
- **Dynamic Campaign:** A 6-act story-driven campaign tracing a ransomware incident ("Night Meridian").

## 🛠️ Technology Stack

- **Frontend:** React, Vite
- **Styling:** Tailwind CSS (with custom UI elements simulating a forensic workstation)
- **Data:** Deterministically generated JSON levels representing raw memory dumps

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Serious_game_CFCA
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

## 📁 Project Structure

- `src/` — React application source code (Components, Hooks, Data, Utils).
- `public/` — Static assets served directly by the browser, including the pre-generated JSON levels (`public/levels/`) and intro videos.
- `assets/` — Source assets used to generate the level dumps.
- `scripts/level_generation/` — Node.js scripts for deterministic generation of the hex dumps.
- `docs/` — Project documentation, walkthroughs, design directives, and course alignment notes.

## 📖 The Campaign: Operation Shattered Meridian

You are assigned to assist Agent Root in tracking the "Night Meridian" ransomware cell. Over 6 acts, you will:
1. **Act 1:** Triage a simple PNG file while avoiding decoy headers.
2. **Act 2:** Reconstruct a fragmented identity scan.
3. **Act 3:** Perform multi-signature triage to find a specific CCTV frame among noise.
4. **Act 4:** Parse the MBR to locate a hidden partition.
5. **Act 5:** Defeat XOR obfuscation on a partially overwritten payload.
6. **Act 6:** Reconstruct fragmented, XOR-encoded exfiltration credentials.

---

*Developed as a Master's degree project for the Computer Forensics and Cyber Crime Analysis course.*
