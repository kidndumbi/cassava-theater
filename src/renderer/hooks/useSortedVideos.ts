import { useMemo } from "react";
import { VideoDataModel } from "../../models/videoData.model";

const useSortedVideos = (movies: VideoDataModel[], tvShows: VideoDataModel[]) => {
	// Helper to filter, sort by lastVideoPlayedDate, and limit results.
	const getSortedItems = (
		items: VideoDataModel[],
		filterFn: (m: VideoDataModel) => boolean
	) => {
		return items
			.filter(filterFn)
			.sort(
				(a, b) =>
					new Date(b.lastVideoPlayedDate ?? 0).getTime() -
					new Date(a.lastVideoPlayedDate ?? 0).getTime()
			)
			.slice(0, 20);
	};

	const sortedMovies = useMemo(
		() =>
			getSortedItems(movies, (m) => m.lastVideoPlayedDate && (m.currentTime || 0) > 1),
		[movies]
	);
	const sortedTvShows = useMemo(
		() =>
			getSortedItems(tvShows, (m) => !!m.lastVideoPlayed && !!m.lastVideoPlayedDate),
		[tvShows]
	);

	return { sortedMovies, sortedTvShows };
};

export default useSortedVideos;
