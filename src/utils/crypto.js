/**
 * Applica XOR singolo byte su una stringa esadecimale.
 * @param {string} hexString - Stringa hex (es. "4A5B6C")
 * @param {number} keyByte - Chiave XOR (0-255)
 * @returns {string} Stringa hex decifrata
 */
export function applyXor(hexString, keyByte) {
  let result = '';
  for (let i = 0; i < hexString.length; i += 2) {
    const byteVal = parseInt(hexString.substring(i, i + 2), 16);
    const decrypted = byteVal ^ (keyByte & 0xFF);
    result += decrypted.toString(16).padStart(2, '0').toUpperCase();
  }
  return result;
}

/**
 * Tenta di derivare la chiave XOR conoscendo un frammento del plaintext.
 * @param {string} cipherHex - Primo byte cifrato (hex, 2 char)
 * @param {string} knownPlainHex - Primo byte plaintext (hex, 2 char)
 * @returns {number} Chiave XOR derivata
 */
export function deriveXorKey(cipherHex, knownPlainHex) {
  return parseInt(cipherHex, 16) ^ parseInt(knownPlainHex, 16);
}

/**
 * Parsa una chiave XOR da una stringa (supporta "0x1A", "1A", "26", decimale).
 * @param {string} input - Input utente
 * @returns {number|null} Chiave 0-255 o null se invalida
 */
export function parseXorKey(input) {
  const trimmed = input.trim();
  let value;
  if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
    value = parseInt(trimmed, 16);
  } else if (/^\d{1,3}$/.test(trimmed)) {
    value = parseInt(trimmed, 10);
  } else if (/^[0-9A-Fa-f]{1,2}$/.test(trimmed)) {
    value = parseInt(trimmed, 16);
  } else {
    value = parseInt(trimmed, 10);
  }
  if (isNaN(value) || value < 0 || value > 255) return null;
  return value;
}
