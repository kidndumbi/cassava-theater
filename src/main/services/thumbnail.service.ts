import * as fs from "fs";
import { app } from "electron";
import { Jimp } from "jimp";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { loggingService as log } from "./main-logging.service";
import * as videoScreenshotDbService from "./videoScreenshotDb.service";

function ensureTempDir(): string {
  const tempDir = `${app.getPath("userData")}/temp`;
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

function getVideoDimensions(
  videoPath: string,
  ffmpegInstance: typeof ffmpeg,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    ffmpegInstance.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        log.error("FFprobe error:", err);
        reject(err);
        return;
      }

      const stream = metadata.streams.find(
        (s: ffmpeg.FfprobeStream) => s.width && s.height,
      );
      if (!stream) {
        const error = new Error("Unable to retrieve video dimensions.");
        log.error(error.message);
        reject(error);
        return;
      }

      const width = !isNaN(stream.width) ? stream.width : 1920; // Default width
      const height = !isNaN(stream.height) ? stream.height : 1080;
      resolve({ width, height });
    });
  });
}

function generateScreenshot(
  videoPath: string,
  currentTime: number,
  duration: number,
  tempDir: string,
  filename: string,
  ffmpegInstance: typeof ffmpeg,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const normalizedCurrentTime = Math.min(currentTime, duration - 3);
    ffmpegInstance(videoPath)
      .screenshots({
        timestamps: [currentTime === 0 ? 5 : Math.floor(normalizedCurrentTime)],
        filename,
        folder: tempDir,
      })
      .on("end", () => resolve(path.join(tempDir, filename)))
      .on("error", (error) => {
        log.error("FFmpeg error:", error);
        reject(error);
      });
  });
}

async function processThumbnail(
  imagePath: string,
  thumbnailWidth: number,
  thumbnailHeight: number,
): Promise<string> {
  const image = await Jimp.read(imagePath);
  image.resize({ w: thumbnailWidth, h: thumbnailHeight });
  const base64Image = await image.getBase64("image/png");
  fs.unlinkSync(imagePath); // Clean up the generated thumbnail file
  return base64Image;
}

export async function generateThumbnail(
  videoPath: string,
  currentTime: number,
  ffmpegInstance: typeof ffmpeg,
  duration: number,
): Promise<string> {
  try {
    const dbScreenshot =
      await videoScreenshotDbService.getVideoScreenshot(videoPath);
    if (dbScreenshot?.currentTime === currentTime) {
      return dbScreenshot.image;
    }

    const tempDir = ensureTempDir();
    const filename = `thumbnail-at-${path.basename(
      videoPath,
      path.extname(videoPath),
    )}.png`;

    const { width, height } = await getVideoDimensions(
      videoPath,
      ffmpegInstance,
    );
    const thumbnailWidth = width / 5; // Adjust this value to control the thumbnail size
    const thumbnailHeight = height / 5; // Maintain aspect ratio

    const imagePath = await generateScreenshot(
      videoPath,
      currentTime,
      duration,
      tempDir,
      filename,
      ffmpegInstance,
    );

    if (!fs.existsSync(imagePath)) {
      const error = new Error(
        `Thumbnail image not found at path: ${imagePath}`,
      );
      log.error(error.message);
      throw error;
    }

    const image = await processThumbnail(
      imagePath,
      thumbnailWidth,
      thumbnailHeight,
    );

    videoScreenshotDbService.putVideoScreenshot(videoPath, {
      filePath: videoPath,
      currentTime,
      image,
    });

    return image;
  } catch (error) {
    log.error("Error generating thumbnail:", error);
    throw error;
  }
}
