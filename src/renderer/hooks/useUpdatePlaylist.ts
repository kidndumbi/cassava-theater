import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlaylistModel } from "../../models/playlist.model";
export const useUpdatePlaylist = (
  onSuccess?: (
    data: boolean,
    variables: {
      id: string;
      playlist: PlaylistModel;
    },
    context: unknown,
  ) => Promise<unknown> | unknown,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; playlist: PlaylistModel }) => {
      return window.playlistAPI.putPlaylist(args.playlist.id, args.playlist);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
  });
};
