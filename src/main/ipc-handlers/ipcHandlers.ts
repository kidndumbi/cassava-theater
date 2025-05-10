import { fileIpcHandlers } from "./fileIpcHandlers";
import { mainUtilIpcHandlers } from "./mainUtilIpcHandlers";
import { mp4ConversionIpcHandlers } from "./mp4ConversionIpcHandlers";
import { openDialogIpcHandlers } from "./openDialogIpcHandlers";
import { playlistIpcHandlers } from "./playlistIpcHandlers";
import { settingsIpcHandlers } from "./settingsIpcHandlers";
import { theMovieDbIpcHandlers } from "./theMovieDbIpcHandlers";
import { videosIpcHandlers } from "./videosIpcHandlers";

export function registerIpcHandlers() {
  settingsIpcHandlers();
  videosIpcHandlers();
  openDialogIpcHandlers();
  mainUtilIpcHandlers();
  theMovieDbIpcHandlers();
  fileIpcHandlers();
  mp4ConversionIpcHandlers();
  playlistIpcHandlers();
}
