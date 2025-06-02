export interface PlaylistModel {
  id: string;
  name: string;
  videos: string[];
  createdAt: string;
  lastVideoPlayedDate?: string | null;
  lastVideoPlayed?: string | null;
  display?: PlaylistDisplayType
}

export type PlaylistDisplayType = "grid" | "list";