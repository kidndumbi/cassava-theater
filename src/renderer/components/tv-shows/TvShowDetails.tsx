import React, { useEffect, useState } from "react";
import { useTvShows } from "../../hooks/useTvShows";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { Box, IconButton, Tab, Tabs, Tooltip, useTheme } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
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
import { Season } from "../../../models/tv-show-details.model";
import { useSettings } from "../../hooks/useSettings";

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
  const {
    getSeasonDetails,
    tvShowDetails,
    loadingFolderDetails,
    episodes,
    getEpisodeDetails,
    loadingEpisodes,
    resetTvShowDetails,
    updateTvShowTMDBId,
    resetEpisodes,
  } = useTvShows();
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

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  const theme = useTheme();

  useEffect(() => {
    return () => {
      resetTvShowDetails();
      resetEpisodes();
    };
  }, []);

  useEffect(() => {
    if (videoPath) {
      getSeasonDetails(videoPath);
    }
  }, [videoPath]);

  const { settings } = useSettings();

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

  const setSeasonDetails = async (path: string, details: VideoDataModel) => {
    resetEpisodes();
    const seasonName = getFilename(path);
    const selectedSeason = details?.tv_show_details?.seasons?.find(
      (season: Season) => season.name.toLowerCase() === seasonName.toLowerCase()
    );

    setSeasonOverview(selectedSeason?.overview ?? "");
    setSeasonAirDate(selectedSeason?.air_date ?? "");
    setSeasonPosterPath(
      selectedSeason?.poster_path &&
        getTmdbImageUrl(selectedSeason.poster_path, "original")
    );
    getEpisodeDetails(path);
  };

  function updateBackgroundAndSeason(tvShowDetails: VideoDataModel) {
    const backgroundUrl = getImageUrl(tvShowDetails);

    setTvShowBackgroundUrl(backgroundUrl);

    // Determine the selected season from lastVideoPlayed or fallback to the first child folder path
    let selSeason = "";
    if (tvShowDetails?.lastVideoPlayed) {
      selSeason = tvShowDetails.lastVideoPlayed
        .replace(/\\/g, "/")
        .split("/")
        .slice(0, -1)
        .join("/");
    } else {
      selSeason = getFirstChildFolderPath(tvShowDetails);
    }
    setSelectedSeason(selSeason);

    // Set the season details and episodes
    setSeasonDetails(selSeason, tvShowDetails);
  }

  useEffect(() => {
    if (tvShowDetails) {
      updateBackgroundAndSeason(tvShowDetails);
    }
  }, [tvShowDetails]);

  useEffect(() => {
    if (
      !tvShowDetails?.lastVideoPlayed ||
      episodes.length === 0 ||
      episodeLastWatched
    )
      return;
    const normalizedLastPlayed = tvShowDetails.lastVideoPlayed.replace(
      /\\/g,
      "/"
    );
    const lastWatchedEpisode = episodes.find(
      (episode) => episode.filePath === normalizedLastPlayed
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

  const onStartFromBeginningClick = () => {
    if (episodeLastWatched) {
      setCurrentVideo(episodeLastWatched);
      navigate(
        "/video-player?startFromBeginning=true&menuId=" +
          menuId +
          "&resumeId=" +
          resumeId
      );
    }
  };

  const childFolders = tvShowDetails?.childFolders ?? [];

  return (
    <>
      <Box
        className="relative bg-cover h-screen w-screen"
        style={{ backgroundImage: getBackgroundGradient(tvShowBackgroundUrl) }}
      >
        {loadingFolderDetails ? (
          <Box className="flex justify-center items-center h-screen">
            <LoadingIndicator message="Loading..." />
          </Box>
        ) : (
          <>
            <Box className="absolute top-5 left-5 flex justify-between w-[calc(100vw-40px)]">
              <IconButton
                onClick={onBackClick}
                style={{ color: theme.customVariables.appWhite }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Tooltip title="theMovieDb data">
                <IconButton
                  onClick={handleOpenModal}
                  style={{ color: theme.customVariables.appWhite }}
                >
                  <MovieIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box className="absolute bottom-5 left-5 text-white drop-shadow-md">
              <h2 className="text-4xl font-extrabold mb-4">
                {tvShowDetails?.tv_show_details?.name ||
                  tvShowDetails?.filePath?.split("\\").pop()}
                {tvShowDetails?.tv_show_details?.first_air_date &&
                  "(" +
                    getYearFromDate(
                      tvShowDetails?.tv_show_details?.first_air_date
                    ) +
                    ")"}
              </h2>
              <p className="max-w-[50%]">
                {tvShowDetails?.tv_show_details?.overview}
              </p>

              {episodes.length > 0 && tvShowDetails?.lastVideoPlayed && (
                <TvShowDetailsButtons
                  tvShowDetails={tvShowDetails}
                  onContinueClick={onContinueClick}
                  onStartFromBeginningClick={onStartFromBeginningClick}
                />
              )}
              {tvShowDetails?.lastVideoPlayed && (
                <Box>
                  {getFilename(tvShowDetails?.lastVideoPlayed).replace(
                    /\.(mp4|mkv)$/i,
                    ""
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
              {childFolders.length > 0 && (
                <Box className="flex gap-2">
                  <RenderSelect
                    value={selectedSeason}
                    onChange={onSeasonChange}
                    items={childFolders}
                    getItemValue={(folder) => folder.folderPath}
                    getItemLabel={(folder) => folder.basename}
                    theme={theme}
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
            seasonPosterPath={seasonPosterPath} // Pass seasonPosterPath as a prop
            handleFilepathChange={async (
              newSubtitleFilePath: string,
              episode: VideoDataModel
            ) => {
              await updateSubtitle(newSubtitleFilePath, episode);
              getEpisodeDetails(selectedSeason);
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
        handleSelectTvShow={async (tv_show_details) => {
          if (tv_show_details.id) {
            await updateTvShowTMDBId(videoPath || "", tv_show_details);
            getSeasonDetails(videoPath || "");
          }
        }}
      />
    </>
  );
};

export default TvShowDetails;
