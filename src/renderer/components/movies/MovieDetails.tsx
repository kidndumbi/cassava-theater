import React, { useEffect, useState, useCallback } from "react";
import { useMovies } from "../../hooks/useMovies";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import LoadingIndicator from "../common/LoadingIndicator";
import { useSubtitle } from "../../hooks/useSubtitle";
import { MovieSuggestionsModal } from "./MovieSuggestionsModal";
import { CustomTabPanel } from "../common/TabPanel";
import { AppNotes } from "../AppNotes";
import MovieDetailsHeader from "./MovieDetailsHeader";
import MovieDetailsContent from "./MovieDetailsContent";
import { getUrl, removeVidExt } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import CustomDrawer from "../common/CustomDrawer";
import { MovieCastAndCrew } from "../common/MovieCastAndCrew";
import { useVideoDetailsQuery } from "../../hooks/useVideoData.query";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { MovieDetails } from "../../../models/movie-detail.model";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useSaveJsonData } from "../../hooks/useSaveJsonData";
import { AppModal } from "../common/AppModal";
import { useModalState } from "../../hooks/useModalState";
import {
  chatHistoryActions,
  selChatHistory,
} from "../../store/chatHistory.slice";
import { ConversationMessage } from "../../../models/conversationMessage.model";
import { useAppDispatch } from "../../store";
import { AiChat } from "../common/AiChat";

interface MovieDetailsProps {
  videoPath: string | null;
  menuId: string;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ videoPath, menuId }) => {
  const { getExtraMovieDetails } = useMovies();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const {
    open: isChatModalOpen,
    openModal: openChatModal,
    closeModal: closeChatModal,
  } = useModalState(false);

  const {
    data: videoDetails,
    isLoading: loadingVideoDetails,
    refetch,
  } = useVideoDetailsQuery({ path: videoPath, category: "movies" });

  const { mutate: updateVideoData } = useMutation({
    mutationFn: window.videoAPI.saveVideoJsonData,
    onSuccess: (_, { newVideoJsonData }) => {
      queryClient.setQueryData(
        ["videoDetails", videoPath, "movies"],
        (oldData: VideoDataModel) => ({ ...oldData, ...newVideoJsonData }),
      );
      showSnackbar("Custom image updated successfully", "success");
    },
    onError: () => {
      showSnackbar("Failed to update custom image", "error");
    },
  });

  const { mutateAsync: saveTmdbData } = useSaveJsonData((data, savedData) => {
    queryClient.setQueryData(
      ["videoDetails", videoPath, "movies"],
      (oldData: VideoDataModel) => ({
        ...oldData,
        movie_details: savedData.newVideoJsonData.movie_details,
      }),
    );
  });

  const [imageUrl, setImageUrl] = useState("");
  const { getTmdbImageUrl, getBackgroundGradient } = useTmdbImageUrl();
  const navigate = useNavigate();
  const { setCurrentVideo } = useVideoListLogic();
  const { updateSubtitle } = useSubtitle();
  const [openModal, setOpenModal] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState(0);
  const { data: settings } = useGetAllSettings();
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const [searchParams] = useSearchParams();
  const [streamId, setStreamId] = useState<string | undefined>(undefined);

  const [chatHistory, setChatHistory] = useState<
    { id: string; history: ConversationMessage[] } | undefined
  >(undefined);

  const allChatHistory = useSelector(selChatHistory);

  useEffect(() => {
    const currentVideoChatHistory = allChatHistory.find(
      (chat) => chat.id === videoPath,
    );
    setChatHistory(currentVideoChatHistory);
  }, [allChatHistory]);

  const handleBackClick = () => {
    const folderId = searchParams.get("folderId");
    const isCustomFolder = menuId === "app-custom-folders";
    let url = `/?menuId=${menuId}`;
    if (isCustomFolder && folderId) {
      url += `&folderId=${folderId}`;
    }
    navigate(url);
  };

  const handlePlay = (startFromBeginning = false) => {
    if (!videoDetails) return;
    const folderId = searchParams.get("folderId");
    setCurrentVideo(videoDetails);

    const params = new URLSearchParams();
    if (startFromBeginning) params.append("startFromBeginning", "true");
    params.append("menuId", menuId);
    if (folderId) params.append("folderId", folderId);

    navigate(`/video-player?${params.toString()}`);
  };

  const onTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  const handleWatchLaterUpdate = async (
    filePath: string,
    watchLater: boolean,
  ) => {
    await window.videoAPI.saveVideoJsonData({
      currentVideo: { filePath },
      newVideoJsonData: { watchLater },
    });
    refetch();
  };

  const handleMovieSelect = async (movie_details: MovieDetails) => {
    const extraMovieDetails = await getExtraMovieDetails(
      videoPath,
      movie_details,
    );
    saveTmdbData({
      currentVideo: { filePath: videoPath },
      newVideoJsonData: { movie_details: extraMovieDetails },
    });
  };

  const handleImageUpdate = async (data: VideoDataModel, filePath: string) => {
    if (!filePath) return;
    updateVideoData({
      currentVideo: { filePath },
      newVideoJsonData: data,
    });
  };

  const handleVideoSeek = (seekTime: number) => {
    if (!videoDetails) return;
    const videoWithUpdatedTime = {
      ...videoDetails,
      currentTime: seekTime,
    };
    setCurrentVideo(videoWithUpdatedTime);
    navigate(`/video-player?menuId=${menuId}`);
  };

  // --- Extracted Logic ---
  const getImageUlr = (movie: VideoDataModel) => {
    if (movie.backdrop) {
      return getUrl("file", movie.backdrop, null, settings?.port);
    }
    if (movie?.movie_details?.backdrop_path) {
      return getTmdbImageUrl(movie.movie_details.backdrop_path, "original");
    }
  };

  useEffect(() => {
    if (videoDetails) {
      setImageUrl(getImageUlr(videoDetails));
    }
  }, [videoDetails, getTmdbImageUrl]);

  const triggerChatStream = async (prompt?: string, ollamaModel?: string, conversationHistory?: ConversationMessage[]) => {
    const movieTitle =
      videoDetails?.movie_details?.title ||
      removeVidExt(videoDetails?.fileName) ||
      "Unknown Movie";
    
    // Format conversation history for context
    let contextualPrompt = "";
    if (conversationHistory && conversationHistory.length > 0) {
      const historyContext = conversationHistory
        .slice(-10) // Only include last 10 messages to avoid token limits
        .map(msg => `${msg.type === "user" ? "User" : "Assistant"}: ${msg.message}`)
        .join("\n");
      contextualPrompt = `Previous conversation:\n${historyContext}\n\nCurrent question: `;
    }
    
    const chatPrompt = prompt
      ? `${contextualPrompt}${prompt} (Context: We're discussing the movie "${movieTitle}")`
      : `Tell me about the movie "${movieTitle}"`;

    if (streamId) {
      try {
        await window.llmAPI.cancelLlmStreamById(streamId);
      } catch (error) {
        console.error("Error canceling previous LLM stream:", error);
      }
    }
    const id = await window.llmAPI.generateLlmResponseByChunks(
      "",
      "",
      chatPrompt,
      "desktop",
      ollamaModel || settings?.ollamaModel || "llama3.1:latest",
    );
    setStreamId(id);
    console.log("LLM Stream ID:", id);
  };

  const updateHistory = useCallback(
    (conversationHistory: ConversationMessage[]) => {
      dispatch(
        chatHistoryActions.addChatHistory({
          id: videoPath || "",
          history: conversationHistory,
        }),
      );
    },
    [dispatch, videoPath],
  );

  return (
    <>
      <Box
        className="relative h-screen w-screen bg-cover"
        style={{
          backgroundImage: getBackgroundGradient(imageUrl),
        }}
      >
        {loadingVideoDetails ? (
          <div className="flex h-screen items-center justify-center">
            <LoadingIndicator message="Loading..." />
          </div>
        ) : (
          <>
            <MovieDetailsHeader
              toggleCastAndCrew={() => setOpenDrawer(!openDrawer)}
              handleBackClick={handleBackClick}
              handleOpenModal={handleOpenModal}
              videoDetails={videoDetails}
              videoPath={videoPath}
              updateSubtitle={updateSubtitle}
              getVideoDetails={() => {
                console.log("will be implemented in future");
              }}
              updateWatchLater={handleWatchLaterUpdate}
              onRefresh={() => {
                if (videoPath) {
                  refetch();
                }
              }}
              onOpenChatModal={() => {
                openChatModal();
              }}
            />
            <MovieDetailsContent
              videoDetails={videoDetails}
              handlePlay={handlePlay}
              currentTabValue={currentTabValue}
              onTabChange={onTabChange}
            />
          </>
        )}
      </Box>
      <Box>
        <CustomTabPanel value={currentTabValue} index={0}>
          <AppNotes
            videoData={videoDetails}
            currentVideoTime={0}
            handleVideoSeek={handleVideoSeek}
          />
        </CustomTabPanel>
      </Box>
      <MovieSuggestionsModal
        id={videoDetails?.movie_details?.id?.toString() || ""}
        open={openModal}
        handleClose={handleCloseModal}
        fileName={removeVidExt(videoDetails?.fileName) || ""}
        filePath={videoPath || ""}
        handleSelectMovie={handleMovieSelect}
        handleImageUpdate={handleImageUpdate}
      />
      <CustomDrawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <MovieCastAndCrew credits={videoDetails?.movie_details?.credits} />
      </CustomDrawer>
      <AppModal
        open={isChatModalOpen}
        onClose={async () => {
          closeChatModal();
          await window.llmAPI.cancelLlmStreamById(streamId || "");
        }}
        title="Movie AI Chat"
      >
        <AiChat
          ollamaModel={settings?.ollamaModel || "llama3.1:latest"}
          triggerChatStream={triggerChatStream}
          history={chatHistory}
          updateHistory={updateHistory}
          cancelStream={async () => {
            if (streamId) {
              await window.llmAPI.cancelLlmStreamById(streamId);
              setStreamId(undefined);
            }
          }}
        />
      </AppModal>
    </>
  );
};

export default MovieDetails;
