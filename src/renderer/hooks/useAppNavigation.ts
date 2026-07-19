import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Centralized navigation utility that eliminates URL construction duplication.
 * All components that navigate to video-player or video-details should use this hook
 * instead of manually building `?menuId=...&resumeId=...` query strings.
 */
export function useAppNavigation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /** Navigate to the video player page with the given params. */
  const goToVideoPlayer = useCallback(
    (params: {
      menuId: string;
      resumeId?: string;
      startFromBeginning?: boolean;
      playlistId?: string;
    }) => {
      const q = new URLSearchParams();
      q.set("menuId", params.menuId);
      if (params.resumeId) q.set("resumeId", params.resumeId);
      if (params.startFromBeginning) q.set("startFromBeginning", "true");
      if (params.playlistId) q.set("playlistId", params.playlistId);
      navigate(`/video-player?${q.toString()}`);
    },
    [navigate],
  );

  /** Navigate to the video details page for a given file path. */
  const goToVideoDetails = useCallback(
    (
      filePath: string,
      params: { menuId: string; resumeId?: string; folderId?: string },
    ) => {
      const q = new URLSearchParams();
      q.set("menuId", params.menuId);
      if (params.resumeId) q.set("resumeId", params.resumeId);
      q.set("videoPath", filePath);
      const folderId = params.folderId ?? searchParams.get("folderId");
      if (folderId) q.set("folderId", folderId);
      navigate(`/video-details?${q.toString()}`);
    },
    [navigate, searchParams],
  );

  /** Extract the current page params from searchParams. */
  const getCurrentParams = useCallback(() => {
    return {
      menuId: searchParams.get("menuId") || "",
      resumeId: searchParams.get("resumeId") || "",
      startFromBeginning: searchParams.get("startFromBeginning") === "true",
    };
  }, [searchParams]);

  return { goToVideoPlayer, goToVideoDetails, getCurrentParams };
}