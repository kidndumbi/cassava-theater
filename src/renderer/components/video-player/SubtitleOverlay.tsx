import React, { useEffect, useState } from "react";
import { VTTCue, parseVTT, findActiveCue } from "../../util/vttParser";

interface SubtitleOverlayProps {
  subtitleUrl: string | null;
  currentTime: number;
  isVisible?: boolean;
  enabled?: boolean;
  fontSize?: number;
  hideText?: boolean;
  subtitleOverlayLanguage?: 'en' | 'es' | 'fr' | null;
}

const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  subtitleUrl,
  currentTime,
  isVisible = true,
  enabled = false,
  fontSize = 16,
  hideText = false,
  subtitleOverlayLanguage = null,
}) => {
  const [cues, setCues] = useState<VTTCue[]>([]);
  const [activeCue, setActiveCue] = useState<VTTCue | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [displayText, setDisplayText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const translationCacheRef = React.useRef<Map<string, string>>(new Map());

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

  // Clear translation cache when subtitle file changes
  useEffect(() => {
    translationCacheRef.current.clear();
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

  // Translate active cue in real-time when it or the target language changes
  useEffect(() => {
    if (!activeCue) {
      setDisplayText('');
      return;
    }

    const sourceText = activeCue.text;

    if (!subtitleOverlayLanguage) {
      setDisplayText(sourceText);
      return;
    }

    const cacheKey = `${sourceText}::${subtitleOverlayLanguage}`;
    if (translationCacheRef.current.has(cacheKey)) {
      setDisplayText(translationCacheRef.current.get(cacheKey) ?? sourceText);
      return;
    }

    const languageNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French' };
    const targetLanguageName = languageNames[subtitleOverlayLanguage];

    setIsTranslating(true);
    setDisplayText('');

    const translate = async () => {
      try {
        const flatSource = sourceText.replace(/\n/g, ' ').trim();
        const prompt = `Translate the following subtitle text to ${targetLanguageName}. Return ONLY the translated text with no explanation, no quotes, and no additional commentary:\n\n${flatSource}`;
        const result = await window.llmAPI.generateLlmResponse(prompt);
        const cleaned = result.trim();
        translationCacheRef.current.set(cacheKey, cleaned);
        setDisplayText(cleaned);
      } catch (err) {
        console.error('SubtitleOverlay translation failed, using original:', err);
        setDisplayText(sourceText);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [activeCue, subtitleOverlayLanguage]);

  // Handle copying subtitle text to clipboard
  const handleCopyText = async () => {
    if (!displayText || hideText) return;
    
    try {
      await navigator.clipboard.writeText(displayText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Don't render anything if not enabled, not visible, loading, or no display text yet
  if (!enabled || !isVisible || loading || (!displayText && !isTranslating) || !activeCue) {
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
        ) : isTranslating ? (
          <svg className="animate-spin mx-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        ) : (
          displayText.split('\n').map((line, index) => (
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