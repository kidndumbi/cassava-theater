import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import theme from "./renderer/theme";
import { useSettings } from "./renderer/hooks/useSettings";
import { store, useAppDispatch } from "./renderer/store";
import { LandingPage } from "./renderer/pages/landing-page/LandingPage";
import { VideoDetailsPage } from "./renderer/pages/video-details-page/VideoDetailsPage";
import { VideoPlayerPage } from "./renderer/pages/video-player-page/VideoPlayerPage";
import { Layout } from "./renderer/pages/Layout";
import { VideoCommands } from "./models/video-commands.model";
import { videoCommandsHandler } from "./renderer/util/video-commands-handler";
import { SetPlayingModel } from "./models/set-playing.model";
import { useVideoListLogic } from "./renderer/hooks/useVideoListLogic";
import {
  SnackbarProvider,
  useSnackbar,
} from "./renderer/contexts/SnackbarContext";
import { AppVideoPlayerHandle } from "./renderer/components/video-player/AppVideoPlayer";
import { ConfirmationProvider } from "./renderer/contexts/ConfirmationContext";
import { StatusDisplay } from "./renderer/components/StatusDisplay";
import {
  mp4ConversionActions,
  Mp4ConversionProgress,
} from "./renderer/store/mp4Conversion/mp4Conversion.slice";
import { useMp4Conversion } from "./renderer/hooks/useMp4Conversion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

const App = () => {
  const dispatch = useAppDispatch();
  const { fetchAllSettings } = useSettings();
  const { showSnackbar } = useSnackbar();
  const { currentlyProcessingItem } = useMp4Conversion();
  const currentlyProcessingItemRef = useRef(currentlyProcessingItem);
  const { initConverversionQueueFromStore, getConversionQueue } =
    useMp4Conversion();

  const lastExecutionRef = useRef<number>(0);
  const pendingProgressRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initQueue = async () => {
      const conversionQueue = await getConversionQueue();
      initConverversionQueueFromStore(conversionQueue);
    };
    initQueue();
  }, []);

  useEffect(() => {
    currentlyProcessingItemRef.current = currentlyProcessingItem;
  }, [currentlyProcessingItem]);

  const appVideoPlayerRef = useRef<AppVideoPlayerHandle>(null);

  useEffect(() => {
    fetchAllSettings();

    window.videoCommandsAPI.videoCommand((command: VideoCommands) => {
      videoCommandsHandler(command, appVideoPlayerRef.current);
    });

    window.mainNotificationsAPI.userConnected((userId: string) => {
      showSnackbar("User connected: " + userId, "success");
    });

    window.mainNotificationsAPI.userDisconnected((userId: string) => {
      showSnackbar("User disconnected: " + userId, "error");
    });

    // Throttle mp4ConversionProgress handler to fire at most once every 4 seconds
    window.mainNotificationsAPI.mp4ConversionProgress((progress) => { 
      pendingProgressRef.current = progress;
      const now = Date.now();
      const elapsed = now - lastExecutionRef.current;

      const execute = () => {
        const progress = pendingProgressRef.current;
        pendingProgressRef.current = null;
        lastExecutionRef.current = Date.now();

        const [fromPath, toPath] = progress.file.split(":::") || [];
        const progressItem: Mp4ConversionProgress = {
          fromPath,
          toPath,
          percent: progress.percent,
          paused: false,
          complete: false,
        };

        dispatch(mp4ConversionActions.updateConvertToMp4Progress(progressItem));

        if (
          progressItem.fromPath !== currentlyProcessingItemRef.current?.fromPath
        ) {
          dispatch(
            mp4ConversionActions.setCurrentlyProcessingItem(progressItem),
          );
        }
      };

      if (elapsed >= 10000) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        execute();
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          execute();
        }, 10000 - elapsed);
      }
    });

    window.mainNotificationsAPI.mp4ConversionCompleted((progress) => {
      const [fromPath, toPath] = progress.file.split(":::") || [];
      const progressItem: Mp4ConversionProgress = {
        fromPath,
        toPath,
        percent: progress.percent,
        paused: false,
        complete: true,
      };

      dispatch(mp4ConversionActions.updateConvertToMp4Progress(progressItem));
      showSnackbar(`Conversion completed: ${toPath}`, "success");
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
     <HashRouter>
      <Box
        data-testid="box-container"
        sx={{
          backgroundColor: theme.customVariables.appDarker,
        }}
      >
        <main>
          <AppRoutes appVideoPlayerRef={appVideoPlayerRef} />
        </main>
      </Box>
    </HashRouter>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>

  );
};

const root = createRoot(document.body);
root.render(
  <SnackbarProvider>
    <ConfirmationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <App />
        </Provider>
      </ThemeProvider>
    </ConfirmationProvider>
  </SnackbarProvider>,
);

function AppRoutes({
  appVideoPlayerRef,
}: {
  appVideoPlayerRef: React.Ref<AppVideoPlayerHandle>;
}) {
  const navigate = useNavigate();
  const { handleVideoSelect } = useVideoListLogic();
  const { settings } = useSettings();

  const location = useLocation();
  const showStatusDisplay = !["/video-player", "/video-details"].includes(
    location.pathname,
  );

  useEffect(() => {
    window.videoCommandsAPI.setCurrentVideo((data: SetPlayingModel) => {
      handleVideoSelect(data.video);
      navigate(
        "/video-player?menuId=" +
          data.queryParams.menuId +
          "&resumeId=" +
          data.queryParams.resumeId +
          "&startFromBeginning=" +
          data.queryParams.startFromBeginning,
      );
    });
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route
            path="video-player"
            element={<VideoPlayerPage appVideoPlayerRef={appVideoPlayerRef} />}
          />
          <Route path="video-details" element={<VideoDetailsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
      {showStatusDisplay && <StatusDisplay port={settings?.port} />}
    </>
  );
}
