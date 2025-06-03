import * as React from "react";
import { Paper, Box, Typography } from "@mui/material";
import theme from "../../theme";
import { getFilename, removeVidExt } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import {
  ListDisplayType,
  PlaylistModel,
} from "../../../models/playlist.model";
import { PlaylistsVideo } from "./PlaylistsVideo";
import { AppDrop } from "../common/AppDrop";
import { useDragState } from "../../hooks/useDragState";

interface PlaylistVideosPanelProps {
  videos: VideoDataModel[] | undefined;
  getImageUrl: (video: VideoDataModel) => string | undefined;
  selectedPlaylist: PlaylistModel | null;
  updatePlaylist: (id: string, playlist: PlaylistModel) => void;
  navToDetails: (videoPath: string) => void;
  onPlayVideo: (videoIndex: number) => void;
  displayType: ListDisplayType;
}

export const PlaylistVideosPanel: React.FC<PlaylistVideosPanelProps> = ({
  videos,
  getImageUrl,
  selectedPlaylist,
  updatePlaylist,
  navToDetails,
  onPlayVideo,
  displayType = "grid",
}) => {
  const { isAnyDragging, setDragging } = useDragState();

  const handleRemove = (videoIdx: number) => {
    if (
      typeof videoIdx === "number" &&
      selectedPlaylist &&
      Array.isArray(selectedPlaylist.videos)
    ) {
      const videoToRemove = videos?.[videoIdx];
      if (videoToRemove?.filePath) {
        const updated = {
          ...selectedPlaylist,
          videos: selectedPlaylist.videos.filter(
            (fp) => fp !== videoToRemove.filePath,
          ),
        };
        updatePlaylist(updated.id, updated);
      }
    }
  };

  const handleInfo = (videoIdx: number) => {
    if (typeof videoIdx === "number" && videos?.[videoIdx]) {
      navToDetails(videos[videoIdx].filePath);
    }
  };

  // Handler to move video in the list
  const moveVideo = (from: number, to: number) => {
    if (!videos || !selectedPlaylist) return;
    const updatedVideos = [...videos];
    const [removed] = updatedVideos.splice(from, 1);
    updatedVideos.splice(to, 0, removed);

    // Update playlist with new order
    const updated = {
      ...selectedPlaylist,
      videos: updatedVideos.map((v) => v.filePath),
    };
    updatePlaylist(updated.id, updated);
  };

  return (
    <>
      <Paper
        sx={{
          minHeight: 300,
          p: 2,
          backgroundColor: theme.customVariables.appDarker,
          color: theme.customVariables.appWhiteSmoke,
        }}
      >
        {selectedPlaylist?.lastVideoPlayed && (
          <Typography sx={{ marginBottom: 2 }} variant="subtitle2">
            Last Played:{" "}
            {removeVidExt(getFilename(selectedPlaylist.lastVideoPlayed))}
          </Typography>
        )}
        <Box
          display="flex"
          flexWrap={displayType === "grid" ? "wrap" : "nowrap"}
          flexDirection={displayType === "list" ? "column" : "row"}
          gap={2}
        >
          {videos?.length > 0 ? (
            videos.map((video, idx) =>
              video ? (
                <PlaylistsVideo
                  key={video.filePath || idx}
                  currentPlaylist={selectedPlaylist}
                  video={video}
                  idx={idx}
                  getImageUrl={getImageUrl}
                  onPlayVideo={onPlayVideo}
                  handleRemove={handleRemove}
                  handleInfo={handleInfo}
                  moveVideo={moveVideo}
                  dragging={setDragging}
                  displayType={displayType}
                />
              ) : null,
            )
          ) : (
            <Typography sx={{ color: theme.customVariables.appWhiteSmoke }}>
              {selectedPlaylist
                ? "No videos in this playlist."
                : "Select a playlist to view its videos."}
            </Typography>
          )}
        </Box>
      </Paper>

      {isAnyDragging && (
        <AppDrop
          itemDroped={(item: {
            index: number;
            type: string;
            currentPlaylist: PlaylistModel;
          }) => {
            handleRemove(item.index);
          }}
          accept={["VIDEO"]}
        />
      )}
    </>
  );
};
