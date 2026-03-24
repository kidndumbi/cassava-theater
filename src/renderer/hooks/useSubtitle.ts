import { useState, useEffect } from "react";
import { useVideoPlayerLogic } from "./useVideoPlayerLogic";
import { VideoDataModel } from "../../models/videoData.model";

const useSubtitle = () => {
  const [subtitleFilePath, setSubtitleFilePath] = useState<string | null>(null);
  const { currentVideo } = useVideoPlayerLogic();

  useEffect(() => {
    if (currentVideo) {
      const activeSubtitlePath = getActiveSubtitlePath(currentVideo);
      setSubtitleFilePath(activeSubtitlePath || "None");
    } else {
      setSubtitleFilePath("None");
    }
  }, [currentVideo]);

  const updateSubtitle = async (subtitlePath: string | null, videoData: VideoDataModel) => {
    await window.videoAPI.saveVideoJsonData({
      currentVideo: videoData,
      newVideoJsonData: { subtitlePath },
    });
  };

  // New function to update multiple subtitle languages and active language
  const updateSubtitleLanguages = async (
    subtitleData: {
      subtitlePath?: string | null;
      subtitlePathEs?: string | null;
      subtitlePathFr?: string | null;
      activeSubtitleLanguage?: 'en' | 'es' | 'fr' | null;
    },
    videoData: VideoDataModel
  ) => {
    await window.videoAPI.saveVideoJsonData({
      currentVideo: videoData,
      newVideoJsonData: subtitleData,
    });
  };

  // Get the currently active subtitle path based on the active language
  const getActiveSubtitlePath = (videoData: VideoDataModel): string | null => {
    const { activeSubtitleLanguage, subtitlePath, subtitlePathEs, subtitlePathFr } = videoData;
    
    switch (activeSubtitleLanguage) {
      case 'en':
        return subtitlePath || null;
      case 'es':
        return subtitlePathEs || null;
      case 'fr':
        return subtitlePathFr || null;
      default:
        return null;
    }
  };

  // Get available subtitle languages for a video
  const getAvailableLanguages = (videoData: VideoDataModel) => {
    const languages: Array<{ code: 'en' | 'es' | 'fr'; name: string; path: string }> = [];
    
    if (videoData.subtitlePath) {
      languages.push({ code: 'en', name: 'English', path: videoData.subtitlePath });
    }
    if (videoData.subtitlePathEs) {
      languages.push({ code: 'es', name: 'Spanish', path: videoData.subtitlePathEs });
    }
    if (videoData.subtitlePathFr) {
      languages.push({ code: 'fr', name: 'French', path: videoData.subtitlePathFr });
    }
    
    return languages;
  };

  return { 
    subtitleFilePath, 
    updateSubtitle, 
    updateSubtitleLanguages,
    setSubtitleFilePath,
    getActiveSubtitlePath,
    getAvailableLanguages,
  };
};

export { useSubtitle };
