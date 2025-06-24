import fs from "fs";
import path from "path";

/**
 * Converts an image path to a displayable format (URL or Base64 Data URL).
 * @param imagePath - Local file path or external URL.
 * @returns Promise<string> - Resolves to a URL or Base64 Data URL.
 */
export async function imagePathToDisplayable(
  imagePath: string,
): Promise<string> {
  // Check if the path is a URL (http/https)
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath; // Return as-is for web URLs
  }

  // Handle local file path
  try {
    // Resolve the full path (handles relative paths)
    const fullPath = path.resolve(imagePath);

    // Read the file as Base64
    const imageBuffer = await fs.promises.readFile(fullPath);
    const base64Image = imageBuffer.toString("base64");

    // Determine MIME type from file extension
    const ext = path.extname(imagePath).toLowerCase().substring(1);
    const mimeType = getMimeType(ext);

    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    throw new Error(
      `Failed to process image: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Helper function to get MIME type from file extension.
 * @param ext - File extension (e.g., 'jpg', 'png').
 * @returns string - Corresponding MIME type.
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return mimeTypes[ext] || "application/octet-stream"; // Fallback
}
