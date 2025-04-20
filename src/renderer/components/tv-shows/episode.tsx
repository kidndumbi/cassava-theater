import React, { useEffect, useState } from "react";
import { Box, Theme } from "@mui/material";
import FourMpIcon from "@mui/icons-material/FourMp";

import {
  getFileExtension,
  getPlayedPercentage,
  removeVidExt,
  secondsTohhmmss,
} from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { ClosedCaptionButton } from "../common/ClosedCaptionButton";
import NotesIcon from "@mui/icons-material/Notes";
import "./episode.css";
import { VideoProgressBar } from "../common/VideoProgressBar";
import { NotesModal } from "../common/NotesModal";
import AppIconButton from "../common/AppIconButton";
import { useMp4Conversion } from "../../hooks/useMp4Conversion";
import { useSettings } from "../../hooks/useSettings";
import { styled } from "@mui/system";
import { VideoTypeChip } from "../common/VideoTypeChip";
import { useCommonUtil } from "../../../renderer/hooks/useCommonUtil";

interface EpisodeProps {
  episode: VideoDataModel;
  theme: Theme;
  onEpisodeClick: (episode: VideoDataModel) => void;
  handleFilepathChange: (
    newSubtitleFilePath: string,
    episode: VideoDataModel,
  ) => void;
  handleConvertToMp4?: (filePath: string) => void;
}

export const Episode: React.FC<EpisodeProps> = ({
  episode,
  theme,
  onEpisodeClick,
  handleFilepathChange,
  handleConvertToMp4,
}) => {
  const { isConvertingToMp4 } = useMp4Conversion();
  const { settings } = useSettings();
  const { getScreenshot } = useCommonUtil();

  const [hover, setHover] = useState(false);
  const [openNotesModal, setOpenNotesModal] = useState(false);
  const handleCloseNotesModal = () => setOpenNotesModal(false);

  const handleMouseEnter = () => setHover(true);
  const handleMouseLeave = () => setHover(false);
  const handlePlayClick = () => onEpisodeClick(episode);
  const handleNotesClick = () => setOpenNotesModal(true);

  const [hasError, setHasError] = useState(false);
  const [episodeScreenshot, setEpisodeScreenshot] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (episode) {
      const callGetScreenshot = async () => {
        const screenShot = await getScreenshot(episode);
        if (screenShot) {
          setEpisodeScreenshot(screenShot);
        }
      };
      callGetScreenshot();
    }
  }, [episode]);

  const handleError = () => {
    setHasError(true);
  };

  const showThumbnail = episodeScreenshot && !hasError;

  const HoverBox = styled(Box)({
    position: "relative",
    "&:hover .hover-content": {
      display: "block",
    },
  });

  const VideoTypeContainer = styled(Box)(
    ({ alwaysShow }: { alwaysShow: boolean }) => ({
      position: "absolute",
      top: 9,
      left: 9,
      display: alwaysShow ? "block" : "none",
      "&.hover-content": {
        display: alwaysShow ? "block" : "none",
      },
    }),
  );

  return (
    <Box key={episode.filePath} className="episode-container">
      <HoverBox
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="episode-thumbnail-container"
      >
        {showThumbnail ? (
          <img
            src={episodeScreenshot}
            alt={episode?.fileName}
            className="episode-thumbnail"
            onClick={handlePlayClick}
            onError={handleError}
          />
        ) : (
          <Box className="flex h-[200px] w-[300px] items-center justify-center">
            Loading Image
          </Box>
        )}

        {hover && (
          <PlayArrowIcon className="play-icon" onClick={handlePlayClick} />
        )}
        {episode.currentTime !== undefined && episode.currentTime > 0 && (
          <Box className="progress-bar-container">
            <VideoProgressBar
              current={episode.currentTime}
              total={episode.duration || 0}
            />
            <Box className="progress-percentage">
              {getPlayedPercentage(episode.currentTime, episode.duration || 0)}%
            </Box>
          </Box>
        )}
        <VideoTypeContainer
          className={!settings?.showVideoType ? "hover-content" : ""}
          alwaysShow={settings?.showVideoType}
        >
          <VideoTypeChip filePath={episode.filePath} />
        </VideoTypeContainer>
      </HoverBox>

      <Box
        className="episode-details"
        sx={{ color: theme.customVariables.appWhiteSmoke }}
      >
        <h3 className="episode-title">
          {removeVidExt(episode.fileName) || "Unknown Title"}
        </h3>
        <p className="episode-duration">
          {secondsTohhmmss(episode.duration || 0)}
        </p>

        <Box className="flex gap-2">
          <ClosedCaptionButton
            handleFilepathChange={(newSubtitleFilePath: string) => {
              handleFilepathChange(newSubtitleFilePath, episode);
            }}
            subtitlePath={episode.subtitlePath || "None"}
          />
          <AppIconButton tooltip="Notes" onClick={handleNotesClick}>
            <NotesIcon />
          </AppIconButton>

          {getFileExtension(episode.filePath) !== "mp4" &&
            !isConvertingToMp4(episode.filePath) && (
              <AppIconButton
                tooltip="Convert to MP4"
                onClick={handleConvertToMp4?.bind(null, episode.filePath || "")}
              >
                <FourMpIcon />
              </AppIconButton>
            )}
        </Box>
      </Box>
      <NotesModal
        handleVideoSeek={(seekTime) => {
          const episodeWithUpdatedTime = { ...episode, currentTime: seekTime };
          onEpisodeClick(episodeWithUpdatedTime);
        }}
        open={openNotesModal}
        handleClose={handleCloseNotesModal}
        videoData={episode}
        currentVideoTime={0}
      />
    </Box>
  );
};
