import { Box } from "@mui/material";
import { Title } from "../common/Title";
import { AppListPanel } from "../common/AppListPanel";
import { useState } from "react";
import { ToolPanel } from "./ToolPanel";

export const ToolsPage = () => {
  const tools = [{ id: "youtube-download", name: "Youtube Download" }];
  const [selectedTool, setSelectedTool] = useState(tools[0]);

  return (
    <>
      <Box className="custom-scrollbar mr-5 overflow-y-auto pt-5">
        {<Title>Tools</Title>}
        <Box display="flex" gap={2} mt={2}>
          <AppListPanel
            items={tools}
            selectedItem={selectedTool}
            setSelectedItem={(tool) => {
              setSelectedTool(tool);
            }}
          />
          <Box sx={{ width: "100%" }}>
            <ToolPanel selectedTool={selectedTool} />
          </Box>
        </Box>
      </Box>
    </>
  );
};
