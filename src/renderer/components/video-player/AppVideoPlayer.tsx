import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { useMouseActivity } from "../../hooks/useMouseActivity";
import { useVideoPlayer } from "../../hooks/useVideoPlayer";
import VideoPlayerActionsContainer from "./VideoPlayerActionsContainer";
import TitleOverlay from "./TitleOverlay";
import SideControlsOverlay from "./SideControlsOverlay";
import "./AppVideoPlayer.css";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import { useSubtitle } from "../../hooks/useSubtitle";
import Video from "./video";
import { NotesModal } from "../common/NotesModal";
import { SubtitleTimingModal } from "../common/SubtitleTimingModal";
import Box from "@mui/material/Box";
import {
  getUrl,
  removeLastSegments,
  secondsTohhmmss,
} from "../../util/helperFunctions";
import { AppSlider } from "../common/AppSlider";
import { useVideoPlayerLogic } from "../../hooks/useVideoPlayerLogic";
import { useDebounce } from "@uidotdev/usehooks";
import CustomDrawer from "../common/CustomDrawer";
import SubtitleOverlay from "./SubtitleOverlay";
import SubtitleOverlayControlModal from "./SubtitleOverlayControlModal";
import { MovieCastAndCrew } from "../common/MovieCastAndCrew";
import { TvShowCastAndCrew } from "../common/TvShowCastAndCrew";
import { useModalState } from "../../hooks/useModalState";
import { FullscreenErrorOverlay } from "../common/FullscreenErrorOverlay";
import { useSetSetting } from "../../hooks/settings/useSetSetting";
import { useSaveJsonData } from "../../hooks/useSaveJsonData";
import { SettingsModel } from "../../../models/settings.model";

export type AppVideoPlayerHandle = {
  skipBy?: (seconds: number) => void;
  play?: () => void;
  pause?: () => void;
  startPlayingAt?: (seconds: number) => void;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  triggereNextEpisode?: () => void;
  setPlaybackSpeed: (speed: number) => void;
};

type AppVideoPlayerProps = {
  onVideoEnded: (filePath: string, episode: VideoDataModel | null) => void;
  subtitleFilePath: string | null;
  onVideoPaused: () => void;
  onSubtitleChange: (subtitle: string | null) => void;
  triggeredOnPlayInterval: () => void;
  handleCancel: (filePath: string) => void;
  startFromBeginning: boolean;
  isTvShow: boolean;
  episodes: VideoDataModel[];
  playNextEpisode: (episode: VideoDataModel) => void;
  findNextEpisode: (currentFilePath: string) => VideoDataModel | null;
  port: string;
  openPlaylistControls?: () => void;
  settings?: SettingsModel;
};

const AppVideoPlayer = forwardRef<AppVideoPlayerHandle, AppVideoPlayerProps>(
  (
    {
      onVideoEnded,
      subtitleFilePath,
      onVideoPaused,
      onSubtitleChange,
      triggeredOnPlayInterval,
      handleCancel,
      startFromBeginning,
      isTvShow,
      episodes,
      playNextEpisode,
      findNextEpisode,
      port,
      openPlaylistControls,
      settings,
    },
    ref,
  ) => {
    const { setPlayer, setCurrentVideo } = useVideoListLogic();
    const { getActiveSubtitlePath } = useSubtitle();
    const { mkvCurrentTime, currentVideo } = useVideoPlayerLogic();
    const { mutateAsync: setSetting } = useSetSetting();
  const saveJsonDataMutation = useSaveJsonData();
    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null!);
    const [error, setError] = useState<string | null>(null);
    const castAndCrewModal = useModalState(false);
    const notesModal = useModalState(false);
    const subtitleTimingModal = useModalState(false);
    const subtitleOverlayControlModal = useModalState(false);
    const [subtitleModalOpen, setSubtitleModalOpen] = useState(false);

    
    
    // Initialize subtitle overlay settings from passed settings or defaults
    const [subtitleOverlayEnabled, setSubtitleOverlayEnabled] = useState(
      currentVideo?.subtitleOverlayEnabled ?? false
    );
    const [subtitleOverlayLanguage, setSubtitleOverlayLanguage] = useState<'en' | 'es' | 'fr' | null>(
      currentVideo?.subtitleOverlayLanguage ?? null
    );
    const [subtitleOverlayFontSize, setSubtitleOverlayFontSize] = useState(
      settings?.subtitleOverlay?.fontSize ?? 16
    );
    const [sliderValue, setSliderValue] = useState<number | null>(null);
    const debouncedSliderValue = useDebounce(sliderValue, 300);
    const isMouseActive = useMouseActivity();
    const isNotMp4VideoFormat = !!(currentVideo?.isMkv || currentVideo?.isAvi);
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [subtitleCacheBuster, setSubtitleCacheBuster] = useState<number>(Date.now());

    // Sync subtitle overlay settings when video changes
    useEffect(() => {
      setSubtitleOverlayEnabled(currentVideo?.subtitleOverlayEnabled ?? false);
      setSubtitleOverlayLanguage(currentVideo?.subtitleOverlayLanguage ?? null);
    }, [currentVideo?.filePath]); // Re-run when video changes

    // Sync font size when settings change
    useEffect(() => {
      setSubtitleOverlayFontSize(settings?.subtitleOverlay?.fontSize ?? 16);
    }, [settings?.subtitleOverlay?.fontSize]);

    useEffect(() => {
      console.log("Current video changed:", currentVideo);
     },[currentVideo]);

    const {
      skipBy,
      play,
      pause,
      toggleFullscreen,
      paused,
      startPlayingAt,
      currentTime,
      formattedTime,
      setVolume,
      isFullScreen,
      setPlaybackSpeed,
    } = useVideoPlayer(
      () => onVideoEnded(currentVideo?.filePath || "", nextEpisode),
      currentVideo ?? undefined,
      startFromBeginning,
      triggeredOnPlayInterval,
    );

    // Next episode calculation
    const nextEpisode = useMemo(
      () => findNextEpisode(currentVideo?.filePath || ""),
      [currentVideo, episodes, isTvShow],
    );

    useEffect(() => {
      return () => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current = null;
        }
      };
    }, []);

    const getVideoUrl = () =>
      getUrl(
        "video",
        currentVideo?.filePath,
        startFromBeginning ? 0 : currentVideo?.currentTime,
        port,
      );
    useEffect(() => {
      setVideoUrl(getVideoUrl() || "");
    }, [currentVideo, startFromBeginning, port]);
    
    // Reset subtitle cache buster when subtitle file or active language changes
    useEffect(() => {
      setSubtitleCacheBuster(Date.now());
    }, [subtitleFilePath, currentVideo?.activeSubtitleLanguage]);
    
    const getSubtitleUrl = () => {
      // Use active subtitle path based on the activeSubtitleLanguage setting
      const activeSubtitlePath = currentVideo ? getActiveSubtitlePath(currentVideo) : subtitleFilePath;
      const baseUrl = getUrl("file", activeSubtitlePath, null, port);
      return baseUrl ? `${baseUrl}&cb=${subtitleCacheBuster}` : "";
    };

    // Get subtitle URL for overlay based on selected language
    const getOverlaySubtitleUrl = (language: 'en' | 'es' | 'fr' | null) => {
      if (!currentVideo || !language) return null;
      
      let subtitlePath = null;
      switch (language) {
        case 'en':
          subtitlePath = currentVideo.subtitlePath;
          break;
        case 'es':
          subtitlePath = currentVideo.subtitlePathEs;
          break;
        case 'fr':
          subtitlePath = currentVideo.subtitlePathFr;
          break;
      }
      
      if (!subtitlePath) return null;
      
      const baseUrl = getUrl("file", subtitlePath, null, port);
      return baseUrl ? `${baseUrl}&cb=${subtitleCacheBuster}` : null;
    };

    useEffect(() => {
      if (videoPlayerRef.current) {
        setPlayer(videoPlayerRef.current);
      }
    }, [currentVideo]);

    useEffect(() => {
      if (debouncedSliderValue !== null) {
        startPlayingAt?.(debouncedSliderValue);
      }
    }, [debouncedSliderValue]);

    useEffect(() => {
      if (pause !== undefined && paused) {
        onVideoPaused();
      }
    }, [paused]);

    const [castAndCrewContent, setCastAndCrewContent] =
      useState<React.ReactNode>(null);

    useEffect(() => {
      const fetchCastAndCrew = async () => {
        if (isTvShow && currentVideo?.filePath) {
          const tvShowPath = removeLastSegments(currentVideo.filePath, 2);
          const tvShowDetails = await window.videoAPI.fetchFolderDetails({
            path: tvShowPath,
          });

          if (tvShowDetails?.tv_show_details?.aggregate_credits) {
            setCastAndCrewContent(
              <TvShowCastAndCrew
                aggregateCredits={
                  tvShowDetails?.tv_show_details?.aggregate_credits
                }
              />,
            );
          }
        } else if (!isTvShow && currentVideo?.movie_details) {
          if (currentVideo?.movie_details?.credits) {
            setCastAndCrewContent(
              <MovieCastAndCrew credits={currentVideo.movie_details.credits} />,
            );
          } else if (currentVideo.filePath) {
            const movieDetails = await window.videoAPI.fetchVideoDetails({
              path: currentVideo.filePath,
              category: "movie",
            });

            if (movieDetails?.movie_details?.credits) {
              setCastAndCrewContent(
                <MovieCastAndCrew
                  credits={movieDetails.movie_details.credits}
                />,
              );
            }
          }
        } else {
          setCastAndCrewContent(null);
        }
      };

      fetchCastAndCrew();
    }, [isTvShow, currentVideo]);

    const handleOpenNotesModal = () => {
      pause?.();
      notesModal.setOpen(true);
    };

    const handleCloseNotesModal = () => {
      notesModal.setOpen(false);
      play?.();
    };

    const handleToggleDrawer = () => {
      pause();
      castAndCrewModal.setOpen(!castAndCrewModal.open);
    };

    const handleCloseDrawer = () => {
      castAndCrewModal.setOpen(false);
      play();
    };

    const handleOpenSubtitleTimingModal = () => {
      pause?.();
      subtitleTimingModal.setOpen(true);
    };

    const handleCloseSubtitleTimingModal = () => {
      subtitleTimingModal.setOpen(false);
      play?.();
    };

    const handleTimingAdjusted = () => {
      // Store current playback time before reloading
      const currentPlaybackTime = currentTime || 0;
      
      // Force both video and subtitle reload by updating URLs with cache busting
      setSubtitleCacheBuster(Date.now());
      setVideoUrl(getVideoUrl() || "");
      
      // Seek back to the previous position after a short delay to allow video to load
      setTimeout(() => {
        if (startPlayingAt && currentPlaybackTime > 0) {
          startPlayingAt(currentPlaybackTime);
        }
      }, 500);
      
      console.log("Subtitle timing adjusted successfully - video and subtitles reloaded");
    };

    // Handle video data updates (for multi-language subtitle changes)
    const handleVideoDataUpdate = (updatedVideoData: VideoDataModel) => {
      setCurrentVideo(updatedVideoData);
    };

    // Handle subtitle modal state changes
    const handleSubtitleModalStateChange = (isOpen: boolean) => {
      setSubtitleModalOpen(isOpen);
    };

    // Handle subtitle overlay control modal
    const handleToggleSubtitleOverlayControl = () => {
      subtitleOverlayControlModal.setOpen(true);
    };

    const handleSubtitleOverlayToggle = async (enabled: boolean) => {
      setSubtitleOverlayEnabled(enabled);
      if (currentVideo) {
        try {
          await saveJsonDataMutation.mutateAsync({
            currentVideo,
            newVideoJsonData: {
              ...currentVideo,
              subtitleOverlayEnabled: enabled,
            },
          });
        } catch (error) {
          console.error('Failed to save subtitle overlay enabled setting:', error);
        }
      }
    };

    const handleSubtitleOverlayLanguageChange = async (language: 'en' | 'es' | 'fr' | null) => {
      setSubtitleOverlayLanguage(language);
      if (currentVideo) {
        try {
          await saveJsonDataMutation.mutateAsync({
            currentVideo,
            newVideoJsonData: {
              ...currentVideo,
              subtitleOverlayLanguage: language,
            },
          });
        } catch (error) {
          console.error('Failed to save subtitle overlay language setting:', error);
        }
      }
    };

    const handleSubtitleOverlayFontSizeChange = async (fontSize: number) => {
      setSubtitleOverlayFontSize(fontSize);
      try {
        await setSetting({
          key: 'subtitleOverlay',
          value: {
            fontSize,
          },
        });
      } catch (error) {
        console.error('Failed to save subtitle overlay font size setting:', error);
      }
    };

 

    const renderTimeDisplay = () => (
      <span className="absolute bottom-2.5 left-5 text-sm text-white">
        {formattedTime +
          " / " +
          (secondsTohhmmss(currentVideo?.duration || 0) || "")}
      </span>
    );

    const renderSlider = () => (
      <Box className="absolute bottom-0.5 left-5 m-0 w-[calc(100%-40px)] max-w-full p-0 text-white">
        <AppSlider
          max={currentVideo?.duration || 0}
          value={mkvCurrentTime}
          onChange={(event, newValue) => {
            setSliderValue(newValue as number);
          }}
        />
      </Box>
    );

    const renderErrorState = () => (
      <FullscreenErrorOverlay
        title="Video Playback Error"
        message={error || ""}
        onButtonClick={handleCancel.bind(null, currentVideo?.filePath || "")}
      />
    );

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      setPlaybackSpeed,
      skipBy,
      play,
      pause,
      startPlayingAt,
      setVolume,
      triggereNextEpisode:
        isTvShow && nextEpisode
          ? () => playNextEpisode(nextEpisode)
          : undefined,
    }));

    if (error) {
      return renderErrorState();
    }

    return (
      <div ref={containerRef} className="video-container">
        <Video
          videoUrl={videoUrl}
          isMkv={isNotMp4VideoFormat}
          videoPlayerRef={videoPlayerRef}
          getSubtitleUrl={getSubtitleUrl}
          subtitleFilePath={subtitleFilePath}
          onClick={() => {
            if (isNotMp4VideoFormat) {
              paused ? play?.() : pause?.();
            }
          }}
          onError={() => {
            setError(
              `An error occurred while loading the video: ${
                currentVideo?.filePath
              }. \nPlease check if the file exists or is supported.`,
            );
          }}
        />

        {/* Custom Subtitle Overlay */}
        <SubtitleOverlay
          subtitleUrl={getOverlaySubtitleUrl(subtitleOverlayLanguage)}
          currentTime={currentTime || 0}
          isVisible={!subtitleModalOpen}
          enabled={subtitleOverlayEnabled}
          fontSize={subtitleOverlayFontSize}
        />

        {(isMouseActive || subtitleModalOpen) && (
          <>
            <VideoPlayerActionsContainer
              isFullScreen={isFullScreen}
              paused={paused}
              play={play}
              pause={pause}
              onSubtitleChange={onSubtitleChange}
              subtitleFilePath={subtitleFilePath}
              skip={skipBy}
              onToggleFullscreen={() => toggleFullscreen(containerRef)}
              isNotMp4VideoFormat={isNotMp4VideoFormat}
              onStartFromBeginning={() => {
                startPlayingAt?.(0);
              }}
              handleAdjustTiming={handleOpenSubtitleTimingModal}
              videoData={currentVideo || undefined}
              onVideoDataUpdate={handleVideoDataUpdate}
              onSubtitleModalStateChange={handleSubtitleModalStateChange}
            />
            <TitleOverlay fileName={currentVideo?.fileName} />
            <SideControlsOverlay
              toggleCastAndCrew={
                castAndCrewContent ? handleToggleDrawer : undefined
              }
              togglePlaylistControl={
                openPlaylistControls ? openPlaylistControls : undefined
              }
              toggleSubtitleOverlayControl={handleToggleSubtitleOverlayControl}
              handleCancel={(filePath) => {
                setVideoUrl("");
                handleCancel(filePath);
              }}
              handleNext={
                isTvShow && nextEpisode
                  ? () => playNextEpisode(nextEpisode)
                  : undefined
              }
              filePath={currentVideo?.filePath}
              handleOpenNotesModal={handleOpenNotesModal}
              nextEpisode={nextEpisode || undefined}
            />
          </>
        )}

        {currentVideo && (
          <NotesModal
            open={notesModal.open}
            handleClose={handleCloseNotesModal}
            videoData={currentVideo}
            currentVideoTime={currentTime}
            handleVideoSeek={(seekTime) => {
              handleCloseNotesModal();
              startPlayingAt(seekTime);
            }}
          />
        )}

        <SubtitleTimingModal
          open={subtitleTimingModal.open}
          onClose={handleCloseSubtitleTimingModal}
          subtitleFilePath={subtitleFilePath}
          onTimingAdjusted={handleTimingAdjusted}
        />

        <SubtitleOverlayControlModal
          open={subtitleOverlayControlModal.open}
          onClose={subtitleOverlayControlModal.setOpen.bind(null, false)}
          videoData={currentVideo || undefined}
          isEnabled={subtitleOverlayEnabled}
          selectedLanguage={subtitleOverlayLanguage}
          fontSize={subtitleOverlayFontSize}
          onToggleEnabled={handleSubtitleOverlayToggle}
          onLanguageChange={handleSubtitleOverlayLanguageChange}
          onFontSizeChange={handleSubtitleOverlayFontSizeChange}
        />

        {isNotMp4VideoFormat && isMouseActive && (
          <>
            {renderTimeDisplay()}
            {renderSlider()}
          </>
        )}

        <CustomDrawer open={castAndCrewModal.open} onClose={handleCloseDrawer}>
          {castAndCrewContent}
        </CustomDrawer>
      </div>
    );
  },
);

export default AppVideoPlayer;
