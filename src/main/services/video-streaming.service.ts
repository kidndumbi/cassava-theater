import { IncomingMessage, ServerResponse } from "http";
import ffmpeg from "fluent-ffmpeg";
import * as path from "path";
import * as fs from "fs";
import { loggingService as log } from "./main-logging.service";

export function handleVideoRequest(req: IncomingMessage, res: ServerResponse) {
    if (!req.url) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request: URL is missing.");
      return;
    }
  
    let url: URL;
    try {
      url = new URL(req.url, `http://${req.headers.host}`);
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request: Invalid URL.");
      return;
    }
  
    const videoPathParam = url.searchParams.get("path");
    if (!videoPathParam) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad Request: 'path' parameter is missing.");
      return;
    }
  
    let videoPath: string;
    try {
      videoPath = decodeURIComponent(videoPathParam);
    } catch (error) {
      if (error instanceof URIError) {
        log.error("Error decoding video path:", error);
        const problematicCharacters = "%";
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end(
          `Bad Request: Invalid 'path' parameter. The path contains characters that cannot be decoded: ${problematicCharacters}`,
        );
        return;
      } else {
        throw error;
      }
    }
  
    const fileExt = path.extname(videoPath).toLowerCase();
  
    if (fileExt === ".mkv" || fileExt === ".avi") {
      // Optional: extract start time from query parameter (in seconds)
      const startParam = url.searchParams.get("start");
      const startTime = startParam ? Number(startParam) : 0;
  
      console.log("startTime:: ", startTime);
  
      if (!fs.existsSync(videoPath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end(`${fileExt.toUpperCase()} file not found.`);
        return;
      }
  
      res.writeHead(200, { "Content-Type": "video/mp4" });
      const command = ffmpeg(videoPath)
        // Use -ss input option if startTime specified
        .inputOptions(startTime > 0 ? [`-ss ${startTime}`] : [])
        .videoCodec("libx264")
        .audioCodec("aac")
        .format("mp4")
        .outputOptions("-movflags frag_keyframe+empty_moov");
  
      command
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "text/plain" });
          }
          res.end(`Error processing ${fileExt.toUpperCase()} to MP4 stream.`);
        })
        .pipe(res, { end: true });
      return;
    }
  
    // Otherwise (e.g. MP4 case), use your existing partial-content logic
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
  
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
  
      const fileStream = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      };
  
      res.writeHead(206, head);
      fileStream.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  }
  