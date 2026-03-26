export enum SubtitleIPCChannels {
  // Legacy single generation (for compatibility)
  GenerateSubtitles = "subtitle:generateSubtitles",
  CheckSubtitleStatus = "subtitle:checkStatus",
  GetExistingSubtitles = "subtitle:getExisting",
  
  // Queue management
  AddToSubtitleGenerationQueue = "subtitle:addToQueue",
  AddToSubtitleGenerationQueueBulk = "subtitle:addToQueueBulk",
  PauseSubtitleGenerationItem = "subtitle:pauseItem",
  UnpauseSubtitleGenerationItem = "subtitle:unpauseItem",
  IsSubtitleItemPaused = "subtitle:isItemPaused",
  GetCurrentProcessingSubtitleItem = "subtitle:getCurrentProcessingItem",
  GetSubtitleGenerationQueue = "subtitle:getQueue",
  RemoveFromSubtitleGenerationQueue = "subtitle:removeFromQueue",
  InitializeSubtitleGenerationQueue = "subtitle:initializeQueue",
  SwapSubtitleQueueItems = "subtitle:swapQueueItems",
}