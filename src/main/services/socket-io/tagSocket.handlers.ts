// Tag socket handlers for mobile app communication
import { Socket } from "socket.io";
import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { getAllTags, addTag, deleteTag, tagExists } from "../tagService";
import { loggingService as log } from "../main-logging.service";

interface SocketCallback {
  (response: { success: boolean; data?: any; error?: string }): void;
}

interface RequestData {
  data?: any;
}

export const tagSocketHandlers = (socket: Socket): void => {
  /**
   * Get all tags
   */
  socket.on(AppSocketEvents.TAG_GET_ALL_TAGS, async (requestData: RequestData, callback: SocketCallback) => {
    try {
      const tags = await getAllTags();
      callback({ success: true, data: tags });
    } catch (error) {
      log.error("Socket Error getting all tags:", error);
      callback({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get tags" 
      });
    }
  });

  /**
   * Add a tag
   */
  socket.on(AppSocketEvents.TAG_ADD_TAG, async (requestData: RequestData, callback: SocketCallback) => {
    try {
      if (!requestData.data || typeof requestData.data !== 'string') {
        throw new Error("Tag name is required");
      }
      
      await addTag(requestData.data);
      callback({ success: true });
    } catch (error) {
      log.error("Socket Error adding tag:", error);
      callback({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to add tag" 
      });
    }
  });

  /**
   * Delete a tag
   */
  socket.on(AppSocketEvents.TAG_DELETE_TAG, async (requestData: RequestData, callback: SocketCallback) => {
    try {
      if (!requestData.data || typeof requestData.data !== 'string') {
        throw new Error("Tag name is required");
      }
      
      await deleteTag(requestData.data);
      callback({ success: true });
    } catch (error) {
      log.error("Socket Error deleting tag:", error);
      callback({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to delete tag" 
      });
    }
  });

  /**
   * Check if tag exists
   */
  socket.on(AppSocketEvents.TAG_EXISTS, async (requestData: RequestData, callback: SocketCallback) => {
    try {
      if (!requestData.data || typeof requestData.data !== 'string') {
        throw new Error("Tag name is required");
      }
      
      const exists = await tagExists(requestData.data);
      callback({ success: true, data: exists });
    } catch (error) {
      log.error("Socket Error checking tag exists:", error);
      callback({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to check tag" 
      });
    }
  });

  log.info("Tag socket handlers registered for client:", socket.id);
};