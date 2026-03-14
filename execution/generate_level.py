import argparse
import os
import json
import uuid
import random
import binascii

MAX_FILE_SIZE = 500 * 1024 # Increased to 500 KB for React Virtual Scrolling

def generate_noise(size):
    """Generates random bytes"""
    return os.urandom(size)

def apply_xor(data_bytes, key_byte):
    """Apply XOR encryption to bytes using a single key byte"""
    return bytes([b ^ key_byte for b in data_bytes])

def generate_mbr(partition_offset):
    """Generates a dummy MBR (Master Boot Record) with a single partition starting at partition_offset."""
    # Standard MBR size is 512 bytes
    mbr = bytearray(512)
    # Boot code signature
    mbr[510] = 0x55
    mbr[511] = 0xAA
    
    # First partition entry starts at offset 446 (0x1BE)
    pt_offset = 446
    
    # Status (0x80 = active)
    mbr[pt_offset] = 0x80
    
    # Partition type (e.g., 0x07 for NTFS)
    mbr[pt_offset + 4] = 0x07
    
    # LBA of first absolute sector in the partition (4 bytes, little-endian)
    # We pretend the 'offset' is sector count (offset // 512) for realism, 
    # but to make the puzzle easier we'll just write the absolute byte offset
    # encoded as Little-Endian in the LBA field. 
    # Forensics student will read this and know where the file starts.
    lba_bytes = partition_offset.to_bytes(4, byteorder='little')
    for i in range(4):
        mbr[pt_offset + 8 + i] = lba_bytes[i]
        
    # Number of sectors in partition
    size_bytes = (100000).to_bytes(4, byteorder='little')
    for i in range(4):
        mbr[pt_offset + 12 + i] = size_bytes[i]
        
    return bytes(mbr)

def generate_level(input_path, output_path, difficulty="easy", noise_size=2048):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")
    
    file_size = os.path.getsize(input_path)
    if file_size > MAX_FILE_SIZE:
        print(f"Warning: File size ({file_size} bytes) is very large. Consider files under 500KB.")
    
    with open(input_path, "rb") as f:
        file_bytes = f.read()
    
    extension = os.path.splitext(input_path)[1].lower().replace(".", "")
    solution_offsets = []
    metadata = {}
    
    if difficulty == "easy":
        # Case 1: Tutorial
        prefix_noise_size = random.randint(100, noise_size // 2)
        suffix_noise_size = noise_size - prefix_noise_size
        
        full_buffer = generate_noise(prefix_noise_size) + file_bytes + generate_noise(suffix_noise_size)
        
        start_offset = prefix_noise_size
        end_offset = prefix_noise_size + len(file_bytes) - 1
        solution_offsets.append({"start": start_offset, "end": end_offset})
        
    elif difficulty == "fragmented":
        # Case 2: Multi-Chunk
        split_point = len(file_bytes) // 2
        chunk1 = file_bytes[:split_point]
        chunk2 = file_bytes[split_point:]
        
        n1_size = random.randint(200, noise_size // 3)
        n2_size = random.randint(500, noise_size // 2)
        n3_size = noise_size - (n1_size + n2_size)
        
        full_buffer = generate_noise(n1_size) + chunk1 + generate_noise(n2_size) + chunk2 + generate_noise(n3_size)
        
        start1 = n1_size
        end1 = start1 + len(chunk1) - 1
        start2 = end1 + 1 + n2_size
        end2 = start2 + len(chunk2) - 1
        
        solution_offsets.append({"start": start1, "end": end1})
        solution_offsets.append({"start": start2, "end": end2})
        metadata["chunks_required"] = 2
        
    elif difficulty == "mbr":
        # Case 3: MBR Parsing
        # MBR + Noise + File + Noise
        prefix_noise_size = random.randint(1000, noise_size)
        target_offset = 512 + prefix_noise_size # exactly where the file begins
        
        mbr = generate_mbr(target_offset)
        
        full_buffer = mbr + generate_noise(prefix_noise_size) + file_bytes + generate_noise(noise_size // 2)
        
        end_offset = target_offset + len(file_bytes) - 1
        solution_offsets.append({"start": target_offset, "end": end_offset})
        metadata["mbr_present"] = True
        metadata["target_offset_encoded"] = target_offset
        
    elif difficulty == "ransomware":
        # Case 4: XOR Obfuscation
        xor_key = random.randint(1, 255)
        obfuscated_bytes = apply_xor(file_bytes, xor_key)
        
        prefix_noise_size = random.randint(100, noise_size // 2)
        suffix_noise_size = noise_size - prefix_noise_size
        
        full_buffer = generate_noise(prefix_noise_size) + obfuscated_bytes + generate_noise(suffix_noise_size)
        
        start_offset = prefix_noise_size
        end_offset = prefix_noise_size + len(file_bytes) - 1
        solution_offsets.append({"start": start_offset, "end": end_offset})
        metadata["xor_encoded"] = True
        metadata["xor_key"] = xor_key # for hints
        
    else:
        raise ValueError("Invalid difficulty.")
    
    final_hex_dump = binascii.hexlify(full_buffer).decode('utf-8').upper()
    
    level_data = {
        "level_id": str(uuid.uuid4()),
        "difficulty": difficulty,
        "target_extension": extension,
        "target_size": file_size,
        "hex_dump": final_hex_dump,
        "metadata": metadata,
        "solution_offsets": solution_offsets
    }
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as out_f:
        json.dump(level_data, out_f, indent=2)
    
    print(f"Level generated. Difficulty: {difficulty}, Hex size: {len(final_hex_dump)} chars")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--difficulty", choices=["easy", "fragmented", "mbr", "ransomware"], default="easy")
    parser.add_argument("--noise", type=int, default=2048)
    
    args = parser.parse_args()
    generate_level(args.input, args.output, args.difficulty, args.noise)
