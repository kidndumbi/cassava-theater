import { currentlPlayingIpcHandlers } from "./currentlPlayingIpcHandlers";
import { fileIpcHandlers } from "./fileIpcHandlers";
import { llmIpcHandlers } from "./llmIpcHandlers";
import { mainUtilIpcHandlers } from "./mainUtilIpcHandlers";
import { mp4ConversionIpcHandlers } from "./mp4ConversionIpcHandlers";
import { openDialogIpcHandlers } from "./openDialogIpcHandlers";
import { playlistIpcHandlers } from "./playlistIpcHandlers";
import { settingsIpcHandlers } from "./settingsIpcHandlers";
import { subtitleIpcHandlers } from "./subtitleIpcHandlers";
import { theMovieDbIpcHandlers } from "./theMovieDbIpcHandlers";
import { videosIpcHandlers } from "./videosIpcHandlers";
import { youtubeIpcHandlers } from "./youtubeIpcHandlers";
import { translationIpcHandlers } from "./translationIpcHandlers";

export function registerIpcHandlers() {
  settingsIpcHandlers();
  videosIpcHandlers();
  openDialogIpcHandlers();
  mainUtilIpcHandlers();
  theMovieDbIpcHandlers();
  fileIpcHandlers();
  translationIpcHandlers();
  mp4ConversionIpcHandlers();
  playlistIpcHandlers();
  youtubeIpcHandlers();
  currentlPlayingIpcHandlers();
  llmIpcHandlers();
  subtitleIpcHandlers();
}
