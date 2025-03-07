import { IncomingMessage, ServerResponse } from "http";
import ffmpeg from "fluent-ffmpeg";
import * as path from "path";
import * as fs from "fs";
import { loggingService as log } from "./main-logging.service";

export function handleVideoRequest(req: IncomingMessage, res: ServerResponse) {
    try {
        const url = validateAndParseUrl(req);
        const videoPath = getVideoPath(url);
        const fileExt = path.extname(videoPath).toLowerCase();

        if (fileExt === ".mkv" || fileExt === ".avi") {
            handleConversionRequest(videoPath, url, res);
        } else {
            handleDirectStreamRequest(videoPath, req, res);
        }
    } catch (error) {
        handleError(error, res);
    }
}

function validateAndParseUrl(req: IncomingMessage): URL {
    if (!req.url) {
        throw new Error("Bad Request: URL is missing.");
    }

    try {
        return new URL(req.url, `http://${req.headers.host}`);
    } catch (error) {
        throw new Error("Bad Request: Invalid URL.");
    }
}

function getVideoPath(url: URL): string {
    const videoPathParam = url.searchParams.get("path");
    if (!videoPathParam) {
        throw new Error("Bad Request: 'path' parameter is missing.");
    }

    try {
        return decodeURIComponent(videoPathParam);
    } catch (error) {
        if (error instanceof URIError) {
            log.error("Error decoding video path:", error);
            throw new Error("Bad Request: Invalid 'path' parameter. The path contains characters that cannot be decoded.");
        } else {
            throw error;
        }
    }
}

function handleConversionRequest(videoPath: string, url: URL, res: ServerResponse) {
    if (!fs.existsSync(videoPath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found.");
        return;
    }

    const startParam = url.searchParams.get("start");
    const startTime = startParam ? Number(startParam) : 0;

    res.writeHead(200, { "Content-Type": "video/mp4" });
    const command = ffmpeg(videoPath)
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
            res.end("Error processing video to MP4 stream.");
        })
        .pipe(res, { end: true });
}

function handleDirectStreamRequest(videoPath: string, req: IncomingMessage, res: ServerResponse) {
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

function handleError(error: unknown, res: ServerResponse) {
    if (error instanceof Error) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end(error.message);
    } else {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
}