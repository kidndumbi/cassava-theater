export interface PlaylistModel {
  id: string;
  name: string;
  videos: string[];
  createdAt: string;
  lastVideoPlayedDate?: string | null;
  lastVideoPlayed?: string | null;
  display?: ListDisplayType
}

export type ListDisplayType = "grid" | "list";