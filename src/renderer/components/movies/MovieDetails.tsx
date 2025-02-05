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
import "./MovieDetails.css";
import MovieDetailsHeader from "./MovieDetailsHeader";
import MovieDetailsContent from "./MovieDetailsContent";

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
  } = useMovies();
  const [imageUrl, setImageUrl] = useState("");
  const { getTmdbImageUrl, defaultBackdropImageUrl } = useTmdbImageUrl();
  const navigate = useNavigate();
  const { setCurrentVideo } = useVideoListLogic();
  const { updateSubtitle } = useSubtitle();
  const [openModal, setOpenModal] = useState(false);
  const [currentTabValue, setCurrentTabValue] = useState(0);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  useEffect(() => {
    if (videoPath) {
      getVideoDetails(videoPath);
    }
  }, [videoPath]);

  useEffect(() => {
    setImageUrl(
      videoDetails?.movie_details?.backdrop_path
        ? getTmdbImageUrl(videoDetails.movie_details.backdrop_path, "original")
        : defaultBackdropImageUrl
    );
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
        }&menuId=${menuId}`
      );
    }
  };

  const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  const backgroundImageUrl = loadingVideoDetails
    ? defaultBackdropImageUrl
    : imageUrl;

  return (
    <>
      <div
        style={{
          position: "relative",
          backgroundSize: "cover",
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0)), linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0)), url(${backgroundImageUrl})`,
          height: "100vh",
          width: "100vw",
        }}
      >
        {loadingVideoDetails ? (
          <div className="loading-container">
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
                watchLater: boolean
              ) => {
                await updateWatchLater(filePath, watchLater);
                getVideoDetails(filePath);
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
      </div>
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
        fileName={videoDetails?.fileName?.replace(/\.(mp4|mkv)$/i, "") || ""}
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
