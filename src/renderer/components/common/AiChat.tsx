import { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import {
  Send as SendIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
} from "@mui/icons-material";
import { LlmResponseChunk } from "../../../models/llm-response-chunk.model";
import theme from "../../theme";
import { formatTime } from "../../util/helperFunctions";
import { useOllamaModels } from "../../hooks/useOllamaModels";
import RenderSelect from "../tv-shows/RenderSelect";
import { OllamaModel } from "../../../models/ollamaModel.model";

interface ConversationMessage {
  type: "user" | "ai";
  message: string;
  timestamp: string;
}

export const AiChat = ({
  chatStream,
  triggerChatStream,
  ollamaModel,
}: {
  chatStream: LlmResponseChunk | undefined;
  triggerChatStream: (prompt?: string) => void;
  ollamaModel: string;
}) => {
  const [accumulatedResponse, setAccumulatedResponse] = useState<string>("");
  const [currentModel, setCurrentModel] = useState<string>("");
  const [isComplete, setIsComplete] = useState<boolean>(true);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [userInput, setUserInput] = useState<string>("");
  const chatContentRef = useRef<HTMLDivElement>(null);
  const lastProcessedChunk = useRef<LlmResponseChunk | null>(null);

  const { data: ollamaModels } = useOllamaModels();

  useEffect(() => {
    return () => {
      window.llmAPI.cancelCurrentLlmByChunksRequest().catch((err) => {
        console.error("Error canceling LLM request:", err);
      });
    };
  }, []);

  // Handle chat stream updates
  useEffect(() => {
    if (chatStream && chatStream !== lastProcessedChunk.current) {
      //console.log('AiChat.tsx Stream Chunk:', chatStream);
      lastProcessedChunk.current = chatStream;

      // Set model on first chunk
      if (!currentModel && chatStream.model) {
        setCurrentModel(chatStream.model);
      }

      // Accumulate the response
      if (chatStream.response) {
        setAccumulatedResponse((prev) => prev + chatStream.response);
      }

      // Update completion status
      setIsComplete(chatStream.done);

      // When response is complete, add accumulated response to conversation history
      if (chatStream.done) {
        setConversationHistory((prev) => {
          const currentAccumulated =
            accumulatedResponse + (chatStream.response || "");
          if (currentAccumulated.trim()) {
            return [
              ...prev,
              {
                type: "ai",
                message: currentAccumulated,
                timestamp: new Date().toISOString(),
              },
            ];
          }
          return prev;
        });

        // Reset for next conversation
        setAccumulatedResponse("");

        // Scroll to bottom after AI response is complete
        setTimeout(() => scrollToBottom(), 100);
      }

      // Scroll to bottom while streaming
      if (chatStream.response && !chatStream.done) {
        setTimeout(() => scrollToBottom(), 50);
      }
    }
  }, [chatStream]);

  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  };

  const sendMessage = () => {
    const message = userInput.trim();
    if (message && isComplete) {
      console.log("Sending message:", message);

      // Add user message to conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          type: "user",
          message: message,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Reset accumulated response for new AI response
      setAccumulatedResponse("");
      setIsComplete(false);

      // Trigger chat stream with the message
      triggerChatStream(message);
      setUserInput(""); // Clear input after sending

      // Scroll to bottom after adding user message
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    // Note: You may need to pass an onModelChange prop to handle model selection
    console.log("Model changed to:", event.target.value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "80vh" }}>
      {/* Chat Content */}
      <Box
        ref={chatContentRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          backgroundColor: "background.default",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,.2)",
            borderRadius: "3px",
          },
        }}
      >
        {/* No conversation yet */}
        {conversationHistory.length === 0 && !accumulatedResponse && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">Start a conversation...</Typography>
          </Box>
        )}

        {/* Conversation History */}
        {conversationHistory.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent:
                message.type === "user" ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                maxWidth: "80%",
                p: 1.5,
                backgroundColor:
                  message.type === "user" ? "primary.main" : "secondary.main",
                color:
                  message.type === "user"
                    ? "primary.contrastText"
                    : "text.primary",
                borderRadius: 2,
                borderBottomRightRadius: message.type === "user" ? 0.5 : 2,
                borderBottomLeftRadius: message.type === "ai" ? 0.5 : 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                    mr: 1,
                    backgroundColor:
                      message.type === "user"
                        ? "primary.dark"
                        : "secondary.main",
                  }}
                >
                  {message.type === "user" ? (
                    <PersonIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <BotIcon sx={{ fontSize: 14 }} />
                  )}
                </Avatar>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: "bold", mr: 1 }}
                >
                  {message.type === "user" ? "You" : currentModel || "AI"}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.4,
                  ml: 3.5,
                }}
              >
                {message.message}
              </Typography>
            </Paper>
          </Box>
        ))}

        {/* Current AI Response (while streaming) */}
        {accumulatedResponse && !isComplete && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
            <Paper
              elevation={1}
              sx={{
                maxWidth: "80%",
                p: 1.5,
                backgroundColor: "grey.100",
                borderRadius: 2,
                borderBottomLeftRadius: 0.5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                    mr: 1,
                    backgroundColor: "secondary.main",
                  }}
                >
                  <BotIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: "bold", mr: 1 }}
                >
                  {currentModel || "AI"}
                </Typography>
                <CircularProgress size={12} thickness={6} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.4,
                  ml: 3.5,
                }}
              >
                {accumulatedResponse}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: "divider" }}>
        <RenderSelect<OllamaModel>
          value={ollamaModel || ""}
          onChange={handleModelChange}
          items={ollamaModels || []}
          getItemValue={(model) => model.model}
          getItemLabel={(model) => model.model}
          theme={theme}
        />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
            disabled={!isComplete}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={!userInput.trim() || !isComplete}
            color="primary"
            sx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              "&:disabled": {
                backgroundColor: "action.disabled",
                color: "action.disabled",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
