import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { app } from "electron";
import { Jimp } from "jimp";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { loggingService } from "./main-logging.service";

export async function generateThumbnail(
  videoPath: string,
  currentTime: number,
  ffmpegInstance: typeof ffmpeg
): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempDir = `${app.getPath("userData")}/temp`; // Ensure this directory exists and is writable

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `thumbnail-at-${uuidv4()}-seconds.png`;

    // Extract video dimensions
    ffmpegInstance.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        loggingService.error("FFprobe error:", err);
        reject(err);
        return;
      }

      const stream = metadata.streams.find((s: any) => s.width && s.height);
      if (!stream) {
        const error = new Error("Unable to retrieve video dimensions.");
        loggingService.error(error.message);
        reject(error);
        return;
      }

      const width = stream.width;
      const height = stream.height;

      if (!width || !height) {
        const error = new Error("Unable to retrieve video dimensions.");
        loggingService.error(error.message);
        reject(error);
        return;
      }

      // Adjust thumbnail size based on video dimensions
      const thumbnailWidth = width / 5; // Adjust this value to control the thumbnail size
      const thumbnailHeight = height / 5; // Maintain aspect ratio

      ffmpegInstance(videoPath)
        .screenshots({
          timestamps: [currentTime === 0 ? 5 : currentTime],
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
              loggingService.info(
                "Thumbnail generated successfully:",
                imagePath
              );
              resolve(base64Image);
              fs.unlinkSync(imagePath); // Clean up the generated thumbnail file
            } else {
              const error = new Error(
                `Thumbnail image not found at path: ${imagePath}`
              );
              loggingService.error(error.message);
              reject(error);
            }
          } catch (error) {
            loggingService.error("Error processing thumbnail:", error);
            reject(error);
          }
        })
        .on("error", (error) => {
          loggingService.error("FFmpeg error:", error);
          reject(error);
        });
    });
  });
}
