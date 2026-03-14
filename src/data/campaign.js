// Definizione completa della campagna Shattered Bytes
// Ogni livello ha briefing narrativo, obiettivi, hint e sistema punteggio

export const CAMPAIGN = [
  {
    id: 'level_1',
    title: 'CASE 001: The Integrity',
    subtitle: 'Tutorial — Contiguous File Recovery',
    difficulty: 'easy',
    briefing: [
      'Agent, welcome to the Forensic Analysis Division.',
      'A suspect\'s hard drive has been seized. Intelligence suggests a PNG image was stored on the disk before a quick format was performed.',
      'The file is still intact somewhere in the raw dump — the magnetic residue hasn\'t been overwritten yet.',
      'Your task: locate the PNG file header (89 50 4E 47) and footer (49 45 4E 44 AE 42 60 82), select the full byte range, and extract it.',
    ],
    objectives: [
      { id: 'find_header', text: 'Locate the PNG header signature (89 50 4E 47)', completed: false },
      { id: 'select_range', text: 'Select the complete byte range from header to footer', completed: false },
      { id: 'stash_chunk', text: 'Stash the selection to the Workbench', completed: false },
      { id: 'carve_file', text: 'Carve and verify the extracted file', completed: false },
    ],
    hints: [
      'PNG files always start with the magic bytes: 89 50 4E 47 0D 0A 1A 0A',
      'Use the "Go to offset" command in the terminal to jump to specific positions',
      'The ASCII column can help you spot readable text patterns in the noise',
    ],
    maxScore: 100,
    timeBonusThreshold: 120, // seconds for time bonus
    requires_mbr: false,
    requires_xor: false,
  },
  {
    id: 'level_2',
    title: 'CASE 002: The Fracture',
    subtitle: 'Fragmented File Reconstruction',
    difficulty: 'fragmented',
    briefing: [
      'Good work on the last case, Agent.',
      'This time, the suspect was more careful. The file was stored on an NTFS volume with heavy fragmentation.',
      'Our acquisition shows the target PNG split across TWO non-contiguous clusters, separated by unallocated garbage data.',
      'You must find BOTH fragments, stash them in the correct order, then concatenate and carve.',
      'Remember: header chunk first, footer chunk second. Order matters in data carving.',
    ],
    objectives: [
      { id: 'find_chunk1', text: 'Find and stash Fragment #1 (contains the PNG header)', completed: false },
      { id: 'find_chunk2', text: 'Find and stash Fragment #2 (contains the PNG footer)', completed: false },
      { id: 'order_chunks', text: 'Ensure fragments are in correct order on the Workbench', completed: false },
      { id: 'carve_file', text: 'Compose and carve the reassembled file', completed: false },
    ],
    hints: [
      'Look for the PNG header (89 50 4E 47) for the first fragment',
      'The second fragment ends with the PNG footer: 49 45 4E 44 AE 42 60 82',
      'You can reorder fragments in the Workbench by dragging them',
    ],
    maxScore: 200,
    timeBonusThreshold: 180,
    requires_mbr: false,
    requires_xor: false,
  },
  {
    id: 'level_3',
    title: 'CASE 003: The Hidden Partition',
    subtitle: 'MBR Analysis & Offset Calculation',
    difficulty: 'mbr',
    briefing: [
      'Agent, this is a critical case.',
      'We\'ve acquired a full disk image. The suspect created a hidden partition to conceal evidence.',
      'The disk starts with a Master Boot Record (MBR) at offset 0x000. The partition table starts at byte 446 (0x1BE).',
      'Each partition entry is 16 bytes. The LBA (Logical Block Address) of the first sector is stored at offset +8 within the entry, encoded as a 4-byte Little-Endian integer.',
      'Read the MBR, calculate the true partition offset, then use the terminal command "go <offset>" to unlock the encrypted sectors.',
      'Only then can you carve the hidden file.',
    ],
    objectives: [
      { id: 'read_mbr', text: 'Examine the MBR at offset 0x000 (first 512 bytes)', completed: false },
      { id: 'find_lba', text: 'Read the LBA value at partition entry offset 0x1BE+8 (Little-Endian)', completed: false },
      { id: 'calculate_offset', text: 'Convert the Little-Endian bytes to decimal offset', completed: false },
      { id: 'unlock_sector', text: 'Use terminal command "go <offset>" to unlock sectors', completed: false },
      { id: 'carve_file', text: 'Carve the revealed file', completed: false },
    ],
    hints: [
      'The MBR signature is 55 AA at bytes 510-511',
      'Partition table entry 1 starts at offset 446 (0x1BE). The LBA field is at +8 from that entry start.',
      'Little-Endian means the least significant byte comes first. E.g., "EE 06 00 00" = 0x000006EE = 1774 in decimal',
      'After calculating, type "go 1774" (or whatever you computed) in the terminal',
    ],
    maxScore: 350,
    timeBonusThreshold: 300,
    requires_mbr: true,
    requires_xor: false,
  },
  {
    id: 'level_4',
    title: 'CASE 004: The Ransomware',
    subtitle: 'XOR Decryption & Payload Recovery',
    difficulty: 'ransomware',
    briefing: [
      'Final case, Agent. This is top priority.',
      'A ransomware strain has encrypted critical evidence files on the suspect\'s machine.',
      'Through reverse engineering of the malware binary, our team has determined it uses a simple single-byte XOR cipher.',
      'The XOR key is embedded in the level metadata. Your job:',
      '1. Locate the encrypted payload in the hex dump',
      '2. Stash it to the Workbench',
      '3. Apply the correct XOR decryption key',
      '4. Carve the decrypted result to recover the original text flag',
      'The flag file is a .txt — you\'ll know you succeeded when readable text appears.',
    ],
    objectives: [
      { id: 'find_payload', text: 'Locate the encrypted payload region', completed: false },
      { id: 'stash_payload', text: 'Stash the encrypted chunk to Workbench', completed: false },
      { id: 'find_key', text: 'Identify the XOR key from the metadata/hints', completed: false },
      { id: 'decrypt', text: 'Apply XOR decryption with the correct key', completed: false },
      { id: 'carve_flag', text: 'Carve and read the decrypted flag', completed: false },
    ],
    hints: [
      'The XOR key is a single byte (0x00-0xFF). Check the mission briefing terminal for clues.',
      'If you know part of the plaintext (e.g., common text file patterns), you can derive the key: plaintext XOR ciphertext = key',
      'Text files often start with readable ASCII. If the first decrypted byte looks like a letter, you\'re on the right track.',
    ],
    maxScore: 500,
    timeBonusThreshold: 360,
    requires_mbr: false,
    requires_xor: true,
  },
];

// Signatures forensi note per reference in-game
export const KNOWN_SIGNATURES = {
  png: { header: '89504E47', footer: '49454E44AE426082', name: 'PNG Image' },
  jpg: { header: 'FFD8FF', footer: 'FFD9', name: 'JPEG Image' },
  pdf: { header: '25504446', footer: '2525454F46', name: 'PDF Document' },
  zip: { header: '504B0304', footer: '504B0506', name: 'ZIP Archive' },
};
