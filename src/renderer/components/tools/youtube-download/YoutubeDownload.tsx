import { AppTextField } from "../../common/AppTextField";
import { useEffect, useRef, useState } from "react";
import theme from "../../../theme";
import { AppButton } from "../../common/AppButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Folder as FolderIcon } from "@mui/icons-material";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Avatar,
  Box,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
  Button,
} from "@mui/material";
import { useGetAllSettings } from "../../../hooks/settings/useGetAllSettings";
import { selectFolder } from "../../../util/helperFunctions";
import { useSaveJsonData } from "../../../hooks/useSaveJsonData";
import { useAppDispatch } from "../../../store";
import { youtubeDownloadActions } from "../../../store/youtubeDownload.slice";

export const YoutubeDownload = () => {
  const [url, setUrl] = useState("");

  const [fileName, setFileName] = useState("");
  const { data: settings } = useGetAllSettings();
  const dispatch = useAppDispatch();

  const destinationOptions = useRef<{ name: string; filePath: string }[]>([]);
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      const { folders, movieFolderPath, tvShowsFolderPath } = settings;
      const folderOptions = folders.map((folder) => ({
        name: folder.name,
        filePath: folder.folderPath,
      }));
      destinationOptions.current = [
        ...folderOptions,
        { name: "Movies", filePath: movieFolderPath },
        { name: "TV Shows", filePath: tvShowsFolderPath },
      ];
    }
  }, [settings]);

  const {
    data: info,
    refetch,
    isLoading: isLoadingInfo,
  } = useQuery({
    queryKey: ["youtube-info", url],
    queryFn: () => window.youtubeAPI.getVideoInfo(url),
    enabled: false,
  });

  const { mutateAsync: download, isPending: isDownloading } = useMutation({
    mutationFn: (data: { url: string; destination: string }) =>
      window.youtubeAPI.downloadVideo(data.url, data.destination),
    onError: (error) => {
      console.error("Error downloading video:", error);
    },
  });

  const { mutate: saveJsonData } = useSaveJsonData(() => {
    setFileName("");
    setUrl("");
    setDestination(null);
  });

  const { mutateAsync: addToQueue, isPending: isAddingToQueue } = useMutation({
    mutationFn: (data: {
      title: string;
      url: string;
      destinationPath: string;
    }) => window.youtubeAPI.addToDownloadQueue(data),
    onError: (error) => {
      console.error("Error adding to download queue:", error);
    },
    onSuccess: async () => {
      setFileName("");
      setUrl("");
      setDestination(null);
      const queue = await window.youtubeAPI.getQueue();
      dispatch(youtubeDownloadActions.setDownloadProgress(queue));
    },
  });

  useEffect(() => {
    console.log("Youtube Info: ", info);
    if (info) {
      // Remove invalid filename characters: \ / : * ? " < > |
      const safeTitle = info.videoDetails.title.replace(/[\\/:*?"<>|]/g, "");
      setFileName(safeTitle);
    }
  }, [info]);

  return (
    <>
      <Box
        sx={{ display: "flex", gap: 2, alignItems: "center", width: "100%" }}
      >
        <AppTextField
          label="Youtube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          theme={theme}
        />
        <AppButton
          disabled={!url.trim()}
          onClick={() => {
            refetch(); // trigger fetching manually
          }}
        >
          Verify
        </AppButton>
      </Box>
      <Box sx={{ mt: 3, width: "100%" }}>
        {isLoadingInfo && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {info && !isLoadingInfo && (
          <Card
            sx={{
              backgroundColor: theme.customVariables.appDark,
            }}
          >
            <CardContent
              sx={{
                color: theme.customVariables.appWhiteSmoke,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                }}
              >
                {info.videoDetails.thumbnails.length > 0 && (
                  <Avatar
                    variant="rounded"
                    src={info.videoDetails.thumbnails[0].url}
                    alt={info.videoDetails.title}
                    sx={{ width: 80, height: 80 }}
                  />
                )}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {info.videoDetails.title}
                  </Typography>
                  <Typography variant="body2">
                    {info.videoDetails.author.name}
                  </Typography>
                  <Box className="mt-2 flex flex-col gap-2">
                    <AppTextField
                      label="file name"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      theme={theme}
                    />

                    <Box>
                      <FormControl sx={{ mt: 2 }}>
                        <FormLabel
                          sx={{ color: theme.customVariables.appWhiteSmoke }}
                        >
                          Destination: {destination}
                        </FormLabel>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          style={{ marginLeft: "8px" }}
                          onClick={async () => {
                            const folderPath = await selectFolder();
                            if (folderPath) setDestination(folderPath);
                          }}
                          sx={{
                            ml: 0,
                            width: "fit-content",
                            height: "fit-content",
                          }}
                        >
                          <FolderIcon />
                        </Button>
                        <RadioGroup
                          value={destination ?? ""}
                          onChange={(e) => setDestination(e.target.value)}
                        >
                          {destinationOptions.current.map((opt) => (
                            <FormControlLabel
                              key={opt.filePath}
                              value={opt.filePath}
                              control={<Radio />}
                              label={opt.name}
                              slotProps={{
                                typography: {
                                  style: {
                                    color: theme.customVariables.appWhiteSmoke,
                                  },
                                },
                              }}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Box>
                    <Box className="flex gap-2">
                      <AppButton
                        sx={{ width: "fit-content", height: "fit-content" }}
                        disabled={
                          !fileName.trim() || !destination || isDownloading
                        }
                        onClick={async () => {
                          console.log("Download Video");
                          const filePath = `${destination}\\${fileName}.mp4`;

                          await download({
                            url: info.videoDetails.video_url,
                            destination: filePath,
                          });

                          saveJsonData({
                            currentVideo: {
                              filePath,
                            },
                            newVideoJsonData: {
                              poster: info.videoDetails.thumbnails[4].url,
                              backdrop: info.videoDetails.thumbnails[4].url,
                            },
                          });
                        }}
                      >
                        Download
                      </AppButton>
                      <AppButton
                        sx={{ width: "fit-content", height: "fit-content" }}
                        disabled={
                          !fileName.trim() ||
                          !destination ||
                          isDownloading ||
                          isAddingToQueue
                        }
                        onClick={async () => {
                          console.log("adding to queue");
                          const filePath = `${destination}\\${fileName}.mp4`;
                          await addToQueue({
                            title: fileName,
                            url: info.videoDetails.video_url,
                            destinationPath: filePath,
                          });
                        }}
                      >
                        Add to Queue
                      </AppButton>
                    </Box>

                    {isDownloading && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 2 }}
                      >
                        <CircularProgress size={24} />
                        <Typography sx={{ ml: 2 }}>Downloading...</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
      {/* <AppModal
        title="Destination"
        open={destinationModalOpen}
        onClose={() => {
          setDestinationModalOpen(false);
        }}
      >
        <Box>HIIIIII</Box>
      </AppModal> */}
    </>
  );
};
