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
} from "react-router-dom";
import theme from "./renderer/theme";
import { useSettings } from "./renderer/hooks/useSettings";
import { store } from "./renderer/store";
import { LandingPage } from "./renderer/pages/landing-page/LandingPage";
import { VideoDetailsPage } from "./renderer/pages/video-details-page/VideoDetailsPage";
import { VideoPlayerPage } from "./renderer/pages/video-player-page/VideoPlayerPage";
import { Layout } from "./renderer/pages/Layout";
import { VideoCommands } from "./models/video-commands.model";
import { selVideoPlayer } from "./renderer/store/videoPlayer.slice";
import { videoCommandsHandler } from "./renderer/util/video-commands-handler";
import { SetPlayingModel } from "./models/set-playing.model";
import { useVideoListLogic } from "./renderer/hooks/useVideoListLogic";
import {
  SnackbarProvider,
  useSnackbar,
} from "./renderer/contexts/SnackbarContext";
import { AppVideoPlayerHandle } from "./renderer/components/video-player/AppVideoPlayer";

const App = () => {
  const { fetchAllSettings } = useSettings();
  const { showSnackbar } = useSnackbar();

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </SnackbarProvider>
);

// Pass appVideoPlayerRef as a prop to VideoPlayerPage.
function AppRoutes({
  appVideoPlayerRef,
}: {
  appVideoPlayerRef: React.Ref<AppVideoPlayerHandle>;
}) {
  const navigate = useNavigate();
  const { handleVideoSelect } = useVideoListLogic();

  useEffect(() => {
    window.videoCommandsAPI.setCurrentVideo((data: SetPlayingModel) => {
      handleVideoSelect(data.video);
      navigate(
        "/video-player?menuId=" +
          data.queryParams.menuId +
          "&resumeId=" +
          data.queryParams.resumeId +
          "&startFromBeginning=" +
          data.queryParams.startFromBeginning
      );
    });
  }, []);

  return (
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
  );
}
