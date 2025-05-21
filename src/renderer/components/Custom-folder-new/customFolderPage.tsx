import { Box } from "@mui/material";
import { CustomFoldersToolbar } from "./CustomFoldersToolbar";
import { Title } from "../common/Title";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { CustomFolderListPanel } from "./CustomFolderListPanel";
import { useCallback, useState } from "react";
import { SelectedCustomFolderToolbar } from "./SelectedCustomFolderToolbar";
import { CustomFolderVideosPanel } from "./CustomFolderVideosPanel";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl } from "../../util/helperFunctions";
import { useVideoDataQuery } from "../../hooks/useVideoData.query";

interface CustomFolderProps {
  menuId: string;
}

export const CustomFolderPage = ({ menuId }: CustomFolderProps) => {
  const {
    data: { folders, port },
  } = useGetAllSettings();

  const { getTmdbImageUrl } = useTmdbImageUrl();

  const [selectedFolder, setSelectedFolder] = useState<{
    id: string;
    name: string;
    folderPath: string;
  } | null>(null);

  const { data: videos, isLoading } = useVideoDataQuery({
    filePath: selectedFolder?.folderPath || "",
    category: "customFolder",
  });

  const getImageUrl = useCallback(
    (movie: VideoDataModel) => {
      if (movie?.poster) {
        return getUrl("file", movie.poster, null, port);
      }
      if (movie?.movie_details?.poster_path) {
        return getTmdbImageUrl(movie.movie_details.poster_path);
      }
    },
    [getTmdbImageUrl, port],
  );

  return (
    <>
      <Box className="custom-scrollbar mr-5 overflow-y-auto pt-5">
        <CustomFoldersToolbar
          onAdd={() => {
            console.log("Add new folder clicked");
          }}
        />
        {<Title>Custom Folders</Title>}
        <Box display="flex" gap={2} mt={2}>
          <CustomFolderListPanel
            folders={folders}
            updateFolder={() => {
              console.log("Update folder clicked");
            }}
            selectedFolder={selectedFolder}
            setSelectedFolder={(folder) => {
              setSelectedFolder(folder);
              console.log("Set selected folder clicked", folder);
            }}
          />
          <Box>
            {selectedFolder && (
              <SelectedCustomFolderToolbar
                onRename={() => {
                  console.log("Rename folder clicked");
                }}
                onDelete={() => {
                  console.log("Delete folder clicked");
                }}
              />
            )}
            <CustomFolderVideosPanel
              getImageUrl={getImageUrl}
              videos={videos} // Replace with actual videos
              onClick={() => {
                console.log("Video clicked");
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};
