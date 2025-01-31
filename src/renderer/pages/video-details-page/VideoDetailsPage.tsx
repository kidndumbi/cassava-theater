import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
// import TvShowDetails from "../../components/tv-shows/TvShowDetails";
import MovieDetails from "../../components/movies/MovieDetails";

const isTvShow = (menuId: string, resumeId: string): boolean => {
  return (
    menuId === "app-tv-shows" ||
    (menuId === "app-home" && resumeId === "tvShow")
  );
};

export const VideoDetailsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const videoPath = queryParams.get("videoPath") || "";
  const menuId = queryParams.get("menuId") || "";
  const resumeId = queryParams.get("resumeId") || "";

  return (<MovieDetails menuId={menuId} videoPath={videoPath} />)

  // return isTvShow(menuId, resumeId) ? (
  //   <TvShowDetails menuId={menuId} resumeId={resumeId} videoPath={videoPath} />
  // ) : (
  //   <MovieDetails menuId={menuId} videoPath={videoPath} />
  // );
};
