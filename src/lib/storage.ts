import fs from "fs/promises";
import path from "path";

/**
 * Saves an uploaded file buffer to public/uploads directory.
 * Returns the public relative URL to access the uploaded file.
 */
export async function saveUploadedFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  // Ensure uploads directory exists
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  // Create unique filename using timestamp and sanitized original name
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueFileName = `${Date.now()}_${sanitizedName}`;
  const filePath = path.join(uploadsDir, uniqueFileName);

  await fs.writeFile(filePath, buffer);

  // Return public URL path
  return `/uploads/${uniqueFileName}`;
}
