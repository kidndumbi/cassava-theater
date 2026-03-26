import { useEffect } from "react";
import { useAppDispatch } from "./renderer/store";
import { useSnackbar } from "./renderer/contexts/SnackbarContext";
import { SettingsModel } from "./models/settings.model";
import { VideoDataModel } from "./models/videoData.model";
import { useGetAllSettings } from "./renderer/hooks/settings/useGetAllSettings";
import { subtitleGenerationActions } from "./renderer/store/subtitleGeneration.slice";

export const SubtitleGenerationEvents = () => {
  const dispatch = useAppDispatch();
  const { data: settings = {} as SettingsModel } = useGetAllSettings();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    // Initialize subtitle generation queue on component mount
    console.log("🎬 SubtitleGenerationEvents: Initializing queue...");
    window.subtitleAPI.getSubtitleGenerationQueue().then(async (queue) => {
      console.log("🎬 SubtitleGenerationEvents: Initial queue loaded:", queue);
      dispatch(subtitleGenerationActions.setSubtitleGenerationProgress(queue));
    });
    window.subtitleAPI.initializeSubtitleGenerationQueue().then(() => {
      console.log("🎬 SubtitleGenerationEvents: Queue initialization complete");
    });
  }, []);

  useEffect(() => {
    // Listen for subtitle generation progress updates
    window.mainNotificationsAPI.subtitleGenerationProgress(async (progress) => {
      console.log("🎬 SubtitleGenerationEvents: Received progress update:", progress);
      dispatch(
        subtitleGenerationActions.setSubtitleGenerationProgress(
          progress.queue, 
        ),
      );
    });

    // Listen for subtitle generation updates from backend
    window.mainNotificationsAPI.subtitleGenerationUpdatedFromBackend(
      async (progress) => {
        console.log("🎬 SubtitleGenerationEvents: Received backend update:", progress);
        dispatch( 
          subtitleGenerationActions.setSubtitleGenerationProgress(  
            progress.queue,
          ),
        );
      },
    );

    // Listen for subtitle generation completion
    window.mainNotificationsAPI.subtitleGenerationCompleted(async (progress) => {
      console.log("🎬 SubtitleGenerationEvents: Received completion:", progress);
      
      // Update video database with new subtitle information
      try {
        const normalizedVideoPath = progress.queueItem.videoPath;
        // Pass a VideoDataModel object with filePath property
        const videoData = await window.videoAPI.getVideoJsonData({ filePath: normalizedVideoPath } as VideoDataModel);
        
        if (videoData) {
          await window.videoAPI.saveVideoJsonData({
            currentVideo: videoData,
            newVideoJsonData: {
              subtitlePath: progress.subtitlePath,
              activeSubtitleLanguage: 'en'
            },
          });
          console.log(`🎬 SubtitleGenerationEvents: Updated video data with subtitle path: ${progress.subtitlePath}`);
        } else {
          console.warn(`⚠️  Could not find video data for: ${normalizedVideoPath}`);
        }
      } catch (error) {
        console.error(`❌ Failed to update video data for ${progress.queueItem.videoPath}:`, error);
      }
      
      // Note: Queue update is handled by a separate backend event after item removal
      // Don't update queue here since the completion event may still contain the completed item

      if (settings?.notifications?.subtitleGenerationStatus) {
        showSnackbar(
          `Subtitle generation completed: ${progress.queueItem.fileName}`,
          "success",
        );
      }
    });
  }, [settings]);

  return <></>;
};