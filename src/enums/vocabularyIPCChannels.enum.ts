export enum VocabularyIPCChannels {
  GET_ALL_WORDS = "vocabulary:get-all-words",
  GET_WORD = "vocabulary:get-word",
  CREATE_WORD = "vocabulary:create-word",
  UPDATE_WORD = "vocabulary:update-word",
  DELETE_WORD = "vocabulary:delete-word",
  UPDATE_WORD_STATS = "vocabulary:update-word-stats",
}

export enum VerbTaggingIPCChannels {
  START = "verb-tagging:start",
  STOP = "verb-tagging:stop",
  GET_PROGRESS = "verb-tagging:get-progress",
}

export enum VerbFormLinkingIPCChannels {
  START = "verb-form-linking:start",
  STOP = "verb-form-linking:stop",
  GET_PROGRESS = "verb-form-linking:get-progress",
}

export enum VerbTaggingEvents {
  PROGRESS_UPDATE = "verb-tagging:progress-update",
  COMPLETED = "verb-tagging:completed",
  ERROR = "verb-tagging:error",
}

export enum VerbFormLinkingEvents {
  PROGRESS_UPDATE = "verb-form-linking:progress-update",
  COMPLETED = "verb-form-linking:completed",
  ERROR = "verb-form-linking:error",
}
