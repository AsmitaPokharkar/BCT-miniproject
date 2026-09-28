/**
 * Calculates SHA-256 cryptographic hash of a File or ArrayBuffer using standard Web Crypto API.
 */
export async function calculateSHA256(fileOrBuffer: File | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;

  if (fileOrBuffer instanceof File) {
    buffer = await fileOrBuffer.arrayBuffer();
  } else {
    buffer = fileOrBuffer;
  }

  // Use Web Crypto API (supported in browser and modern Node.js environments)
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Node.js environment fallback
  const { createHash } = await import("crypto");
  return createHash("sha256").update(Buffer.from(buffer)).digest("hex");
}

/**
 * Format file size into human-readable format (KB, MB, GB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Formats a SHA-256 hash or hash string for truncated display (e.g. e3b0c4...b855).
 */
export function truncateHash(hash: string, startChars = 8, endChars = 8): string {
  if (!hash || hash.length <= startChars + endChars) return hash || "";
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}
