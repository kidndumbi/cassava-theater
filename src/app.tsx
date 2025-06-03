import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import theme from "./renderer/theme";
import { store } from "./renderer/store";
import { LandingPage } from "./renderer/pages/landing-page/LandingPage";
import { VideoDetailsPage } from "./renderer/pages/video-details-page/VideoDetailsPage";
import {
  VideoPlayerPage,
  VideoPlayerPageHandle,
} from "./renderer/pages/video-player-page/VideoPlayerPage";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Mp4ConversionEvents } from "./Mp4ConversionEvents";
import { useGetAllSettings } from "./renderer/hooks/settings/useGetAllSettings";
import { YoutubeDownloadEvents } from "./YoutubeDownloadEvents";
import { useUpdatePlaylist } from "./renderer/hooks/useUpdatePlaylist";
import { PlaylistCommands } from "./models/playlist-commands.model";
import { playlistCommandsHandler } from "./renderer/util/playlist-commands-handler";

const queryClient = new QueryClient();

const App = () => {
  const { data: settings } = useGetAllSettings();
  const { showSnackbar } = useSnackbar();
  const appVideoPlayerRef = useRef<AppVideoPlayerHandle>(null);
  const videoPlayerPageRef = useRef<VideoPlayerPageHandle>(null);
  const userConnectionStatus = useRef<boolean>(null);

  useEffect(() => {
    userConnectionStatus.current =
      settings?.notifications?.userConnectionStatus;
  }, [settings?.notifications?.userConnectionStatus]);

  useEffect(() => {
    window.videoCommandsAPI.videoCommand((command: VideoCommands) => {
      videoCommandsHandler(command, appVideoPlayerRef.current);
    });

    window.playlistCommandsAPI.playlistVideoCommand(
      (command: PlaylistCommands) => {
        playlistCommandsHandler(command, videoPlayerPageRef.current);
      },
    );

    window.mainNotificationsAPI.userConnected((userId: string) => {
      if (userConnectionStatus.current) {
        showSnackbar("User connected: " + userId, "success");
      }
    });

    window.mainNotificationsAPI.userDisconnected((userId: string) => {
      if (userConnectionStatus.current) {
        showSnackbar("User disconnected: " + userId, "error");
      }
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
          <AppRoutes
            appVideoPlayerRef={appVideoPlayerRef}
            videoPlayerPageRef={videoPlayerPageRef}
          />
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
          <QueryClientProvider client={queryClient}>
            <DndProvider backend={HTML5Backend}>
              <App />
              <Mp4ConversionEvents />
              <YoutubeDownloadEvents />
            </DndProvider>

            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </Provider>
      </ThemeProvider>
    </ConfirmationProvider>
  </SnackbarProvider>,
);

function AppRoutes({
  appVideoPlayerRef,
  videoPlayerPageRef,
}: {
  appVideoPlayerRef: React.Ref<AppVideoPlayerHandle>;
  videoPlayerPageRef: React.Ref<VideoPlayerPageHandle>;
}) {
  const navigate = useNavigate();
  const { handleVideoSelect } = useVideoListLogic();
  const { data: settings } = useGetAllSettings();

  const { mutate: updatePlaylist } = useUpdatePlaylist();

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

    window.videoCommandsAPI.setCurrentPlaylist((data) => {
      handleVideoSelect(data.video);
      updatePlaylist({
        id: data.playlistId,
        playlist: {
          ...data.playlist,
          lastVideoPlayed: data.video.filePath,
          lastVideoPlayedDate: new Date().toISOString(),
        },
      });
      let url = `/video-player?menuId=${data.menuId}&playlistId=${data.playlistId}`;
      if (data.shuffle) {
        url += `&shuffle=true`;
      }
      navigate(url);
    });
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route
            path="video-player"
            element={
              <VideoPlayerPage
                ref={videoPlayerPageRef}
                appVideoPlayerRef={appVideoPlayerRef}
              />
            }
          />
          <Route path="video-details" element={<VideoDetailsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
      {showStatusDisplay && <StatusDisplay port={settings?.port} />}
    </>
  );
}
