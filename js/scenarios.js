/**
 * CyberForensics: Digital Detective
 * Scenarios Data – 6 Computer Forensics themes
 *
 * Each scenario contains:
 *   id, title, topic, description, icon, accentColor,
 *   narrative (story intro text)
 *   evidence (artifacts shown in the terminal)
 *   questions[] – multiple-choice quiz steps
 *     Each question: text, options[], correctIndex, explanation, concept
 */

const SCENARIOS = [
  /* ═══════════════════════════════════════════════════════════════
     SCENARIO 1 – Chain of Custody & Evidence Acquisition
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 1,
    title: "Operation: Frozen Clock",
    topic: "Evidence Acquisition & Chain of Custody",
    icon: "🔒",
    accentColor: "#00d4ff",
    description:
      "A corporate laptop is seized at an airport. You must follow proper acquisition procedures to ensure evidence is admissible in court.",
    narrative: [
      "Date: March 12 — 07:14 UTC. Border agents at Milan Malpensa Airport have detained a corporate executive suspected of industrial espionage. A company-issued laptop (Dell XPS 15, serial XPS-2024-7741) is confiscated.",
      "You are the lead digital forensics investigator. Your actions in the next few minutes will determine whether this evidence is admissible in court. Every decision you make will be recorded.",
      "The laptop is still powered on. A USB thumb-drive is partially inserted in the USB-A port. A cloud-sync icon pulses in the system tray."
    ],
    evidence: [
      { icon: "💻", text: "Dell XPS 15 – S/N XPS-2024-7741 (powered ON, battery 62%)" },
      { icon: "🔌", text: "USB drive partially inserted (Kingston 64GB)" },
      { icon: "☁️",  text: "OneDrive sync active – 3 files uploading" },
      { icon: "📋", text: "Airport security log: device located at Gate B12" }
    ],
    terminalLabel: "CASE-001 // Initial Status",
    terminalContent: `<span class="t-header">══ SCENE ASSESSMENT ══════════════════════</span>
<span class="t-key">Device State   :</span> <span class="t-warn">POWERED ON</span>
<span class="t-key">Network Status :</span> <span class="t-warn">WiFi connected (airport_free_wifi)</span>
<span class="t-key">Active Sync    :</span> <span class="t-warn">OneDrive – 3 items pending upload</span>
<span class="t-key">USB Port A     :</span> <span class="t-warn">Kingston DT101 G2 – NOT safely ejected</span>
<span class="t-key">Screen         :</span> <span class="t-val">Logged in as "m.bianchi" (no lock)</span>
<span class="t-key">Time of Seizure:</span> <span class="t-val">2024-03-12 07:14:33 UTC</span>
<span class="t-dim">──────────────────────────────────────────</span>
<span class="t-comment"># AWAITING INVESTIGATOR ACTION</span>`,
    hint: "Think about what actions could permanently alter the digital evidence before you begin acquisition.",
    questions: [
      {
        text: "The laptop is on and OneDrive is actively syncing files. What is your FIRST priority action?",
        options: [
          "Begin imaging the hard drive immediately using the running OS",
          "Disable the Wi-Fi connection and remove the USB drive to prevent data modification",
          "Take a screenshot of the desktop to document the current state",
          "Power off the laptop immediately by holding the power button"
        ],
        correctIndex: 1,
        explanation:
          "The first priority is to stop any data modification. Active cloud sync can overwrite or delete files on the remote server (altering evidence). The USB drive should also be preserved in its current state. Powering off abruptly could corrupt the file system and lose volatile data; imaging on a live system via the OS is forensically unsound.",
        concept: "The 'Order of Volatility' principle (RFC 3227) dictates preserving the most volatile data first. Network connections that are actively modifying data must be severed before acquisition."
      },
      {
        text: "You are about to create a forensic image of the drive. Which write-blocking method is most forensically sound?",
        options: [
          "Copy files using Windows File Explorer to an external drive",
          "Use 'dd' directly on the live system without a write blocker",
          "Attach a hardware write-blocker between the drive and the imaging workstation",
          "Compress the drive contents with 7-Zip to a USB drive"
        ],
        correctIndex: 2,
        explanation:
          "A hardware write-blocker physically prevents any write commands from reaching the evidence drive while allowing read commands to pass. Software write-blockers can be bypassed by OS operations. File-copy tools do not create a bit-for-bit image and skip metadata. Using 'dd' on a live system risks writing to the evidence drive.",
        concept: "Write blockers (hardware or software) guarantee the forensic soundness principle: the examination must not alter the original evidence. This is fundamental to admissibility under rules like the Federal Rules of Evidence."
      },
      {
        text: "After imaging is complete, which hash algorithm and verification step ensures the integrity of the forensic image?",
        options: [
          "CRC32 checksum of the image file only",
          "Compute MD5 + SHA-256 of both the source drive and the image; confirm they match",
          "Compare file counts between the original drive and the image",
          "No verification needed if a hardware write-blocker was used"
        ],
        correctIndex: 1,
        explanation:
          "MD5 and SHA-256 hashes are computed on both the source drive and the forensic image immediately after acquisition. Matching hashes prove the image is a perfect bit-for-bit copy. CRC32 has too many collisions to be forensically reliable. File-count comparison ignores deleted data, slack space, and metadata.",
        concept: "Hash verification is the cornerstone of forensic image integrity. Dual hashing (MD5 + SHA-256) is current best practice — MD5 for legacy compatibility and SHA-256 for collision resistance."
      },
      {
        text: "Which document is mandatory to record EVERY person who handles the evidence from seizure to court presentation?",
        options: [
          "Forensic imaging report",
          "Chain of Custody form",
          "Incident response plan",
          "Hash verification log"
        ],
        correctIndex: 1,
        explanation:
          "The Chain of Custody (CoC) form tracks every individual who handles the evidence, the date/time, and the reason for access. Any gap in the CoC can render evidence inadmissible, as the defense can argue evidence tampering. It is a legal requirement in virtually all jurisdictions.",
        concept: "Chain of Custody (CoC) is a legal concept ensuring that evidence has been collected, transferred, analyzed, and preserved in a way that does not compromise its integrity or admissibility in court."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════════════
     SCENARIO 2 – Data Carving (recovering deleted files)
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 2,
    title: "Operation: Ghost Files",
    topic: "Data Carving & File Recovery",
    icon: "🔍",
    accentColor: "#00ff88",
    description:
      "A suspect wiped critical evidence files, but the raw disk image still holds their remnants. Use data carving knowledge to reconstruct the deleted data.",
    narrative: [
      "A disk image (suspect_disk.img, 32 GB) from an encrypted external drive has been decrypted and is ready for analysis. The file system shows as empty — the suspect ran a quick-format before handing over the device.",
      "Your hex editor reveals the disk is far from empty. There are known file signatures scattered throughout the raw sectors. Your task is to understand data carving principles and correctly guide the recovery.",
      "A lead indicates the suspect stored JPEG photographs documenting a crime. The suspect claimed the drive was never used."
    ],
    evidence: [
      { icon: "💾", text: "suspect_disk.img (32 GB) – FAT32, quick-formatted" },
      { icon: "🔬", text: "Hex editor active – sectors 0x00 to 0xFFFF scanned" },
      { icon: "📷", text: "Known JPEG magic bytes detected at offset 0x94000" },
      { icon: "📄", text: "PDF signature found at offset 0x1FA000" }
    ],
    terminalLabel: "HEX VIEWER // sector scan",
    terminalContent: `<span class="t-header">══ RAW SECTOR SCAN (suspect_disk.img) ════</span>
<span class="t-dim">Offset     Hex Bytes                   ASCII</span>
<span class="t-dim">─────────────────────────────────────────</span>
<span class="t-key">0x094000:</span>  <span class="t-highlight">FF D8 FF E0</span> 00 10 4A 46  <span class="t-ok">ÿØÿà..JF</span>
<span class="t-key">0x094008:</span>  49 46 00 01 01 00 00 48  <span class="t-ok">IF.....H</span>
<span class="t-key">0x094010:</span>  00 48 00 00 FF E1 22 14  <span class="t-ok">.H..ÿá".</span>
<span class="t-dim">           ... [JPEG data continues] ...</span>
<span class="t-key">0x1FA000:</span>  <span class="t-highlight">25 50 44 46</span> 2D 31 2E 34  <span class="t-ok">%PDF-1.4</span>
<span class="t-key">0x1FA008:</span>  0A 25 E2 E3 CF D3 0A 0A  <span class="t-ok">.%âãÏÓ..</span>
<span class="t-dim">           ... [PDF data continues] ...</span>
<span class="t-key">0x2C0000:</span>  <span class="t-highlight">FF D9</span> 00 00 00 00 00 00  <span class="t-warn">JPEG EOF marker</span>
<span class="t-key">0x2C0010:</span>  00 00 00 00 00 00 00 00  <span class="t-dim">(zero-padded sector)</span>
<span class="t-comment"># File system directory entries: EMPTY (wiped)</span>`,
    hint: "File carving relies on known binary signatures (magic bytes) at the start and end of file types, not on file system metadata.",
    questions: [
      {
        text: "What is 'data carving' in the context of digital forensics?",
        options: [
          "Decrypting encrypted files using brute-force",
          "Recovering files from raw disk data based on file signatures, bypassing the file system",
          "Analysing the file system journal to reconstruct deleted entries",
          "Extracting data from cloud storage backups"
        ],
        correctIndex: 1,
        explanation:
          "Data carving (also called file carving) is the process of searching raw, unallocated disk space for known file signatures (headers and footers) to reconstruct files without relying on file system metadata. It works even when the file system directory is completely wiped or corrupted.",
        concept: "File carving is essential when the file system is damaged or deliberately wiped. Tools like Scalpel, Foremost, and PhotoRec use header/footer databases to carve files from raw binary data."
      },
      {
        text: "The hex dump shows 'FF D8 FF E0' at offset 0x094000. What does this represent?",
        options: [
          "The JPEG file footer (end-of-file marker)",
          "A PDF header signature",
          "The JPEG file header (magic bytes / file signature)",
          "An NTFS MFT entry signature"
        ],
        correctIndex: 2,
        explanation:
          "'FF D8 FF' is the universally recognized JPEG magic bytes (Start of Image / SOI marker). It is always the first 3 bytes of any valid JPEG/JFIF file. Data carving tools search for this exact byte sequence to identify the start of a JPEG file in raw disk data.",
        concept: "File signatures (magic bytes) are sequences of bytes at specific offsets within a file that identify the file format. The JPEG SOI marker (FFD8FF) and the JFIF APP0 marker (FFE0) together identify a JPEG/JFIF image."
      },
      {
        text: "'FF D9' appears at offset 0x2C0000. In the context of JPEG carving, what is this?",
        options: [
          "The JPEG Start of Scan (SOS) marker indicating image data starts here",
          "The JPEG End of Image (EOI) footer marker — used to determine the file's end boundary",
          "A corrupt sector marker inserted by the OS",
          "The beginning of an embedded thumbnail"
        ],
        correctIndex: 1,
        explanation:
          "'FF D9' is the JPEG End of Image (EOI) marker. In data carving, finding both the header (FFD8FF) and the footer (FFD9) allows the carver to extract the complete file. The file extends from offset 0x094000 to 0x2C0001. Without a known footer, carvers may use a maximum file-size limit.",
        concept: "Header-footer carving extracts files by finding both the start (header) and end (footer) magic bytes. For files without reliable footers (like some video formats), carvers use maximum size limits or internal structure analysis."
      },
      {
        text: "A suspect ran a quick-format on the FAT32 volume before surrendering the device. What does this mean for data recovery?",
        options: [
          "All data is permanently overwritten; recovery is impossible",
          "Only the FAT directory entries and allocation tables are cleared; file data remains in sectors until overwritten",
          "The Master Boot Record (MBR) is erased but file data is preserved in NTFS logs",
          "The entire disk is zeroed out and no recovery is possible"
        ],
        correctIndex: 1,
        explanation:
          "A quick format on FAT32 only clears the File Allocation Table (FAT) and the directory entries, marking all clusters as free. The actual file data in the data area is NOT overwritten and remains physically on the disk. This is why data carving from raw sectors can still recover files even after a quick format.",
        concept: "Quick format ≠ data destruction. It only removes file system metadata. A full/overwrite format (or tools like DBAN) is required to destroy data. In FAT32, the Data Area sectors are untouched by a quick format."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════════════
     SCENARIO 3 – File System Analysis (NTFS + FAT)
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 3,
    title: "Operation: Ghost Timestamp",
    topic: "File System Analysis (NTFS / FAT / Ext)",
    icon: "🗂️",
    accentColor: "#ffd700",
    description:
      "A suspect claims a file was created after the alleged crime. Analyse NTFS metadata to prove or disprove the alibi — timestamps don't lie (unless manipulated).",
    narrative: [
      "The suspect, a system administrator, is accused of planting a backdoor in the company network on January 8th. He claims the backdoor script (install.ps1) was created on January 15th — after he was suspended.",
      "You have a forensic image of his workstation (Windows 10 Pro, NTFS). The MFT (Master File Table) record for the suspicious file has been extracted. There are two sets of timestamps to compare.",
      "Analysis reveals a suspicious discrepancy. The $STANDARD_INFORMATION attribute shows one date, while the $FILE_NAME attribute shows another. This is a classic anti-forensics indicator."
    ],
    evidence: [
      { icon: "📁", text: "File: C:\\Tools\\Scripts\\install.ps1 (4,217 bytes)" },
      { icon: "🗃️", text: "NTFS Volume – MFT Entry #87423 extracted" },
      { icon: "⏱️",  text: "$STANDARD_INFORMATION timestamps (modifiable by user)" },
      { icon: "🔐", text: "$FILE_NAME timestamps (protected by kernel – harder to forge)" }
    ],
    terminalLabel: "NTFS MFT // Entry #87423 – install.ps1",
    terminalContent: `<span class="t-header">══ MFT RECORD #87423 ════════════════════</span>
<span class="t-key">File Name    :</span> <span class="t-val">install.ps1</span>
<span class="t-key">File Size    :</span> <span class="t-val">4,217 bytes</span>
<span class="t-key">MFT Flags    :</span> <span class="t-val">In-use, Non-Resident Data</span>

<span class="t-header">── $STANDARD_INFORMATION (0x10) ─────────</span>
<span class="t-key">  Created    :</span> <span class="t-warn">2024-01-15 09:22:11 UTC</span>
<span class="t-key">  Modified   :</span> <span class="t-warn">2024-01-15 09:22:11 UTC</span>
<span class="t-key">  MFT Changed:</span> <span class="t-warn">2024-01-15 09:22:15 UTC</span>
<span class="t-key">  Accessed   :</span> <span class="t-warn">2024-01-20 14:05:33 UTC</span>

<span class="t-header">── $FILE_NAME (0x30) ────────────────────</span>
<span class="t-key">  Created    :</span> <span class="t-ok">2024-01-08 02:14:47 UTC</span>
<span class="t-key">  Modified   :</span> <span class="t-ok">2024-01-08 02:14:47 UTC</span>
<span class="t-key">  MFT Changed:</span> <span class="t-ok">2024-01-08 02:14:51 UTC</span>
<span class="t-key">  Accessed   :</span> <span class="t-ok">2024-01-08 02:14:47 UTC</span>
<span class="t-comment"># NOTE: $FN timestamps are set by the NTFS kernel and are harder to alter</span>`,
    hint: "Compare the two sets of NTFS timestamps and consider what tools a forensic analyst uses to detect timestamp manipulation (timestomping).",
    questions: [
      {
        text: "In NTFS, what is the difference between $STANDARD_INFORMATION and $FILE_NAME timestamps?",
        options: [
          "$STANDARD_INFORMATION is set by hardware; $FILE_NAME is set by software",
          "$STANDARD_INFORMATION timestamps can be changed by user-mode tools; $FILE_NAME timestamps are updated by the NTFS kernel and are harder to manipulate",
          "Both sets are identical and maintained by the Windows Registry",
          "$FILE_NAME only tracks access times; $STANDARD_INFORMATION tracks all four MACE times"
        ],
        correctIndex: 1,
        explanation:
          "NTFS stores two sets of timestamps: $STANDARD_INFORMATION (0x10 attribute), which can be changed by user-mode tools like SetMace or timestomping malware; and $FILE_NAME (0x30 attribute), which is updated by the NTFS kernel driver and requires kernel-mode code to modify. This discrepancy is a key indicator of anti-forensic timestamp manipulation.",
        concept: "MACE timestamps (Modified, Accessed, Changed, Entry modified) exist in both $SI and $FN NTFS attributes. Timestomping typically only changes $SI, leaving $FN intact — a forensic indicator detectable by tools like Plaso, Autopsy, and FTK."
      },
      {
        text: "The $STANDARD_INFORMATION timestamps show Jan 15th but $FILE_NAME shows Jan 8th. What is the most likely explanation?",
        options: [
          "The file was legitimately created on Jan 15th and accessed on Jan 8th",
          "This is normal NTFS behavior when files are compressed",
          "The $SI timestamps were deliberately manipulated ('timestomping') after the file was created on Jan 8th",
          "The system clock was incorrect on Jan 8th"
        ],
        correctIndex: 2,
        explanation:
          "When $SI timestamps are NEWER than $FN timestamps for the same attribute (Created, Modified), it strongly indicates timestomping — deliberately altering $SI timestamps to make a file appear newer (post-crime). The $FN timestamps (Jan 8th) reveal the true creation date, matching the date of the alleged crime.",
        concept: "Timestomping is an anti-forensic technique where an attacker modifies $STANDARD_INFORMATION timestamps using tools like Metasploit's timestomp, PowerShell, or Windows API calls (SetFileTime). $FILE_NAME timestamps are typically unaffected."
      },
      {
        text: "Which NTFS artifact would you examine to find evidence that install.ps1 was EXECUTED on January 8th?",
        options: [
          "The Volume Shadow Copy (VSS) metadata only",
          "The Windows Prefetch file (C:\\Windows\\Prefetch\\INSTALL.PS1-XXXXXX.pf)",
          "The file's Alternate Data Stream (ADS)",
          "The MFT bitmap"
        ],
        correctIndex: 1,
        explanation:
          "Windows Prefetch (.pf files in C:\\Windows\\Prefetch) records the first and last execution time of applications, along with DLLs and files loaded. A prefetch file for install.ps1 would contain a timestamp of when the script was first run — corroborating the Jan 8th date even if the file timestamps were modified.",
        concept: "Prefetch files are a critical Windows forensic artifact for proving program execution. They store: executable name, run count, last run times (up to 8), and referenced files/directories. Enabled by default on workstations (disabled on servers)."
      },
      {
        text: "Which of the following correctly describes the Ext4 (Linux) equivalent of NTFS's MFT?",
        options: [
          "The Ext4 Journal (journal_mode=ordered)",
          "The inode table, where each inode stores metadata (permissions, timestamps, block pointers) for one file",
          "The superblock, which contains only filesystem-wide metadata",
          "The directory entry (.dir block), which stores all file metadata including content"
        ],
        correctIndex: 1,
        explanation:
          "In Ext filesystems (Ext2/3/4), the inode table is the functional equivalent of the NTFS MFT. Each inode stores file metadata: permissions, owner/group IDs, timestamps (ctime/mtime/atime), and pointers to data blocks. Unlike NTFS, Ext4 inodes do NOT store the filename — filenames are stored in directory entries which point to an inode number.",
        concept: "Ext4 inode timestamps: atime (last access), mtime (last data modification), ctime (last metadata change — NOT creation). Ext4 adds crtime (creation time) in the inode's extra space. Forensically, ctime is hardest to fake as it changes on any metadata modification."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════════════
     SCENARIO 4 – Memory Forensics
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 4,
    title: "Operation: Phantom Process",
    topic: "Memory Forensics",
    icon: "🧠",
    accentColor: "#b060ff",
    description:
      "A memory dump from a compromised server is under your microscope. Identify malicious processes, injected code, and network artifacts hiding in volatile memory.",
    narrative: [
      "At 03:22 UTC, an IDS alert fires at MegaCorp's SIEM: 'Suspicious LSASS memory access detected.' A Level-2 analyst immediately captures a full RAM dump of the affected Windows Server 2019 (memdump.raw, 16 GB).",
      "Your task is to analyze the memory image using Volatility-framework knowledge. The attacker may have injected code into a legitimate process, established a covert C2 channel, or harvested credentials from LSASS.",
      "The IDS alert specifically mentioned unusual parent-child process relationships. Experience tells you this is either process hollowing or a process injection technique."
    ],
    evidence: [
      { icon: "🧠", text: "memdump.raw – 16 GB Windows Server 2019 memory image" },
      { icon: "🚨", text: "IDS Alert: LSASS memory read by non-standard process" },
      { icon: "🔗", text: "Unusual network connection to 185.220.101.47:4444" },
      { icon: "👤", text: "User 'SYSTEM' spawned an unusual child process" }
    ],
    terminalLabel: "VOLATILITY3 // process analysis",
    terminalContent: `<span class="t-header">══ vol3 -f memdump.raw windows.pstree ════</span>
<span class="t-key">PID   PPID  Name                Threads</span>
<span class="t-dim">──────────────────────────────────────────</span>
<span class="t-val">4     0     System              200</span>
<span class="t-val">  ├─ 524   4   smss.exe          3</span>
<span class="t-val">  └─ 672   4   csrss.exe         14</span>
<span class="t-val">832   628   wininit.exe         3</span>
<span class="t-val">  └─ 912   832  lsass.exe        10</span>
<span class="t-val">1044  628   svchost.exe         18</span>
<span class="t-val">  └─ 2384  1044  svchost.exe     12</span>
<span class="t-warn">        └─ 3712  2384  cmd.exe  1  ← SUSPICIOUS</span>
<span class="t-warn">               └─ 4891  3712  powershell.exe  2</span>
<span class="t-warn">1792  832   svchost.exe         1   ← MalParent?</span>
<span class="t-comment"># vol3 windows.netstat:</span>
<span class="t-warn">4891  powershell.exe  TCP  ESTABLISHED  185.220.101.47:4444</span>`,
    hint: "Look at the parent-child process hierarchy. A 'svchost.exe' spawning 'cmd.exe' then 'powershell.exe' is highly abnormal in a Windows environment.",
    questions: [
      {
        text: "The process tree shows svchost.exe (PID 2384) spawning cmd.exe → powershell.exe. Why is this suspicious?",
        options: [
          "svchost.exe is not a legitimate Windows process and should never appear in memory",
          "svchost.exe is a Windows Service Host; it should never legitimately spawn cmd.exe or powershell.exe as child processes",
          "cmd.exe is only allowed to spawn from explorer.exe",
          "powershell.exe with 2 threads is normal for background scripts"
        ],
        correctIndex: 1,
        explanation:
          "svchost.exe (Service Host) is a legitimate Windows process that hosts Windows services. It should never spawn cmd.exe or powershell.exe in a normal execution environment. This parent-child relationship strongly indicates that malware has either injected code into svchost.exe or is using it as a decoy to spawn a command shell, a classic technique for living-off-the-land attacks.",
        concept: "Process lineage analysis is key in memory forensics. Legitimate Windows processes have predictable parent-child relationships. Anomalous parents (e.g., svchost→cmd, word→powershell, explorer→rundll32) are strong malware indicators. The SANS Hunt Evil poster documents expected parent processes."
      },
      {
        text: "powershell.exe (PID 4891) has an established TCP connection to 185.220.101.47:4444. What is 4444 commonly associated with?",
        options: [
          "Standard HTTPS traffic on an alternate port",
          "The default Metasploit Meterpreter reverse TCP listener port — a common C2 channel",
          "DNS over HTTPS (DoH) communications",
          "Windows Remote Management (WinRM) default port"
        ],
        correctIndex: 1,
        explanation:
          "Port 4444 is the default reverse TCP listener port in Metasploit Framework's Meterpreter payload. While ports can be changed, an established connection from a suspicious process (powershell.exe spawned from svchost) to port 4444 on an external IP is a strong indicator of a Meterpreter or similar C2 session.",
        concept: "Common C2 ports to know: 4444 (Meterpreter default), 4445 (Metasploit), 1234 (common custom backdoor), 8080/8443 (HTTP/HTTPS C2 to blend in). Memory forensics can reveal C2 connections that have since been closed by examining socket structures."
      },
      {
        text: "Which Volatility plugin would best help identify process injection (e.g., code injected into a legitimate process's memory)?",
        options: [
          "windows.pstree — lists all running processes",
          "windows.malfind — scans process memory for executable code in uncommitted/private regions",
          "windows.filescan — scans for FILE_OBJECT structures",
          "windows.dlllist — lists loaded DLLs for each process"
        ],
        correctIndex: 1,
        explanation:
          "windows.malfind searches for memory regions with executable permissions (PAGE_EXECUTE_READ/WRITE) that are not backed by a file on disk (private memory). Injected shellcode or reflectively-loaded DLLs typically appear as executable private memory regions — a telltale sign of process injection techniques like hollow process injection or DLL injection.",
        concept: "Process injection techniques detected by malfind: Classic DLL injection, Process hollowing (RunPE), Reflective DLL injection, Shellcode injection. Malfind looks for MZ headers or executable code in private, executable memory pages not mapped to any file."
      },
      {
        text: "The IDS alerted on unusual LSASS memory access. Why would an attacker target lsass.exe?",
        options: [
          "lsass.exe contains the Internet Explorer cache and browsing history",
          "lsass.exe stores plaintext passwords, NTLM hashes, and Kerberos tickets in memory that can be dumped with tools like Mimikatz",
          "lsass.exe is the main malware persistence mechanism in Windows",
          "lsass.exe processes all network traffic and can be hijacked for man-in-the-middle attacks"
        ],
        correctIndex: 1,
        explanation:
          "LSASS (Local Security Authority Subsystem Service) manages Windows authentication. It holds plaintext passwords (in older configs), NTLM hashes, and Kerberos TGTs in memory for SSO (Single Sign-On). Mimikatz and similar tools can extract these credentials with sekurlsa::logonpasswords, enabling lateral movement. Windows Credential Guard and Protected Process Light (PPL) are mitigations.",
        concept: "LSASS credential dumping is one of the most common post-exploitation techniques (MITRE ATT&CK T1003.001). From a forensics perspective, a memory dump allows offline analysis of lsass.exe memory to find injected code or evidence of credential access without re-running Mimikatz."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════════════
     SCENARIO 5 – Network Forensics
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 5,
    title: "Operation: Silent Exfiltration",
    topic: "Network Forensics",
    icon: "🌐",
    accentColor: "#ff8c00",
    description:
      "A PCAP capture from the corporate firewall reveals suspicious traffic. Identify data exfiltration techniques hidden in plain-sight network protocols.",
    narrative: [
      "The firewall at FinCorp generated an anomaly alert at 23:47 on a Tuesday. An automated script captured the next 90 minutes of traffic to capture.pcap (2.3 GB). The SIEM flagged unusually large DNS query payloads.",
      "Initial analysis shows the volume of outbound DNS queries to 'stats.analytics-cdn.net' is 300× above baseline. The queries contain subdomain labels that appear random but are unusually long.",
      "Cross-referencing with DLP logs shows the corporate financial report (Q4_Report_CONFIDENTIAL.xlsx) was accessed at 23:45 — two minutes before the anomalous DNS traffic began."
    ],
    evidence: [
      { icon: "📦", text: "capture.pcap – 2.3 GB, 90 minutes of firewall traffic" },
      { icon: "🔎", text: "SIEM Alert: Excessive DNS queries (src: 10.0.4.87)" },
      { icon: "📊", text: "DLP: Q4_Report_CONFIDENTIAL.xlsx accessed at 23:45:12" },
      { icon: "🌐", text: "DNS queries to: *.stats.analytics-cdn.net (external)" }
    ],
    terminalLabel: "TSHARK // DNS query analysis",
    terminalContent: `<span class="t-header">══ tshark -r capture.pcap -Y "dns" ══════</span>
<span class="t-key">Time     Src IP       Query</span>
<span class="t-dim">──────────────────────────────────────────</span>
<span class="t-val">23:47:03  10.0.4.87  A  <span class="t-warn">UWx1bHUgaW5mb3JtYXQ</span>.stats.analytics-cdn.net</span>
<span class="t-val">23:47:04  10.0.4.87  A  <span class="t-warn">pvbiBmaW5hbmNpYWxl</span>.stats.analytics-cdn.net</span>
<span class="t-val">23:47:05  10.0.4.87  A  <span class="t-warn">IHJlcG9ydCBRNCAyMDI</span>.stats.analytics-cdn.net</span>
<span class="t-val">23:47:06  10.0.4.87  A  <span class="t-warn">0IHJldmVudWU6ICQ0Lj</span>.stats.analytics-cdn.net</span>
<span class="t-dim">  ... 4,847 similar queries in 90 minutes ...</span>
<span class="t-dim">──────────────────────────────────────────</span>
<span class="t-key">DNS Query Stats:</span>
<span class="t-warn">  Total queries  : 4,851</span>
<span class="t-warn">  Avg label len  : 19.2 chars (normal: 5-8)</span>
<span class="t-warn">  Unique FQDNs   : 4,847  (extremely high)</span>
<span class="t-comment"># Base64 decode of first label: "Lulu informatio"</span>`,
    hint: "DNS subdomains are rarely more than 6-8 characters in legitimate traffic. Base64-encoded data in DNS labels is a classic covert channel technique.",
    questions: [
      {
        text: "The DNS subdomain labels ('UWx1bHUgaW5mb3JtYXQ', etc.) are unusually long and look like encoded data. What exfiltration technique is being used?",
        options: [
          "HTTP tunneling over port 80",
          "DNS tunneling — encoding data in DNS query subdomains to exfiltrate through the DNS protocol",
          "ICMP covert channel via ping packet payloads",
          "SMTP data exfiltration using email attachments"
        ],
        correctIndex: 1,
        explanation:
          "DNS tunneling encodes data (often in Base64 or similar encoding) within DNS query subdomains. Since most firewalls allow outbound DNS (UDP port 53), this is an effective covert channel. The attacker's server controls the domain (stats.analytics-cdn.net) and receives the exfiltrated data as part of DNS lookups. Tools like dnscat2, iodine, and custom scripts implement this.",
        concept: "DNS tunneling (MITRE ATT&CK T1071.004) abuses the DNS protocol for C2 or data exfiltration. Detection indicators: high query volume, long subdomain labels (>15 chars), high entropy subdomains, many unique FQDNs under one domain, NX responses to data queries."
      },
      {
        text: "You decode the Base64 subdomain labels and find fragments of the financial report. Which tool is best for bulk decoding and reassembling DNS-tunneled data from a PCAP?",
        options: [
          "Wireshark's 'Follow TCP Stream' feature",
          "NetworkMiner for passive OS fingerprinting",
          "iodine/dnscat2 client or custom python script extracting DNS query fields with tshark + base64",
          "Nmap for service version detection"
        ],
        correctIndex: 2,
        explanation:
          "DNS tunneling reconstruction requires extracting the subdomain labels from each DNS query, ordering them by sequence (if present), decoding the payload (Base64/hex), and reassembling the data stream. tshark with -T fields -e dns.qry.name can extract query names, then a Python script can decode and reassemble. Tools like dns2tcp, iodine-analyzer, and NetworkMiner have built-in DNS tunnel detection.",
        concept: "PCAP analysis workflow for DNS tunneling: 1) tshark to extract DNS queries, 2) Filter by suspicious domain, 3) Extract labels, 4) Decode (Base64/hex), 5) Reassemble by sequence, 6) Carve files from reassembled data. Zeek (Bro) can automate DNS anomaly detection."
      },
      {
        text: "To definitively attribute the exfiltration to the host 10.0.4.87, what additional artifact would you correlate?",
        options: [
          "The ARP cache on the firewall to get the MAC address, then match to DHCP lease logs to identify the device/user",
          "Ping the IP address from another machine to confirm it is still online",
          "Check the SSL certificate of the target domain",
          "The ICMP echo request log"
        ],
        correctIndex: 0,
        explanation:
          "IP addresses alone are insufficient for attribution — they can be spoofed or dynamically assigned. The correct approach is: (1) get the MAC address from ARP cache/logs for IP 10.0.4.87, (2) correlate with DHCP lease logs to find which device/user had that IP at the time, (3) cross-reference with Active Directory or endpoint agent logs to identify the user and machine.",
        concept: "Network forensics attribution chain: IP → MAC (ARP logs) → Device (DHCP/NetBIOS) → User (AD logon events / SIEM). Without the full chain, defense attorneys can challenge attribution. Always preserve DHCP logs, firewall NAT logs, and VPN session logs."
      },
      {
        text: "Which network forensics artifact is MOST useful for reconstructing the timeline of a web-based attack, including HTTP headers and payload bodies?",
        options: [
          "NetFlow/IPFIX records (flow data)",
          "Full packet capture (PCAP) with application layer data",
          "Firewall accept/deny log (syslog)",
          "DNS server query log"
        ],
        correctIndex: 1,
        explanation:
          "Full packet captures (PCAP) contain the complete network conversation including payload data, HTTP headers, request/response bodies, and application-layer content. NetFlow only provides metadata (src/dst IP, ports, bytes, packets) — no content. Firewall logs only record connection decisions. PCAP is the 'gold standard' for network forensics but requires significant storage.",
        concept: "Network evidence tiers: 1) Full content (PCAP) — everything; 2) Session data (NetFlow/IPFIX) — metadata only; 3) Alert data (IDS/SIEM) — signature matches; 4) Statistical data — aggregated metrics. Full PCAP is most forensically valuable but least scalable."
      }
    ]
  },

  /* ═══════════════════════════════════════════════════════════════
     SCENARIO 6 – Mobile Forensics
     ═══════════════════════════════════════════════════════════════ */
  {
    id: 6,
    title: "Operation: Digital Alibi",
    topic: "Mobile Forensics",
    icon: "📱",
    accentColor: "#ff4488",
    description:
      "A murder suspect claims to have been at home all evening. Their seized iPhone may contain GPS coordinates, deleted messages, and app activity that challenge the alibi.",
    narrative: [
      "On the night of March 4th, a homicide occurred at a location 12 km from the suspect's claimed home address. The suspect's iPhone 13 Pro was seized the next morning. The device is locked with a 6-digit passcode and Face ID is active.",
      "Judicial authorization has been granted for the full extraction. Your lab has an UFED Touch3 physical extraction device and access to GrayKey. A logical extraction was attempted first — it returned partial data.",
      "The timeline between 20:00 and 23:30 is critical. You must correlate location data, deleted iMessages, and application artifacts to build an accurate timeline."
    ],
    evidence: [
      { icon: "📱", text: "iPhone 13 Pro – iOS 17.2.1 – locked (6-digit PIN + Face ID)" },
      { icon: "📍", text: "Apple Maps cache: 'Search: Via Garibaldi 14' at 19:58:07" },
      { icon: "💬", text: "iMessage fragments recovered from SQLite WAL file" },
      { icon: "🗺️",  text: "Significant Locations: 3 visits to crime area in last 90 days" }
    ],
    terminalLabel: "UFED LOGICAL EXTRACTION // Artifacts",
    terminalContent: `<span class="t-header">══ iOS ARTIFACT REPORT ══════════════════</span>
<span class="t-key">Device       :</span> <span class="t-val">iPhone 13 Pro (A2641)</span>
<span class="t-key">iOS Version  :</span> <span class="t-val">17.2.1</span>
<span class="t-key">Extraction   :</span> <span class="t-val">Logical + File System (partial)</span>
<span class="t-dim">──────────────────────────────────────────</span>
<span class="t-header">── SIGNIFICANT LOCATIONS (CoreLocation) ─</span>
<span class="t-key">  Loc #1:</span> <span class="t-warn">45.4654°N 9.1859°E @ 20:14:22 (Mar 4)</span>
<span class="t-key">  Loc #2:</span> <span class="t-warn">45.4651°N 9.1862°E @ 21:03:47 (Mar 4)</span>
<span class="t-key">  Loc #3:</span> <span class="t-dim">Home address @ 23:51:00 (Mar 4)</span>
<span class="t-header">── iMESSAGE (cache.db WAL recovery) ─────</span>
<span class="t-warn">  21:17:14  "it's done, leaving now"</span>
<span class="t-warn">  21:18:02  [attachment deleted]</span>
<span class="t-key">── STEPS (CMPedometerData) ──────────────</span>
<span class="t-warn">  Mar 4, 20:00–22:00: 4,847 steps</span>
<span class="t-comment"># Logical coord match: crime scene area</span>`,
    hint: "iOS devices store location data in multiple places: Significant Locations (CoreLocation), GPS EXIF in photos, Wi-Fi positioning, and app-specific location databases.",
    questions: [
      {
        text: "The UFED performed a logical extraction. What is the key limitation of logical extraction compared to physical or full filesystem extraction on iOS?",
        options: [
          "Logical extraction only works on Android devices",
          "Logical extraction accesses only what the iOS backup API exposes — it misses deleted data, app sandbox containers not backed up, keychain data, and low-level filesystem artifacts",
          "Logical extraction cannot recover photos or videos",
          "Logical extraction requires the device to be jailbroken"
        ],
        correctIndex: 1,
        explanation:
          "Logical extraction uses the Apple iTunes/Finder backup mechanism (AFC protocol). It only retrieves data that iOS exposes through its official backup API — approximately 70-80% of stored data. It misses: deleted records not yet overwritten in SQLite databases, Keychain entries (passwords), app data marked as 'excluded from backup', and low-level filesystem artifacts like cached GPS and system logs.",
        concept: "iOS extraction levels: 1) Logical (iTunes backup API) — least invasive, least complete; 2) Advanced Logical (full filesystem via developer mode / checkm8); 3) Physical (raw NAND extraction) — most complete, hardest; 4) Cloud (iCloud backup/MDM) — depends on sync settings."
      },
      {
        text: "The iMessage fragment 'it's done, leaving now' was recovered from a SQLite WAL file. What is a WAL file in the context of mobile forensics?",
        options: [
          "A Windows Application Log file used by iOS for debugging",
          "Write-Ahead Log — a SQLite journaling mechanism where uncommitted transactions are stored; can contain recently deleted records not yet purged from the main database",
          "A WhatsApp Archive Log containing encrypted chat backups",
          "A WiFi Adapter Log recording wireless network connections"
        ],
        correctIndex: 1,
        explanation:
          "SQLite's Write-Ahead Log (WAL) mode writes changes to a .wal file before committing them to the main .db file. This means recently deleted records may still exist in the WAL or in the rollback journal before the database is checkpointed (compacted). Mobile forensics tools specifically parse WAL files to recover records that apps have 'deleted' from the main database.",
        concept: "SQLite forensics: Messages, WhatsApp, Telegram, contacts, and most iOS/Android apps use SQLite. Deleted records may be recovered from: WAL files (-wal), rollback journals (-journal), SQLite freelist pages (within the .db file), and unallocated database space. Tools: DB Browser for SQLite, sqlite-deleted, AXIOM."
      },
      {
        text: "The GPS coordinates in Significant Locations match the crime scene area. Under which iOS privacy feature are these stored, and why is it forensically significant?",
        options: [
          "iCloud Keychain — encrypted end-to-end with no forensic access",
          "Apple's Significant Locations (frequented places) in the CoreLocation framework — stored in an encrypted SQLite database, requires device passcode or physical access to extract",
          "Google Maps cache — accessible via logical extraction always",
          "SIM card memory — only 256 bytes available"
        ],
        correctIndex: 1,
        explanation:
          "Apple's Significant Locations feature (System Preferences → Privacy → Location → System Services) records places the user frequents using CoreLocation. The data is stored in an encrypted SQLite database (KnowledgeC.db and the coreduet database). On newer iOS, this requires physical/advanced logical extraction or device-level decryption. It can provide a GPS timeline with timestamps even when no apps logged the location.",
        concept: "Key iOS location forensics databases: KnowledgeC.db (location + app usage timeline), consolidated.db (historical), com.apple.Maps/History.mapsdata (search history), Photo EXIF GPS, Find My cache, Wi-Fi hotspot location cache. UFED/Oxygen/AXIOM can parse all of these."
      },
      {
        text: "The defense argues the GPS data was automatically generated by the OS and the suspect didn't actively use the phone. How do you strengthen the evidence that the suspect was actively present?",
        options: [
          "GPS data alone is sufficient; no corroboration is needed",
          "Correlate multiple independent data sources: step counter (CMPedometerData showing 4,847 steps), iMessage timestamps matching the location, screen unlock events (biometric logs), and cell tower triangulation records",
          "Obtain a second phone from the carrier to compare",
          "GPS accuracy of ±5 meters is sufficient proof of presence"
        ],
        correctIndex: 1,
        explanation:
          "A single artifact can be challenged in court. Convergence of multiple independent data sources creates an irrefutable timeline: (1) GPS coordinates matching crime scene, (2) 4,847 steps indicating physical movement, (3) iMessage sent from the location, (4) screen interaction logs showing active use. This multi-source correlation eliminates alternative explanations like GPS spoofing or background location updates.",
        concept: "Mobile forensics best practice: corroborate location claims with at least 3 independent data sources. Use: GPS (CoreLocation), Cell tower records (carrier CDRs), Wi-Fi location (hotspot databases), Application location logs, Physical movement (accelerometer/pedometer), Communication metadata (SMS/call timestamps)."
      }
    ]
  }
];

/* Export for use in game engine */
if (typeof module !== 'undefined') module.exports = { SCENARIOS };
