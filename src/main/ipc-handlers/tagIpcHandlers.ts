// Tag IPC handlers
import { ipcMain } from "electron";
import { TagIPCChannels } from "../../enums/tagIPCChannels.enum";
import { getAllTags, addTag, deleteTag, tagExists } from "../services/tagService";
import { loggingService as log } from "../services/main-logging.service";

export const registerTagIpcHandlers = () => {
  /**
   * Get all tags
   */
  ipcMain.handle(TagIPCChannels.GetAllTags, async () => {
    try {
      const tags = await getAllTags();
      return { success: true, data: tags };
    } catch (error) {
      log.error("IPC Error getting all tags:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get tags" 
      };
    }
  });

  /**
   * Add a tag
   */
  ipcMain.handle(TagIPCChannels.AddTag, async (_event, tag: string) => {
    try {
      await addTag(tag);
      return { success: true };
    } catch (error) {
      log.error("IPC Error adding tag:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to add tag" 
      };
    }
  });

  /**
   * Delete a tag
   */
  ipcMain.handle(TagIPCChannels.DeleteTag, async (_event, tag: string) => {
    try {
      await deleteTag(tag);
      return { success: true };
    } catch (error) {
      log.error("IPC Error deleting tag:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to delete tag" 
      };
    }
  });

  /**
   * Check if tag exists
   */
  ipcMain.handle(TagIPCChannels.TagExists, async (_event, tag: string) => {
    try {
      const exists = await tagExists(tag);
      return { success: true, data: exists };
    } catch (error) {
      log.error("IPC Error checking tag exists:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to check tag" 
      };
    }
  });

  log.info("Tag IPC handlers registered");
};