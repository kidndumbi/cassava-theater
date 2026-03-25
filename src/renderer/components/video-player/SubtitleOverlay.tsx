import React, { useEffect, useState } from "react";
import { VTTCue, parseVTT, findActiveCue } from "../../util/vttParser";

interface SubtitleOverlayProps {
  subtitleUrl: string | null;
  currentTime: number;
  isVisible?: boolean;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitleUrl,
  currentTime,
  isVisible = true,
}) => {
  const [cues, setCues] = useState<VTTCue[]>([]);
  const [activeCue, setActiveCue] = useState<VTTCue | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch and parse VTT file when URL changes
  useEffect(() => {
    if (!subtitleUrl) {
      setCues([]);
      setActiveCue(null);
      return;
    }

    const fetchSubtitles = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(subtitleUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch subtitles: ${response.statusText}`);
        }
        
        const vttContent = await response.text();
        const parsedCues = parseVTT(vttContent);
        setCues(parsedCues);
        
        console.log(`Parsed ${parsedCues.length} subtitle cues`);
      } catch (err) {
        console.error("Error fetching/parsing subtitles:", err);
        setCues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubtitles();
  }, [subtitleUrl]);

  // Find active cue based on current time
  useEffect(() => {
    if (cues.length === 0) {
      setActiveCue(null);
      return;
    }

    const active = findActiveCue(cues, currentTime);
    setActiveCue(active);
  }, [cues, currentTime]);

  // Don't render anything if not visible, loading, or no active cue
  if (!isVisible || loading || !activeCue) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-none">
      <div
        className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs"
        style={{
          fontSize: '16px',
          lineHeight: '1.4',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        {activeCue.text.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-full right-0 mt-2 text-xs text-white bg-gray-800 px-2 py-1 rounded">
          Cue #{activeCue.id} ({activeCue.startTime.toFixed(1)}s - {activeCue.endTime.toFixed(1)}s)
        </div>
      )}
    </div>
  );
};

export default SubtitleOverlay;