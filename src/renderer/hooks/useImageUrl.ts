import { useCallback } from "react";

const baseImageUrl = "https://image.tmdb.org/t/p/";
export const useTmdbImageUrl = () => {
  const getTmdbImageUrl = useCallback((imgPath: string, size = "w500") => {
    return `${baseImageUrl}${size}${imgPath}`;
  }, []);

  const getBackgroundGradient = useCallback((imageUrl: string) => {
    return imageUrl
      ? `linear-gradient(to right, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0)), linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0)), url(${imageUrl})`
      : `linear-gradient(to right, #485563, #29323c)`;
  }, []);

  return {
    getTmdbImageUrl,
    getBackgroundGradient,
  };
};
