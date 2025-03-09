import { createAsyncThunk } from "@reduxjs/toolkit";
import { VideoDataModel } from "../../../models/videoData.model";
import { rendererLoggingService as log } from "../../util/renderer-logging.service";
import { fetchVideoDetailsApi } from "./folderVideosInfoApi";

export const fetchVideoData = createAsyncThunk(
  "folderVideosInfo/fetchVideoData",
  async (
    {
      path,
      category,
      searchText,
      includeThumbnail = false,
    }: {
      path: string;
      category: string;
      searchText?: string;
      includeThumbnail?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      if (!path) return { category, data: [] };

      const response = await window.videoAPI.fetchVideoData({
        filePath: path,
        searchText,
        includeThumbnail,
        category,
      });

      return { category, data: response };
    } catch (error) {
      log.error("Error fetching video data:", error);
      return rejectWithValue(error);
    }
  },
);

export const fetchVideoDetails = createAsyncThunk(
  "folderVideosInfo/fetchVideoDetails",
  async (args: { path: string; category: string }, { rejectWithValue }) => {
    try {
      const data = await fetchVideoDetailsApi(args);
      return data;
    } catch (error) {
      log.error("Error fetching video details:", error);
      return rejectWithValue(error);
    }
  },
);

export const fetchFolderDetails = createAsyncThunk(
  "folderVideosInfo/fetchFolderDetails",
  async ({ path }: { path: string }, { rejectWithValue }) => {
    try {
      const response = await window.videoAPI.fetchFolderDetails({ path });
      return response;
    } catch (error) {
      log.error("Error fetching folder details:", error);
      return rejectWithValue(error);
    }
  },
);

export const postVideoJason = createAsyncThunk(
  "folderVideosInfo/postVideoJason",
  async ({
    currentVideo,
    newVideoJsonData,
  }: {
    currentVideo: VideoDataModel | undefined;
    newVideoJsonData: VideoDataModel | undefined;
  }) => {
    try {
      return await window.videoAPI.saveVideoJsonData({
        currentVideo,
        newVideoJsonData,
      });
    } catch (error) {
      log.error("Failed to post video JSON data:", error);
      throw error;
    }
  },
);