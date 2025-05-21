import { Box } from "@mui/material";
import { Title } from "../common/Title";
import { ToolListPanel } from "./ToolListPanel";
import { useState } from "react";
import { ToolPanel } from "./ToolPanel";

export const ToolsPage = () => {
  const tools = [
    { id: "youtube-download", name: "Youtube Download" },
    { id: "youtube-to-mp3", name: "Youtube to MP3" },
    { id: "youtube-to-mp4", name: "Youtube to MP4" },
    { id: "youtube-to-mkv", name: "Youtube to MKV" },
    { id: "youtube-to-webm", name: "Youtube to WEBM" },
  ];
  const [selectedTool, setSelectedTool] = useState(tools[0]);

  return (
    <>
      <Box className="custom-scrollbar mr-5 overflow-y-auto pt-5">
        {<Title>Tools</Title>}
        <Box display="flex" gap={2} mt={2}>
          <ToolListPanel
            tools={tools}
            selectedTool={selectedTool}
            setSelectedTool={(tool) => {
              setSelectedTool(tool);
            }}
          />
          <Box>
            <ToolPanel selectedTool={selectedTool} />
          </Box>
        </Box>
      </Box>
    </>
  );
};
