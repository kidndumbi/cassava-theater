import React, { useEffect, useState } from "react";
import { useMovies } from "../../hooks/useMovies";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import LoadingIndicator from "../common/LoadingIndicator";
import { useSubtitle } from "../../hooks/useSubtitle";
import { MovieSuggestionsModal } from "./MovieSuggestionsModal";
import { CustomTabPanel } from "../common/TabPanel";
import { AppNotes } from "../AppNotes";
import MovieDetailsHeader from "./MovieDetailsHeader";
import MovieDetailsContent from "./MovieDetailsContent";
import { useSettings } from "../../hooks/useSettings";
import { getUrl } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";

interface MovieDetailsProps {
  videoPath: string | null;
  menuId: string;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ videoPath, menuId }) => {
  const {
    getVideoDetails,
    videoDetails,
    loadingVideoDetails,
    updateTMDBId,
    updateWatchLater,
    resetMovieDetails,
  } = useMovies();
  const [imageUrl, setImageUrl] = useState("");
  const { getTmdbImageUrl, getBackgroundGradient } = useTmdbImageUrl();
  const navigate = useNavigate();
  const { setCurrentVideo } = useVideoListLogic();
  const { updateSubtitle } = useSubtitle();
  const [openModal, setOpenModal] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState(0);
  const { settings } = useSettings();

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  useEffect(() => {
    return () => {
      resetMovieDetails();
    };
  }, []);

  useEffect(() => {
    if (videoPath) {
      getVideoDetails(videoPath);
    }
  }, [videoPath]);

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

  const handleBackClick = () => {
    navigate("/?menuId=" + menuId);
  };

  const handlePlay = (startFromBeginning = false) => {
    if (videoDetails) {
      setCurrentVideo(videoDetails);
      navigate(
        `/video-player?${
          startFromBeginning ? "startFromBeginning=true&" : ""
        }&menuId=${menuId}`,
      );
    }
  };

  const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  return (
    <>
      <Box
        className="relative h-screen w-screen bg-cover "
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
              handleBackClick={handleBackClick}
              handleOpenModal={handleOpenModal}
              videoDetails={videoDetails}
              videoPath={videoPath}
              updateSubtitle={updateSubtitle}
              getVideoDetails={getVideoDetails}
              updateWatchLater={async (
                filePath: string,
                watchLater: boolean,
              ) => {
                await updateWatchLater(filePath, watchLater);
                getVideoDetails(filePath);
              }}

              onRefresh={() => {
                if (videoPath) {
                  getVideoDetails(videoPath);
                }
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
            handleVideoSeek={(seekTime) => {
              const videoWithUpdatedTime = {
                ...videoDetails,
                currentTime: seekTime,
              };
              setCurrentVideo(videoWithUpdatedTime);
              navigate(`/video-player?menuId=${menuId}`);
            }}
          ></AppNotes>
        </CustomTabPanel>
      </Box>
      <MovieSuggestionsModal
        id={videoDetails?.movie_details?.id?.toString() || ""}
        open={openModal}
        handleClose={handleCloseModal}
        fileName={
          videoDetails?.fileName?.replace(/\.(mp4|mkv|avi)$/i, "") || ""
        }
        handleSelectMovie={async (movie_details) => {
          if (movie_details.id) {
            await updateTMDBId(videoPath || "", movie_details);
            getVideoDetails(videoPath || "");
          }
        }}
      />
    </>
  );
};

export default MovieDetails;
