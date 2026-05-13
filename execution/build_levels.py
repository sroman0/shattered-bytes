#!/usr/bin/env python3
"""
Build all 6 campaign levels for Shattered Bytes.
Each level embeds real forensic artifacts inside randomised noise,
producing a JSON file ready for the game engine.

Evidence images in assets/ represent realistic forensic scenarios:
- evidence_chat_tiny.png:         Encrypted chat log screenshot (Acts 1, 2)
- evidence_surveillance_tiny.jpg: CCTV surveillance footage (Act 3)
- evidence_transaction_tiny.png:  Suspicious bank transfer screenshot (Act 4)
- evidence_document_tiny.png:     Forged identity document scan (used for decoys)
"""

import json, os, random, uuid, struct

random.seed(42)  # reproducible builds

BASE = os.path.dirname(__file__)
ASSETS = os.path.join(BASE, '..', 'assets')
OUT = os.path.join(BASE, '..', 'public', 'levels')
os.makedirs(OUT, exist_ok=True)

# ── Load real forensic evidence from assets ─────────────────────────
def load_asset(name):
    path = os.path.join(ASSETS, name)
    with open(path, 'rb') as f:
        return f.read()

EVIDENCE_CHAT_PNG   = load_asset('evidence_chat_tiny.png')
EVIDENCE_DOC_PNG    = load_asset('evidence_document_tiny.png')
EVIDENCE_SURVEIL_JPG = load_asset('evidence_surveillance_tiny.jpg')
EVIDENCE_TXFER_PNG  = load_asset('evidence_transaction_tiny.png')

# ── Forensic constants ──────────────────────────────────────────────
PNG_HEADER = bytes.fromhex('89504E470D0A1A0A')
PNG_IEND   = bytes.fromhex('0000000049454E44AE426082')

JPEG_SOI   = bytes.fromhex('FFD8FFE0')
JPEG_EOI   = bytes.fromhex('FFD9')

PDF_HEADER = b'%PDF-1.4\n'
PDF_BODY   = b'1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n'
PDF_FOOTER = b'%%EOF'
FULL_PDF   = PDF_HEADER + PDF_BODY + PDF_FOOTER

def noise(n):
    """Generate n random bytes that do NOT accidentally contain known headers."""
    buf = bytearray(random.randint(0, 255) for _ in range(n))
    # Scrub accidental magic numbers
    for sig in [b'\x89PNG', b'\xFF\xD8\xFF', b'%PDF', b'PK\x03\x04']:
        while True:
            idx = buf.find(sig)
            if idx < 0:
                break
            for j in range(len(sig)):
                buf[idx + j] = random.randint(1, 0xFE)
    return bytes(buf)


def build_level(filename, data):
    path = os.path.join(OUT, filename)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    total = len(data['hex_dump']) // 2
    sols = data.get('solution_offsets', [])
    print(f"  ✓ {filename:20s}  {total:>5d} bytes  solutions={len(sols)}")


# ════════════════════════════════════════════════════════════════════
# LEVEL 1 — Intake & False Lead
# Scenario: Seized laptop. Deleted chat screenshot used to coordinate
#           a ransomware payment. Contains a planted decoy PNG header.
# Evidence: evidence_chat_tiny.png (encrypted chat log)
# ════════════════════════════════════════════════════════════════════
def level_1():
    target = EVIDENCE_CHAT_PNG

    pre_decoy  = noise(400)
    # Decoy: PNG header fragment from a different (forged) document — no valid footer
    decoy = PNG_HEADER + b'DECOY_FORGED_DOC' + noise(30)
    mid_noise  = noise(1800)
    post_noise = noise(1800 - len(target))

    dump = pre_decoy + decoy + mid_noise + target + post_noise
    t_start = len(pre_decoy) + len(decoy) + len(mid_noise)
    t_end   = t_start + len(target) - 1

    d_start = len(pre_decoy)
    d_end   = d_start + len(decoy) - 1

    return {
        "level_id": str(uuid.uuid4()),
        "difficulty": "triage",
        "target_extension": "png",
        "target_size": len(target),
        "hex_dump": dump.hex().upper(),
        "metadata": {
            "false_positives": [
                {"start": d_start, "end": d_end,
                 "reason": "PNG header-like decoy without valid IEND footer — signature alone is not evidence"}
            ]
        },
        "solution_offsets": [{"start": t_start, "end": t_end}]
    }


# ════════════════════════════════════════════════════════════════════
# LEVEL 2 — The Fracture
# Scenario: The suspect's SSD used TRIM, fragmenting a screenshot of
#           a forged identity document into two non-contiguous pieces.
# Evidence: evidence_document_tiny.png (forged ID scan)
# ════════════════════════════════════════════════════════════════════
def level_2():
    full_img = EVIDENCE_DOC_PNG
    # Split realistically: header+PLTE+partial IDAT vs rest+IEND
    split_point = len(full_img) // 2
    frag1 = full_img[:split_point]
    frag2 = full_img[split_point:]

    pre       = noise(300)
    decoy     = PNG_HEADER + b'FRAGMENT_DECOY' + noise(10)
    mid1      = noise(1200)
    mid2      = noise(1600)
    post      = noise(500)

    dump = pre + decoy + mid1 + frag1 + mid2 + frag2 + post
    f1_start = len(pre) + len(decoy) + len(mid1)
    f1_end   = f1_start + len(frag1) - 1
    f2_start = f1_end + 1 + len(mid2)
    f2_end   = f2_start + len(frag2) - 1

    d_start  = len(pre)
    d_end    = d_start + len(decoy) - 1

    return {
        "level_id": str(uuid.uuid4()),
        "difficulty": "fragmented",
        "target_extension": "png",
        "target_size": len(full_img),
        "hex_dump": dump.hex().upper(),
        "metadata": {
            "chunks_required": 2,
            "false_positives": [
                {"start": d_start, "end": d_end,
                 "reason": "Orphan PNG header not connected to a recoverable file"}
            ]
        },
        "solution_offsets": [
            {"start": f1_start, "end": f1_end},
            {"start": f2_start, "end": f2_end}
        ]
    }


# ════════════════════════════════════════════════════════════════════
# LEVEL 3 — Multi-Signature Triage
# Scenario: ATM skimming investigation. The disk image contains a PDF
#           report (decoy) and a truncated JPEG (false lead). The real
#           evidence is a CCTV surveillance still from the ATM camera.
# Evidence: evidence_surveillance_tiny.jpg (CCTV footage)
# ════════════════════════════════════════════════════════════════════
def level_3():
    target = EVIDENCE_SURVEIL_JPG

    pre        = noise(500)
    pdf_decoy  = FULL_PDF  # real PDF but it's the distractor, not the target
    mid1       = noise(1200)
    # Another false JPEG header (truncated)
    jpeg_decoy = JPEG_SOI + noise(20)
    mid2       = noise(1500)
    post       = noise(800)

    dump = pre + pdf_decoy + mid1 + jpeg_decoy + mid2 + target + post

    pd_start = len(pre)
    pd_end   = pd_start + len(pdf_decoy) - 1
    jd_start = pd_end + 1 + len(mid1)
    jd_end   = jd_start + len(jpeg_decoy) - 1
    t_start  = jd_end + 1 + len(mid2)
    t_end    = t_start + len(target) - 1

    return {
        "level_id": str(uuid.uuid4()),
        "difficulty": "multi_sig",
        "target_extension": "jpg",
        "target_size": len(target),
        "hex_dump": dump.hex().upper(),
        "metadata": {
            "false_positives": [
                {"start": pd_start, "end": pd_end,
                 "reason": "Valid PDF structure but not the target artefact — intelligence specifies a JPEG image"},
                {"start": jd_start, "end": jd_end,
                 "reason": "Truncated JPEG SOI marker without valid EOI footer"}
            ],
            "target_description": "JPEG image file"
        },
        "solution_offsets": [{"start": t_start, "end": t_end}]
    }


# ════════════════════════════════════════════════════════════════════
# LEVEL 4 — Partition Archaeology
# Scenario: Seized accountant's hard drive with MBR partition table.
#           A screenshot proving fraudulent wire transfers was hidden
#           inside the first NTFS partition. Parse MBR to find it.
# Evidence: evidence_transaction_tiny.png (bank transfer proof)
# ════════════════════════════════════════════════════════════════════
def level_4():
    target = EVIDENCE_TXFER_PNG

    # Build a realistic MBR (512 bytes)
    boot_code = noise(446)  # boot code area

    # Partition entry 1: active, type=0x07 (NTFS), starts at sector 63
    part1 = bytes([
        0x80,              # status: active
        0x01, 0x01, 0x00,  # CHS first sector
        0x07,              # type: NTFS
        0xFE, 0xFF, 0xFF,  # CHS last sector
        0x3F, 0x00, 0x00, 0x00,  # LBA start = 63 (LE)
        0x00, 0x08, 0x00, 0x00,  # LBA size = 2048 (LE)
    ])
    part_empty = bytes(16)
    mbr_sig = bytes([0x55, 0xAA])
    mbr = boot_code + part1 + part_empty * 3 + mbr_sig
    assert len(mbr) == 512

    target_offset = 63 * 32  # 2016
    gap = noise(target_offset - 512)
    post = noise(3500 - target_offset - len(target))

    dump = mbr + gap + target + post

    t_start = target_offset
    t_end   = t_start + len(target) - 1

    return {
        "level_id": str(uuid.uuid4()),
        "difficulty": "mbr",
        "target_extension": "png",
        "target_size": len(target),
        "hex_dump": dump.hex().upper(),
        "metadata": {
            "mbr_present": True,
            "partition_table_offset": 446,
            "target_offset_encoded": target_offset,
            "sector_size_hint": 32,
            "lba_start_hex": "3F000000",
            "lba_start_decimal": 63
        },
        "solution_offsets": [{"start": t_start, "end": t_end}]
    }


# ════════════════════════════════════════════════════════════════════
# LEVEL 5 — The Obscured Tail
# Scenario: A ransomware infection left an encrypted config file
#           containing the decryption key. XOR-encoded with key 0x2A.
#           Only partial data survived disk overwriting.
# Evidence: text payload (ransomware encryption key)
# ════════════════════════════════════════════════════════════════════
def level_5():
    plaintext_full = b'RANSOMWARE_PAYLOAD_ENCRYPTION_KEY_STORED_HERE'
    xor_key = 0x2A
    recoverable_size = 26
    plaintext_recoverable = plaintext_full[:recoverable_size]
    ciphertext = bytes(b ^ xor_key for b in plaintext_recoverable)

    pre   = noise(2200)
    # Scatter some misleading text-like patterns
    decoy_text = bytes(b ^ 0x55 for b in b'NOT_THE_REAL_PAYLOAD_DATA')
    mid1  = noise(800)
    mid2  = noise(2200)
    post  = noise(600)

    dump = pre + decoy_text + mid1 + ciphertext + mid2 + post

    dt_start = len(pre)
    dt_end   = dt_start + len(decoy_text) - 1
    t_start  = dt_end + 1 + len(mid1)
    t_end    = t_start + len(ciphertext) - 1

    return {
        "level_id": str(uuid.uuid4()),
        "difficulty": "partial",
        "target_extension": "txt",
        "target_size": len(plaintext_full),
        "hex_dump": dump.hex().upper(),
        "metadata": {
            "partial_recovery": True,
            "original_size": len(plaintext_full),
            "recoverable_size": recoverable_size,
            "overwritten_bytes": len(plaintext_full) - recoverable_size,
            "xor_encoded": True,
            "xor_key": xor_key,
            "known_plaintext_hint": "RANSOMWARE_PAYLOAD",
            "false_positives": [
                {"start": dt_start, "end": dt_end,
                 "reason": "XOR-encoded noise with different key — not the target payload"}
            ]
        },
        "solution_offsets": [{"start": t_start, "end": t_end}]
    }


# ════════════════════════════════════════════════════════════════════
# LEVEL 6 — Ransomware Aftermath
# Scenario: Post-breach investigation. Exfiltrated credentials file
#           was XOR-encrypted (key 0x1B) and split into 3 fragments
#           across unallocated disk space. Recover all fragments.
# Evidence: text payload (stolen admin credentials)
# ════════════════════════════════════════════════════════════════════
def level_6():
    plaintext = b'EXFILTRATED_CREDENTIALS_admin:P@ssw0rd123_root:T0pS3cr3t!_db:mysql_backup_2024'
    xor_key = 0x1B
    ciphertext = bytes(b ^ xor_key for b in plaintext)

    # Split into 3 fragments
    frag1 = ciphertext[:25]
    frag2 = ciphertext[25:53]
    frag3 = ciphertext[53:]

    pre    = noise(800)
    # Decoy: partial PNG header (anti-forensics bait)
    decoy1 = PNG_HEADER + b'CORRUPTED' + noise(15)
    mid1   = noise(1500)
    mid2   = noise(1800)
    mid3   = noise(1600)
    # Another decoy: XOR'd noise that looks like it could be the payload
    decoy2 = bytes(b ^ 0x3C for b in b'FAKE_CREDENTIALS_NOT_REAL_DATA_')
    mid4   = noise(500)
    post   = noise(700)

    dump = pre + decoy1 + mid1 + frag1 + mid2 + frag2 + mid3 + decoy2 + mid4 + frag3 + post

    d1_start = len(pre)
    d1_end   = d1_start + len(decoy1) - 1

    f1_start = d1_end + 1 + len(mid1)
    f1_end   = f1_start + len(frag1) - 1

    f2_start = f1_end + 1 + len(mid2)
    f2_end   = f2_start + len(frag2) - 1

    d2_start = f2_end + 1 + len(mid3)
    d2_end   = d2_start + len(decoy2) - 1

    f3_start = d2_end + 1 + len(mid4)
    f3_end   = f3_start + len(frag3) - 1

    return {
        "level_id": str(uuid.uuid4()),
        "difficulty": "ransomware",
        "target_extension": "txt",
        "target_size": len(plaintext),
        "hex_dump": dump.hex().upper(),
        "metadata": {
            "chunks_required": 3,
            "xor_encoded": True,
            "xor_key": xor_key,
            "known_plaintext_hint": "EXFILTRATED_CREDENTIALS",
            "false_positives": [
                {"start": d1_start, "end": d1_end,
                 "reason": "Corrupted PNG header — anti-forensics bait, not the target payload"},
                {"start": d2_start, "end": d2_end,
                 "reason": "XOR-encoded noise with wrong key (0x3C) — decoy credentials"}
            ]
        },
        "solution_offsets": [
            {"start": f1_start, "end": f1_end},
            {"start": f2_start, "end": f2_end},
            {"start": f3_start, "end": f3_end}
        ]
    }


# ── Main ────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("Building Shattered Bytes campaign levels...\n")
    build_level('level_1.json', level_1())
    build_level('level_2.json', level_2())
    build_level('level_3.json', level_3())
    build_level('level_4.json', level_4())
    build_level('level_5.json', level_5())
    build_level('level_6.json', level_6())
    print("\nDone. All levels written to public/levels/")
