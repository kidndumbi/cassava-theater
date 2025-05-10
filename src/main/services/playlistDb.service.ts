import { PlaylistModel } from "../../models/playlist.model";
import { levelDBService, KeyType } from "./levelDB.service";

const PLAYLISTS_COLLECTION = "playlists";

export const getPlaylist = async (
  id: KeyType,
): Promise<PlaylistModel | null> => {
  return levelDBService.get(PLAYLISTS_COLLECTION, id);
};

export const getAllPlaylists = async (): Promise<PlaylistModel[]> => {
  return levelDBService.getAll(PLAYLISTS_COLLECTION);
};

export const putPlaylist = async (
  id: KeyType,
  playlist: PlaylistModel,
): Promise<void> => {
  const existing = (await getPlaylist(id)) || {};
  await levelDBService.put(PLAYLISTS_COLLECTION, id, {
    ...existing,
    ...playlist,
  });
};

export const deletePlaylist = async (id: KeyType): Promise<void> => {
  await levelDBService.delete(PLAYLISTS_COLLECTION, id);
};
