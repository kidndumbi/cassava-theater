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
import { AppModal } from "../common/AppModal";
import { CustomFolderAddEdit } from "./CustomFolderAddEdit";
import { useSetSetting } from "../../hooks/settings/useSetSetting";
import { useConfirmation } from "../../contexts/ConfirmationContext";

interface CustomFolderProps {
  menuId: string;
}

export const CustomFolderPage = ({ menuId }: CustomFolderProps) => {
  const { data: settings } = useGetAllSettings();
  const folders = settings?.folders ?? [];
  const port = settings?.port;

  const { openDialog } = useConfirmation();

  const { mutateAsync: setSetting } = useSetSetting();

  const navigate = useNavigate();

  const [ediModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedFolder, setSelectedFolder] =
    useState<CustomFolderModel | null>(null);

  const { data: videos } = useVideoDataQuery({
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
            setAddModalOpen(true);
          }}
        />
        {<Title>Folders</Title>}
        <Box display="flex" gap={2} mt={2}>
          <CustomFolderListPanel
            folders={folders}
            selectedFolder={selectedFolder}
            setSelectedFolder={(folder) => {
              setSelectedFolder(folder);
            }}
          />
          <Box>
            {selectedFolder && (
              <SelectedCustomFolderToolbar
                onEdit={() => {
                  setEditModalOpen(true);
                }}
                onDelete={async () => {
                  if (
                    (await openDialog(
                      undefined,
                      undefined,
                      `Are you sure you want to remove this folder link? 
                      This will only remove the link, not delete the actual folder from your disk.`,
                    )) === "Ok"
                  ) {
                    const updatedFolders = folders.filter(
                      (folder) => folder.id !== selectedFolder.id,
                    );
                    await setSetting({
                      key: "folders",
                      value: updatedFolders,
                    });
                    setSelectedFolder(null);
                  }
                }}
              />
            )}
            <CustomFolderVideosPanel
              selectedFolder={selectedFolder}
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
      <AppModal
        open={ediModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        title="Edit Folder"
      >
        <CustomFolderAddEdit
          folder={selectedFolder}
          onEdit={async (changes) => {
            if (!selectedFolder || Object.keys(changes).length === 0) return;
            const updatedFolders = folders.map((f) =>
              f.id === selectedFolder.id ? { ...f, ...changes } : f,
            );
            await setSetting({ key: "folders", value: updatedFolders });
            setSelectedFolder((prev) =>
              prev ? { ...prev, ...changes } : prev,
            );
            setEditModalOpen(false);
          }}
        />
      </AppModal>
      <AppModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
        }}
        title="Add Folder"
      >
        <CustomFolderAddEdit
          onAdd={async (newFolder) => {
            const updatedFolders = [...folders, newFolder];
            await setSetting({ key: "folders", value: updatedFolders });
            setSelectedFolder(newFolder);
            setAddModalOpen(false);
          }}
        />
      </AppModal>
    </>
  );
};
