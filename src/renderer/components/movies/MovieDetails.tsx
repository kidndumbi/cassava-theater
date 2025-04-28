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
import { getUrl, removeVidExt } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import CustomDrawer from "../common/CustomDrawer";
import { MovieCastAndCrew } from "../common/MovieCastAndCrew";
import { useVideoDetailsQuery } from "../../hooks/useVideoData.query";

interface MovieDetailsProps {
  videoPath: string | null;
  menuId: string;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ videoPath, menuId }) => {
  const { updateTMDBId, updateWatchLater } = useMovies();

  const {
    data: videoDetails,
    isLoading: loadingVideoDetails,
    refetch,
  } = useVideoDetailsQuery({ path: videoPath, category: "movies" });

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
  const [openDrawer, setOpenDrawer] = useState(false);

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
              updateWatchLater={async (
                filePath: string,
                watchLater: boolean,
              ) => {
                await updateWatchLater(filePath, watchLater);
                refetch();
              }}
              onRefresh={() => {
                if (videoPath) {
                  refetch();
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
        fileName={removeVidExt(videoDetails?.fileName) || ""}
        filePath={videoPath || ""}
        handleSelectMovie={async (movie_details) => {
          if (movie_details.id) {
            await updateTMDBId(videoPath || "", movie_details);
            refetch();
          }
        }}
      />
      <CustomDrawer open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <MovieCastAndCrew credits={videoDetails?.movie_details?.credits} />
      </CustomDrawer>
    </>
  );
};

export default MovieDetails;
