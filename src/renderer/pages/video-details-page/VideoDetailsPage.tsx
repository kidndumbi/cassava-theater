import { useSearchParams } from "react-router-dom";
import MovieDetails from "../../components/movies/MovieDetails";
import TvShowDetails from "../../components/tv-shows/TvShowDetails";

const isTvShow = (menuId: string, resumeId: string): boolean => {
  return (
    menuId === "app-tv-shows" ||
    (menuId === "app-home" && resumeId === "tvShow")
  );
};

export const VideoDetailsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const videoPath = searchParams.get("videoPath") || "";
  const menuId = searchParams.get("menuId") || "";
  const resumeId = searchParams.get("resumeId") || "";

  return isTvShow(menuId, resumeId) ? (
    <TvShowDetails menuId={menuId} resumeId={resumeId} videoPath={videoPath} />
  ) : (
    <MovieDetails menuId={menuId} videoPath={videoPath} />
  );
};
