import { useCallback } from "react";
// import path from "path";

// const defaultPosterImageUrl = path.join(__static, '/poster-not-available.png');
const defaultPosterImageUrl =
  "https://res.cloudinary.com/cassavacloudinary/image/upload/v1730167450/wnc1yqvvzbgxuxft0ecg.jpg";
const baseImageUrl = "https://image.tmdb.org/t/p/";
const defaultBackdropImageUrl =
  "https://res.cloudinary.com/cassavacloudinary/image/upload/v1730167450/wnc1yqvvzbgxuxft0ecg.jpg";

export const useTmdbImageUrl = () => {
  const defaultImageUrl = defaultPosterImageUrl;
  const getTmdbImageUrl = useCallback(
    (imgPath: string, size: string = "w500") => {
      if (!imgPath) return defaultPosterImageUrl;
      return `${baseImageUrl}${size}${imgPath}`;
    },
    []
  );

  return { getTmdbImageUrl, defaultImageUrl, defaultBackdropImageUrl };
};
