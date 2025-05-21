import { Box, Paper } from "@mui/material";
import theme from "../../theme";
import { VideoDataModel } from "../../../models/videoData.model";
import { AppContextMenu } from "../common/AppContextMenu";
import { removeVidExt, trimFileName } from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";

interface CustomFolderVideosPanelProps {
  videos: VideoDataModel[] | undefined;
  getImageUrl: (video: VideoDataModel) => string | undefined;
  onClick: (video: VideoDataModel) => void;
}

export const CustomFolderVideosPanel = ({
  videos,
  getImageUrl,
  onClick,
}: CustomFolderVideosPanelProps) => {
  return (
    <>
      <Paper
        sx={{
          flex: 1,
          minHeight: 300,
          p: 2,
          backgroundColor: theme.customVariables.appDarker,
          color: theme.customVariables.appWhiteSmoke,
        }}
      >
        <Box display="flex" flexWrap="wrap" gap={2}>
          {videos?.length > 0 ? (
            videos.map((video, idx) =>
              video ? (
                <AppContextMenu
                  key={video.filePath || idx}
                  title={removeVidExt(video.fileName)}
                  menuItems={[]}
                >
                  <PosterCard
                    imageUrl={getImageUrl(video)}
                    altText={video.fileName || ""}
                    footer={trimFileName(video.fileName || "")}
                    onClick={() => onClick(video)}
                  />
                </AppContextMenu>
              ) : null,
            )
          ) : (
            <div>No Videos</div>
          )}
        </Box>
      </Paper>
    </>
  );
};
