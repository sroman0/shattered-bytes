// Archived one-off generator for early Act 5 experiments.
// The canonical campaign generator is scripts/level_generation/build_levels.py.
const crypto = require('crypto');

const TOTAL_SIZE = 5851;
const REAL_MARKER = Buffer.from('NMPL', 'ascii');
const DECOY_MARKER = Buffer.from('NXPL', 'ascii');
const REAL_OFFSET = 3025;
const REAL_PLAINTEXT = "RANSOMWARE_PAYLOAD_CONFIG_";  // 26 bytes
const REAL_KEY = 0x2A; // 42 decimal

const DECOY_OFFSET = 2200;
const DECOY_PLAINTEXT = "DECOY_FRAGMENT_NULL_ENTRY"; // 25 bytes
const DECOY_KEY = 0x3C; // 60 decimal

// Generate random noise
const dump = crypto.randomBytes(TOTAL_SIZE);

// Embed loader markers 4 bytes before each candidate block
REAL_MARKER.copy(dump, REAL_OFFSET - 4);
DECOY_MARKER.copy(dump, DECOY_OFFSET - 4);

// Embed real XOR-encoded payload
for (let i = 0; i < REAL_PLAINTEXT.length; i++) {
  dump[REAL_OFFSET + i] = REAL_PLAINTEXT.charCodeAt(i) ^ REAL_KEY;
}

// Embed decoy XOR-encoded block (different key)
for (let i = 0; i < DECOY_PLAINTEXT.length; i++) {
  dump[DECOY_OFFSET + i] = DECOY_PLAINTEXT.charCodeAt(i) ^ DECOY_KEY;
}

const level5 = {
  level_id: "4cbb00b4-e1b1-44ff-a779-d569a92d16b0",
  difficulty: "partial",
  target_extension: "txt",
  target_size: 45,
  hex_dump: dump.toString('hex').toUpperCase(),
  metadata: {
    partial_recovery: true,
    original_size: 45,
    recoverable_size: 26,
    overwritten_bytes: 19,
    xor_encoded: true,
    xor_key: 42,
    known_plaintext_hint: "RANSOMWARE_PAYLOAD",
    payload_markers: [
      {
        label: "NMPL",
        hex: REAL_MARKER.toString('hex').toUpperCase(),
        offset: REAL_OFFSET - 4,
        payload_start: REAL_OFFSET,
        payload_end: REAL_OFFSET + REAL_PLAINTEXT.length - 1,
        meaning: "Night Meridian loader payload marker"
      },
      {
        label: "NXPL",
        hex: DECOY_MARKER.toString('hex').toUpperCase(),
        offset: DECOY_OFFSET - 4,
        payload_start: DECOY_OFFSET,
        payload_end: DECOY_OFFSET + DECOY_PLAINTEXT.length - 1,
        meaning: "Night Meridian decoy candidate marker"
      }
    ],
    entropy_block_size: 64,
    false_positives: [
      {
        start: DECOY_OFFSET,
        end: DECOY_OFFSET + DECOY_PLAINTEXT.length - 1,
        reason: "NXPL-marked XOR candidate with different key - not the target payload"
      }
    ]
  },
  solution_offsets: [
    {
      start: REAL_OFFSET,
      end: REAL_OFFSET + REAL_PLAINTEXT.length - 1
    }
  ]
};

process.stdout.write(JSON.stringify(level5, null, 2));
