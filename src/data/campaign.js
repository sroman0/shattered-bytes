// Campagna compatta da 10-15 minuti: un singolo caso investigativo in 3 atti.

export const CAMPAIGN = [
  {
    id: 'level_1',
    title: 'ACT 1: Intake and False Lead',
    subtitle: 'Contiguous carving with evidence validation',
    difficulty: 'triage',
    briefing: [
      'You are examining a verified forensic image of a seized USB drive.',
      'Intelligence says a small PNG proof file was deleted before seizure, but the dump contains a deliberate false signature.',
      'Do not trust the first magic number blindly: verify that the selected range has a coherent header, footer, and size.',
      'After carving, submit a report conclusion with the terminal: report recovered.',
    ],
    objectives: [
      { id: 'find_header', text: 'Find a valid PNG header, not only a header-looking decoy', completed: false },
      { id: 'select_range', text: 'Select the exact contiguous byte range', completed: false },
      { id: 'carve_file', text: 'Carve and verify the recovered object', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'PNG files start with 89 50 4E 47 0D 0A 1A 0A and end with 49 45 4E 44 AE 42 60 82.',
      'A header without a coherent footer is only a lead, not evidence.',
      'Use search 89504E47 and continue searching manually around nearby offsets.',
    ],
    maxScore: 150,
    timeBonusThreshold: 180,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: false,
  },
  {
    id: 'level_2',
    title: 'ACT 2: The Fracture',
    subtitle: 'Fragmented reconstruction and ordering',
    difficulty: 'fragmented',
    briefing: [
      'The same USB image contains a second deleted artefact stored in non-contiguous clusters.',
      'The first fragment contains the PNG header; the second fragment contains the footer. Garbage bytes between them are not part of the file.',
      'Stash both fragments in the Workbench, keep their forensic order, carve the composed stream, then report recovered.',
    ],
    objectives: [
      { id: 'find_chunk1', text: 'Find and stash Fragment #1 (contains the PNG header)', completed: false },
      { id: 'find_chunk2', text: 'Find and stash Fragment #2 (contains the PNG footer)', completed: false },
      { id: 'order_chunks', text: 'Keep fragments in the correct reconstruction order', completed: false },
      { id: 'carve_file', text: 'Compose and carve the reassembled file', completed: false },
      { id: 'report_recovered', text: 'Report the evidence as fully recovered', completed: false },
    ],
    hints: [
      'Look for the PNG header (89 50 4E 47) for the first fragment',
      'The second fragment ends with the PNG footer: 49 45 4E 44 AE 42 60 82',
      'Do not include the unallocated garbage between fragments.',
      'You can reorder fragments in the Workbench by dragging them.',
    ],
    maxScore: 250,
    timeBonusThreshold: 300,
    acceptedReport: 'recovered',
    requires_mbr: false,
    requires_xor: false,
  },
  {
    id: 'level_3',
    title: 'ACT 3: The Missing Tail',
    subtitle: 'Partial recovery and defensible conclusion',
    difficulty: 'partial',
    briefing: [
      'The final artefact is a text note whose tail was overwritten after deletion.',
      'A perfect recovery is impossible. The forensic task is to recover the remaining bytes and avoid overstating the conclusion.',
      'Carve the recoverable fragment, then submit a calibrated conclusion with: report partial.',
    ],
    objectives: [
      { id: 'find_partial', text: 'Identify the recoverable text fragment', completed: false },
      { id: 'carve_file', text: 'Carve the partial payload', completed: false },
      { id: 'declare_limit', text: 'Recognise that the original file is incomplete', completed: false },
      { id: 'report_partial', text: 'Report a partial recovery without overclaiming', completed: false },
    ],
    hints: [
      'Text fragments appear as readable ASCII in the right column.',
      'A missing tail means the correct conclusion is partial, not recovered.',
      'The report matters here as much as the byte selection.',
    ],
    maxScore: 300,
    timeBonusThreshold: 300,
    acceptedReport: 'partial',
    allowPartial: true,
    requires_mbr: false,
    requires_xor: false,
  },
];

// Signatures forensi note per reference in-game
export const KNOWN_SIGNATURES = {
  png: { header: '89504E47', footer: '49454E44AE426082', name: 'PNG Image' },
  jpg: { header: 'FFD8FF', footer: 'FFD9', name: 'JPEG Image' },
  pdf: { header: '25504446', footer: '2525454F46', name: 'PDF Document' },
  zip: { header: '504B0304', footer: '504B0506', name: 'ZIP Archive' },
};
