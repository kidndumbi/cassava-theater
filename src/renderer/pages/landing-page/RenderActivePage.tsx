import { Movies } from "../../components/movies/Movies";
import { MenuItem } from "../../../models/menu-item.model";
import { VideoDataModel } from "../../../models/videoData.model";
import { TvShows } from "../../components/tv-shows/TvShows";
import { HomePage } from "../../components/home/Home";
import { PlaylistsPage } from "../../components/playlists/PlaylistsPage";
import { CustomFolderPage } from "../../components/Custom-folder-new/customFolderPage";
import { ToolsPage } from "../../components/tools/ToolsPage";

export interface RenderActivePageProps {
  loadingMovies: boolean;
  movies: VideoDataModel[];
  loadingTvShows: boolean;
  tvShows: VideoDataModel[];
  refreshData: () => void;
  getMovies: () => void;
  getTvShows: () => void;
}

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
  }: RenderActivePageProps,
) => {
  switch (activeMenu.id) {
    case "app-home":
      return <HomePage menuId={activeMenu.id} refreshData={refreshData} />;
    case "app-movies":
      return (
        <Movies
          menuId={activeMenu.id}
          loadingMovies={loadingMovies}
          movies={movies}
          refreshMovies={getMovies}
        />
      );
    case "app-tv-shows":
      return (
        <TvShows
          menuId={activeMenu.id}
          loadingTvShows={loadingTvShows}
          tvShows={tvShows}
          refreshTvShows={getTvShows}
        />
      );
    case "app-playlists":
      return <PlaylistsPage menuId={activeMenu.id} />;
    case "app-tools":
      return <ToolsPage />;
    case "app-custom-folders":
      return <CustomFolderPage menuId={activeMenu.id} />;
    default:
      return <div>Page not found</div>;
  }
};
