/**
 * Parsa una stringa hex in array di byte-pair.
 * @param {string} hexDump - Stringa esadecimale continua
 * @returns {string[]} Array di stringhe da 2 caratteri (es. ["89","50","4E",...])
 */
export function parseHexDump(hexDump) {
  const bytes = [];
  for (let i = 0; i < hexDump.length; i += 2) {
    bytes.push(hexDump.substring(i, i + 2));
  }
  return bytes;
}

/**
 * Converte un byte hex in carattere ASCII stampabile o '.'
 */
export function getAsciiChar(hexByte) {
  const code = parseInt(hexByte, 16);
  if (code >= 32 && code <= 126) return String.fromCharCode(code);
  return '.';
}

/**
 * Costanti pagina per l'hex editor
 */
export const BYTES_PER_ROW = 16;
export const ROWS_PER_PAGE = 64; // 64 righe * 16 byte = 1024 byte per pagina (simula 2 settori da 512)
export const BYTES_PER_PAGE = BYTES_PER_ROW * ROWS_PER_PAGE;

/**
 * Calcola il numero totale di pagine per un dump
 */
export function getTotalPages(totalBytes) {
  return Math.max(1, Math.ceil(totalBytes / BYTES_PER_PAGE));
}

/**
 * Ricava i byte di una pagina specifica
 */
export function getPageBytes(allBytes, page) {
  const start = page * BYTES_PER_PAGE;
  const end = Math.min(start + BYTES_PER_PAGE, allBytes.length);
  return allBytes.slice(start, end);
}

/**
 * Calcola la pagina che contiene un dato offset
 */
export function getPageForOffset(byteOffset) {
  return Math.floor(byteOffset / BYTES_PER_PAGE);
}

/**
 * Formatta un offset numerico come stringa hex 8 cifre
 */
export function formatOffset(offset) {
  return offset.toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Cerca una sequenza hex all'interno dell'array di byte.
 * @param {string[]} hexBytes - Array di byte hex
 * @param {string} pattern - Pattern da cercare (hex string, es. "89504E47")
 * @returns {number} Indice del primo byte trovato, o -1
 */
export function searchHexPattern(hexBytes, pattern) {
  const normalized = pattern.replace(/\s/g, '').toUpperCase();
  const patternPairs = [];
  for (let i = 0; i < normalized.length; i += 2) {
    patternPairs.push(normalized.substring(i, i + 2));
  }
  if (patternPairs.length === 0) return -1;

  outer:
  for (let i = 0; i <= hexBytes.length - patternPairs.length; i++) {
    for (let j = 0; j < patternPairs.length; j++) {
      if (hexBytes[i + j].toUpperCase() !== patternPairs[j]) continue outer;
    }
    return i;
  }
  return -1;
}
