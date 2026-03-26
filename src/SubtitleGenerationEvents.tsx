import { useEffect } from "react";
import { useAppDispatch } from "./renderer/store";
import { useSnackbar } from "./renderer/contexts/SnackbarContext";
import { SettingsModel } from "./models/settings.model";
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
      dispatch(
        subtitleGenerationActions.setSubtitleGenerationProgress(
          progress.queue,
        ),
      );

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