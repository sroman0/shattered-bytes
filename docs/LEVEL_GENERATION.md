# Direttiva: Generazione dei Livelli (Shattered Bytes)

**Obiettivo:** Generare un livello giocabile (JSON) per il serious game "Shattered Bytes". Il livello consiste in uno o più frammenti di un file reale "nascosti" all'interno di un grosso blocco di byte casuali (spazzatura).

## Input
Lo script di esecuzione richiede:
- `input_file`: Il percorso di un file valido (es. un'immagine PNG, JPG o un PDF) che farà da "prova da recuperare".
- `output_file`: Il percorso dove salvare il file `livello.json` generato.
- (Opzionale) `difficulty`: 
  - `triage`: file contiguo con falso positivo.
  - `fragmented`: file spezzato in due chunk.
  - `partial`: recupero parziale con XOR.
  - `mbr`: scenario con offset derivato da tabella MBR.
  - `ransomware`: payload XOR-encoded.
- (Opzionale) `noise_size`: Quantità di byte spazzatura da generare attorno al file. Default: 1024 bytes (1KB).

## Output
Il file `livello.json` conterrà:
```json
{
  "level_id": "uuid",
  "difficulty": "easy",
  "target_extension": "png",
  "target_size": 1500,
  "hex_dump": "BEEFCAFE... (stringa esadecimale completa che include spazzatura e file target)",
  "solution_offsets": [
     {"start": 100, "end": 1600}
  ]
}
```
*I `solution_offsets` servono solo per il sistema di validazione automatica (o hints).*

## Strumenti
Usa lo script legacy parametrico `scripts/level_generation/generate_level.py`.

Per rigenerare i 6 livelli ufficiali della campagna usa invece:

```bash
npm run levels:build
```

### Esempio di utilizzo:
```bash
python3 scripts/level_generation/generate_level.py --input assets/evidence_chat_tiny.png --output public/levels/level_custom.json --difficulty triage --noise 1024
```

## Casi Limite & Error Handling
- Se `input_file` non esiste, lo script deve sollevare un `FileNotFoundError`.
- Se il file è più grande di 10MB, potrebbe bloccare il browser nella fase di rendering dell'Hex Editor. Limitare la generazione a file piccoli (es. icone, piccoli PDF < 50KB). Se il file in input è troppo grande, restituire un avviso/errore.
