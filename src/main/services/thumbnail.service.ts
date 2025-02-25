import * as fs from "fs";
import { app } from "electron";
import { Jimp } from "jimp";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { loggingService as log } from "./main-logging.service";

export async function generateThumbnail(
  videoPath: string,
  currentTime: number,
  ffmpegInstance: typeof ffmpeg,
  duration: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempDir = `${app.getPath("userData")}/temp`;

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `thumbnail-at-${path.basename(
      videoPath,
      path.extname(videoPath)
    )}.png`;

    // Extract video dimensions
    ffmpegInstance.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        log.error("FFprobe error:", err);
        reject(err);
        return;
      }

      const stream = metadata.streams.find(
        (s: ffmpeg.FfprobeStream) => s.width && s.height
      );
      if (!stream) {
        const error = new Error("Unable to retrieve video dimensions.");
        log.error(error.message);
        reject(error);
        return;
      }

      const width = stream.width;
      const height = stream.height;

      if (!width || !height) {
        const error = new Error("Unable to retrieve video dimensions.");
        log.error(error.message);
        reject(error);
        return;
      }

      // Adjust thumbnail size based on video dimensions
      const thumbnailWidth = width / 5; // Adjust this value to control the thumbnail size
      const thumbnailHeight = height / 5; // Maintain aspect ratio

      const normalizedCurrentTime = Math.min(currentTime, duration - 3);

      ffmpegInstance(videoPath)
        .screenshots({
          timestamps: [
            currentTime === 0 ? 5 : Math.floor(normalizedCurrentTime),
          ],
          filename,
          folder: tempDir,
        })
        .on("end", async () => {
          try {
            const imagePath = path.join(tempDir, filename);
            if (fs.existsSync(imagePath)) {
              const image = await Jimp.read(imagePath);
              image.resize({ w: thumbnailWidth, h: thumbnailHeight });
              const base64Image = await image.getBase64("image/png");
              resolve(base64Image);
              fs.unlinkSync(imagePath); // Clean up the generated thumbnail file
            } else {
              const error = new Error(
                `Thumbnail image not found at path: ${imagePath}`
              );
              log.error(error.message);
              reject(error);
            }
          } catch (error) {
            log.error("Error processing thumbnail:", error);
            reject(error);
          }
        })
        .on("error", (error) => {
          log.error("FFmpeg error:", error);
          reject(error);
        });
    });
  });
}
