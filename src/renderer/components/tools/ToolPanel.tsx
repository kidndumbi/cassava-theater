import { YoutubeDownload } from "./youtube-download/YoutubeDownload";

export const ToolPanel = ({
  selectedTool,
}: {
  selectedTool: { id: string; name: string };
}) => {
  switch (selectedTool.id) {
    case "youtube-download":
      return <YoutubeDownload />;
    default:
      return <div>Select a tool from the list.</div>;
  }
};
