// Campagna completa da 10-15 minuti: un caso investigativo in 6 atti progressivi.

export const STORY = {
  operation: 'OPERATION SHATTERED MERIDIAN',
  agency: 'Digital Forensics Division',
  playerRole: 'Junior forensic analyst assigned to Agent Root',
  antagonist: 'Night Meridian ransomware cell',
  premise:
    'A regional hospital network has been hit by Night Meridian. The live breach is contained, but the payment channel, mule identities, and exfiltration path are still buried in seized devices.',
  stakes:
    'You have one lab session to turn raw bytes into defensible evidence before the incident command team decides whether to notify banks, arrest the mule, and warn the affected victims.',
  finalReport:
    'The reconstructed evidence links the ransom channel, forged identity, ATM cash-out, fraudulent transfer, ransomware payload, and exfiltrated credentials into one defensible incident chain.',
};

export const CAMPAIGN = [
  // ─── ACT 1 ─── Contiguous PNG carving with false positive ──────
  {
    id: 'level_1',
    title: 'ACT 1: Intake and False Lead',
    subtitle: 'Contiguous carving with evidence validation',
    difficulty: 'triage',
    caseNote: '03:14 UTC. Incident command receives a seized laptop from a suspected Night Meridian negotiator. Agent Root assigns you the first triage pass: prove whether the chat screenshot still exists.',
    briefing: [
      'You are examining a forensic image from a seized laptop belonging to a Night Meridian ransomware negotiator.',
      'Intelligence confirms the suspect deleted a screenshot of an encrypted chat log used to coordinate a cryptocurrency ransom payment against the hospital network. A PNG copy was present on the drive before seizure.',
      'Anti-forensics: the suspect planted a fake PNG header (decoy) earlier in the dump to mislead investigators. Do not trust the first magic number — verify header AND footer.',
      'After carving the genuine evidence, submit a report conclusion with the terminal: report recovered.',
    ],
    debrief:
      'The recovered chat log confirms the ransom wallet and gives the task force its first reliable thread: Night Meridian used a document mule to move money after negotiation.',
    forensicConcept: {
      title: 'File Signatures & Magic Numbers',
      paragraphs: [
        'Every file format begins with a distinctive byte sequence called a "magic number" or file signature. Forensic analysts use these signatures to locate files inside raw disk images, bypassing the file system entirely.',
        'A PNG file always starts with the 8-byte header 89 50 4E 47 0D 0A 1A 0A and ends with the IEND chunk: 49 45 4E 44 AE 42 60 82. Both must be present for a valid recovery.',
        'Anti-forensics technique: attackers sometimes plant fake headers (decoys) to waste investigator time. Always verify that a header has a matching footer before concluding a file is recoverable.',
      ],
      keySignatures: ['PNG'],
    },
    objectives: [
      { id: 'find_header', text: 'Find a valid PNG header, not only a header-looking decoy', completed: false },
      { id: 'select_range', text: 'Select the exact contiguous byte range', completed: false },
      { id: 'carve_file', text: 'Carve and verify the recovered object', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'PNG files start with 89 50 4E 47 0D 0A 1A 0A and end with 49 45 4E 44 AE 42 60 82.',
      'A header without a coherent footer is only a lead, not evidence.',
      'Use search 89504E47 to find all occurrences, then verify each one.',
    ],
    maxScore: 150,
    timeBonusThreshold: 240,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: false,
    nudges: [
      { objectiveId: 'find_header', delaySeconds: 45, message: 'Try typing search 89504E47 in the terminal to locate PNG file signatures in the dump.' },
      { objectiveId: 'select_range', delaySeconds: 90, message: 'Click and drag across hex bytes to select a range, or use select <start> <end> in the terminal. Remember: a valid PNG needs both header (89504E47) AND footer (49454E44AE426082).' },
      { objectiveId: 'carve_file', delaySeconds: 120, message: 'After stashing your selection, click "Compose & Carve" in the Workbench panel on the left.' },
      { objectiveId: 'report_recovered', delaySeconds: 150, message: 'Your evidence is carved! Now type report recovered in the terminal to submit your forensic conclusion.' },
    ],
  },

  // ─── ACT 2 ─── Fragmented PNG reconstruction ──────────────────
  {
    id: 'level_2',
    title: 'ACT 2: The Fracture',
    subtitle: 'Fragmented reconstruction and ordering',
    difficulty: 'fragmented',
    caseNote: 'The wallet lead points to a forged identity packet used to open intermediary bank accounts. The file survived deletion, but not contiguously.',
    briefing: [
      'The suspect\'s SSD used TRIM, causing file data to be scattered across non-contiguous disk sectors.',
      'A scanned image of a forged identity document — used by Night Meridian to open fraudulent bank accounts — was split into two fragments during deletion. The first fragment contains the PNG header, the second contains the footer.',
      'Two filesystem journal remnants survived before the fragments: FR01 and FR02. Each marker is followed by a two-byte fragment length, then the fragment bytes.',
      'Garbage bytes between fragments are unrelated disk residue and must NOT be included in the reconstruction.',
      'Stash both fragments in the Workbench, keep their forensic order, carve the composed stream, then report recovered.',
    ],
    debrief:
      'The reconstructed identity scan gives investigators a mule alias. Bank telemetry now ties that alias to a cash-out attempt at a compromised ATM.',
    forensicConcept: {
      title: 'File Fragmentation on Disk',
      paragraphs: [
        'When a file is saved, the operating system allocates disk clusters. If contiguous clusters are unavailable, the file is split across non-adjacent locations — this is fragmentation.',
        'After deletion, each fragment may survive independently. A forensic examiner must locate all fragments, determine their correct order, and reconstruct the original file.',
        'Filesystem journals or allocation remnants can sometimes reveal fragment run descriptors. In this case, FR01 and FR02 identify two recovered runs and the length bytes immediately after each marker tell you where the fragment ends.',
        'The cluster gap between fragments often contains unrelated data (garbage). Including these bytes in the reconstruction corrupts the recovered file.',
      ],
      keySignatures: ['PNG', 'FR01', 'FR02'],
    },
    objectives: [
      { id: 'find_chunk1', text: 'Find and stash Fragment #1 (contains the PNG header)', completed: false },
      { id: 'find_chunk2', text: 'Find and stash Fragment #2 (contains the PNG footer)', completed: false },
      { id: 'order_chunks', text: 'Keep fragments in the correct reconstruction order', completed: false },
      { id: 'carve_file', text: 'Compose and carve the reassembled file', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'Look for the recovered run descriptors: FR01 = 46 52 30 31 and FR02 = 46 52 30 32.',
      'Each FR marker is followed by a two-byte length field, then the fragment bytes. 00 AA means 170 bytes; 00 AB means 171 bytes.',
      'The PNG header confirms fragment 1, and the IEND footer confirms fragment 2.',
      'Do not include the FR marker, length bytes, or unallocated garbage in the stashed fragments.',
      'You can reorder fragments in the Workbench by dragging them.',
    ],
    maxScore: 200,
    timeBonusThreshold: 300,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: false,
    nudges: [
      { objectiveId: 'find_chunk1', delaySeconds: 45, message: 'Use search 46523031 to find FR01. The two bytes after it encode fragment length; stash only the fragment bytes after the descriptor.' },
      { objectiveId: 'find_chunk2', delaySeconds: 90, message: 'Use search 46523032 to find FR02. It marks the second run; the PNG footer confirms the end of the recovered file.' },
      { objectiveId: 'carve_file', delaySeconds: 140, message: 'Both fragments should now be in your Workbench. Make sure Fragment #1 (with the header) is first, then click "Compose & Carve".' },
    ],
  },

  // ─── ACT 3 ─── Multi-signature triage (JPEG target, PDF decoy) ─
  {
    id: 'level_3',
    title: 'ACT 3: Signal and Noise',
    subtitle: 'Multi-signature triage — identify the correct target format',
    difficulty: 'multi_sig',
    caseNote: 'The mule alias appears in bank surveillance metadata. Your dump contains several recoverable artefacts, but only one can place the suspect at the ATM.',
    briefing: [
      'An ATM skimming investigation has yielded a disk image from the suspect\'s laptop. Intelligence specifies the target is a JPEG still frame from CCTV surveillance footage showing the mule at the compromised ATM.',
      'The dump contains a complete PDF document (an unrelated police report) and a truncated JPEG header planted as a decoy. Neither is the evidence you need.',
      'Locate the genuine CCTV surveillance JPEG (starts with FF D8 FF, ends with FF D9), carve it, and report recovered.',
    ],
    debrief:
      'The CCTV frame connects the forged identity to a real-world cash-out. The next warrant targets a corporate accountant suspected of laundering the transfer.',
    forensicConcept: {
      title: 'Signature-Based Carving & File Format Diversity',
      paragraphs: [
        'A forensic examiner must know multiple file signatures. Different file types use different magic numbers: PNG (89504E47), JPEG (FFD8FF), PDF (25504446), ZIP (504B0304).',
        'When multiple signatures appear in a dump, the examiner must determine which ones are relevant to the investigation. Not every recoverable file is evidence.',
        'A common mistake is carving every recognisable file. Forensic discipline requires targeting only the artefacts specified by the case brief.',
      ],
      keySignatures: ['JPEG', 'PDF'],
    },
    objectives: [
      { id: 'identify_target', text: 'Determine that the target is a JPEG, not the PDF', completed: false },
      { id: 'avoid_pdf', text: 'Avoid selecting the PDF document as evidence', completed: false },
      { id: 'select_range', text: 'Select the exact JPEG byte range (FFD8FF…FFD9)', completed: false },
      { id: 'carve_file', text: 'Carve and verify the JPEG image', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'JPEG files start with FF D8 FF and end with FF D9.',
      'A PDF starts with %PDF (hex 25 50 44 46) — this is NOT your target.',
      'There may be a truncated JPEG header without a footer. Verify both ends.',
      'Use search FFD8FF to find JPEG signatures.',
    ],
    maxScore: 200,
    timeBonusThreshold: 300,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: false,
    nudges: [
      { objectiveId: 'identify_target', delaySeconds: 45, message: 'Read the briefing carefully — the target is a JPEG (starts with FF D8 FF), not the PDF. Try search FFD8FF in the terminal.' },
      { objectiveId: 'select_range', delaySeconds: 100, message: 'A valid JPEG runs from FF D8 FF to FF D9. Make sure BOTH the header and footer are present in your selection. Truncated headers are decoys.' },
      { objectiveId: 'report_recovered', delaySeconds: 150, message: 'Evidence carved! Type report recovered in the terminal to close this case.' },
    ],
  },

  // ─── ACT 4 ─── MBR Partition Archaeology ──────────────────────
  {
    id: 'level_4',
    title: 'ACT 4: Partition Archaeology',
    subtitle: 'Parse the MBR partition table to unlock hidden sectors',
    difficulty: 'mbr',
    caseNote: 'The accountant tried to hide banking evidence inside an old partition layout. The file is not gone; it is behind an offset calculation.',
    briefing: [
      'You receive a forensic image from the corporate accountant\'s seized hard drive. The drive uses a traditional MBR partition layout. A screenshot proving fraudulent wire transfers was hidden inside the NTFS partition.',
      'Read the partition table at offset 0x1BE. Each entry is 16 bytes. The LBA start address is at bytes 8-11 of each entry, stored in Little-Endian format.',
      'Calculate the byte offset (LBA_start × sector_size) and use the terminal command "go <offset>" to unlock the target sector. The sector size for this dump is 32 bytes.',
      'After unlocking, locate and carve the PNG evidence of the suspicious bank transfer, then report recovered.',
    ],
    debrief:
      'The bank transfer screenshot closes the money trail. Agent Root now pivots from laundering to attribution: recover the ransomware configuration itself.',
    forensicConcept: {
      title: 'Master Boot Record & Partition Tables',
      paragraphs: [
        'The MBR occupies the first 512 bytes (sector 0) of a storage device. It contains boot code (446 bytes), a partition table (64 bytes for 4 entries), and the boot signature (0x55AA).',
        'Each 16-byte partition entry encodes: status byte, CHS addresses, type byte, and crucially the LBA start address (bytes 8-11) and size (bytes 12-15) in Little-Endian format.',
        'Little-Endian means the least significant byte comes first. For example, hex bytes 3F 00 00 00 represent the decimal value 63 (0x3F).',
        'To find the byte offset of a partition: multiply the LBA start value by the sector size. This is where the partition\'s data begins.',
      ],
      keySignatures: ['PNG'],
    },
    objectives: [
      { id: 'read_mbr', text: 'Locate and read the MBR partition table at 0x1BE', completed: false },
      { id: 'find_lba', text: 'Extract the LBA start address in Little-Endian', completed: false },
      { id: 'calculate_offset', text: 'Calculate the byte offset (LBA × sector_size)', completed: false },
      { id: 'unlock_sector', text: 'Unlock the partition with go <offset>', completed: false },
      { id: 'select_range', text: 'Select the PNG byte range', completed: false },
      { id: 'carve_file', text: 'Carve the recovered file', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'The partition table starts at byte offset 446 (0x1BE) from the beginning of the dump.',
      'Each partition entry is 16 bytes. The first entry starts at 0x1BE.',
      'Bytes 8-11 of the entry contain the LBA start in Little-Endian. Read them right-to-left.',
      'The sector size is 32 bytes. Multiply the LBA start by 32 to get the byte offset.',
      'After calculating, use: go <offset> in the terminal to unlock.',
    ],
    maxScore: 300,
    timeBonusThreshold: 360,
    acceptedReport: 'recovered',
    requires_mbr: true,
    requires_xor: false,
    walkthroughExample: {
      title: 'Worked Example: Reading an MBR Partition Entry',
      steps: [
        'The partition table starts at offset 0x1BE (446 bytes from the beginning).',
        'Each partition entry is 16 bytes. The LBA start address is at bytes 8–11 of each entry.',
        'Example: if bytes 8–11 read  3F 00 00 00  in the dump…',
        'Little-Endian means least-significant byte first. Read right-to-left: 00 00 00 3F → 0x3F = 63.',
        'Byte offset = LBA_start × sector_size. With sector_size = 32: 63 × 32 = 2016.',
        'Type  go 2016  in the terminal to jump to that partition\'s data area.',
      ],
    },
    nudges: [
      { objectiveId: 'read_mbr', delaySeconds: 30, message: 'Navigate to offset 0x1BE (decimal 446) to inspect the MBR partition table. Use go 446 in the terminal; this does not unlock the partition yet.' },
      { objectiveId: 'find_lba', delaySeconds: 60, message: 'Look at bytes 8–11 of the first partition entry. These 4 bytes contain the LBA start address in Little-Endian format (least-significant byte first).' },
      { objectiveId: 'calculate_offset', delaySeconds: 90, message: 'To convert Little-Endian: read the 4 bytes right-to-left to get the hex value, convert to decimal, then multiply by the sector size (32 bytes).' },
      { objectiveId: 'unlock_sector', delaySeconds: 120, message: 'Use the terminal command go <byte_offset> with the value you calculated to unlock the partition data.' },
      { objectiveId: 'select_range', delaySeconds: 160, message: 'Now look for the PNG signature (89504E47) in the unlocked area. Select from header to footer and stash it.' },
    ],
  },

  // ─── ACT 5 ─── XOR deobfuscation & partial recovery ──────────
  {
    id: 'level_5',
    title: 'ACT 5: The Obscured Tail',
    subtitle: 'Partial recovery, XOR deobfuscation, and defensible conclusion',
    difficulty: 'partial',
    caseNote: 'Malware triage finds a deleted configuration block from the Night Meridian loader. It may expose the payload family, but the tail has been overwritten.',
    briefing: [
      'A text artefact from the ransomware loader was partially overwritten after deletion. The surviving bytes were also weakly obfuscated with a single-byte XOR.',
      'Malware triage notes that Night Meridian loaders tag candidate payload blocks with small cleartext markers: NMPL for the real loader payload and NXPL for a planted decoy candidate.',
      'The plaintext likely starts with "RANSOMWARE_PAYLOAD". Find the marked candidates, test the first encrypted byte against ASCII "R" (0x52), and reject the block whose derived key does not decode coherently.',
      'A perfect recovery is impossible: recover the surviving range, derive the XOR key from known plaintext, carve the readable fragment, then submit: report partial.',
      'If you want a secondary triage path, use entropy to locate blocks whose byte distribution deviates from the surrounding random noise.',
    ],
    debrief:
      'The partial payload is enough to identify the ransomware branch, but not enough to overclaim. The final dump may still contain the credentials used for exfiltration.',
    forensicConcept: {
      title: 'Loader Markers, XOR & Known-Plaintext Attacks',
      paragraphs: [
        'XOR (exclusive OR) is the simplest form of obfuscation. Each byte of plaintext is combined with a key byte: ciphertext = plaintext ⊕ key. The same operation reverses it: plaintext = ciphertext ⊕ key.',
        'Real malware often stores compact cleartext markers before encoded payloads so its loader can find the right block at runtime. Here, NMPL marks the Night Meridian payload candidate and NXPL marks a decoy candidate.',
        'If you know even one byte of the original plaintext, you can derive the key: key = ciphertext_byte ⊕ known_plaintext_byte. This is called a known-plaintext attack.',
        'Entropy analysis is a secondary triage method: encoded text can have a different byte distribution from random filler, so anomalous blocks deserve closer inspection.',
        'Partial recovery occurs when part of the original data has been overwritten by new data. The forensic conclusion must accurately reflect that the recovery is incomplete — overclaiming undermines the entire investigation.',
      ],
      keySignatures: ['NMPL', 'NXPL'],
    },
    objectives: [
      { id: 'find_partial', text: 'Identify the recoverable NMPL-marked obfuscated fragment', completed: false },
      { id: 'find_key', text: 'Derive the XOR key from known plaintext', completed: false },
      { id: 'decrypt', text: 'Apply XOR deobfuscation to the recovered fragment', completed: false },
      { id: 'carve_file', text: 'Carve the partial readable payload', completed: false },
      { id: 'declare_limit', text: 'Recognise that the original file is incomplete', completed: false },
      { id: 'report_partial', text: 'Report a partial recovery without overclaiming', completed: false },
    ],
    hints: [
      'Search for loader markers: NM is 4E4D and NX is 4E58. The encrypted candidate starts 4 bytes after the marker.',
      'You can also use entropy to identify blocks whose byte distribution differs from the surrounding random filler.',
      'For single-byte XOR, plaintext_byte XOR ciphertext_byte reveals the key. Test each candidate with ASCII "R" (0x52).',
      'The NMPL candidate should derive key 0x2A and decode into RANSOMWARE_PAYLOAD...',
      'A missing tail means the correct conclusion is partial, not recovered.',
      'The report matters here as much as the byte selection.',
    ],
    maxScore: 300,
    timeBonusThreshold: 360,
    acceptedReport: 'partial',
    allowPartial: true,
    requires_mbr: false,
    requires_xor: true,
    nudges: [
      { objectiveId: 'find_partial', delaySeconds: 45, message: 'Search for marker 4E4D (NM) and 4E58 (NX). Each marked candidate starts 4 bytes after the marker; NMPL is the likely loader payload, NXPL is suspicious.' },
      { objectiveId: 'find_key', delaySeconds: 90, message: 'Use xorcalc in the terminal: XOR the first encrypted byte after each marker with 0x52 (ASCII "R") to derive and compare candidate keys.' },
      { objectiveId: 'report_partial', delaySeconds: 150, message: 'The file was partially overwritten — the correct conclusion is report partial, not recovered. Forensic integrity matters!' },
    ],
  },

  // ─── ACT 6 ─── Ransomware Aftermath (multi-frag XOR triage) ───
  {
    id: 'level_6',
    title: 'ACT 6: Ransomware Aftermath',
    subtitle: 'Multi-fragment XOR recovery with forensic triage',
    difficulty: 'ransomware',
    caseNote: 'The last image comes from a staging server. If the credential fragments can be reconstructed, the response team can notify victims and revoke the compromised accounts.',
    briefing: [
      'The Night Meridian incident left encrypted credential fragments scattered across this dump. The attacker used single-byte XOR with an unknown key.',
      'Intelligence suggests the plaintext begins with "EXFILTRATED_CREDENTIALS". Use this to derive the XOR key.',
      'Three separate fragments must be recovered and assembled in order. The staging tool left cleartext records EX01, EX02, and EX03; each record is followed by one length byte and then an XOR-encoded fragment.',
      'Decoy artefacts include a corrupted PNG header and an EXD0 record containing fake credentials encoded with a different XOR key.',
      'After XOR decryption, carve the reassembled payload and report recovered.',
    ],
    debrief:
      'The recovered credentials confirm exfiltration and give incident command the account list needed for containment, victim notification, and prosecution.',
    forensicConcept: {
      title: 'Incident Response & Multi-Artefact Triage',
      paragraphs: [
        'In a real ransomware investigation, exfiltrated data is often fragmented across multiple locations. The attacker may use weak encryption to hinder casual recovery while keeping the data accessible to their own tools.',
        'Staging tools often need small cleartext record tags so they can reassemble chunks later. Here, EX01, EX02, and EX03 identify ordered exfiltration records; EXD0 is a planted decoy record.',
        'Forensic triage requires distinguishing between genuine evidence fragments, anti-forensics decoys, and unrelated data. Each stashed fragment affects your evidence chain — false inclusions weaken the case.',
        'When multiple fragments exist, their reconstruction order matters. An incorrect sequence produces corrupted output even if the individual fragments are correct.',
      ],
      keySignatures: ['EX01', 'EX02', 'EX03', 'EXD0'],
    },
    objectives: [
      { id: 'find_chunk1', text: 'Find and stash Fragment #1 (beginning of the payload)', completed: false },
      { id: 'find_chunk2', text: 'Find and stash Fragment #2 (middle section)', completed: false },
      { id: 'find_chunk3', text: 'Find and stash Fragment #3 (end section)', completed: false },
      { id: 'order_chunks', text: 'Arrange all three fragments in correct order', completed: false },
      { id: 'find_key', text: 'Derive the XOR key from known plaintext', completed: false },
      { id: 'decrypt', text: 'Apply XOR deobfuscation to the assembled payload', completed: false },
      { id: 'carve_file', text: 'Carve the decrypted credentials', completed: false },
      { id: 'report_recovered', text: 'Report a full recovery of the credential payload', completed: false },
    ],
    hints: [
      'Search for staging records: EX01 = 45 58 30 31, EX02 = 45 58 30 32, EX03 = 45 58 30 33.',
      'The byte immediately after each EX record is the fragment length. Stash the encrypted bytes after that length byte.',
      'ASCII "E" = 0x45. XOR the first byte after EX01 with 0x45 to derive the key.',
      'EXD0 is a decoy credential block using a different XOR key (0x3C) — it will produce garbage with the real key.',
      'Fragment order follows the record IDs: EX01, EX02, EX03.',
      'After stashing all 3 fragments in order, apply XOR in the Workbench, then Compose & Carve.',
    ],
    maxScore: 350,
    timeBonusThreshold: 420,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: true,
    nudges: [
      { objectiveId: 'find_chunk1', delaySeconds: 45, message: 'Search 45583031 to find EX01. The following byte is the fragment length; stash only the encrypted payload bytes after it.' },
      { objectiveId: 'find_key', delaySeconds: 90, message: 'XOR the first EX01 payload byte with 0x45 (ASCII "E") using xorcalc to derive the real key. EXD0 is a wrong-key decoy.' },
      { objectiveId: 'find_chunk3', delaySeconds: 140, message: 'Find EX02 and EX03 the same way. Stash fragments in record order: EX01, EX02, EX03.' },
    ],
  },
];

// Signatures forensi note per reference in-game
export const KNOWN_SIGNATURES = {
  png:  { header: '89504E47', footer: '49454E44AE426082', name: 'PNG Image',     description: 'Portable Network Graphics — lossless image format' },
  jpg:  { header: 'FFD8FF',   footer: 'FFD9',             name: 'JPEG Image',    description: 'Joint Photographic Experts Group — lossy image format' },
  pdf:  { header: '25504446', footer: '2525454F46',       name: 'PDF Document',  description: 'Portable Document Format — page layout document' },
  zip:  { header: '504B0304', footer: '504B0506',         name: 'ZIP Archive',   description: 'PKZip compressed archive format' },
  gif:  { header: '47494638', footer: '003B',             name: 'GIF Image',     description: 'Graphics Interchange Format — animated image' },
  docx: { header: '504B0304', footer: '504B0506',         name: 'DOCX (Office)', description: 'Microsoft Office Open XML — same ZIP container' },
  exe:  { header: '4D5A',     footer: '',                 name: 'PE Executable', description: 'Windows Portable Executable binary' },
  elf:  { header: '7F454C46', footer: '',                 name: 'ELF Binary',    description: 'Linux Executable and Linkable Format' },
  nmpl: { header: '4E4D504C', footer: '',                 name: 'NMPL Marker',   description: 'Night Meridian loader payload marker' },
  nxpl: { header: '4E58504C', footer: '',                 name: 'NXPL Marker',   description: 'Night Meridian decoy candidate marker' },
  fr01: { header: '46523031', footer: '',                 name: 'FR01 Run',      description: 'Recovered fragment run descriptor #1' },
  fr02: { header: '46523032', footer: '',                 name: 'FR02 Run',      description: 'Recovered fragment run descriptor #2' },
  ex01: { header: '45583031', footer: '',                 name: 'EX01 Record',   description: 'Exfiltration staging record #1' },
  ex02: { header: '45583032', footer: '',                 name: 'EX02 Record',   description: 'Exfiltration staging record #2' },
  ex03: { header: '45583033', footer: '',                 name: 'EX03 Record',   description: 'Exfiltration staging record #3' },
  exd0: { header: '45584430', footer: '',                 name: 'EXD0 Decoy',    description: 'Wrong-key exfiltration decoy record' },
};
