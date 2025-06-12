export enum YoutubeIPCChannels {
  GetVideoInfo = "youtube:getVideoInfo",
  DownloadVideo = "youtube:downloadVideo",
  AddToDownloadQueue = "youtube:addToDownloadQueue",
  RemoveFromQueue = "youtube:removeFromQueue",
  IsProcessingQueue = "youtube:isProcessingQueue",
  ClearQueue = "youtube:clearQueue",
  GetQueue = "youtube:getQueue",
  SwapQueueItems = "youtube:swapQueueItems",
  ProcessQueue = "youtube:processQueue",
  SetIsProcessing = "youtube:setIsProcessing",
}
