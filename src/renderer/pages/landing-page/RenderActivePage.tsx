import React from "react";
import { Movies } from "../../components/movies/Movies";
// import { TvShows } from "../../components/tv-shows/TvShows";
// import { PlaylistsPage } from "../../components/playlists/PlaylistsPage";
import { MenuItem } from "../../../models/menu-item.model";
import { CustomFolderModel } from "../../../models/custom-folder";
// import { CustomFolder } from "../../components/custom-folder/CustomFolder";
import { VideoDataModel } from "../../../models/videoData.model";
// import { HomePage } from "../../components/home/Home";

export interface RenderActivePageProps {
  loadingMovies: boolean;
  movies: VideoDataModel[];
  loadingTvShows: boolean;
  tvShows: any[];
  refreshData: () => void;
  getMovies: () => void;
  getTvShows: () => void;
  loadingCustomFolderData: boolean;
  customFolderData: any[];
  loadCustomFolder: (path: string) => void;
  selectedCustomFolder: CustomFolderModel | null;
}

const renderMoviesPage = (
  loadingMovies: boolean,
  movies: any[],
  getMovies: () => void,
  menuId: string
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

// const renderTvShowsPage = (
//   loadingTvShows: boolean,
//   tvShows: any[],
//   getTvShows: () => void,
//   menuId: string
// ) => {
//   return (
//     <TvShows
//       menuId={menuId}
//       loadingTvShows={loadingTvShows}
//       tvShows={tvShows}
//       refreshTvShows={getTvShows}
//     />
//   );
// };

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
  }: RenderActivePageProps
) => {
  switch (activeMenu.id) {
    // case "app-home":
    //   return (
    //     <HomePage
    //       menuId={activeMenu.id}
    //       loadingTvShows={loadingTvShows}
    //       loadingMovies={loadingMovies}
    //       tvShows={tvShows}
    //       movies={movies}
    //       refreshData={refreshData}
    //     />
    //   );
    case "app-movies":
      return renderMoviesPage(loadingMovies, movies, getMovies, activeMenu.id);
    // case "app-tv-shows":
    //   return renderTvShowsPage(
    //     loadingTvShows,
    //     tvShows,
    //     getTvShows,
    //     activeMenu.id
    //   );
    // case "app-playlists":
    //   return <PlaylistsPage />;
    // default:
    //   return (
    //     <CustomFolder
    //       menuId={activeMenu.id}
    //       customFolder={selectedCustomFolder}
    //       loadingCustomFolderData={loadingCustomFolderData}
    //       refreshCustomFolderData={loadCustomFolder}
    //       customFolderData={customFolderData}
    //     ></CustomFolder>
    //   );
  }
};
