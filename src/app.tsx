import { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { Alert, Box, Snackbar, ThemeProvider } from "@mui/material";
import { Provider, useSelector } from "react-redux";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import theme from "./renderer/theme";
import { useSettings } from "./renderer/hooks/useSettings";
import { store } from "./renderer/store";
import { LandingPage } from "./renderer/pages/landing-page/LandingPage";
import { VideoDetailsPage } from "./renderer/pages/video-details-page/VideoDetailsPage";
import { VideoPlayerPage } from "./renderer/pages/video-player-page/VideoPlayerPage";
import { Layout } from "./renderer/pages/Layout";
import { VideoCommands } from "./models/video-commands.model";
import { selVideoPlayer } from "./renderer/store/videoPlayer.slice";

const App = () => {
  const { fetchAllSettings, settings } = useSettings();

  const globalVideoPlayer = useSelector(selVideoPlayer);
  const globalVideoPlayerRef = useRef(globalVideoPlayer);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const openSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    globalVideoPlayerRef.current = globalVideoPlayer;
  }, [globalVideoPlayer]);

  useEffect(() => {
    fetchAllSettings();

    window.videoCommandsAPI.videoCommand((command: VideoCommands) => {
      const currentGlobalVideoPlayer = globalVideoPlayerRef.current;
      switch (command) {
        case "play":
          currentGlobalVideoPlayer.play();
          break;
        case "pause":
          currentGlobalVideoPlayer.pause();
          break;
        case "forward30":
          currentGlobalVideoPlayer.currentTime += 30;
          break;
        case "backward10":
          currentGlobalVideoPlayer.currentTime -= 10;
          break;
        case "restart":
          break;
        // case "volumeDown":
        //   if (volume > 0) {
        //     setVolume(Math.max(volume - 0.1, 0));
        //   }
        //   break;
        // case "volumeUp":
        //   if (volume < 1) {
        //     setVolume(Math.min(volume + 0.1, 1));
        //   }
        //   break;
        default:
          console.log(`Unknown command: ${command}`);
      }
    });

    window.mainNotificationsAPI.userConnected((userId: string) => {
      openSnackbar(`User ${userId} connected`, "success");
    });

    window.mainNotificationsAPI.userDisconnected((userId: string) => {
      openSnackbar(`User ${userId} disconnected`, "error");
    });
  }, []);

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      data-testid="box-container"
      sx={{
        backgroundColor: theme.customVariables.appDarker,
      }}
    >
      <main>
        <AppRoutes />
      </main>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const root = createRoot(document.body);
root.render(
  <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </>
);

function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="video-player" element={<VideoPlayerPage />} />
          <Route path="video-details" element={<VideoDetailsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
