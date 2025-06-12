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
    const stream = ytdl(url, {
      quality: "highest",
      filter: "audioandvideo",
    }).pipe(fs.createWriteStream(destinationPath));
    stream.on("finish", resolve);
    stream.on("error", (error) => {
      reject(error);
    });
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
  private currentDownloadStream: fs.WriteStream | null = null; // Track current stream

  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  public setIsProcessing(isProcessing: boolean) {
    this.isProcessing = isProcessing;
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
  public async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0]; // Peek at the first item, don't remove yet
      if (!item) continue;

      // Update status to "downloading"
      item.status = "downloading";

      const { url, destinationPath } = item;
      try {
        this.mainWindow?.webContents.send(
          "youtube-download-started",
          this.queue,
        );
        // --- Begin: Track the current download stream ---
        await new Promise<void>((resolve, reject) => {
          const stream = ytdl(url, {
            quality: "highest",
            filter: "audioandvideo",
          }).pipe(fs.createWriteStream(destinationPath));
          this.currentDownloadStream = stream;
          stream.on("finish", () => {
            this.currentDownloadStream = null;
            resolve();
          });
          stream.on("error", (error) => {
            this.currentDownloadStream = null;
            reject(error);
          });
        });
        // --- End: Track the current download stream ---
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
    // If the item is currently downloading (first in queue and status is 'downloading'), cancel the stream
    if (
      index === 0 &&
      this.queue[0].status === "downloading" &&
      this.currentDownloadStream
    ) {
      this.currentDownloadStream.destroy();
      this.currentDownloadStream = null;
      // Attempt to remove the partially downloaded file
      const filePath = this.queue[0].destinationPath;
      fsPromises.unlink(filePath).catch(() => {
        // Ignore error if file does not exist or can't be deleted
      });
      this.isProcessing = false; // Reset processing state
    }
    this.queue.splice(index, 1);
    this.processQueue(); // Process the queue after removal
  }

  public swapQueueItems(id1: string, id2: string) {
    const index1 = this.queue.findIndex((item) => item.id === id1);
    const index2 = this.queue.findIndex((item) => item.id === id2);
    if (index1 === -1 || index2 === -1) {
      throw new Error("One or both ids not found in queue");
    }
    if (
      this.queue[index1].status !== "pending" ||
      this.queue[index2].status !== "pending"
    ) {
      throw new Error("Both items must be in 'pending' status to swap");
    }
    // Swap the items
    [this.queue[index1], this.queue[index2]] = [
      this.queue[index2],
      this.queue[index1],
    ];
  }
}

let youtubeQueueInstance: YoutubeDownloadQueue | null = null;

export function getYoutubeDownloadQueueInstance() {
  if (!youtubeQueueInstance) {
    youtubeQueueInstance = new YoutubeDownloadQueue();
  }
  return youtubeQueueInstance;
}
