import { contextBridge, ipcRenderer } from "electron";
import { TagIPCChannels } from "../enums/tagIPCChannels.enum";

export function exposeTagApi() {
  contextBridge.exposeInMainWorld("tagAPI", {
    getAllTags: () => ipcRenderer.invoke(TagIPCChannels.GetAllTags),
    addTag: (tag: string) => ipcRenderer.invoke(TagIPCChannels.AddTag, tag),
    deleteTag: (tag: string) => ipcRenderer.invoke(TagIPCChannels.DeleteTag, tag),
    tagExists: (tag: string) => ipcRenderer.invoke(TagIPCChannels.TagExists, tag),
  });
}