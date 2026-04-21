import React, { useEffect, useState } from "react";
import { VTTCue, parseVTT, findActiveCue } from "../../util/vttParser";

interface SubtitleOverlayProps {
  subtitleUrl: string | null;
  currentTime: number;
  isVisible?: boolean;
  enabled?: boolean;
  fontSize?: number;
  hideText?: boolean;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitleUrl,
  currentTime,
  isVisible = true,
  enabled = false,
  fontSize = 16,
  hideText = false,
}) => {
  const [cues, setCues] = useState<VTTCue[]>([]);
  const [activeCue, setActiveCue] = useState<VTTCue | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch and parse VTT file when URL changes
  useEffect(() => {
    if (!subtitleUrl || !enabled) {
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
  }, [subtitleUrl, enabled]);

  // Find active cue based on current time
  useEffect(() => {
    if (cues.length === 0) {
      setActiveCue(null);
      return;
    }

    const active = findActiveCue(cues, currentTime);
    setActiveCue(active);
  }, [cues, currentTime]);

  // Handle copying subtitle text to clipboard
  const handleCopyText = async () => {
    if (!activeCue || hideText) return;
    
    try {
      await navigator.clipboard.writeText(activeCue.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Don't render anything if not enabled, not visible, loading, or no active cue
  if (!enabled || !isVisible || loading || !activeCue) {
    return null;
  }

  return (
    <div 
      className="absolute top-4 z-50" 
      style={{ right: '80px' }}
      onMouseEnter={() => setShowCopyButton(true)}
      onMouseLeave={() => setShowCopyButton(false)}
    >
      <div
        className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg shadow-lg relative"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.4',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          maxWidth: `${Math.max(320, fontSize * 20)}px`,
          minWidth: '200px',
        }}
      >
        {hideText ? (
          <div style={{ color: 'red' }}>Text Hidden</div>
        ) : (
          activeCue.text.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))
        )}
        
        {/* Copy Button - only show when not hiding text and on hover */}
        {!hideText && showCopyButton && (
          <button
            onClick={handleCopyText}
            className="absolute top-1 right-1 bg-gray-700 hover:bg-gray-600 text-white rounded px-2 py-1 text-xs transition-colors pointer-events-auto"
            style={{ fontSize: '12px' }}
            title="Copy subtitle text"
          >
            {copySuccess ? '✓' : '📋'}
          </button>
        )}
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