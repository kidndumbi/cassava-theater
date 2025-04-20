// src/main/services/levelDB.service.ts
import { Level } from "level";
import path from "path";
import { app } from "electron";
import { loggingService as log } from "./main-logging.service";
import { VideoDataModel } from "../../models/videoData.model";

// Define your database collections
type Collections = {
  videos: VideoDataModel;
  // Add more collections as needed
};

type CollectionName = keyof Collections;
type KeyType = string;

interface DatabaseStatus {
  initialized: boolean;
  version: string;
  createdAt: string;
  lastModified?: string;
}

class LevelDBService {
  private db: Level<KeyType, unknown>;

  constructor() {
    const dbPath = path.join(app.getPath("userData"), "app-database");
    this.db = new Level<KeyType, unknown>(dbPath, {
      valueEncoding: "json",
    });
    this.initialize()
      .then(() => log.info("LevelDB initialized"))
      .catch((err) => log.error("LevelDB init error:", err));
  }

  // Public API Methods

  public async close(): Promise<void> {
    try {
      await this.db.close();
      log.info("Database connection closed");
    } catch (err) {
      log.error("Failed to close database:", err);
      throw err;
    }
  }

  // Collection-specific methods
  public async putVideo(
    key: KeyType,
    value: Partial<VideoDataModel>,
  ): Promise<void> {
    const existing = (await this.getVideo(key)) || {};
    return this.put("videos", key, { ...existing, ...value });
  }

  public async getVideo(key: KeyType): Promise<VideoDataModel | null> {
    return this.get("videos", key);
  }

  public async deleteVideo(key: KeyType): Promise<void> {
    return this.delete("videos", key);
  }

  public async getAllVideos(): Promise<VideoDataModel[]> {
    return this.getAll("videos");
  }

  // Generic methods
  private async put<T extends CollectionName>(
    collection: T,
    key: KeyType,
    value: Collections[T],
  ): Promise<void> {
    const collectionKey = `${collection}:${key}`;
    try {
      await this.db.put(collectionKey, value);
    } catch (err) {
      log.error(`DB put failed for ${collectionKey}:`, err);
      throw err;
    }
  }

  private async get<T extends CollectionName>(
    collection: T,
    key: KeyType,
  ): Promise<Collections[T] | null> {
    const collectionKey = `${collection}:${key}`;
    try {
      return await this.db.get(collectionKey);
    } catch (err) {
      if (err.code === "LEVEL_NOT_FOUND") return null;
      log.error(`DB get failed for ${collectionKey}:`, err);
      throw err;
    }
  }

  private async delete(
    collection: CollectionName,
    key: KeyType,
  ): Promise<void> {
    const collectionKey = `${collection}:${key}`;
    try {
      await this.db.del(collectionKey);
    } catch (err) {
      log.error(`DB delete failed for ${collectionKey}:`, err);
      throw err;
    }
  }

  private async getAll<T extends CollectionName>(
    collection: T,
  ): Promise<Collections[T][]> {
    const items: Collections[T][] = [];
    try {
      for await (const [key, value] of this.db.iterator({
        gte: `${collection}:`,
        lte: `${collection}:\xff`,
      })) {
        items.push(value as Collections[T]);
      }
      return items;
    } catch (err) {
      log.error(`DB getAll failed for ${collection}:`, err);
      throw err;
    }
  }

  private async initialize(): Promise<void> {
    try {
      const dbStatus = (await this.db
        .get("db:status")
        .catch((): null => null)) as DatabaseStatus | null;
      if (!dbStatus) {
        const initialStatus: DatabaseStatus = {
          initialized: true,
          version: app.getVersion(),
          createdAt: new Date().toISOString(),
        };
        await this.db.put("db:status", initialStatus);
      } else {
        const updatedStatus: DatabaseStatus = {
          ...dbStatus,
          lastModified: new Date().toISOString(),
        };
        await this.db.put("db:status", updatedStatus);
      }
    } catch (err) {
      log.error("Database initialization check failed:", err);
      throw err;
    }
  }
}

export const levelDBService = new LevelDBService();
