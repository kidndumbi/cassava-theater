import ytdl from '@distube/ytdl-core';
import * as fs from "fs";
import * as fsPromises from "fs/promises";

/**
 * Returns the info of a YouTube video.
 * @param url The YouTube video URL.
 * @returns Promise<ytdl.videoInfo>
 */
export async function getYoutubeVideoInfo(
  url: string,
): Promise<ytdl.videoInfo> {
  return await ytdl.getInfo(url);
}

/**
 * Downloads a YouTube video to the specified destination path.
 * @param url The YouTube video URL.
 * @param destinationPath The file path to save the video.
 * @returns Promise<void>
 */
export async function downloadYoutubeVideo(
  url: string,
  destinationPath: string,
): Promise<void> {
  // Check if file already exists
  try {
    await fsPromises.access(destinationPath, fs.constants.F_OK);
    throw new Error(`File already exists at destination: ${destinationPath}`);
  } catch (err) {
    // If error is not "file does not exist", rethrow
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
    // else file does not exist, continue
  }

  return new Promise((resolve, reject) => {
    const stream = ytdl(url, { quality: "highest" }).pipe(
      fs.createWriteStream(destinationPath),
    );
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}
