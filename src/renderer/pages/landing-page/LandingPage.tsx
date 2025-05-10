import { useTheme } from "@mui/material/styles";
import { useEffect, useState, useMemo } from "react";
import MainMenu from "../../components/main-menu/MainMenu";
import { MenuItem } from "../../../models/menu-item.model";
import {
  Home,
  LiveTv,
  Theaters,
  Folder as FolderIcon,
  FeaturedPlayList
} from "@mui/icons-material";
import { CustomFolderModel } from "../../../models/custom-folder";
import Grid from "@mui/material/Grid2";
import { renderActivePage } from "./RenderActivePage";
import { useSearchParams } from "react-router-dom";

import { AppModal } from "../../components/common/AppModal";
import { SettingsPage } from "../../components/settings/SettingsPage";
import { useVideoDataQuery } from "../../hooks/useVideoData.query";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";

export const LandingPage = () => {
  const theme = useTheme();
  const { data: settings } = useGetAllSettings();
  const [searchParams] = useSearchParams();

  const [customFolderPath, setCustomFolderPath] = useState<string>("");

  // Memoize file paths to avoid unnecessary refetches
  const movieFolderPath = useMemo(
    () => settings?.movieFolderPath || "",
    [settings?.movieFolderPath],
  );
  const tvShowsFolderPath = useMemo(
    () => settings?.tvShowsFolderPath || "",
    [settings?.tvShowsFolderPath],
  );
  const customFolderPathMemo = useMemo(
    () => customFolderPath || "",
    [customFolderPath],
  );

  // Memoize query options to keep reference stable
  const moviesQueryOptions = useMemo(
    () => ({
      filePath: movieFolderPath,
      category: "movies",
    }),
    [movieFolderPath],
  );
  const tvShowsQueryOptions = useMemo(
    () => ({
      filePath: tvShowsFolderPath,
      category: "tvShows",
    }),
    [tvShowsFolderPath],
  );
  const customFolderQueryOptions = useMemo(
    () => ({
      filePath: customFolderPathMemo,
      category: "customFolder",
    }),
    [customFolderPathMemo],
  );

  const {
    data: movies,
    isLoading: loadingMovies,
    refetch: getMovies,
  } = useVideoDataQuery(moviesQueryOptions);

  const { data: tvShows, isLoading: loadingTvShows } =
    useVideoDataQuery(tvShowsQueryOptions);

  const {
    data: customFolderData,
    isLoading: loadingCustomFolderData,
    refetch: getTvShows,
  } = useVideoDataQuery(customFolderQueryOptions);

  const handleMenuClick = (menuItem: MenuItem) => {
    setActiveMenu(menuItem);
  };

  const [selectedCustomFolder, setSelectedCustomFolder] =
    useState<CustomFolderModel | null>(null);

  const handleCustomMenuClick = (menuItem: MenuItem) => {
    const customFolders = settings?.folders || ([] as CustomFolderModel[]);
    const selectedFolder = customFolders.find(
      (folder) => folder.id === menuItem.id,
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
    {
      id: "app-playlists",
      label: "Playlists",
      icon: <FeaturedPlayList />,
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
          (folder) => folder.id === activeMenu.id,
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
    setActiveMenu: React.Dispatch<React.SetStateAction<MenuItem>>,
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

  const loadCustomFolder = (path: string) => {
    setCustomFolderPath(path);
  };

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
      <AppModal
        open={isSettingsModalOpen}
        onClose={handleCloseSettingsModal}
        title="Settings"
        fullScreen={true}
      >
        <SettingsPage />
      </AppModal>
    </Grid>
  );
};
