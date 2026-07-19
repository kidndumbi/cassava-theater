import { ipcMain } from "electron";
import { Socket } from "socket.io";
import { TagIPCChannels } from "../../enums/tagIPCChannels.enum";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { getAllTags, addTag, deleteTag, tagExists } from "../services/tagService";
import { loggingService as log } from "../services/main-logging.service";

export const registerTagHandlers = {
  ipc(): void {
    ipcMain.handle(TagIPCChannels.GetAllTags, async () => {
      try { const tags = await getAllTags(); return { success: true, data: tags }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(TagIPCChannels.AddTag, async (_event, tag: string) => {
      try { await addTag(tag); return { success: true }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(TagIPCChannels.DeleteTag, async (_event, tag: string) => {
      try { await deleteTag(tag); return { success: true }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(TagIPCChannels.TagExists, async (_event, tag: string) => {
      try { const exists = await tagExists(tag); return { success: true, data: exists }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
  },

  socket(socket: Socket): void {
    socket.on(AppSocketEvents.TAG_GET_ALL_TAGS, async (_req: unknown, callback: (r: { success: boolean; data?: string[]; error?: string }) => void) => {
      try { const tags = await getAllTags(); callback({ success: true, data: tags }); }
      catch (error) { log.error("Error getting tags:", error); callback({ success: false, error: "Failed to get tags" }); }
    });
    socket.on(AppSocketEvents.TAG_ADD_TAG, async (requestData: { data: { tag: string } }, callback: (r: { success: boolean; error?: string }) => void) => {
      try { await addTag(requestData.data.tag); callback({ success: true }); }
      catch (error) { log.error("Error adding tag:", error); callback({ success: false, error: "Failed to add tag" }); }
    });
    socket.on(AppSocketEvents.TAG_DELETE_TAG, async (requestData: { data: { tag: string } }, callback: (r: { success: boolean; error?: string }) => void) => {
      try { await deleteTag(requestData.data.tag); callback({ success: true }); }
      catch (error) { log.error("Error deleting tag:", error); callback({ success: false, error: "Failed to delete tag" }); }
    });
    socket.on(AppSocketEvents.TAG_EXISTS, async (requestData: { data: { tag: string } }, callback: (r: { success: boolean; data?: boolean; error?: string }) => void) => {
      try { const exists = await tagExists(requestData.data.tag); callback({ success: true, data: exists }); }
      catch (error) { log.error("Error checking tag:", error); callback({ success: false, error: "Failed to check tag" }); }
    });
  },
};