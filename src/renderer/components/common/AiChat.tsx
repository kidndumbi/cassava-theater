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
  Stop as StopIcon,
} from "@mui/icons-material";
import { LlmResponseChunk } from "../../../models/llm-response-chunk.model";
import theme from "../../theme";
import { formatTime } from "../../util/helperFunctions";
import { useOllamaModels } from "../../hooks/useOllamaModels";
import RenderSelect from "../tv-shows/RenderSelect";
import { OllamaModel } from "../../../models/ollamaModel.model";
import { ConversationMessage } from "../../../models/conversationMessage.model";

export const AiChat = ({
  triggerChatStream,
  ollamaModel,
  history,
  updateHistory,
  cancelStream,
}: {
  triggerChatStream: (prompt?: string, ollamaModel?: string, conversationHistory?: ConversationMessage[]) => void;
  ollamaModel: string;
  history: { id: string; history: ConversationMessage[] } | undefined;
  updateHistory: (history: ConversationMessage[]) => void;
  cancelStream: () => void;
}) => {
  const [accumulatedResponse, setAccumulatedResponse] = useState<string>("");
  const [isComplete, setIsComplete] = useState<boolean>(true);
  const [isWaitingForStream, setIsWaitingForStream] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [userInput, setUserInput] = useState<string>("");
  const [chatStream, setChatStream] = useState<LlmResponseChunk | undefined>(
    undefined,
  );
  const [userHasScrolledUp, setUserHasScrolledUp] = useState<boolean>(false);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const lastProcessedChunk = useRef<LlmResponseChunk | null>(null);

  const [componentOllamaModel, setComponentOllamaModel] = useState(ollamaModel);

  const { data: ollamaModels } = useOllamaModels();

  useEffect(() => {
    if (history && history.history.length > 0) {
      setConversationHistory(history.history);
    }
  }, [history]);

  useEffect(() => {
    window.mainNotificationsAPI.videoAiChatDataChunks(
      (chatResponseChunk: LlmResponseChunk) => {
        setChatStream(chatResponseChunk);
      },
    );
    return () => {
      setChatStream(undefined);
    };
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (chatContentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          chatContentRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px threshold

        if (isAtBottom) {
          setUserHasScrolledUp(false);
        } else {
          setUserHasScrolledUp(true);
        }
      }
    };

    const chatElement = chatContentRef.current;
    if (chatElement) {
      chatElement.addEventListener("scroll", handleScroll);
      return () => chatElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Handle chat stream updates
  useEffect(() => {
    if (chatStream && chatStream !== lastProcessedChunk.current) {
      lastProcessedChunk.current = chatStream;

      // Hide waiting indicator once stream starts
      if (isWaitingForStream) {
        setIsWaitingForStream(false);
      }

      // Accumulate the response
      if (chatStream.response) {
        setAccumulatedResponse((prev) => prev + chatStream.response);
      }

      // Update completion status
      setIsComplete(chatStream.done);

      // When response is complete, add accumulated response to conversation history
      if (chatStream.done) {
        const newMessage = {
          type: "ai" as const,
          message: accumulatedResponse + (chatStream.response || ""),
          timestamp: new Date().toISOString(),
          model: chatStream.model,
        };

        setConversationHistory((prev) => {
          const currentAccumulated =
            accumulatedResponse + (chatStream.response || "");
          if (currentAccumulated.trim()) {
            const newHistory = [...prev, newMessage];
            // Update Redux store
            updateHistory(newHistory);
            return newHistory;
          }
          return prev;
        });

        // Reset for next conversation
        setAccumulatedResponse("");

        // Scroll to bottom after AI response is complete only if user hasn't scrolled up
        if (!userHasScrolledUp) {
          setTimeout(() => scrollToBottom(), 100);
        }
      }

      // Scroll to bottom while streaming only if user hasn't scrolled up
      if (chatStream.response && !chatStream.done && !userHasScrolledUp) {
        setTimeout(() => scrollToBottom(), 50);
      }
    }
  }, [
    chatStream,
    accumulatedResponse,
    updateHistory,
    userHasScrolledUp,
    isWaitingForStream,
  ]);

  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  };

  const sendMessage = () => {
    const message = userInput.trim();
    if (message && isComplete) {
      const newUserMessage = {
        type: "user" as const,
        message,
        timestamp: new Date().toISOString(),
      };

      // Add user message to conversation history
      setConversationHistory((prev) => {
        const newHistory = [...prev, newUserMessage];
        // Update Redux store immediately with user message
        updateHistory(newHistory);
        
        // Reset accumulated response for new AI response
        setAccumulatedResponse("");
        setIsComplete(false);
        setIsWaitingForStream(true);

        // Trigger chat stream with the message and conversation history
        setChatStream(undefined);
        triggerChatStream(message, componentOllamaModel, newHistory);
        
        return newHistory;
      });

      setUserInput(""); // Clear input after sending

      // Scroll to bottom after adding user message only if user hasn't scrolled up
      if (!userHasScrolledUp) {
        setTimeout(() => scrollToBottom(), 100);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setComponentOllamaModel(event.target.value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "80vh",
        minWidth: "600px",
      }}
    >
      {/* Chat Content */}
      <Box
        ref={chatContentRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          backgroundColor: theme.customVariables.appDark,
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
            <Typography
              variant="body2"
              sx={{
                color: theme.customVariables.appWhiteSmoke,
              }}
            >
              Start a conversation...
            </Typography>
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
              elevation={message.type === "user" ? 1 : 0}
              sx={{
                maxWidth: "80%",
                p: 1.5,
                backgroundColor:
                  message.type === "user"
                    ? "primary.main"
                    : theme.customVariables.appDark,
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
                  sx={{
                    fontWeight: "bold",
                    mr: 1,
                    color: theme.customVariables.appWhiteSmoke,
                  }}
                >
                  {message.type === "user" ? "You" : message?.model || "AI"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    fontSize: "0.7em",
                    color: theme.customVariables.appWhiteSmoke,
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.4,
                  ml: 3.5,
                  color: theme.customVariables.appWhiteSmoke,
                }}
              >
                {message.message}
              </Typography>
            </Paper>
          </Box>
        ))}

        {/* Current AI Response (while streaming) */}
        {(accumulatedResponse || isWaitingForStream) && !isComplete && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                maxWidth: "80%",
                p: 1.5,
                backgroundColor: theme.customVariables.appDark,
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
                  sx={{
                    fontWeight: "bold",
                    mr: 1,
                    color: theme.customVariables.appWhiteSmoke,
                  }}
                >
                  {componentOllamaModel || "AI"}
                </Typography>
                <CircularProgress size={12} thickness={6} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.4,
                  ml: 3.5,
                  color: theme.customVariables.appWhiteSmoke,
                }}
              >
                {isWaitingForStream ? "Thinking..." : accumulatedResponse}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <RenderSelect<OllamaModel>
              value={componentOllamaModel || ""}
              onChange={handleModelChange}
              items={ollamaModels || []}
              getItemValue={(model) => model.model}
              getItemLabel={(model) => model.model}
            />
          </Box>

          {!isComplete && (
            <Box sx={{ position: "relative" }}>
              <IconButton
                color="error"
                sx={{
                  backgroundColor: "error.main",
                  color: "error.contrastText",
                  "&:hover": {
                    backgroundColor: "error.dark",
                  },
                  position: "relative",
                  zIndex: 2,
                }}
                onClick={() => {
                  cancelStream();
                  setIsComplete(true);
                  setIsWaitingForStream(false);
                  setAccumulatedResponse("");
                  setChatStream(undefined);
                  setUserInput("");
                }}
              >
                <StopIcon />
              </IconButton>

              {isWaitingForStream && (
                <CircularProgress
                  size={53}
                  thickness={3}
                  sx={{
                    position: "absolute",
                    top: -4,
                    left: -4,
                    color: "error.main",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: theme.customVariables.appDark,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            size="medium"
            disabled={!isComplete}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                color: theme.customVariables.appWhiteSmoke,
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
