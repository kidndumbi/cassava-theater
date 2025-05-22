import ytdl from "@distube/ytdl-core";
import * as fs from "fs";
import * as fsPromises from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { getMainWindow } from "../mainWindowManager";

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

export interface YoutubeDownloadQueueItem {
  id: string;
  title: string;
  url: string;
  destinationPath: string;
  status: "pending" | "downloading" | "completed" | "error";
  poster: string;
  backdrop: string;
}

class YoutubeDownloadQueue {
  private queue: YoutubeDownloadQueueItem[] = [];
  private isProcessing = false;
  private mainWindow = getMainWindow();

  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  public addToQueue(queueItem: {
    title: string;
    url: string;
    destinationPath: string;
    poster: string;
    backdrop: string;
  }) {
    const { title, url, destinationPath, poster, backdrop } = queueItem;

    if (!url || !destinationPath) {
      throw new Error("URL and destination path are required");
    }
    if (!title) {
      throw new Error("Title is required");
    }

    const id = uuidv4();
    this.queue.push({
      id,
      title,
      url,
      destinationPath,
      status: "pending",
      poster,
      backdrop,
    });
    this.processQueue();
  }
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0]; // Peek at the first item, don't remove yet
      if (!item) continue;

      // Update status to "downloading"
      item.status = "downloading";
      console.log("current queue:", this.queue);

      const { url, destinationPath } = item;
      try {
        this.mainWindow?.webContents.send(
          "youtube-download-started",
          this.queue,
        );
        await downloadYoutubeVideo(url, destinationPath);
        // Update status to "completed" after successful download
        item.status = "completed";
      } catch (error) {
        // Update status to "error" if download fails
        item.status = "error";
        console.error("Error downloading video:", error);
      }
      // Remove the item from the queue after processing
      this.queue.shift();
      this.mainWindow?.webContents.send("youtube-download-completed", {
        queue: this.queue,
        completedItem: item,
      });
      // Optionally, you could push the item to a "history" array if you want to keep track
    }

    this.isProcessing = false;
  }
  public clearQueue() {
    this.queue = [];
  }
  public getQueue() {
    return this.queue;
  }

  public isProcessingQueue() {
    return this.isProcessing;
  }

  public getQueueItem(index: number) {
    return this.queue[index];
  }

  public removeFromQueue(id: string) {
    const index = this.queue.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Item with specified id not found in queue");
    }
    this.queue.splice(index, 1);
  }
}

let youtubeQueueInstance: YoutubeDownloadQueue | null = null;

export function getYoutubeDownloadQueueInstance() {
  if (!youtubeQueueInstance) {
    youtubeQueueInstance = new YoutubeDownloadQueue();
  }
  return youtubeQueueInstance;
}
