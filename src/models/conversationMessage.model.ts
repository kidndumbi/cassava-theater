export interface ConversationMessage {
  type: "user" | "ai";
  message: string;
  timestamp: string;
  model?: string;
}