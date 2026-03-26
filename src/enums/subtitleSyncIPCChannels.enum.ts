export enum SubtitleSyncIPCChannels {
  AddToSyncQueue = "subtitleSync:addToSyncQueue",
  AddToSyncQueueBulk = "subtitleSync:addToSyncQueueBulk",
  PauseSyncItem = "subtitleSync:pauseSyncItem",
  UnpauseSyncItem = "subtitleSync:unpauseSyncItem",
  IsItemPaused = "subtitleSync:isItemPaused",
  GetCurrentProcessingItem = "subtitleSync:getCurrentProcessingItem",
  GetSyncQueue = "subtitleSync:getSyncQueue",
  RemoveFromSyncQueue = "subtitleSync:removeFromSyncQueue",
  InitializeSyncQueue = "subtitleSync:initializeSyncQueue",
  SwapQueueItems = "subtitleSync:swapQueueItems",
}