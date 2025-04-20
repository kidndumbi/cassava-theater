// src/main/services/levelDB.service.ts
import { Level } from "level";
import path from "path";
import { app } from "electron";
import { loggingService as log } from "./main-logging.service";
import { VideoDataModel } from "../../models/videoData.model";
import { ConversionQueueItem } from "../../models/conversion-queue-item.model";
import { SettingsModel } from "../../models/settings.model";

// Define your database collections
type Collections = {
  videos: VideoDataModel;
  markedForDelete: string; // Each key is a file path, value is the file path string
  converQueueItems: ConversionQueueItem;
  settings: SettingsModel; // <-- Add this line
  // Add more collections as needed
};

type CollectionName = keyof Collections;
export type KeyType = string;

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

  // Generic methods
  public async put<T extends CollectionName>(
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

  public async get<T extends CollectionName>(
    collection: T,
    key: KeyType,
  ): Promise<Collections[T] | null> {
    const collectionKey = `${collection}:${key}`;
    try {
      // Cast the result to Collections[T] to satisfy TypeScript
      return (await this.db.get(collectionKey)) as Collections[T];
    } catch (err) {
      if (err.code === "LEVEL_NOT_FOUND") return null;
      log.error(`DB get failed for ${collectionKey}:`, err);
      throw err;
    }
  }

  public async delete(collection: CollectionName, key: KeyType): Promise<void> {
    const collectionKey = `${collection}:${key}`;
    try {
      await this.db.del(collectionKey);
    } catch (err) {
      log.error(`DB delete failed for ${collectionKey}:`, err);
      throw err;
    }
  }

  public async getAll<T extends CollectionName>(
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

  /**
   * Delete all entries in a given collection.
   */
  public async clearCollection<T extends CollectionName>(
    collection: T,
  ): Promise<void> {
    const batch = this.db.batch();
    try {
      for await (const [key] of this.db.iterator({
        gte: `${collection}:`,
        lte: `${collection}:\xff`,
        keys: true,
        values: false,
      })) {
        batch.del(key);
      }
      await batch.write();
    } catch (err) {
      log.error(`Failed to clear collection  ${collection}:`, err);
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
