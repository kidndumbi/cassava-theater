import { useTheme } from "@mui/material/styles";
import { useEffect, useState, useMemo } from "react";
import MainMenu from "../../components/main-menu/MainMenu";
import { MenuItem } from "../../../models/menu-item.model";
import {
  LiveTv,
  Theaters,
  Folder as FolderIcon,
  FeaturedPlayList,
} from "@mui/icons-material";
import { CustomFolderModel } from "../../../models/custom-folder";
import Grid from "@mui/material/Grid2";
import { renderActivePage } from "./RenderActivePage";
import { useSearchParams } from "react-router-dom";

import { AppModal } from "../../components/common/AppModal";
import { SettingsPage } from "../../components/settings/SettingsPage";
import { useVideoDataQuery } from "../../hooks/useVideoData.query";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useModalState } from "../../hooks/useModalState";

export const LandingPage = () => {
  const theme = useTheme();
  const { data: settings } = useGetAllSettings();
  const [searchParams] = useSearchParams();

  const [customFolderPath, setCustomFolderPath] = useState<string>("");

  // Modal state
  const {
    open: isSettingsModalOpen,
    openModal: openSettingsModal,
    closeModal: closeSettingsModal,
  } = useModalState(false);

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

  const { data: tvShows, isLoading: loadingTvShows, refetch: getTvShows, } =
    useVideoDataQuery(tvShowsQueryOptions);

  const {
    data: customFolderData,
    isLoading: loadingCustomFolderData,
    refetch: refetchCustomFolder,
    
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
      icon: (
        <span style={{ fontSize: "30px" }} role="img" aria-label="rename">
          🏡
        </span>
      ),
      handler: handleMenuClick,
      menuType: "default" as const,
    },
    {
      id: "app-movies",
      label: "Movies",
      icon: <Theaters sx={{ color: theme.palette.primary.main }} />,
      handler: handleMenuClick,
      menuType: "default",
    },
    {
      id: "app-tv-shows",
      label: "Tv Shows",
      icon: <LiveTv sx={{ color: theme.palette.primary.main }} />,
      handler: handleMenuClick,
      menuType: "default",
    },
    {
      id: "app-playlists",
      label: "Playlists",
      icon: <FeaturedPlayList sx={{ color: theme.palette.primary.main }} />,
      handler: handleMenuClick,
      menuType: "default",
    },
  ]);

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
          onSettingsClick={openSettingsModal}
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
          refetchCustomFolder,
        })}
      </Grid>
      <AppModal
        open={isSettingsModalOpen}
        onClose={closeSettingsModal}
        title="Settings"
        fullScreen={true}
      >
        <SettingsPage />
      </AppModal>
    </Grid>
  );
};
