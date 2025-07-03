import { RootState } from "./index";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConversationMessage } from "../../models/conversationMessage.model";

const chatHistorySlice = createSlice({
  name: "chatHistory",
  initialState: {
    conversations: [] as { id: string; history: ConversationMessage[] }[],
  },
  reducers: {
    addChatHistory: (
      state,
      action: PayloadAction<{
        id: string;
        history: ConversationMessage[];
      }>,
    ) => {
      const { id, history } = action.payload;
      const existingChat = state.conversations.find((chat) => chat.id === id);
      if (existingChat) {
        existingChat.history = history;
      } else {
        state.conversations.push({ id, history });
      }
    },
    clearSingleChatHistory: (state, action: PayloadAction<string>) => {
      const filePath = action.payload;
      state.conversations = state.conversations.filter(
        (chat) => chat.id !== filePath,
      );
    },
  },
});

const selChatHistory = (state: RootState) => state.chatHistory.conversations;

const chatHistoryActions = {
  ...chatHistorySlice.actions,
};

export { chatHistorySlice, selChatHistory, chatHistoryActions };
