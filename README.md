# 🕵️ CyberForensics: Digital Detective

A **Serious Game** for the course *Computer Forensics and Cyber Crime Analysis (CFCA)*.

> **Course**: Computer Forensics and Cyber Crime Analysis  
> **Format**: Web-based browser game (no installation required)  
> **Technology**: Vanilla HTML5 / CSS3 / JavaScript (zero dependencies)

---

## 🎯 Learning Objectives

This game trains players in **6 distinct Computer Forensics domains** through interactive investigation scenarios. Each scenario presents authentic forensic artifacts and asks the player to apply correct forensic reasoning.

| # | Case | Topic |
|---|------|-------|
| 1 | Operation: Frozen Clock | Evidence Acquisition & Chain of Custody |
| 2 | Operation: Ghost Files | Data Carving & File Recovery |
| 3 | Operation: Ghost Timestamp | File System Analysis (NTFS / FAT / Ext) |
| 4 | Operation: Phantom Process | Memory Forensics |
| 5 | Operation: Silent Exfiltration | Network Forensics |
| 6 | Operation: Digital Alibi | Mobile Forensics |

---

## 🎮 How to Play

1. **Open `index.html`** in any modern web browser (Chrome, Firefox, Edge, Safari).  
   No server or build step required.
2. Click **"Start Investigation"** on the title screen.
3. Select a **case** from the investigation map.
4. Read the **briefing** and examine the **evidence terminal** (hex dumps, process trees, PCAP extracts, MFT records, etc.).
5. Answer the **multiple-choice questions** — each question tests a specific forensic concept.
6. After each answer, a **feedback overlay** explains why the answer is correct or incorrect, reinforcing the learning objective.
7. Complete all 6 cases to receive your **final analyst rating**.

### Scoring

| Points | Outcome |
|--------|---------|
| +100 | Correct answer |
| +0 | Incorrect answer |
| ⭐⭐⭐ | ≥ 90% on a scenario |
| ⭐⭐ | ≥ 60% on a scenario |
| ⭐ | Any correct answer |

### Final Grade

| Grade | Score Threshold |
|-------|----------------|
| A – Expert Analyst | ≥ 90% |
| B – Senior Analyst | ≥ 75% |
| C – Junior Analyst | ≥ 55% |
| D – Cadet | < 55% |

---

## 📚 Forensic Concepts Covered

### Scenario 1 — Evidence Acquisition & Chain of Custody
- Order of Volatility (RFC 3227)
- Hardware write-blockers
- MD5 + SHA-256 hash verification of forensic images
- Chain of Custody documentation

### Scenario 2 — Data Carving & File Recovery
- File carving principles (header/footer based)
- JPEG magic bytes (FF D8 FF) and EOF marker (FF D9)
- Quick format vs. data destruction (FAT32)
- Tools: Scalpel, Foremost, PhotoRec

### Scenario 3 — File System Analysis (NTFS / FAT / Ext)
- NTFS \$STANDARD_INFORMATION vs \$FILE_NAME timestamps
- Timestomping anti-forensics detection
- Windows Prefetch as execution evidence
- Ext4 inode structure vs. NTFS MFT

### Scenario 4 — Memory Forensics
- Process tree anomalies (parent-child relationships)
- Volatility3 plugins: pstree, malfind, netstat
- LSASS credential dumping (Mimikatz)
- Process injection detection

### Scenario 5 — Network Forensics
- DNS tunneling (MITRE ATT&CK T1071.004)
- PCAP analysis with tshark
- Network evidence tiers (Full packet vs. NetFlow vs. logs)
- Attribution chain: IP → MAC → Device → User

### Scenario 6 — Mobile Forensics
- iOS extraction levels (logical vs. physical vs. advanced)
- SQLite WAL file forensics (deleted record recovery)
- Apple Significant Locations / CoreLocation
- Multi-source timeline corroboration

---

## 🗂️ Project Structure

```
Serious_game_CFCA/
├── index.html          # Main game entry point
├── css/
│   └── style.css       # Dark-theme forensics UI
├── js/
│   ├── scenarios.js    # 6 scenario definitions (questions, evidence, terminal output)
│   └── game.js         # Core game engine (rendering, scoring, state)
└── README.md
```

---

## ✅ Design Principles

- **Authenticity**: Terminal outputs simulate real Volatility3, tshark, and NTFS hex viewer output.
- **Explanation-first feedback**: Every answer (correct or incorrect) includes a detailed explanation and a highlighted forensic concept.
- **No external dependencies**: Runs offline in any browser — no npm, no server.
- **Progress persistence**: Game state is saved in sessionStorage so players can resume.
- **Accessibility**: ARIA labels, keyboard navigation, and high-contrast colour scheme.
- **Originality**: All scenarios, terminal artifacts, and questions are original — not adapted from existing online quiz platforms.
