/**
 * Converte una stringa hex in Uint8Array.
 */
export function hexToBytes(hexString) {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * MIME types per le estensioni supportate.
 */
const MIME_MAP = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  pdf: 'application/pdf',
  txt: 'text/plain',
  zip: 'application/zip',
};

/**
 * Crea un Blob da una stringa hex e la relativa estensione.
 * @param {string} hexString - Dati hex concatenati
 * @param {string} extension - Estensione del file target (es. "png")
 * @returns {{ blob: Blob, url: string, text: string|null }}
 */
export function carveBlob(hexString, extension) {
  const bytes = hexToBytes(hexString);
  const mime = MIME_MAP[extension] || 'application/octet-stream';

  if (extension === 'txt') {
    const text = new TextDecoder().decode(bytes);
    return { blob: null, url: null, text };
  }

  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  return { blob, url, text: null };
}

/**
 * Crea un link di download per un Blob.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
