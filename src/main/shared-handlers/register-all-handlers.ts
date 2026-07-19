import { BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { registerSettingsHandlers } from "./settings.handlers";
import { registerVideoHandlers } from "./video.handlers";
import { registerOpenDialogHandlers } from "./openDialog.handlers";
import { registerMainUtilHandlers } from "./mainUtil.handlers";
import { registerTheMovieDbHandlers } from "./theMovieDb.handlers";
import { registerFileHandlers } from "./file.handlers";
import { registerTranslationHandlers } from "./translation.handlers";
import { registerMp4ConversionHandlers } from "./mp4Conversion.handlers";
import { registerPlaylistHandlers } from "./playlist.handlers";
import { registerYoutubeHandlers } from "./youtube.handlers";
import { registerCurrentlyPlayingHandlers } from "./currentlyPlaying.handlers";
import { registerLlmHandlers } from "./llm.handlers";
import { registerSubtitleHandlers } from "./subtitle.handlers";
import { registerSubtitleSyncHandlers } from "./subtitleSync.handlers";
import { registerLanguageLearningHandlers } from "./languageLearning.handlers";
import { registerTagHandlers } from "./tag.handlers";
import { registerVocabularyHandlers } from "./vocabulary.handlers";
import { registerVerbTaggingHandlers } from "./verbTagging.handlers";

/**
 * Registers all IPC handlers for the Electron main process.
 * Call this once during app initialization (after creating the main window).
 */
export function registerIpcHandlers(): void {
  registerSettingsHandlers.ipc();
  registerVideoHandlers.ipc();
  registerOpenDialogHandlers.ipc();
  registerMainUtilHandlers.ipc();
  registerTheMovieDbHandlers.ipc();
  registerFileHandlers.ipc();
  registerTranslationHandlers.ipc();
  registerMp4ConversionHandlers.ipc();
  registerPlaylistHandlers.ipc();
  registerYoutubeHandlers.ipc();
  registerCurrentlyPlayingHandlers.ipc();
  registerLlmHandlers.ipc();
  registerSubtitleHandlers.ipc();
  registerSubtitleSyncHandlers.ipc();
  registerLanguageLearningHandlers.ipc();
  registerTagHandlers.ipc();
  registerVocabularyHandlers.ipc();
  registerVerbTaggingHandlers.ipc();
}

/**
 * Registers all Socket.IO handlers for a connected socket.
 * Call this inside the io.on("connection") callback.
 */
export function registerSocketHandlers(
  socket: Socket,
  mainWindow: BrowserWindow,
): void {
  registerVideoHandlers.socket(socket, mainWindow);
  registerPlaylistHandlers.socket(socket, mainWindow);
  registerSettingsHandlers.socket(socket);
  registerYoutubeHandlers.socket(socket, mainWindow);
  registerCurrentlyPlayingHandlers.socket(socket);
  registerMp4ConversionHandlers.socket(socket, mainWindow);
  registerSubtitleHandlers.socket(socket, mainWindow);
  registerSubtitleSyncHandlers.socket(socket, mainWindow);
  registerLlmHandlers.socket(socket);
  registerLanguageLearningHandlers.socket(socket, mainWindow);
  registerTagHandlers.socket(socket);
  registerVocabularyHandlers.socket(socket);
  registerVerbTaggingHandlers.socket(socket);
  // Images socket handlers are handled inline in socket.service.ts (no IPC equivalent)
  // ExerciseAiChat handlers are handled inline in socket.service.ts (no IPC equivalent)
  // Tenses handlers are handled inline in socket.service.ts (no IPC equivalent)
}