// Campagna completa da 10-15 minuti: un caso investigativo in 6 atti progressivi.

export const CAMPAIGN = [
  // ─── ACT 1 ─── Contiguous PNG carving with false positive ──────
  {
    id: 'level_1',
    title: 'ACT 1: Intake and False Lead',
    subtitle: 'Contiguous carving with evidence validation',
    difficulty: 'triage',
    briefing: [
      'You are examining a forensic image from a seized laptop belonging to a ransomware operator.',
      'Intelligence confirms the suspect deleted a screenshot of an encrypted chat log used to coordinate a cryptocurrency ransom payment. A PNG copy was present on the drive before seizure.',
      'Anti-forensics: the suspect planted a fake PNG header (decoy) earlier in the dump to mislead investigators. Do not trust the first magic number — verify header AND footer.',
      'After carving the genuine evidence, submit a report conclusion with the terminal: report recovered.',
    ],
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
  },

  // ─── ACT 2 ─── Fragmented PNG reconstruction ──────────────────
  {
    id: 'level_2',
    title: 'ACT 2: The Fracture',
    subtitle: 'Fragmented reconstruction and ordering',
    difficulty: 'fragmented',
    briefing: [
      'The suspect\'s SSD used TRIM, causing file data to be scattered across non-contiguous disk sectors.',
      'A scanned image of a forged identity document — used to open fraudulent bank accounts — was split into two fragments during deletion. The first fragment contains the PNG header, the second contains the footer.',
      'Garbage bytes between fragments are unrelated disk residue and must NOT be included in the reconstruction.',
      'Stash both fragments in the Workbench, keep their forensic order, carve the composed stream, then report recovered.',
    ],
    forensicConcept: {
      title: 'File Fragmentation on Disk',
      paragraphs: [
        'When a file is saved, the operating system allocates disk clusters. If contiguous clusters are unavailable, the file is split across non-adjacent locations — this is fragmentation.',
        'After deletion, each fragment may survive independently. A forensic examiner must locate all fragments, determine their correct order, and reconstruct the original file.',
        'The cluster gap between fragments often contains unrelated data (garbage). Including these bytes in the reconstruction corrupts the recovered file.',
      ],
      keySignatures: ['PNG'],
    },
    objectives: [
      { id: 'find_chunk1', text: 'Find and stash Fragment #1 (contains the PNG header)', completed: false },
      { id: 'find_chunk2', text: 'Find and stash Fragment #2 (contains the PNG footer)', completed: false },
      { id: 'order_chunks', text: 'Keep fragments in the correct reconstruction order', completed: false },
      { id: 'carve_file', text: 'Compose and carve the reassembled file', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'Look for the PNG header (89 50 4E 47) for the first fragment.',
      'The second fragment ends with the PNG footer: 49 45 4E 44 AE 42 60 82.',
      'Do not include the unallocated garbage between fragments.',
      'You can reorder fragments in the Workbench by dragging them.',
    ],
    maxScore: 200,
    timeBonusThreshold: 300,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: false,
  },

  // ─── ACT 3 ─── Multi-signature triage (JPEG target, PDF decoy) ─
  {
    id: 'level_3',
    title: 'ACT 3: Signal and Noise',
    subtitle: 'Multi-signature triage — identify the correct target format',
    difficulty: 'multi_sig',
    briefing: [
      'An ATM skimming investigation has yielded a disk image from the suspect\'s laptop. Intelligence specifies the target is a JPEG still frame from CCTV surveillance footage showing the suspect at the compromised ATM.',
      'The dump contains a complete PDF document (an unrelated police report) and a truncated JPEG header planted as a decoy. Neither is the evidence you need.',
      'Locate the genuine CCTV surveillance JPEG (starts with FF D8 FF, ends with FF D9), carve it, and report recovered.',
    ],
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
  },

  // ─── ACT 4 ─── MBR Partition Archaeology ──────────────────────
  {
    id: 'level_4',
    title: 'ACT 4: Partition Archaeology',
    subtitle: 'Parse the MBR partition table to unlock hidden sectors',
    difficulty: 'mbr',
    briefing: [
      'A forensic image from a corporate accountant\'s seized hard drive. The drive uses a traditional MBR partition layout. A screenshot proving fraudulent wire transfers was hidden inside the NTFS partition.',
      'Read the partition table at offset 0x1BE. Each entry is 16 bytes. The LBA start address is at bytes 8-11 of each entry, stored in Little-Endian format.',
      'Calculate the byte offset (LBA_start × sector_size) and use the terminal command "go <offset>" to unlock the target sector. The sector size for this dump is 32 bytes.',
      'After unlocking, locate and carve the PNG evidence of the suspicious bank transfer, then report recovered.',
    ],
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
  },

  // ─── ACT 5 ─── XOR deobfuscation & partial recovery ──────────
  {
    id: 'level_5',
    title: 'ACT 5: The Obscured Tail',
    subtitle: 'Partial recovery, XOR deobfuscation, and defensible conclusion',
    difficulty: 'partial',
    briefing: [
      'The final text artefact was partially overwritten after deletion. The surviving bytes were also weakly obfuscated with a single-byte XOR.',
      'Malware triage suggests the plaintext likely starts with "RANSOMWARE_PAYLOAD".',
      'A perfect recovery is impossible: recover the surviving range, derive the XOR key from known plaintext, carve the readable fragment, then submit: report partial.',
      'Warning: a decoy XOR-encoded block exists in the dump. Verify your selection against the known plaintext before committing.',
    ],
    forensicConcept: {
      title: 'XOR Obfuscation & Known-Plaintext Attacks',
      paragraphs: [
        'XOR (exclusive OR) is the simplest form of obfuscation. Each byte of plaintext is combined with a key byte: ciphertext = plaintext ⊕ key. The same operation reverses it: plaintext = ciphertext ⊕ key.',
        'If you know even one byte of the original plaintext, you can derive the key: key = ciphertext_byte ⊕ known_plaintext_byte. This is called a known-plaintext attack.',
        'Partial recovery occurs when part of the original data has been overwritten by new data. The forensic conclusion must accurately reflect that the recovery is incomplete — overclaiming undermines the entire investigation.',
      ],
      keySignatures: [],
    },
    objectives: [
      { id: 'find_partial', text: 'Identify the recoverable obfuscated text fragment', completed: false },
      { id: 'find_key', text: 'Derive the XOR key from known plaintext', completed: false },
      { id: 'decrypt', text: 'Apply XOR deobfuscation to the recovered fragment', completed: false },
      { id: 'carve_file', text: 'Carve the partial readable payload', completed: false },
      { id: 'declare_limit', text: 'Recognise that the original file is incomplete', completed: false },
      { id: 'report_partial', text: 'Report a partial recovery without overclaiming', completed: false },
    ],
    hints: [
      'The fragment is intentionally not readable before XOR deobfuscation.',
      'For single-byte XOR, plaintext_byte XOR ciphertext_byte reveals the key.',
      'Use xorcalc to XOR the first ciphertext byte with ASCII "R" (0x52).',
      'A missing tail means the correct conclusion is partial, not recovered.',
      'The report matters here as much as the byte selection.',
    ],
    maxScore: 300,
    timeBonusThreshold: 360,
    acceptedReport: 'partial',
    allowPartial: true,
    requires_mbr: false,
    requires_xor: true,
  },

  // ─── ACT 6 ─── Ransomware Aftermath (multi-frag XOR triage) ───
  {
    id: 'level_6',
    title: 'ACT 6: Ransomware Aftermath',
    subtitle: 'Multi-fragment XOR recovery with forensic triage',
    difficulty: 'ransomware',
    briefing: [
      'A ransomware incident has left encrypted credential fragments scattered across this dump. The attacker used single-byte XOR with an unknown key.',
      'Intelligence suggests the plaintext begins with "EXFILTRATED_CREDENTIALS". Use this to derive the XOR key.',
      'Three separate fragments must be recovered and assembled in order. Decoy artefacts include a corrupted PNG header and a fake credential block encoded with a different XOR key.',
      'After XOR decryption, carve the reassembled payload and report recovered.',
    ],
    forensicConcept: {
      title: 'Incident Response & Multi-Artefact Triage',
      paragraphs: [
        'In a real ransomware investigation, exfiltrated data is often fragmented across multiple locations. The attacker may use weak encryption to hinder casual recovery while keeping the data accessible to their own tools.',
        'Forensic triage requires distinguishing between genuine evidence fragments, anti-forensics decoys, and unrelated data. Each stashed fragment affects your evidence chain — false inclusions weaken the case.',
        'When multiple fragments exist, their reconstruction order matters. An incorrect sequence produces corrupted output even if the individual fragments are correct.',
      ],
      keySignatures: [],
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
      'Use search to find patterns. The plaintext starts with "EXFILTRATED_CREDENTIALS".',
      'ASCII "E" = 0x45. XOR the first byte of a suspect fragment with 0x45 to test the key.',
      'There are exactly 3 fragments. Check the Evidence Journal to avoid false inclusions.',
      'A decoy credential block uses a different XOR key (0x3C) — it will produce garbage with the real key.',
      'Fragment order: the first fragment begins with the "E" of EXFILTRATED.',
      'After stashing all 3 fragments in order, apply XOR in the Workbench, then Compose & Carve.',
    ],
    maxScore: 350,
    timeBonusThreshold: 420,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: true,
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
};
