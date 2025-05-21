export enum YoutubeIPCChannels {
  GetVideoInfo = "youtube:getVideoInfo",
  DownloadVideo = "youtube:downloadVideo",
  AddToDownloadQueue = "youtube:addToDownloadQueue", // Added
  RemoveFromQueue = "youtube:removeFromQueue",
  IsProcessingQueue = "youtube:isProcessingQueue",
  ClearQueue = "youtube:clearQueue",
  GetQueue = "youtube:getQueue",
}
