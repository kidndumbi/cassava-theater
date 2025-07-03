import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTvShows } from "../../hooks/useTvShows";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { Box, IconButton, Tab, Tabs, useTheme } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import RefreshIcon from "@mui/icons-material/Refresh";
import FourMpIcon from "@mui/icons-material/FourMp";
import ChatIcon from "@mui/icons-material/Chat";
import {
  getFilename,
  getUrl,
  getYearFromDate,
} from "../../util/helperFunctions";
import { Episodes } from "./episodes";
import { VideoDataModel } from "../../../models/videoData.model";
import RenderSelect from "./RenderSelect";

import LoadingIndicator from "../common/LoadingIndicator";
import { CustomTabPanel, a11yProps } from "../common/TabPanel";
import { useSubtitle } from "../../hooks/useSubtitle";
import MovieIcon from "@mui/icons-material/Movie";
import { TvShowSuggestionsModal } from "./TvShowSuggestionsModal";
import { VideoProgressBar } from "../common/VideoProgressBar";
import TvShowDetailsButtons from "./TvShowDetailsButtons";
import { Season, TvShowDetails } from "../../../models/tv-show-details.model";
import AppIconButton from "../common/AppIconButton";
import CustomDrawer from "../common/CustomDrawer";
import { TvShowCastAndCrew } from "../common/TvShowCastAndCrew";
import { AppModal } from "../common/AppModal";
import SeasonConvertSelector from "./SeasonConvertSelector";
import { AiChat } from "../common/AiChat";
import { LlmResponseChunk } from "../../../models/llm-response-chunk.model";
import {
  useFolderDetailsQuery,
  useVideoDataQuery,
} from "../../hooks/useVideoData.query";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useModalState } from "../../hooks/useModalState";
import { ConversationMessage } from "../../../models/conversationMessage.model";
import { useSelector } from "react-redux";
import {
  selChatHistory,
  chatHistoryActions,
} from "../../store/chatHistory.slice";
import { useAppDispatch } from "../../store";

interface TvShowDetailsProps {
  videoPath: string | null;
  menuId: string;
  resumeId: string;
}

const TvShowDetails: React.FC<TvShowDetailsProps> = ({
  videoPath,
  menuId,
  resumeId,
}) => {
  const { updateTvShowTMDBId, updateTvShowDbData } = useTvShows();

  const [episodesQuery, setEpisodesQuery] = useState("");
  const { showSnackbar } = useSnackbar();

  const queryClient = useQueryClient();

  const { data: tvShowDetails, isLoading: loadingFolderDetails } =
    useFolderDetailsQuery(videoPath || "");
  const { data: episodes, isLoading: loadingEpisodes } = useVideoDataQuery({
    filePath: episodesQuery,
    category: "episodes",
  });

  const { updateSubtitle } = useSubtitle();
  const [tvShowBackgroundUrl, setTvShowBackgroundUrl] = useState("");
  const { getTmdbImageUrl, getBackgroundGradient } = useTmdbImageUrl();
  const navigate = useNavigate();
  const { setCurrentVideo } = useVideoListLogic();
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [currentTabValue, setCurrentTabValue] = useState(0);
  const [seasonPosterPath, setSeasonPosterPath] = useState("");
  const [seasonOverview, setSeasonOverview] = useState("");
  const [seasonAirDate, setSeasonAirDate] = useState("");
  const [episodeLastWatched, setEpisodeLastWatched] =
    useState<VideoDataModel | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const {
    open: openConvertToMp4Modal,
    openModal: openConvertToMp4ModalOpen,
    closeModal: closeConvertToMp4Modal,
  } = useModalState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const [chatStream, setChatStream] = useState<LlmResponseChunk | undefined>(
    undefined,
  );

  const [chatHistory, setChatHistory] = useState<
    { id: string; history: ConversationMessage[] } | undefined
  >(undefined);

  const allChatHistory = useSelector(selChatHistory);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const currentVideoChatHistory = allChatHistory.find(
      (chat) => chat.id === videoPath,
    );
    setChatHistory(currentVideoChatHistory);
  }, [allChatHistory]);

  const {
    open: isChatModalOpen,
    openModal: openChatModal,
    closeModal: closeChatModal,
  } = useModalState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  const theme = useTheme();

  const nextEpisodeRef = useRef<VideoDataModel | null>(null);

  const nextEpisode = useMemo(() => {
    if (nextEpisodeRef.current) {
      return nextEpisodeRef.current;
    }
    const currentIndex = episodes?.findIndex(
      (episode) => episode.filePath === episodeLastWatched?.filePath,
    );
    if (currentIndex !== -1 && currentIndex < episodes?.length - 1) {
      const foundNext = episodes[currentIndex + 1];
      nextEpisodeRef.current = foundNext;
      return foundNext;
    }
    nextEpisodeRef.current = null;
    return null;
  }, [episodeLastWatched, episodes]);

  const { data: settings } = useGetAllSettings();

  const getImageUrl = (show: VideoDataModel) => {
    const { backdrop, tv_show_details } = show;
    if (backdrop) {
      return getUrl("file", backdrop, null, settings?.port);
    } else if (tv_show_details?.backdrop_path) {
      return getTmdbImageUrl(tv_show_details.backdrop_path, "original");
    }
    return "//";
  };

  const getFirstChildFolderPath = (tvShowDetails: VideoDataModel) =>
    tvShowDetails?.childFolders?.at(0)?.folderPath ?? "";

  const getSelectedSeason = (tvShowDetails: VideoDataModel): string => {
    if (tvShowDetails?.lastVideoPlayed) {
      return tvShowDetails.lastVideoPlayed
        .replace(/\\/g, "/")
        .split("/")
        .slice(0, -1)
        .join("/");
    } else {
      return getFirstChildFolderPath(tvShowDetails);
    }
  };

  const setSeasonDetails = async (path: string, details: VideoDataModel) => {
    const seasonName = getFilename(path);
    const selectedSeason = details?.tv_show_details?.seasons?.find(
      (season: Season) =>
        season.name.toLowerCase() === seasonName.toLowerCase(),
    );

    setSeasonOverview(selectedSeason?.overview ?? "");
    setSeasonAirDate(selectedSeason?.air_date ?? "");
    setSeasonPosterPath(
      selectedSeason?.poster_path &&
        getTmdbImageUrl(selectedSeason.poster_path, "original"),
    );
    setEpisodesQuery(path);
  };

  function updateBackgroundAndSeason(tvShowDetails: VideoDataModel) {
    const backgroundUrl = getImageUrl(tvShowDetails);

    setTvShowBackgroundUrl(backgroundUrl);

    const selSeason = getSelectedSeason(tvShowDetails);
    setSelectedSeason(selSeason);

    setSeasonDetails(selSeason, tvShowDetails);
  }

  useEffect(() => {
    if (tvShowDetails) {
      updateBackgroundAndSeason(tvShowDetails);
    }
  }, [tvShowDetails]);

  useEffect(() => {
    if (!tvShowDetails?.lastVideoPlayed || episodes?.length === 0) return;
    const normalizedLastPlayed = tvShowDetails.lastVideoPlayed.replace(
      /\\/g,
      "/",
    );
    const lastWatchedEpisode = episodes?.find(
      (episode) => episode.filePath === normalizedLastPlayed,
    );

    if (lastWatchedEpisode) {
      setEpisodeLastWatched(lastWatchedEpisode);
    }
  }, [episodes, tvShowDetails, episodeLastWatched]);

  const onBackClick = () => {
    navigate("/?menuId=" + menuId);
  };

  const onSeasonChange = (event: SelectChangeEvent<string>) => {
    const newSeasonFullPath = event.target.value as string;
    setSelectedSeason(newSeasonFullPath);

    setSeasonDetails(newSeasonFullPath, tvShowDetails);
  };

  const onEpisodeClick = (episode: VideoDataModel) => {
    setCurrentVideo(episode);
    navigate("/video-player?menuId=" + menuId + "&resumeId=" + resumeId);
  };

  const onContinueClick = () => {
    if (episodeLastWatched) {
      setCurrentVideo(episodeLastWatched);
      navigate("/video-player?menuId=" + menuId + "&resumeId=" + resumeId);
    }
  };

  const onNextEpisodeClick = () => {
    if (nextEpisode) {
      setCurrentVideo(nextEpisode);
      navigate("/video-player?menuId=" + menuId + "&resumeId=" + resumeId);
    }
  };
  const onStartFromBeginningClick = () => {
    if (episodeLastWatched) {
      setCurrentVideo(episodeLastWatched);
      navigate(
        "/video-player?startFromBeginning=true&menuId=" +
          menuId +
          "&resumeId=" +
          resumeId,
      );
    }
  };

  const childFolders = tvShowDetails?.childFolders ?? [];

  // --- Mutations ---
  const updateTmdbMutation = useMutation({
    mutationFn: async (tv_show_details: TvShowDetails) => {
      if (!videoPath || !tv_show_details?.id) return null;
      return updateTvShowTMDBId(videoPath, tv_show_details);
    },
    onSuccess: (extraTvShowDetails) => {
      if (!videoPath || !extraTvShowDetails) return;
      queryClient.setQueryData(
        ["folderDetails", videoPath],
        (oldData: VideoDataModel) => ({
          ...oldData,
          tv_show_details: extraTvShowDetails,
        }),
      );
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({
      filePath,
      data,
    }: {
      filePath: string;
      data: VideoDataModel;
    }) => {
      await updateTvShowDbData(filePath, data);
      return { filePath, data };
    },
    onSuccess: ({ filePath, data }) => {
      showSnackbar("Custom image updated successfully", "success");
      queryClient.setQueryData(
        ["folderDetails", filePath],
        (oldData: VideoDataModel) => ({
          ...oldData,
          ...data,
        }),
      );
    },
    onError: () => {
      showSnackbar("Failed to update custom image", "error");
    },
  });

  // Add mutation for saveVideoJsonData
  const saveVideoJsonDataMutation = useMutation({
    mutationFn: async ({
      currentVideo,
      newVideoJsonData,
    }: {
      currentVideo: { filePath: string | null };
      newVideoJsonData: VideoDataModel;
    }) => {
      return window.videoAPI.saveVideoJsonData({
        currentVideo,
        newVideoJsonData,
      });
    },
    onSuccess: (_, { currentVideo: { filePath }, newVideoJsonData }) => {
      const currentSelectedSeason = selectedSeason;
      queryClient.setQueryData(
        ["folderDetails", filePath],
        (oldData: VideoDataModel) => ({
          ...oldData,
          ...newVideoJsonData,
        }),
      );

      setTimeout(() => {
        setSelectedSeason(currentSelectedSeason);
        setSeasonDetails(currentSelectedSeason, tvShowDetails);
      }, 0);
    },
    onError: () => {
      showSnackbar("Failed to update video data", "error");
    },
  });

  useEffect(() => {
    window.mainNotificationsAPI.videoAiChatDataChunks(
      (chatResponseChunk: LlmResponseChunk) => {
        setChatStream(chatResponseChunk);
      },
    );
  }, []);

  const triggerChatStream = (prompt?: string) => {
    setChatStream(undefined);
    const tvShowTitle =
      tvShowDetails?.tv_show_details?.name ||
      getFilename(tvShowDetails?.filePath || "") ||
      "Unknown TV Show";
    const chatPrompt = prompt
      ? `${prompt} (Context: We're discussing the TV show "${tvShowTitle}")`
      : `Tell me about the TV show "${tvShowTitle}"`;

    window.llmAPI.generateLlmResponseByChunks(
      "",
      "",
      chatPrompt,
      "desktop",
      settings.ollamaModel || "llama3.1:latest",
    );
  };

  return (
    <>
      <Box
        className="relative h-screen w-screen bg-cover"
        style={{
          backgroundImage: getBackgroundGradient(tvShowBackgroundUrl),
        }}
      >
        {loadingFolderDetails ? (
          <Box className="flex h-screen items-center justify-center">
            <LoadingIndicator message="Loading..." />
          </Box>
        ) : (
          <>
            <Box className="absolute left-5 top-5 flex w-[calc(100vw-40px)] justify-between">
              <IconButton
                onClick={onBackClick}
                style={{
                  color: theme.customVariables.appWhite,
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <AppIconButton
                  tooltip="Refresh"
                  onClick={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["folderDetails", videoPath],
                    });
                  }}
                >
                  <RefreshIcon />
                </AppIconButton>

                <AppIconButton
                  tooltip="Cast & Crew"
                  onClick={() => setOpenDrawer(!openDrawer)}
                >
                  <RecentActorsIcon />
                </AppIconButton>

                <AppIconButton
                  tooltip="theMovieDb data"
                  onClick={handleOpenModal}
                >
                  <MovieIcon />
                </AppIconButton>
                <AppIconButton
                  tooltip="convert to MP4"
                  onClick={() => {
                    openConvertToMp4ModalOpen();
                  }}
                >
                  <FourMpIcon />
                </AppIconButton>
                <AppIconButton
                  tooltip="AI Chat"
                  onClick={() => {
                    openChatModal();
                  }}
                >
                  <ChatIcon />
                </AppIconButton>
              </Box>
            </Box>
            <Box className="absolute bottom-12 left-5 ml-4 mr-4 text-white drop-shadow-md">
              <h2 className="mb-4 text-4xl font-extrabold">
                {tvShowDetails?.tv_show_details?.name ||
                  tvShowDetails?.filePath?.split("\\").pop()}
                {tvShowDetails?.tv_show_details?.first_air_date &&
                  "(" +
                    getYearFromDate(
                      tvShowDetails?.tv_show_details?.first_air_date,
                    ) +
                    ")"}
              </h2>
              <p className="max-w-[50%]">
                {tvShowDetails?.tv_show_details?.overview}
              </p>

              {episodes?.length > 0 && tvShowDetails?.lastVideoPlayed && (
                <TvShowDetailsButtons
                  tvShowDetails={tvShowDetails}
                  onContinueClick={onContinueClick}
                  onStartFromBeginningClick={onStartFromBeginningClick}
                  onNextEpisodeClick={
                    nextEpisode ? onNextEpisodeClick : undefined
                  }
                  nextEpisode={nextEpisode}
                />
              )}
              {tvShowDetails?.lastVideoPlayed && (
                <Box>
                  {getFilename(tvShowDetails?.lastVideoPlayed).replace(
                    /\.(mp4|mkv)$/i,
                    "",
                  )}
                </Box>
              )}
              {(tvShowDetails?.lastVideoPlayedTime || 0) > 0 &&
                episodeLastWatched && (
                  <Box className="pb-5">
                    <VideoProgressBar
                      current={episodeLastWatched?.currentTime || 0}
                      total={episodeLastWatched?.duration || 0}
                    />
                  </Box>
                )}
              {childFolders?.length > 0 && (
                <Box className="flex gap-2">
                  <RenderSelect
                    value={selectedSeason}
                    onChange={onSeasonChange}
                    items={childFolders}
                    getItemValue={(folder) => folder.folderPath}
                    getItemLabel={(folder) => folder.basename}
                  />
                </Box>
              )}

              <Box>
                <Tabs
                  value={currentTabValue}
                  onChange={onTabChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Episodes" {...a11yProps(0)} />
                  <Tab label="Item Two" {...a11yProps(1)} />
                </Tabs>
              </Box>
            </Box>
          </>
        )}
      </Box>
      <Box className="flex-grow">
        <CustomTabPanel value={currentTabValue} index={0}>
          <Episodes
            seasonAirDate={seasonAirDate}
            overview={seasonOverview}
            onEpisodeClick={onEpisodeClick}
            loadingEpisodes={loadingEpisodes}
            episodes={episodes}
            theme={theme}
            seasonPosterPath={seasonPosterPath}
            handleFilepathChange={async (
              newSubtitleFilePath: string,
              episode: VideoDataModel,
            ) => {
              await updateSubtitle(newSubtitleFilePath, episode);
            }}
            episodeDeleted={(filepath) => {
              queryClient.setQueryData(
                ["videoData", episodesQuery, false, "episodes"],
                (oldData: VideoDataModel[]) => {
                  return oldData?.filter(
                    (episode: VideoDataModel) => episode.filePath !== filepath,
                  );
                },
              );
              const normalizedLastPlayed =
                tvShowDetails.lastVideoPlayed.replace(/\\/g, "/");
              if (filepath === normalizedLastPlayed) {
                saveVideoJsonDataMutation.mutate({
                  currentVideo: { filePath: videoPath },
                  newVideoJsonData: {
                    lastVideoPlayed: null,
                    lastVideoPlayedTime: 0,
                    lastVideoPlayedDate: null,
                    lastVideoPlayedDuration: 0,
                  },
                });
              }
            }}
          />
        </CustomTabPanel>
        <CustomTabPanel value={currentTabValue} index={1}>
          Item Two
        </CustomTabPanel>
      </Box>
      <TvShowSuggestionsModal
        id={tvShowDetails?.tv_show_details?.id.toString() || ""}
        open={openModal}
        handleClose={handleCloseModal}
        fileName={tvShowDetails?.filePath?.split("/").pop() || ""}
        filePath={videoPath || ""}
        handleSelectTvShow={async (tv_show_details) => {
          updateTmdbMutation.mutate(tv_show_details);
        }}
        handleImageUpdate={async (data: VideoDataModel, filePath: string) => {
          updateImageMutation.mutate({ filePath, data });
        }}
      />
      <AppModal
        open={openConvertToMp4Modal}
        onClose={closeConvertToMp4Modal}
        title="Seasons"
      >
        <SeasonConvertSelector
          childFolders={childFolders}
          close={closeConvertToMp4Modal}
        />
      </AppModal>
      <CustomDrawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <TvShowCastAndCrew
          aggregateCredits={tvShowDetails?.tv_show_details?.aggregate_credits}
        />
      </CustomDrawer>
      <AppModal
        open={isChatModalOpen}
        onClose={closeChatModal}
        title="TV Show AI Chat"
      >
        <AiChat
          ollamaModel={settings?.ollamaModel || "llama3.1:latest"}
          chatStream={chatStream}
          triggerChatStream={triggerChatStream}
          history={chatHistory}
          updateHistory={(conversationHistory) => {
            dispatch(
              chatHistoryActions.addChatHistory({
                id: videoPath || "",
                history: conversationHistory,
              }),
            );
          }}
        />
      </AppModal>
    </>
  );
};

export default TvShowDetails;
