import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import MainMenu from "../../components/main-menu/MainMenu";
import { MenuItem } from "../../../models/menu-item.model";
import {
  Home,
  LiveTv,
  Theaters,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { CustomFolderModel } from "../../../models/custom-folder";
import { useSettings } from "../../hooks/useSettings";
import { useCustomFolder } from "../../hooks/useCustomFolder";
import { SettingsModal } from "../../components/settings/SettingsModal";
import Grid from "@mui/material/Grid2";
import { renderActivePage } from "./RenderActivePage";
import { useMovies } from "../../hooks/useMovies";
import { useTvShows } from "../../hooks/useTvShows";
import { useSearchParams } from "react-router-dom";
import { useVideoPlayerLogic } from "../../hooks/useVideoPlayerLogic";
import { isEmptyObject } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";

export const LandingPage = () => {
  const theme = useTheme();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const { movies, getMovies, loadingMovies, updateMovie } = useMovies();
  const { tvShows, getTvShows, loadingTvShows, updateTvShow } = useTvShows();
  const { customFolderData, loadCustomFolder, loadingCustomFolderData } =
    useCustomFolder();
  const { currentTime, currentVideo, lastVideoPlayedDate } =
    useVideoPlayerLogic();

  const handleMenuClick = (menuItem: MenuItem) => {
    setActiveMenu(menuItem);
  };

  function handleVideoUpdate() {
    if (currentTime > 0 && !isEmptyObject(currentVideo)) {
      if (currentVideo.videoDataType === "movie") {
        updateMovie({ ...currentVideo, currentTime });
      } else if (
        currentVideo.videoDataType === "episode" &&
        lastVideoPlayedDate
      ) {
        const pathArray = currentVideo.filePath.split("/");
        pathArray.pop();
        pathArray.pop();
        const filePath = pathArray.join("/");
        const updatedVideo: VideoDataModel = {
          filePath,
          lastVideoPlayedTime: currentTime,
          lastVideoPlayedDate,
          lastVideoPlayed: currentVideo.filePath,
        };
        updateTvShow(updatedVideo);
      }
    }
  }

  useEffect(() => {
    handleVideoUpdate();
  }, [currentTime, currentVideo]);

  const [selectedCustomFolder, setSelectedCustomFolder] =
    useState<CustomFolderModel | null>(null);

  const handleCustomMenuClick = (menuItem: MenuItem) => {
    const customFolders = settings?.folders || ([] as CustomFolderModel[]);
    const selectedFolder = customFolders.find(
      (folder) => folder.id === menuItem.id
    );
    setSelectedCustomFolder(selectedFolder || null);
    setActiveMenu(menuItem);
  };

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "app-home",
      label: "Home",
      icon: <Home />,
      handler: handleMenuClick,
      menuType: "default" as const,
    },
    {
      id: "app-movies",
      label: "Movies",
      icon: <Theaters />,
      handler: handleMenuClick,
      menuType: "default",
    },
    {
      id: "app-tv-shows",
      label: "Tv Shows",
      icon: <LiveTv />,
      handler: handleMenuClick,
      menuType: "default",
    },
  ]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  useEffect(() => {
    if (settings?.folders) {
      const customFolders = settings?.folders as CustomFolderModel[];
      const customFoldersMenuItems = customFolders.map((folder) => ({
        id: folder.id,
        label: folder.name,
        icon: <FolderIcon></FolderIcon>,
        handler: handleCustomMenuClick,
        menuType: "custom" as const,
      }));
      setMenuItems((prevMenuItems) => [
        ...prevMenuItems.filter((item) => item.menuType !== "custom"),
        ...customFoldersMenuItems,
      ]);
    }
  }, [settings?.folders]);

  const [activeMenu, setActiveMenu] = useState<MenuItem>(menuItems[0]);

  useEffect(() => {
    const updateSelectedCustomFolder = () => {
      if (settings?.folders) {
        const customFolders = settings?.folders as CustomFolderModel[];
        const selectedFolder = customFolders.find(
          (folder) => folder.id === activeMenu.id
        );
        setSelectedCustomFolder(selectedFolder || null);
      }
    };

    const activeMenuItem = menuItems.find((item) => item.id === activeMenu.id);
    if (activeMenuItem?.menuType === "custom" && !selectedCustomFolder) {
      updateSelectedCustomFolder();
    }
  }, [menuItems, activeMenu, selectedCustomFolder, settings?.folders]);

  useEffect(() => {
    if (selectedCustomFolder && selectedCustomFolder.folderPath) {
      loadCustomFolder(selectedCustomFolder.folderPath);
    }
  }, [selectedCustomFolder]);

  const refreshData = () => {
    getMovies();
    getTvShows();
  };

  function syncActiveMenuFromUrl(
    menuItems: MenuItem[],
    setActiveMenu: React.Dispatch<React.SetStateAction<MenuItem>>
  ) {
    const menuId = searchParams.get("menuId");
    const menuItem = menuItems.find((item) => item.id === menuId);
    if (menuItem) {
      setActiveMenu(menuItem);
    }
  }

  useEffect(() => {
    syncActiveMenuFromUrl(menuItems, setActiveMenu);
  }, [searchParams, menuItems]);

  return (
    <Grid
      container
      className="custom-scrollbar"
      sx={{
        height: "100vh",
        width: "100vw",
        color: theme.customVariables.appWhiteSmoke,
      }}
    >
      <Grid size={{ md: 2, lg: 2 }} style={{ padding: "10px" }}>
        <MainMenu
          menuItems={menuItems}
          onActiveMenuItemChange={setActiveMenu}
          activeMenuItem={activeMenu}
          onSettingsClick={handleOpenSettingsModal}
        />
      </Grid>
      <Grid
        size={{ md: 10, lg: 10 }}
        sx={{
          width: "100%",
          maxHeight: "calc(100vh - 30px)",
          overflowY: "auto",
        }}
      >
        {renderActivePage(activeMenu, {
          loadingMovies,
          movies,
          loadingTvShows,
          tvShows,
          refreshData,
          getMovies,
          getTvShows,
          loadingCustomFolderData,
          customFolderData,
          loadCustomFolder,
          selectedCustomFolder,
        })}
      </Grid>
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={handleCloseSettingsModal}
      />
    </Grid>
  );
};
