import { Box, Alert } from "@mui/material";
import { CustomFoldersToolbar } from "./CustomFoldersToolbar";
import { Title } from "../common/Title";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useCallback, useEffect, useState } from "react";
import { SelectedCustomFolderToolbar } from "./SelectedCustomFolderToolbar";
import { CustomFolderVideosPanel } from "./CustomFolderVideosPanel";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, parseIpcError } from "../../util/helperFunctions";
import { useVideoDataQuery } from "../../hooks/useVideoData.query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CustomFolderModel } from "../../../models/custom-folder";
import { AppModal } from "../common/AppModal";
import { CustomFolderAddEdit } from "./CustomFolderAddEdit";
import { useSetSetting } from "../../hooks/settings/useSetSetting";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { AppListPanel, DragMenuItem } from "../common/AppListPanel";
import theme from "../../theme";
import { useDragState } from "../../hooks/useDragState";
import { AppDrop } from "../common/AppDrop";
import LoadingIndicator from "../common/LoadingIndicator";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { useSaveJsonData } from "../../hooks/useSaveJsonData";
import { ListDisplayType } from "../../../models/playlist.model";

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

  const queryClient = new QueryClient();

  const [ediModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedFolder, setSelectedFolder] =
    useState<CustomFolderModel | null>(null);

  const {
    data: videos,
    refetch,
    error,
    isLoading: isVideosLoading,
  } = useVideoDataQuery({
    filePath: selectedFolder?.folderPath || "",
    category: "customFolder",
  });

  const { data: videoJsonData, isLoading: isVideoJsonLoading } = useQuery({
    queryKey: ["videoJsonData", selectedFolder?.folderPath],
    queryFn: () => {
      return window.videoAPI.getVideoJsonData({
        filePath: selectedFolder.folderPath,
      });
    },
    enabled: !!selectedFolder?.folderPath,
  });

  const [selectedFolderDisplayType, setSelectedFolderDisplayType] =
    useState<ListDisplayType>(null);

  useEffect(() => {
    if (videoJsonData) {
      setSelectedFolderDisplayType(videoJsonData?.display || "grid");
    }
  }, [videoJsonData]);

  const { mutate: saveJsonData } = useSaveJsonData(() => {
    queryClient.invalidateQueries({
      queryKey: ["videoJsonData", selectedFolder?.folderPath],
    });
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

  const { isAnyDragging, setDragging } = useDragState();

  const handleDeleteFolder = async (folderId: string) => {
    const dialogDecision = await openDialog(
      undefined,
      undefined,
      "Are you sure you want to remove this folder link? This will only remove the link, not delete the actual folder from your disk.",
    );
    if (dialogDecision === "Ok") {
      const updatedFolders = (folders || []).filter(
        (folder) => folder.id !== folderId,
      );
      await setSetting({
        key: "folders",
        value: updatedFolders,
      });
    }
  };

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
          <AppListPanel
            items={folders}
            selectedItem={selectedFolder}
            setSelectedItem={(folder) => {
              const selectedFolder = folders.find((f) => f.id === folder.id);
              setSelectedFolder(selectedFolder);
            }}
            backgroundColor={theme.palette.primary.main}
            dragging={setDragging}
            onSwitchPosition={async (id1, id2) => {
              const folder1 = folders?.find((item) => item.id === id1);
              const folder2 = folders?.find((item) => item.id === id2);
              if (folder1 && folder2 && Array.isArray(folders)) {
                const index1 = folders.indexOf(folder1);
                const index2 = folders.indexOf(folder2);
                const newFolders = [...folders];
                newFolders[index1] = folder2;
                newFolders[index2] = folder1;
                setSetting({
                  key: "folders",
                  value: newFolders,
                });
              }
            }}
          />
          <Box
            sx={{
              width: "100%",
            }}
          >
            {selectedFolder && (
              <SelectedCustomFolderToolbar
                displayType={selectedFolderDisplayType}
                onEdit={() => {
                  setEditModalOpen(true);
                }}
                onRefresh={() => {
                  refetch();
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
                onUpdateVideoJsonData={async (data) => {
                  const filePath = selectedFolder.folderPath;
                  setSelectedFolderDisplayType(data.display);

                  saveJsonData({
                    currentVideo: {
                      filePath,
                    },
                    newVideoJsonData: {
                      display: data.display,
                      filePath,
                    },
                  });
                }}
              />
            )}

            {isVideosLoading && (
              <LoadingIndicator message="Loading videos..." />
            )}

            {!error && !isVideosLoading && !isVideoJsonLoading && (
              <CustomFolderVideosPanel
                displayType={selectedFolderDisplayType}
                selectedFolder={selectedFolder}
                getImageUrl={getImageUrl}
                videos={videos}
                onClick={(video) => {
                  navigate(
                    `/video-details?videoPath=${video.filePath}&menuId=${menuId}&folderId=${selectedFolder?.id}`,
                  );
                }}
              />
            )}
            {error && (
              <Alert
                severity="error"
                sx={{
                  textAlign: "center",
                  mt: 2,
                }}
              >
                {parseIpcError(error).message ||
                  "An error occurred while loading videos."}
              </Alert>
            )}
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
      {isAnyDragging && (
        <AppDrop
          itemDroped={(item: DragMenuItem) => {
            handleDeleteFolder(item.menuItem.id);
          }}
          accept={["MENUITEM"]}
        />
      )}
    </>
  );
};
