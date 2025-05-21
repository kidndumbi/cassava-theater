import { Box } from "@mui/material";
import { CustomFoldersToolbar } from "./CustomFoldersToolbar";
import { Title } from "../common/Title";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { CustomFolderListPanel } from "./CustomFolderListPanel";
import { useCallback, useEffect, useState } from "react";
import { SelectedCustomFolderToolbar } from "./SelectedCustomFolderToolbar";
import { CustomFolderVideosPanel } from "./CustomFolderVideosPanel";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl } from "../../util/helperFunctions";
import { useVideoDataQuery } from "../../hooks/useVideoData.query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CustomFolderModel } from "../../../models/custom-folder";

interface CustomFolderProps {
  menuId: string;
}

export const CustomFolderPage = ({ menuId }: CustomFolderProps) => {
  const { data } = useGetAllSettings();
  const folders = data?.folders ?? [];
  const port = data?.port;

  const navigate = useNavigate();

  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedFolder, setSelectedFolder] = useState<CustomFolderModel | null>(null);

  const { data: videos, isLoading } = useVideoDataQuery({
    filePath: selectedFolder?.folderPath || "",
    category: "customFolder",
  });

  useEffect(() => {
    const folderId = searchParams.get("folderId") || null;
    if (folderId) {
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        setSelectedFolder(folder);
        setSearchParams((prev) => {
          const params = new URLSearchParams(prev);
          params.delete("folderId");
          return params;
        });
      }
    }
  }, []);

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
        {<Title>Folders</Title>}
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
              videos={videos}
              onClick={(video) => {
                navigate(
                  `/video-details?videoPath=${video.filePath}&menuId=${menuId}&folderId=${selectedFolder?.id}`,
                );
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};
