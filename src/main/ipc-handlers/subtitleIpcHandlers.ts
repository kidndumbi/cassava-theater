import { ipcMain } from "electron";
import { SubtitleIPCChannels } from "../../enums/subtitleIPCChannels.enum";
import {
  generateSubtitles,
  checkSubtitleStatus,
  getExistingSubtitles,
} from "../services/subtitle.service";
import {
  SubtitleGenerationRequest,
  SubtitleGenerationResponse,
  SubtitleGeneration,
} from "../../models/subtitle.model";

export const subtitleIpcHandlers = () => {
  ipcMain.handle(
    SubtitleIPCChannels.GenerateSubtitles,
    async (
      _event: Electron.IpcMainInvokeEvent,
      request: SubtitleGenerationRequest
    ): Promise<SubtitleGenerationResponse> => {
      return await generateSubtitles(request);
    }
  );

  ipcMain.handle(
    SubtitleIPCChannels.CheckSubtitleStatus,
    async (
      _event: Electron.IpcMainInvokeEvent,
      jobId: string
    ): Promise<SubtitleGeneration | null> => {
      return checkSubtitleStatus(jobId);
    }
  );

  ipcMain.handle(
    SubtitleIPCChannels.GetExistingSubtitles,
    async (
      _event: Electron.IpcMainInvokeEvent,
      videoPath: string
    ): Promise<string[]> => {
      return await getExistingSubtitles(videoPath);
    }
  );
};