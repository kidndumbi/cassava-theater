import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { Alert, Box, Snackbar, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import theme from "./renderer/theme";
import { useSettings } from "./renderer/hooks/useSettings";
import { store } from "./renderer/store";
import { LandingPage } from "./renderer/pages/landing-page/LandingPage";
import { VideoDetailsPage } from "./renderer/pages/video-details-page/VideoDetailsPage";
import { VideoPlayerPage } from "./renderer/pages/video-player-page/VideoPlayerPage";
import { Layout } from "./renderer/pages/Layout";

const App = () => {
  const { fetchAllSettings, settings } = useSettings();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const openSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchAllSettings();

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
