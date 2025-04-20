import { IncomingMessage, ServerResponse } from "http";
import { loggingService as log } from "./main-logging.service";
import * as path from "path";
import * as fs from "fs";
import * as helpers from "./helpers";
import * as videoDbDataService from "./videoDbData.service";

export function serveLocalFile(req: IncomingMessage, res: ServerResponse) {
  if (!req.url) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Missing URL.");
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const filePath = decodeURIComponent(url.searchParams.get("path") || "");
  if (!filePath) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Missing 'path' search parameter.");
    return;
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("File not found.");
    return;
  }

  // Determine the content type based on the file extension
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".mp4": "video/mp4",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".vtt": "text/vtt",
  };
  const contentType = mimeTypes[ext] || "application/octet-stream";

  const statData = fs.statSync(filePath);
  const fileSize = statData.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (start >= fileSize) {
      res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
      res.end();
      return;
    }
    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": contentType,
    });
    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": contentType,
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

export function convertSrtToVtt(srtFilePath: string): string {
  if (path.extname(srtFilePath).toLowerCase() !== ".srt") {
    throw new Error("Invalid file type. Expected a .srt file.");
  }

  // Determine the .vtt file path
  const vttFilePath = srtFilePath.replace(/\.srt$/i, ".vtt");
  // Check if .vtt file already exists and return if it does
  if (fs.existsSync(vttFilePath)) {
    return vttFilePath;
  }

  try {
    // Read the .srt file content
    const srtContent = fs.readFileSync(srtFilePath, { encoding: "utf-8" });

    // Convert .srt to .vtt:
    // 1. Prepend 'WEBVTT' header.
    // 2. Replace commas with periods in timestamp lines.
    const vttContent =
      "WEBVTT\n\n" +
      srtContent
        .split("\n")
        .map((line) => {
          const timestampRegex =
            /^(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/;
          if (timestampRegex.test(line)) {
            return line.replace(/,/g, ".");
          }
          return line;
        })
        .join("\n");

    // Write the new .vtt file
    fs.writeFileSync(vttFilePath, vttContent, { encoding: "utf-8" });
    // Delete the original .srt file after successful conversion
    fs.unlinkSync(srtFilePath);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `Error converting ${srtFilePath} to VTT: ${error.message}`,
      );
    } else {
      throw new Error(`Error converting ${srtFilePath} to VTT: Unknown error`);
    }
  }

  // Return the full file path of the created .vtt file
  return vttFilePath;
}

export const deleteFile = async (
  filePath: string,
): Promise<{ success: boolean; message: string }> => {
  const normalizedPath = helpers.normalizeFilePath(filePath);

  try {
    await helpers.verifyFileAccess(normalizedPath);
    const { isFile } = await helpers.getFileInfo(normalizedPath);

    const filesToProcess = isFile
      ? [normalizedPath]
      : [
          ...(await helpers.getVideoFilesInChildFolders(normalizedPath)),
          normalizedPath,
        ];

    await updateMetadataFile(filesToProcess);
    await helpers.deleteFileOrFolder(normalizedPath, isFile);

    log.info(normalizedPath, "File or folder permanently deleted:");
    return successResponse(normalizedPath);
  } catch (error: unknown) {
    return handleError(error, normalizedPath);
  }
};

async function updateMetadataFile(filePaths: string[]): Promise<void> {
  if (Array.isArray(filePaths)) {
    filePaths.forEach((filePath) => {
      videoDbDataService.deleteVideo(filePath);
    });
  }
}

function successResponse(path: string): { success: true; message: string } {
  return {
    success: true,
    message: `File or folder permanently deleted: ${path}`,
  };
}

function handleError(
  error: unknown,
  path: string,
): { success: false; message: string } {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const fullMessage = `Error deleting ${path}: ${errorMessage}`;

  log.error(fullMessage);
  return { success: false, message: fullMessage };
}
