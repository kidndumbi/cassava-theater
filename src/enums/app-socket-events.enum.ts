export enum AppSocketEvents {
  REMOTE_COMMAND = "remote-command",
  SET_PLAYING = "set-playing",
  GET_VIDEOS_DATA = "get-videos-data",
  GET_FOLDER_DETAILS = "get-folder-details",
  GET_VIDEO_DETAILS = "get-video-details",
  SET_CURRENTTIME = "set-currenttime",
  GET_SETTINGS = "get-settings",
  FETCH_WATCHLATER_VIDEOS = "fetch-watchlater-videos",
  FETCH_RECENTLY_WATCHED_CUSTOM_VIDEOS = "fetch-recently-watched-custom-videos",
  FETCH_RECENTLY_WATCHED_VIDEOS = "fetch-recently-watched-videos",
  GET_ALL_PLAYLISTS = "get-all-playlists",
  SET_PLAYING_PLAYLIST = "set-playing-playlist",

  // --- YouTube socket events ---
  YT_GET_VIDEO_INFO = "yt-get-video-info",
  YT_DOWNLOAD_VIDEO = "yt-download-video",
  YT_ADD_TO_DOWNLOAD_QUEUE = "yt-add-to-download-queue",
  YT_REMOVE_FROM_QUEUE = "yt-remove-from-queue",
  YT_IS_PROCESSING_QUEUE = "yt-is-processing-queue",
  YT_CLEAR_QUEUE = "yt-clear-queue",
  YT_GET_QUEUE = "yt-get-queue",
  YT_SWAP_QUEUE_ITEMS = "yt-swap-queue-items",
}
