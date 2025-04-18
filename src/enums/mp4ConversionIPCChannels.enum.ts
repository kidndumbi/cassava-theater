export enum Mp4ConversionIPCChannels { 
    AddToConversionQueue = "video:addToConversionQueue",
    PauseConversionItem = "video:pauseConversionItem",
    UnpauseConversionItem = "video:unpauseConversionItem",
    IsItemPaused = "video:isItemPaused",
    GetCurrentProcessingItem = "video:getCurrentProcessingItem",
    GetConversionQueue = "video:getConversionQueue",
    RemoveFromConversionQueue = "video:removeFromConversionQueue",
}