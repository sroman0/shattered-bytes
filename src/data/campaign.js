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
      'File-system metadata is unreliable; validate any candidate directly from byte structure before reporting it.',
      'After carving the genuine evidence, submit a report conclusion with the terminal: report recovered.',
    ],
    briefingSections: [
      {
        label: 'Case context',
        body: 'A seized laptop may still contain a deleted chat screenshot connected to the ransom negotiation.',
      },
      {
        label: 'Evidence target',
        body: 'Recover the image artefact that can link the negotiation channel to the hospital incident.',
      },
      {
        label: 'Forensic complication',
        body: 'File-system metadata is no longer reliable, so the recovery must be justified directly from the raw bytes.',
      },
      {
        label: 'Investigation method',
        body: 'Compare candidate file boundaries, select only the coherent byte range, then verify the carved object visually.',
      },
      {
        label: 'Reporting standard',
        body: 'Report full recovery only if the carved artefact is complete and supported by the selected bytes.',
      },
    ],
    forensicFocus: {
      label: 'Signature validation and contiguous carving',
      scope: 'Raw image of the seized negotiator laptop; recover the deleted ransom-chat screenshot from byte-level evidence.',
      method: 'Use file signatures as leads, validate coherent file boundaries, and carve only the exact byte range supported by the dump.',
      rationale: 'This maps to magic numbers, data carving, and the forensic rule that a header alone is only a lead, not a defensible recovery.',
      limitation: 'File-system metadata is treated as unreliable; conclusions depend on raw-byte structure and visual validation.',
    },
    debrief:
      'The recovered chat log confirms the ransom wallet and gives the task force its first reliable thread: Night Meridian used a document mule to move money after negotiation.',
    forensicConcept: {
      title: 'File Signatures & Magic Numbers',
      paragraphs: [
        'Every file format begins with a distinctive byte sequence called a "magic number" or file signature. Forensic analysts use these signatures to locate files inside raw disk images, bypassing the file system entirely.',
        'A PNG file always starts with the 8-byte header 89 50 4E 47 0D 0A 1A 0A and ends with the IEND chunk: 49 45 4E 44 AE 42 60 82. Both must be present for a valid recovery.',
        'Recognisable signatures are only candidates. A defensible recovery requires coherent structure, complete boundaries, and an exact selected range.',
      ],
      keySignatures: ['PNG'],
    },
    objectives: [
      { id: 'find_header', text: 'Find a valid PNG candidate with coherent boundaries', completed: false },
      { id: 'select_range', text: 'Select the exact contiguous byte range', completed: false },
      { id: 'carve_file', text: 'Carve and verify the recovered object', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'Start by thinking like a triage examiner: a familiar byte pattern tells you where to look, not what to believe.',
      'The correct candidate should behave like a whole image, with a plausible start, internal structure, and a coherent ending.',
      'Search for a short PNG lead such as 89504E47, then reject any occurrence that cannot be bounded by a matching PNG ending.',
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
      'A scanned image of a forged identity document - used by Night Meridian to open fraudulent bank accounts - was split into two fragments during deletion. The first fragment contains the PNG header, the second contains the footer.',
      'Two filesystem journal remnants survived before the fragments: FR01 and FR02. Each marker is followed by a two-byte fragment length, then the fragment bytes.',
      'Garbage bytes between fragments are unrelated disk residue and must NOT be included in the reconstruction.',
      'Stash both fragments in the Workbench, keep their forensic order, carve the composed stream, then report recovered.',
    ],
    briefingSections: [
      {
        label: 'Case context',
        body: 'The ransom wallet lead points to a forged identity document used in the laundering chain.',
      },
      {
        label: 'Evidence target',
        body: 'Reconstruct the deleted image from multiple surviving byte runs.',
      },
      {
        label: 'Forensic complication',
        body: 'The file is not physically contiguous. Bytes between surviving runs may be unrelated residue from unallocated space.',
      },
      {
        label: 'Investigation method',
        body: 'Use surviving run descriptors, their adjacent length fields, and file-format boundaries to identify fragment limits, then preserve the logical order in the Workbench.',
      },
      {
        label: 'Reporting standard',
        body: 'Report full recovery only if the reassembled artefact renders correctly and contains no unrelated gap bytes.',
      },
    ],
    forensicFocus: {
      label: 'Fragmented recovery from non-contiguous byte runs',
      scope: 'Raw image containing a deleted forged identity scan split across surviving disk runs.',
      method: 'Use run descriptors, adjacent length fields, and file boundaries to reconstruct only the bytes that belong to the artefact.',
      rationale: 'This reinforces fragmentation, unallocated-space residue, and the gap between physical byte position and logical file order.',
      limitation: 'Bytes between fragments are not assumed to belong to the file and must be excluded unless the evidence map supports them.',
    },
    debrief:
      'The reconstructed identity scan gives investigators a mule alias. Bank telemetry now ties that alias to a cash-out attempt at a compromised ATM.',
    forensicConcept: {
      title: 'File Fragmentation on Disk',
      paragraphs: [
        'When a file is saved, the operating system allocates disk clusters. If contiguous clusters are unavailable, the file is split across non-adjacent locations - this is fragmentation.',
        'After deletion, each fragment may survive independently. A forensic examiner must locate all fragments, determine their correct order, and reconstruct the original file.',
        'Filesystem journals or allocation remnants can sometimes reveal fragment run descriptors. In this case, FR01 and FR02 identify two recovered runs and the length bytes immediately after each marker tell you where the fragment ends.',
        'The cluster gap between fragments often contains unrelated data (garbage). Including these bytes in the reconstruction corrupts the recovered file.',
      ],
      keySignatures: ['PNG', 'FR01', 'FR02'],
    },
    objectives: [
      { id: 'find_chunk1', text: 'Find and stash Fragment #1 (contains the PNG header)', completed: false },
      { id: 'find_chunk2', text: 'Find and stash Fragment #2 (contains the PNG footer)', completed: false },
      { id: 'carve_file', text: 'Compose and carve the reassembled file', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'A fragmented file will not reward a single long selection. Look for small pieces of filesystem bookkeeping that survived near the data.',
      'The labels around the fragments are not image content; they are closer to road signs left by the disk history.',
      'Immediately after each label there is boundary information. Use it to decide how many following bytes belong to the fragment.',
      'One selected run should account for the image beginning, while another should account for the image ending. Bytes between them are not automatically part of the file.',
      'Stash only fragment payload bytes, then arrange the Workbench in logical file order before carving.',
    ],
    procedureChecks: [
      {
        id: 'pc_act2_gap_admissibility',
        trigger: 'post_carve',
        title: 'Fragment boundary justification',
        context: 'File-system forensics distinguishes logical file content from physical residue in unallocated areas.',
        question: 'What makes the reconstructed identity scan defensible after carving?',
        options: [
          {
            text: 'The selected runs are bounded by descriptors and file structure; unrelated gap bytes were excluded.',
            correct: true,
          },
          {
            text: 'All bytes between the first and second marker were included to preserve physical continuity.',
            feedback: 'Physical continuity is not the same as logical file membership. Gap bytes may be unrelated residue.',
          },
          {
            text: 'The file rendered once, so the exact selected boundaries no longer need to be documented.',
            feedback: 'Rendering helps validation, but exact offsets and boundaries remain part of the forensic justification.',
          },
        ],
        explanation: 'Correct: the examiner must justify why each selected byte belongs to the recovered file and why the gap does not.',
      },
    ],
    maxScore: 200,
    timeBonusThreshold: 300,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: false,
    nudges: [
      { objectiveId: 'find_chunk1', delaySeconds: 45, message: 'Run descriptors are stored as text labels. Convert FR01 with text2hex, then search that byte pattern. The two bytes after the descriptor encode fragment length.' },
      { objectiveId: 'find_chunk2', delaySeconds: 90, message: 'Convert FR02 with text2hex and search it. It marks the second run; the PNG footer confirms the end of the recovered file.' },
      { objectiveId: 'carve_file', delaySeconds: 140, message: 'Both fragments should now be in your Workbench. Make sure Fragment #1 (with the header) is first, then click "Compose & Carve".' },
    ],
  },

  // ─── ACT 3 ─── Multi-signature triage (JPEG target, PDF decoy) ─
  {
    id: 'level_3',
    title: 'ACT 3: Signal and Noise',
    subtitle: 'Multi-signature triage and evidence relevance',
    difficulty: 'multi_sig',
    caseNote: 'The mule alias appears in ATM surveillance metadata. Your dump contains several recoverable artefacts, but only one can place the suspect at the cash-out location.',
    briefing: [
      'An ATM skimming investigation has yielded a disk image from the suspect\'s laptop. Intelligence asks for the artefact that can visually place the mule at the compromised ATM.',
      'The dump contains recoverable material from different contexts. Some artefacts may be complete but administratively irrelevant; others may look promising but be incomplete.',
      'Triage candidates by case relevance and technical completeness, carve the artefact that answers the surveillance question, and report recovered.',
    ],
    briefingSections: [
      {
        label: 'Case context',
        body: 'The forged identity now needs to be connected to a physical cash-out event at a compromised ATM.',
      },
      {
        label: 'Evidence target',
        body: 'Recover the artefact that can visually support the ATM cash-out hypothesis.',
      },
      {
        label: 'Forensic complication',
        body: 'The dump contains recognisable artefacts that may be valid but irrelevant, plus at least one incomplete decoy.',
      },
      {
        label: 'Investigation method',
        body: 'Use the case question first: a surveillance clue should be visually inspectable. Then validate the candidate with coherent file boundaries before carving.',
      },
      {
        label: 'Reporting standard',
        body: 'Do not report an artefact merely because it is recoverable; report the one that supports the investigative question.',
      },
    ],
    forensicFocus: {
      label: 'Evidence relevance in multi-signature triage',
      scope: 'Forensic image with several recoverable artefacts; only one answers the ATM surveillance question.',
      method: 'Separate technical recoverability from investigative relevance, then validate the selected candidate by its boundaries.',
      rationale: 'This connects signature-based carving with evidence evaluation: a valid file is not automatically the relevant evidence.',
      limitation: 'Recoverability alone is insufficient; the report must match the case hypothesis and the artefact must be complete enough to verify.',
    },
    debrief:
      'The CCTV frame connects the forged identity to a real-world cash-out. The next warrant targets a corporate accountant suspected of laundering the transfer.',
    forensicConcept: {
      title: 'Signature-Based Carving & File Format Diversity',
      paragraphs: [
        'A forensic examiner must know multiple file signatures. Different file families, such as images, documents, archives, and executables, expose different boundary patterns.',
        'When multiple signatures appear in a dump, the examiner must determine which ones are relevant to the investigation. Not every recoverable file is evidence.',
        'A common mistake is carving every recognisable file. Forensic discipline requires targeting only the artefacts specified by the case brief.',
      ],
      keySignatures: [],
    },
    objectives: [
      { id: 'identify_target', text: 'Identify which artefact answers the surveillance question', completed: false },
      { id: 'select_range', text: 'Select the exact byte range for the relevant artefact', completed: false },
      { id: 'carve_file', text: 'Carve and visually verify the recovered artefact', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'Before searching signatures, reread the case question: the useful artefact is the one that can answer it directly.',
      'Several files may be technically recoverable. Ask which one would help an investigator place a person at a cash-out scene.',
      'A visual clue is more likely to be an image than an administrative document. Still, verify boundaries before carving.',
      'If you find a JPEG-like candidate, check that it closes correctly with its end marker before selecting the exact range.',
    ],
    procedureChecks: [
      {
        id: 'pc_act3_evidence_type',
        trigger: 'post_carve',
        title: 'Evidence classification',
        context: 'The recovered artefact is machine-produced but investigator-interpreted. Its meaning depends on the case question.',
        question: 'How should the recovered ATM surveillance artefact be treated in the report?',
        options: [
          {
            text: 'As computer-generated visual evidence that still needs contextual interpretation against the case question.',
            correct: true,
          },
          {
            text: 'As a human confession, because the image visually identifies the suspect.',
            feedback: 'A surveillance image is not a confession. It must be interpreted and correlated with the investigation.',
          },
          {
            text: 'As irrelevant once a valid PDF is also recoverable from the same dump.',
            feedback: 'A valid artefact can be irrelevant. The target is the artefact that answers the surveillance question.',
          },
        ],
        explanation: 'Correct: technical recovery and evidential meaning are separate. The artefact must be linked to the investigation hypothesis.',
      },
    ],
    maxScore: 200,
    timeBonusThreshold: 300,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: false,
    nudges: [
      { objectiveId: 'identify_target', delaySeconds: 45, message: 'Start from the case question: which carved candidate can visually place the mule at the ATM? Documents may be valid files but irrelevant evidence.' },
      { objectiveId: 'select_range', delaySeconds: 100, message: 'If you are looking for a surveillance still, search image-format signatures and verify both ends. A truncated candidate is only a lead.' },
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
    briefingSections: [
      {
        label: 'Case context',
        body: 'A seized accountant drive may contain the transfer screenshot, but the relevant area is behind a partition mapping step.',
      },
      {
        label: 'Evidence target',
        body: 'Recover the image stored inside the partition data area after identifying where that area begins.',
      },
      {
        label: 'Forensic complication',
        body: 'Sectors beyond the readable MBR are encrypted in the lab view. Pattern search cannot inspect them until the correct partition offset is unlocked.',
      },
      {
        label: 'Investigation method',
        body: 'Go to the partition table, count into the first 16-byte entry, isolate bytes 8-11, reverse their order to form the normal hex LBA value, convert it to decimal, then multiply by the sector size before unlocking.',
      },
      {
        label: 'Reporting standard',
        body: 'Only after unlocking should you perform normal carving and report full recovery if the resulting image is complete.',
      },
    ],
    forensicFocus: {
      label: 'Partition-aware acquisition reasoning',
      scope: 'Forensic image where the target evidence lies behind an MBR partition mapping step.',
      method: 'Read the MBR partition entry, decode the Little-Endian LBA, convert it into a byte offset, and unlock the correct sector range.',
      rationale: 'This ties MBR structure, partition tables, Little-Endian encoding, and logical-to-physical offset calculation into one workflow.',
      limitation: 'Pattern search is deliberately scoped to readable sectors until the partition offset is justified.',
    },
    debrief:
      'The bank transfer screenshot closes the money trail. Agent Root now pivots from laundering to attribution: recover the ransomware configuration itself.',
    forensicConcept: {
      title: 'Master Boot Record & Partition Tables',
      paragraphs: [
        'The MBR occupies the first 512 bytes (sector 0) of a storage device. It contains boot code (446 bytes), a partition table (64 bytes for 4 entries), and the boot signature (0x55AA).',
        'Each 16-byte partition entry encodes: status byte, CHS addresses, type byte, and crucially the LBA start address (bytes 8-11) and size (bytes 12-15) in Little-Endian format.',
        'Little-Endian means the least significant byte comes first. For example, hex bytes 3F 00 00 00 represent the decimal value 63 (0x3F).',
        'The terminal can help with the conversion step: after reversing the Little-Endian bytes into a normal hex value, use hex2dec to confirm the decimal LBA before multiplying by the sector size.',
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
      'If searching for the image feels blocked, step back: the storage layout itself may be the clue.',
      'The MBR partition table is a map. Find the partition entry before trying to interpret hidden content.',
      'Inside the entry, the start location is stored as an LBA value, not as a direct byte offset.',
      'The LBA field is little-endian. Reverse the byte order into normal hexadecimal before converting it to decimal.',
      'The terminal command go expects bytes. Multiply the decoded LBA by the sector size reported in the level.',
      'Once you have unlocked the calculated byte position, return to the usual carving workflow and validate the image boundaries.',
    ],
    procedureChecks: [
      {
        id: 'pc_act4_untrusted_view',
        trigger: 'objective',
        triggerObjective: 'unlock_sector',
        title: 'Raw view over OS view',
        context: 'The visible view is incomplete. The partition table is the only reliable map to the hidden sector range.',
        question: 'Why was the partition offset calculation required before searching for the PNG?',
        options: [
          {
            text: 'Because the readable view was intentionally limited; the MBR partition entry justified where the hidden data area begins.',
            correct: true,
          },
          {
            text: 'Because PNG signatures are legally invalid unless they are found by the operating system file browser.',
            feedback: 'The file browser view is not the authority here. The raw partition structure explains where the evidence area begins.',
          },
          {
            text: 'Because Little-Endian values are encryption keys and must be decrypted before any search.',
            feedback: 'Little-Endian is byte order, not encryption. It must be decoded into an LBA and then a byte offset.',
          },
        ],
        explanation: 'Correct: this level forces partition-aware reasoning before normal carving, mirroring low-level file-system forensics.',
      },
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
        'Example: if bytes 8–11 read  10 00 00 00  in a partition entry…',
        'Little-Endian means least-significant byte first. Read right-to-left: 00 00 00 10 → 0x10 = 16.',
        'Byte offset = LBA_start × sector_size. With a 32-byte sector size: 16 × 32 = 512.',
        'Use the same method on the current evidence, then run  go <calculated_offset>  in the terminal.',
      ],
    },
    nudges: [
      { objectiveId: 'read_mbr', delaySeconds: 30, message: 'Navigate to offset 0x1BE (decimal 446) to inspect the MBR partition table. Use go 446 in the terminal; this does not unlock the partition yet.' },
      { objectiveId: 'find_lba', delaySeconds: 60, message: 'In the first 16-byte partition entry, count bytes from 0 to 15. The LBA start field is positions 8, 9, 10, and 11.' },
      { objectiveId: 'calculate_offset', delaySeconds: 90, message: 'Reverse the four LBA bytes to normal hex, run hex2dec on that value, then multiply the decimal result by the sector size (32 bytes).' },
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
    briefingSections: [
      {
        label: 'Case context',
        body: 'Malware triage found traces of a deleted Night Meridian loader configuration.',
      },
      {
        label: 'Evidence target',
        body: 'Recover the surviving readable payload fragment strongly enough to identify the ransomware branch.',
      },
      {
        label: 'Forensic complication',
        body: 'The artefact is incomplete and weakly obfuscated. Candidate markers and statistical anomalies can narrow the search, but they still require validation.',
      },
      {
        label: 'Investigation method',
        body: 'Use known plaintext reasoning to derive a candidate XOR key, then accept only the candidate whose decoded bytes are coherent.',
      },
      {
        label: 'Reporting standard',
        body: 'Because the tail is overwritten, the correct conclusion must acknowledge partial recovery rather than overclaiming a complete artefact.',
      },
    ],
    forensicFocus: {
      label: 'Partial recovery and weak obfuscation',
      scope: 'Deleted malware-loader artefact with an overwritten tail and a surviving XOR-obfuscated fragment.',
      method: 'Use marker triage, known-plaintext XOR reasoning, and coherence checks to decode only the surviving payload bytes.',
      rationale: 'This links anti-forensics, weak obfuscation, known-plaintext analysis, and calibrated forensic reporting.',
      limitation: 'The original artefact is incomplete; the correct conclusion must be partial even if the surviving fragment is readable.',
    },
    debrief:
      'The partial payload is enough to identify the ransomware branch, but not enough to overclaim. The final dump may still contain the credentials used for exfiltration.',
    forensicConcept: {
      title: 'Loader Markers, XOR & Known-Plaintext Attacks',
      paragraphs: [
        'XOR (exclusive OR) is the simplest form of obfuscation. Each byte of plaintext is combined with a key byte: ciphertext = plaintext ⊕ key. The same operation reverses it: plaintext = ciphertext ⊕ key.',
        'Real malware often stores compact cleartext markers before encoded payloads so its loader can find the right block at runtime. Here, NMPL marks the Night Meridian payload candidate and NXPL marks a decoy candidate.',
        'If you know even one byte of the original plaintext, you can derive the key: key = ciphertext_byte ⊕ known_plaintext_byte. This is called a known-plaintext attack.',
        'Entropy analysis is a secondary triage method: encoded text can have a different byte distribution from random filler, so anomalous blocks deserve closer inspection.',
        'Partial recovery occurs when part of the original data has been overwritten by new data. The forensic conclusion must accurately reflect that the recovery is incomplete - overclaiming undermines the entire investigation.',
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
      'The payload is not meant to be readable at first glance. Look for something around it that a loader would use to find its own data.',
      'A marker gives you candidates, not certainty. Compare candidates by what they become after decoding.',
      'The expected plaintext beginning is your lever: combine the first encoded byte with the first expected plaintext byte to test a key.',
      'Apply the candidate key mentally or with the terminal to a few bytes first. Meaningful text should emerge quickly if the candidate is real.',
      'If one candidate decodes coherently and another does not, select the coherent surviving range but stop where the recovered data actually ends.',
      'Because the tail is missing, the defensible terminal conclusion is partial rather than fully recovered.',
    ],
    procedureChecks: [
      {
        id: 'pc_act5_antiforensics',
        trigger: 'post_carve',
        title: 'Anti-forensics diagnosis',
        context: 'The loader artefact contains both concealment and misdirection. The recovered bytes are useful, but not complete.',
        question: 'Which combination best describes what you encountered in this artefact?',
        options: [
          {
            text: 'Weak obfuscation, a planted decoy, and overwritten data causing partial recovery.',
            correct: true,
          },
          {
            text: 'Only file fragmentation, because XOR does not affect forensic interpretation.',
            feedback: 'XOR is an obfuscation technique and the decoy is a deliberate false lead.',
          },
          {
            text: 'A complete encrypted file, so the final report should claim full recovery after decoding.',
            feedback: 'The tail is overwritten. Decoding the surviving bytes does not make the original artefact complete.',
          },
        ],
        explanation: 'Correct: the defensible finding names both the anti-forensic techniques and the recovery limitation.',
      },
    ],
    maxScore: 300,
    timeBonusThreshold: 360,
    acceptedReport: 'partial',
    allowPartial: true,
    requires_mbr: false,
    requires_xor: true,
    nudges: [
      { objectiveId: 'find_partial', delaySeconds: 45, message: 'Search for marker 4E4D (NM) and 4E58 (NX). Each marked candidate starts 4 bytes after the marker; NMPL is the likely loader payload, NXPL is suspicious.' },
      { objectiveId: 'find_key', delaySeconds: 90, message: 'Use xorhex in the terminal: XOR the first encrypted byte after each marker with 52 (ASCII "R") to derive and compare candidate keys.' },
      { objectiveId: 'report_partial', delaySeconds: 150, message: 'The file was partially overwritten - the correct conclusion is report partial, not recovered. Forensic integrity matters!' },
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
    briefingSections: [
      {
        label: 'Case context',
        body: 'The final dump comes from a staging environment used after the ransomware deployment.',
      },
      {
        label: 'Evidence target',
        body: 'Recover the credential payload needed for containment and victim notification.',
      },
      {
        label: 'Forensic complication',
        body: 'The payload is split across ordered records, protected with weak XOR, and mixed with wrong-key decoys.',
      },
      {
        label: 'Investigation method',
        body: 'Treat each staging record as TAG | LEN | XOR_PAYLOAD: identify the genuine record sequence, use the byte after each tag as the fragment length, derive the XOR key from expected plaintext, then validate coherence before carving.',
      },
      {
        label: 'Reporting standard',
        body: 'Report full recovery only if all genuine fragments are present, ordered, decrypted, and readable as one payload.',
      },
    ],
    forensicFocus: {
      label: 'Multi-fragment incident evidence correlation',
      scope: 'Staging-server dump containing credential fragments, decoys, and weak XOR protection.',
      method: 'Identify genuine records, use length fields to bound each fragment, derive the XOR key, and validate the ordered decrypted payload.',
      rationale: 'This combines fragmented recovery, decoy rejection, obfuscation handling, and incident-response relevance.',
      limitation: 'All genuine fragments must be present, ordered, decrypted, and coherent before claiming full recovery.',
    },
    debrief:
      'The recovered credentials confirm exfiltration and give incident command the account list needed for containment, victim notification, and prosecution.',
    forensicConcept: {
      title: 'Incident Response & Multi-Artefact Triage',
      paragraphs: [
        'In a real ransomware investigation, exfiltrated data is often fragmented across multiple locations. The attacker may use weak encryption to hinder casual recovery while keeping the data accessible to their own tools.',
        'Staging tools often need small cleartext record tags so they can reassemble chunks later. Here, EX01, EX02, and EX03 identify ordered exfiltration records; EXD0 is a planted decoy record.',
        'Each staging record follows a compact structure: a 4-byte cleartext tag, one length byte, then exactly that many XOR-encoded payload bytes. The length byte defines where the fragment ends.',
        'Forensic triage requires distinguishing between genuine evidence fragments, anti-forensics decoys, and unrelated data. Each stashed fragment affects your evidence chain - false inclusions weaken the case.',
        'When multiple fragments exist, their reconstruction order matters. An incorrect sequence produces corrupted output even if the individual fragments are correct.',
      ],
      keySignatures: ['EX01', 'EX02', 'EX03', 'EXD0'],
    },
    objectives: [
      { id: 'find_chunk1', text: 'Find and stash Fragment #1 (beginning of the payload)', completed: false },
      { id: 'find_chunk2', text: 'Find and stash Fragment #2 (middle section)', completed: false },
      { id: 'find_chunk3', text: 'Find and stash Fragment #3 (end section)', completed: false },
      { id: 'find_key', text: 'Derive the XOR key from known plaintext', completed: false },
      { id: 'decrypt', text: 'Apply XOR deobfuscation to the assembled payload', completed: false },
      { id: 'carve_file', text: 'Carve the decrypted credentials', completed: false },
      { id: 'report_recovered', text: 'Report a full recovery of the credential payload', completed: false },
    ],
    hints: [
      'This final dump combines earlier lessons: fragments, record structure, decoys, and XOR. Solve the structure before solving the text.',
      'The useful fragments are near compact staging records. Convert or search the record names, then inspect the bytes immediately after them.',
      'The byte after each genuine record tag is not payload text; it tells you how far that fragment runs.',
      'Use the expected plaintext only on the beginning of the first genuine payload fragment to derive the XOR key.',
      'A decoy may share the same visual pattern but fail the coherence test after decryption. Validate decoded meaning across all fragments.',
      'Stash only the encrypted payload bytes from the genuine records, order them by record sequence, decrypt, then compose and carve.',
    ],
    procedureChecks: [
      {
        id: 'pc_act6_timeline',
        trigger: 'post_carve',
        title: 'Incident timeline correlation',
        context: 'The final evidence must read as a sequence of incident events, not as six disconnected recoveries.',
        question: 'Which event sequence best supports the final report?',
        options: [
          {
            text: 'Ransom negotiation -> forged identity -> ATM cash-out -> fraudulent transfer -> payload attribution -> exfiltrated credentials.',
            correct: true,
          },
          {
            text: 'Exfiltrated credentials -> forged identity -> ransom negotiation -> ATM cash-out -> payload attribution.',
            feedback: 'The recovered evidence chain should follow the investigative story built across the acts, not just the final artefact.',
          },
          {
            text: 'ATM cash-out -> payload attribution -> ransom negotiation -> forged identity -> transfer.',
            feedback: 'This sequence breaks the money trail and attribution logic established by the recovered artefacts.',
          },
        ],
        explanation: 'Correct: the final report is not just a list of files; it correlates artefacts into a defensible incident chain.',
      },
    ],
    maxScore: 350,
    timeBonusThreshold: 420,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: true,
    nudges: [
      { objectiveId: 'find_chunk1', delaySeconds: 45, message: 'Convert EX01 with text2hex and search it. The following byte is the fragment length; stash only the encrypted payload bytes after it.' },
      { objectiveId: 'find_key', delaySeconds: 90, message: 'Use xorhex on the first EX01 payload byte and 45 (ASCII "E") to derive the real key. EXD0 is a wrong-key decoy.' },
      { objectiveId: 'find_chunk3', delaySeconds: 140, message: 'Find EX02 and EX03 the same way. Stash fragments in record order: EX01, EX02, EX03.' },
    ],
  },
];

// Signatures forensi note per reference in-game
export const KNOWN_SIGNATURES = {
  png: { header: '89504E47', footer: '49454E44AE426082', name: 'PNG Image', description: 'Portable Network Graphics - lossless image format' },
  pdf: { header: '25504446', footer: '2525454F46', name: 'PDF Document', description: 'Portable Document Format - page layout document' },
  jpg: { header: 'FFD8FF', footer: 'FFD9', name: 'JPEG Image', description: 'Joint Photographic Experts Group - lossy image format' },
  zip: { header: '504B0304', footer: '504B0506', name: 'ZIP Archive', description: 'PKZip compressed archive format' },
  gif: { header: '47494638', footer: '003B', name: 'GIF Image', description: 'Graphics Interchange Format - animated image' },
  docx: { header: '504B0304', footer: '504B0506', name: 'DOCX (Office)', description: 'Microsoft Office Open XML - same ZIP container' },
  exe: { header: '4D5A', footer: '', name: 'PE Executable', description: 'Windows Portable Executable binary' },
  elf: { header: '7F454C46', footer: '', name: 'ELF Binary', description: 'Linux Executable and Linkable Format' },
  nmpl: { header: '4E4D504C', footer: '', name: 'NMPL Marker', description: 'Night Meridian loader payload marker' },
  nxpl: { header: '4E58504C', footer: '', name: 'NXPL Marker', description: 'Night Meridian decoy candidate marker' },
  fr01: { header: '46523031', footer: '', name: 'FR01 Run', description: 'Recovered fragment run descriptor #1' },
  fr02: { header: '46523032', footer: '', name: 'FR02 Run', description: 'Recovered fragment run descriptor #2' },
  ex01: { header: '45583031', footer: '', name: 'EX01 Record', description: 'Exfiltration staging record #1' },
  ex02: { header: '45583032', footer: '', name: 'EX02 Record', description: 'Exfiltration staging record #2' },
  ex03: { header: '45583033', footer: '', name: 'EX03 Record', description: 'Exfiltration staging record #3' },
  exd0: { header: '45584430', footer: '', name: 'EXD0 Decoy', description: 'Wrong-key exfiltration decoy record' },
};
