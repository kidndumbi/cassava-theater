import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import theme from "./renderer/theme";
import Button from "@mui/material/Button";
import { useSettings } from "./renderer/hooks/useSettings";
import { store } from "./renderer/store";
import { LandingPage } from "./renderer/pages/landing-page/LandingPage";
import { VideoDetailsPage } from "./renderer/pages/video-details-page/VideoDetailsPage";
import { VideoPlayerPage } from "./renderer/pages/video-player-page/VideoPlayerPage";

const App = () => {
  const { fetchAllSettings, settings } = useSettings();

  useEffect(() => {
    fetchAllSettings();
  }, []);

  useEffect(() => {
    console.log("settings", settings);
  }, [settings]);

  return (
    <Router>
      <Box
        data-testid="box-container"
        sx={{
          backgroundColor: theme.customVariables.appDarker,
        }}
      >
        <main>
          <AppRoutes />
        </main>
      </Box>
    </Router>
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
  //const socket = useSocket(); // Use the same URL your backend is running on

  //useSocketHandlers(socket);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/video-player" element={<VideoPlayerPage />} />
      <Route path="/video-details" element={<VideoDetailsPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
