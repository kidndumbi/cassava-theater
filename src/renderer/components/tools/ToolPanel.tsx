export const ToolPanel = ({
  selectedTool,
}: {
  selectedTool: { id: string; name: string };
}) => {
  switch (selectedTool.id) {
    case "youtube-download":
      return <div>Youtube Download Tool</div>;
    case "youtube-to-mp3":
      return <div>Youtube to MP3 Tool</div>;
    case "youtube-to-mp4":
      return <div>Youtube to MP4 Tool</div>;
    case "youtube-to-mkv":
      return <div>Youtube to MKV Tool</div>;
    case "youtube-to-webm":
      return <div>Youtube to WEBM Tool</div>;
    default:
      return <div>Select a tool from the list.</div>;
  }
};
