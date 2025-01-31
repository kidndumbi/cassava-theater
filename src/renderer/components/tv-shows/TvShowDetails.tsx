import React, { useEffect, useState } from "react";
import { useTvShows } from "../../hooks/useTvShows";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import {
  Box,
  Button,
  IconButton,
  Tab,
  Tabs,
  Tooltip,
  useTheme,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import { getFilename, getYearFromDate } from "../../../util/helperFunctions";
import { Episodes } from "./episodes";
import { VideoDataModel } from "../../../models/videoData.model";
import RenderSelect from "./RenderSelect";

import LoadingIndicator from "../common/LoadingIndicator";
import { CustomTabPanel, a11yProps } from "../common/TabPanel";
import { useSubtitle } from "../../hooks/useSubtitle";
import MovieIcon from "@mui/icons-material/Movie";
import { TvShowSuggestionsModal } from "./TvShowSuggestionsModal";
import { VideoProgressBar } from "../common/VideoProgressBar";

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
  } = useTvShows();
  const { updateSubtitle } = useSubtitle();
  const [tvShowBackgroundUrl, setTvShowBackgroundUrl] = useState("");
  const { getTmdbImageUrl, defaultBackdropImageUrl } = useTmdbImageUrl();
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
    };
  }, []);

  useEffect(() => {
    if (videoPath) {
      getSeasonDetails(videoPath);
    }
  }, [videoPath]);

  const getFirstChildFolderPath = (tvShowDetails: any) => {
    if (tvShowDetails?.childFolders && tvShowDetails.childFolders.length > 0) {
      return tvShowDetails.childFolders[0].folderPath;
    }
    return "";
  };

  const initializeSeason = async (path: string, details: any) => {
    console.log("initializeSeason path:", path);
    const seasonName = getFilename(path);
    console.log("seasonName:", seasonName);
    const selectedSeasonDetails =
      details?.tv_show_details?.seasons?.find(
        (season: any) => season.name.toLowerCase() === seasonName.toLowerCase()
      ) || {};

    setSeasonOverview(selectedSeasonDetails?.overview || "");
    setSeasonAirDate(selectedSeasonDetails?.air_date || "");
    setSeasonPosterPath(
      selectedSeasonDetails?.poster_path
        ? getTmdbImageUrl(selectedSeasonDetails?.poster_path, "original")
        : defaultBackdropImageUrl
    );
    getEpisodeDetails(path);
  };

  function updateBackgroundAndSeason(tvShowDetails: VideoDataModel) {
    console.log("updateBackgroundAndSeason tvShowDetails:", tvShowDetails);

    setTvShowBackgroundUrl(
      tvShowDetails?.tv_show_details?.backdrop_path
        ? getTmdbImageUrl(
            tvShowDetails.tv_show_details.backdrop_path,
            "original"
          )
        : defaultBackdropImageUrl
    );
    const selSeason = tvShowDetails?.lastVideoPlayed?.replace(/\\/g, "/")
      ? tvShowDetails.lastVideoPlayed
          .replace(/\\/g, "/")
          .split("/")
          .slice(0, -1)
          .join("/")
      : getFirstChildFolderPath(tvShowDetails);

    const season_id = tvShowDetails?.childFolders?.find(
      (f) => f.folderPath === selSeason
    )?.season_id;

    setSelectedSeason(selSeason);
    initializeSeason(selSeason, tvShowDetails);
  }

  useEffect(() => {
    if (tvShowDetails) {
      updateBackgroundAndSeason(tvShowDetails);
    }
  }, [tvShowDetails]);

  useEffect(() => {
    if (
      tvShowDetails &&
      episodes &&
      episodes.length > 0 &&
      episodeLastWatched === null
    ) {
      const episodeLastWatched = episodes.find(
        (episode) =>
          episode.filePath ===
          tvShowDetails?.lastVideoPlayed?.replace(/\\/g, "/")
      );
      if (episodeLastWatched) {
        setEpisodeLastWatched(episodeLastWatched);
      }
    }
  }, [episodes, tvShowDetails]);

  const onBackClick = () => {
    navigate("/?menuId=" + menuId);
  };

  const onSeasonChange = (event: SelectChangeEvent<string>) => {
    const newSeasonFullPath = event.target.value as string;
    setSelectedSeason(newSeasonFullPath);
    const season_id = tvShowDetails?.childFolders?.find(
      (f) => f.folderPath === newSeasonFullPath
    )?.season_id;

    initializeSeason(newSeasonFullPath, tvShowDetails);
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

  return (
    <>
      <div
        style={{
          position: "relative",
          backgroundSize: "cover",
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0)), linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0)), url(${
            loadingFolderDetails ? defaultBackdropImageUrl : tvShowBackgroundUrl
          })`,
          height: "100vh",
          width: "100vw",
        }}
      >
        {loadingFolderDetails ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <LoadingIndicator message="Loading..." />
          </div>
        ) : (
          <>
            <Box
              sx={{
                position: "absolute",
                top: "20px",
                left: "20px",
                display: "flex",
                justifyContent: "space-between",
                width: "calc(100vw - 40px)",
              }}
            >
              <IconButton
                onClick={onBackClick}
                style={{
                  color: theme.customVariables.appWhite,
                }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Tooltip title="theMovieDb data">
                <IconButton
                  onClick={handleOpenModal}
                  style={{
                    color: theme.customVariables.appWhite,
                  }}
                >
                  <MovieIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                color: "white",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
              }}
            >
              <h1>
                {tvShowDetails?.tv_show_details?.name ||
                  tvShowDetails?.filePath?.split("/").pop()}
                {tvShowDetails?.tv_show_details?.first_air_date &&
                  "(" +
                    getYearFromDate(
                      tvShowDetails?.tv_show_details?.first_air_date
                    ) +
                    ")"}
              </h1>
              <p style={{ maxWidth: "50%" }}>
                {tvShowDetails?.tv_show_details?.overview}
              </p>

              {episodes.length > 0 && tvShowDetails?.lastVideoPlayed && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                    flexWrap: "wrap",
                    mt: 2,
                    mb: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={onContinueClick}
                  >
                    {(tvShowDetails?.lastVideoPlayedTime || 0) > 0
                      ? "Continue"
                      : "Play"}
                    <br />
                    {getFilename(tvShowDetails?.lastVideoPlayed).replace(
                      ".mp4",
                      ""
                    )}
                  </Button>

                  {(tvShowDetails?.lastVideoPlayedTime || 0) > 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={onStartFromBeginningClick}
                    >
                      {"Play From Beginning"}
                      <br />
                      {getFilename(tvShowDetails?.lastVideoPlayed).replace(
                        ".mp4",
                        ""
                      )}
                    </Button>
                  )}
                </Box>
              )}
              {(tvShowDetails?.lastVideoPlayedTime || 0) > 0 &&
                episodeLastWatched && (
                  <Box sx={{ paddingBottom: "20px" }}>
                    <VideoProgressBar
                      current={episodeLastWatched?.currentTime || 0}
                      total={episodeLastWatched?.duration || 0}
                    />
                  </Box>
                )}
              {episodes.length > 0 &&
                tvShowDetails?.childFolders &&
                tvShowDetails.childFolders.length > 0 && (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <RenderSelect
                      value={selectedSeason}
                      onChange={onSeasonChange}
                      items={tvShowDetails.childFolders}
                      getItemValue={(folder) => folder.folderPath}
                      getItemLabel={(folder) => folder.basename}
                      theme={theme}
                    />
                  </Box>
                )}

              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={currentTabValue}
                  onChange={onTabChange}
                  aria-label="basic tabs example"
                >
                  <Tab label="Episodes" {...a11yProps(0)} />
                  <Tab label="Item Two" {...a11yProps(1)} />
                </Tabs>
              </Box>
            </div>
          </>
        )}
      </div>
      <Box sx={{ flexGrow: 1 }}>
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
