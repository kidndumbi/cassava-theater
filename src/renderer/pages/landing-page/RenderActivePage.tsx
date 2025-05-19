import { Movies } from "../../components/movies/Movies";
import { MenuItem } from "../../../models/menu-item.model";
import { CustomFolderModel } from "../../../models/custom-folder";
import { CustomFolder } from "../../components/custom-folder/CustomFolder";
import { VideoDataModel } from "../../../models/videoData.model";
import { TvShows } from "../../components/tv-shows/TvShows";
import { HomePage } from "../../components/home/Home";
import { PlaylistsPage } from "../../components/playlists/PlaylistsPage";

export interface RenderActivePageProps {
  loadingMovies: boolean;
  movies: VideoDataModel[];
  loadingTvShows: boolean;
  tvShows: VideoDataModel[];
  refreshData: () => void;
  getMovies: () => void;
  getTvShows: () => void;
  loadingCustomFolderData: boolean;
  customFolderData: VideoDataModel[];
  loadCustomFolder: (path: string) => void;
  selectedCustomFolder: CustomFolderModel | null;
  refetchCustomFolder: () => void;
}

const renderMoviesPage = (
  loadingMovies: boolean,
  movies: VideoDataModel[],
  getMovies: () => void,
  menuId: string,
) => {
  return (
    <Movies
      menuId={menuId}
      loadingMovies={loadingMovies}
      movies={movies}
      refreshMovies={getMovies}
    />
  );
};

const renderTvShowsPage = (
  loadingTvShows: boolean,
  tvShows: VideoDataModel[],
  getTvShows: () => void,
  menuId: string,
) => {
  return (
    <TvShows
      menuId={menuId}
      loadingTvShows={loadingTvShows}
      tvShows={tvShows}
      refreshTvShows={getTvShows}
    />
  );
};

export const renderActivePage = (
  activeMenu: MenuItem,
  {
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
  }: RenderActivePageProps,
) => {
  switch (activeMenu.id) {
    case "app-home":
      return <HomePage menuId={activeMenu.id} refreshData={refreshData} />;
    case "app-movies":
      return renderMoviesPage(loadingMovies, movies, getMovies, activeMenu.id);
    case "app-tv-shows":
      return renderTvShowsPage(
        loadingTvShows,
        tvShows,
        getTvShows,
        activeMenu.id,
      );
    case "app-playlists":
      return <PlaylistsPage menuId={activeMenu.id} />;
    default:
      return (
        <CustomFolder
          menuId={activeMenu.id}
          customFolder={selectedCustomFolder}
          loadingCustomFolderData={loadingCustomFolderData}
          customFolderData={customFolderData}
          refetchCustomFolder={refetchCustomFolder}
        ></CustomFolder>
      );
  }
};
