import React, { useState } from "react";
import { Box, Theme } from "@mui/material";
import FourMpIcon from "@mui/icons-material/FourMp";
import DeleteIcon from "@mui/icons-material/Delete";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import TranslateIcon from "@mui/icons-material/Translate";
import SubtitlesIcon from "@mui/icons-material/Subtitles";

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
import { SubtitleTranslationModal } from "../common/SubtitleTranslationModal";
import AppIconButton from "../common/AppIconButton";
import { styled } from "@mui/system";
import { VideoTypeChip } from "../common/VideoTypeChip";
import { useScreenshot } from "../../hooks/useScreenshot";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import {
  addToConversionQueue,
  isInMp4ConversionQueue,
} from "../../util/mp4ConversionAPI-helpers";
import { ConversionQueueItem } from "../../../models/conversion-queue-item.model";
import { useSubtitle } from "../../hooks/useSubtitle";

interface EpisodeProps {
  episode: VideoDataModel;
  theme: Theme;
  onEpisodeClick: (episode: VideoDataModel) => void;
  handleFilepathChange: (
    newSubtitleFilePath: string,
    episode: VideoDataModel,
  ) => void;
  handleConvertToMp4Result?: (
    success: boolean,
    message: string,
    queue: ConversionQueueItem[],
  ) => void;
  handleDelete: (filePath: string) => void;
  onPlaylistSelect: (episode: VideoDataModel) => void;
}

export const Episode: React.FC<EpisodeProps> = ({
  episode,
  theme,
  onEpisodeClick,
  handleFilepathChange,
  handleConvertToMp4Result,
  handleDelete,
  onPlaylistSelect,
}) => {
  const { data: settings } = useGetAllSettings();
  const { openDialog, setMessage } = useConfirmation();
  const { updateSubtitleLanguages, getActiveSubtitlePath } = useSubtitle();
  const [hover, setHover] = useState(false);
  const [openNotesModal, setOpenNotesModal] = useState(false);
  const [openTranslationModal, setOpenTranslationModal] = useState(false);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);
  const handleCloseNotesModal = () => setOpenNotesModal(false);
  const handleCloseTranslationModal = () => setOpenTranslationModal(false);

  const handleMouseEnter = () => setHover(true);
  const handleMouseLeave = () => setHover(false);
  const handlePlayClick = () => onEpisodeClick(episode);
  const handleNotesClick = () => setOpenNotesModal(true);
  const handleTranslationClick = () => setOpenTranslationModal(true);

  const handleGenerateSubtitles = async () => {
    setIsGeneratingSubtitles(true);
    try {
      const response = await window.subtitleAPI.generateSubtitles({
        videoPath: episode.filePath,
        format: 'vtt',
        language: 'en',
        model: 'base'
      });
      
      if (response.success) {
        // If subtitle already exists, update immediately
        if (response.subtitlePath) {
          await handleSubtitleUpdate({
            subtitlePath: response.subtitlePath,
            activeSubtitleLanguage: 'en'
          });
        } else {
          // Poll for completion if generation started
          const pollForCompletion = async () => {
            const status = await window.subtitleAPI.checkSubtitleStatus(response.jobId);
            if (status?.status === 'completed' && status.subtitlePath) {
              await handleSubtitleUpdate({
                subtitlePath: status.subtitlePath,
                activeSubtitleLanguage: 'en'
              });
              setIsGeneratingSubtitles(false);
            } else if (status?.status === 'failed') {
              console.error('Subtitle generation failed:', status.error);
              setIsGeneratingSubtitles(false);
            } else if (status?.status === 'generating' || status?.status === 'pending') {
              // Continue polling
              setTimeout(pollForCompletion, 2000);
            }
          };
          setTimeout(pollForCompletion, 2000);
        }
      } else {
        console.error('Failed to start subtitle generation:', response.error);
        setIsGeneratingSubtitles(false);
      }
    } catch (error) {
      console.error('Error generating subtitles:', error);
      setIsGeneratingSubtitles(false);
    }
  };

  // Handle subtitle updates using the new multi-language system
  const handleSubtitleUpdate = async (subtitleData: {
    subtitlePath?: string | null;
    subtitlePathEs?: string | null;
    subtitlePathFr?: string | null;
    activeSubtitleLanguage?: 'en' | 'es' | 'fr' | null;
  }) => {
    await updateSubtitleLanguages(subtitleData, episode);
    
    // For backward compatibility, still call the legacy handler if active subtitle changed
    const newActiveSubtitlePath = getActiveSubtitlePath({
      ...episode,
      ...subtitleData,
    });
    
    if (handleFilepathChange) {
      handleFilepathChange(newActiveSubtitlePath || "None", {
        ...episode,
        ...subtitleData,
      });
    }
  };

  const [hasError, setHasError] = useState(false);

  const { data: episodeScreenshot } = useScreenshot(episode);

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

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      const result = await isInMp4ConversionQueue(episode.filePath);
      if (isMounted) setIsInQueue(result);
    })();
    return () => {
      isMounted = false;
    };
  }, [episode.filePath]);

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
            subtitlePath={getActiveSubtitlePath(episode) || "None"}
            videoData={episode}
            onSubtitleUpdate={handleSubtitleUpdate}
          />
          <AppIconButton tooltip="Notes" onClick={handleNotesClick}>
            <NotesIcon />
          </AppIconButton>

          {getFileExtension(episode.filePath) !== "mp4" && !isInQueue && (
            <AppIconButton
              tooltip="Convert to MP4"
              onClick={async () => {
                const { success, queue, message } = await addToConversionQueue(
                  episode.filePath,
                );
                if (!success) {
                  handleConvertToMp4Result?.(false, message, queue);
                  return;
                }
                handleConvertToMp4Result?.(true, message, queue);
                setIsInQueue(true);
              }}
            >
              <FourMpIcon />
            </AppIconButton>
          )}
          <AppIconButton
            tooltip="delete"
            onClick={async () => {
              setMessage("Are you sure you want to delete this episode?");
              const dialogDecision = await openDialog();
              if (dialogDecision === "Ok") {
                handleDelete(episode.filePath);
              }
            }}
          >
            <DeleteIcon />
          </AppIconButton>
          <AppIconButton
            tooltip="Add to Playlist"
            onClick={() => onPlaylistSelect(episode)}
          >
            <FeaturedPlayListIcon />
          </AppIconButton>
          <AppIconButton
            tooltip={isGeneratingSubtitles ? "Generating Subtitles..." : "Generate Subtitles"}
            onClick={handleGenerateSubtitles}
            disabled={isGeneratingSubtitles}
          >
            <SubtitlesIcon />
          </AppIconButton>
          <AppIconButton
            tooltip="Translate Subtitles"
            onClick={handleTranslationClick}
          >
            <TranslateIcon />
          </AppIconButton>
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
      <SubtitleTranslationModal
        open={openTranslationModal}
        onClose={handleCloseTranslationModal}
        videoData={episode}
        onTranslationComplete={async (translatedFilePath, targetLanguage) => {
          // Save the translated path to the appropriate language field
          const subtitleUpdate: {
            subtitlePath?: string | null;
            subtitlePathEs?: string | null;
            subtitlePathFr?: string | null;
            activeSubtitleLanguage?: 'en' | 'es' | 'fr' | null;
          } = {};

          if (targetLanguage === 'es') {
            subtitleUpdate.subtitlePathEs = translatedFilePath;
            subtitleUpdate.activeSubtitleLanguage = 'es';
          } else if (targetLanguage === 'fr') {
            subtitleUpdate.subtitlePathFr = translatedFilePath;
            subtitleUpdate.activeSubtitleLanguage = 'fr';
          } else if (targetLanguage === 'en') {
            subtitleUpdate.subtitlePath = translatedFilePath;
            subtitleUpdate.activeSubtitleLanguage = 'en';
          }

          // Update the subtitle data in the database
          await handleSubtitleUpdate(subtitleUpdate);
          
          console.log(`Translation completed and saved: ${translatedFilePath} for language: ${targetLanguage}`);
        }}
      />
    </Box>
  );
};
