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
import { useMovies } from "./renderer/hooks/useMovies";
import { useTvShows } from "./renderer/hooks/useTvShows";
import { StatusDisplay } from "./renderer/components/StatusDisplay";
import { mp4ConversionActions } from "./renderer/store/mp4Conversion/mp4Conversion.slice";
import { useMp4Conversion } from "./renderer/hooks/useMp4Conversion";

const App = () => {
  const dispatch = useAppDispatch();
  const { fetchAllSettings } = useSettings();
  const { showSnackbar } = useSnackbar();
  const { getMovies } = useMovies();
  const { getTvShows } = useTvShows();
  const { currentlyProcessingItem } = useMp4Conversion();
  const currentlyProcessingItemRef = useRef(currentlyProcessingItem);
  const { initConverversionQueueFromStore, getConversionQueue } =
    useMp4Conversion();

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
    getMovies();
    getTvShows();

    window.videoCommandsAPI.videoCommand((command: VideoCommands) => {
      videoCommandsHandler(command, appVideoPlayerRef.current);
    });

    window.mainNotificationsAPI.userConnected((userId: string) => {
      showSnackbar("User connected: " + userId, "success");
    });

    window.mainNotificationsAPI.userDisconnected((userId: string) => {
      showSnackbar("User disconnected: " + userId, "error");
    });

    window.mainNotificationsAPI.mp4ConversionProgress((progress) => {
      const [fromPath, toPath] = progress.file.split(":::") || [];
      const progressItem = {
        fromPath,
        toPath,
        percent: progress.percent,
        paused: false,
      };

      dispatch(mp4ConversionActions.updateConvertToMp4Progress(progressItem));

      if (
        progressItem.fromPath !== currentlyProcessingItemRef.current?.fromPath
      ) {
        dispatch(mp4ConversionActions.setCurrentlyProcessingItem(progressItem));
      }
    });

    window.mainNotificationsAPI.mp4ConversionCompleted((progress) => {
      const [fromPath, toPath] = progress.file.split(":::") || [];
      const progressItem = {
        fromPath,
        toPath,
        percent: progress.percent,
        paused: false,
      };

      dispatch(mp4ConversionActions.updateConvertToMp4Progress(progressItem));
      showSnackbar(`Conversion completed: ${toPath}`, "success");
    });
  }, []);

  return (
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
