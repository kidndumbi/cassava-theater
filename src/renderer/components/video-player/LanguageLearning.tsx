import React, { useEffect, useState } from "react";
import { VTTCue, parseVTT, findActiveCue } from "../../util/vttParser";
import { VideoDataModel } from "../../../models/videoData.model";

interface LanguageLearningProps {
  subtitleUrl: string | null;
  nativeSubtitleUrl: string | null;
  currentTime: number;
  currentVideo?: VideoDataModel | null;
  subtitleOverlayLanguage?: 'en' | 'es' | 'fr' | null;
  isVisible?: boolean;
  enabled?: boolean;
  fontSize?: number;
  language?: string;
  onPause?: () => void;
}

const LanguageLearning: React.FC<LanguageLearningProps> = ({
  subtitleUrl,
  nativeSubtitleUrl,
  currentTime,
  currentVideo,
  subtitleOverlayLanguage,
  isVisible = true,
  enabled = false,
  fontSize = 16,
  language = 'Language Learning',
  onPause,
}) => {
  const [cues, setCues] = useState<VTTCue[]>([]);
  const [activeCue, setActiveCue] = useState<VTTCue | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Native language subtitle state
  const [nativeCues, setNativeCues] = useState<VTTCue[]>([]);
  const [activeNativeCue, setActiveNativeCue] = useState<VTTCue | null>(null);
  const [nativeLoading, setNativeLoading] = useState(false);
  
  // Language learning exercise state
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [originalText, setOriginalText] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [exerciseCompleted, setExerciseCompleted] = useState<boolean>(false);
  
  // UI visibility state (separate from functionality)
  const [isUIVisible, setIsUIVisible] = useState<boolean>(true);

  // Send state updates to socket clients via IPC
  const sendStateUpdate = () => {
    const state = {
      activeCue: activeCue ? {
        id: activeCue.id || `cue-${Date.now()}`,
        text: activeCue.text,
        startTime: activeCue.startTime,
        endTime: activeCue.endTime
      } : null,
      activeNativeCue: activeNativeCue ? {
        id: activeNativeCue.id || `native-cue-${Date.now()}`,
        text: activeNativeCue.text,
        startTime: activeNativeCue.startTime,
        endTime: activeNativeCue.endTime
      } : null,
      scrambledWords,
      selectedWords,
      originalText,
      showResult,
      isCorrect,
      exerciseCompleted,
      enabled: enabled || false
    };

    // Send to main process for broadcasting to mobile clients
    if (window.languageLearningAPI && window.languageLearningAPI.sendMessage) {
      window.languageLearningAPI.sendMessage('language-learning-state-update', state);
    }
  };

  // Listen for remote commands from mobile app
  useEffect(() => {
    if (!window.languageLearningAPI) return;

    const handleSelectWord = (_event: any, data: { word: string; index: number }) => {
      if (exerciseCompleted) return;
      
      setSelectedWords(prev => [...prev, data.word]);
      setScrambledWords(prev => prev.filter((_, i) => i !== data.index));
    };

    const handleRemoveWord = (_event: any, data: { index: number }) => {
      if (exerciseCompleted) return;
      
      const word = selectedWords[data.index];
      if (word) {
        setSelectedWords(prev => prev.filter((_, i) => i !== data.index));
        setScrambledWords(prev => [...prev, word]);
      }
    };

    const handleSubmit = () => {
      if (selectedWords.length === 0) return;
      
      const userText = selectedWords.join(' ');
      const correct = userText === originalText;
      
      setIsCorrect(correct);
      setShowResult(true);
      setExerciseCompleted(true);
    };

    const handleReset = () => {
      const words = originalText.split(/\s+/).filter(word => word.length > 0);
      const scrambled = [...words].sort(() => Math.random() - 0.5);
      
      setScrambledWords(scrambled);
      setSelectedWords([]);
      setShowResult(false);
      setIsCorrect(false);
      setExerciseCompleted(false);
    };

    // Register IPC listeners
    window.languageLearningAPI.on('language-learning-select-word', handleSelectWord);
    window.languageLearningAPI.on('language-learning-remove-word', handleRemoveWord);
    window.languageLearningAPI.on('language-learning-submit', handleSubmit);
    window.languageLearningAPI.on('language-learning-reset', handleReset);

    return () => {
      // Cleanup listeners
      window.languageLearningAPI.removeAllListeners('language-learning-select-word');
      window.languageLearningAPI.removeAllListeners('language-learning-remove-word');
      window.languageLearningAPI.removeAllListeners('language-learning-submit');
      window.languageLearningAPI.removeAllListeners('language-learning-reset');
    };
  }, [selectedWords, originalText, exerciseCompleted]);

  // Send state updates when relevant state changes
  useEffect(() => {
    sendStateUpdate();
  }, [activeCue, activeNativeCue, scrambledWords, selectedWords, showResult, isCorrect, exerciseCompleted, enabled]);

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
        
        console.log(`Parsed ${parsedCues.length} subtitle cues for language learning`);
      } catch (err) {
        console.error("Error fetching/parsing subtitles for language learning:", err);
        setCues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubtitles();
  }, [subtitleUrl, enabled]);

  // Fetch and parse native language VTT file
  useEffect(() => {
    if (!nativeSubtitleUrl || !enabled) {
      setNativeCues([]);
      setActiveNativeCue(null);
      return;
    }

    const fetchNativeSubtitles = async () => {
      setNativeLoading(true);
      
      try {
        const response = await fetch(nativeSubtitleUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch native subtitles: ${response.statusText}`);
        }
        
        const vttContent = await response.text();
        const parsedCues = parseVTT(vttContent);
        setNativeCues(parsedCues);
        
        console.log(`Parsed ${parsedCues.length} native subtitle cues for language learning`);
      } catch (err) {
        console.error("Error fetching/parsing native subtitles for language learning:", err);
        setNativeCues([]);
      } finally {
        setNativeLoading(false);
      }
    };

    fetchNativeSubtitles();
  }, [nativeSubtitleUrl, enabled]);

  // Find active cue based on current time
  useEffect(() => {
    if (cues.length === 0) {
      setActiveCue(null);
      return;
    }

    const active = findActiveCue(cues, currentTime);
    setActiveCue(active);
  }, [cues, currentTime]);

  // Find active native cue based on current time
  useEffect(() => {
    if (nativeCues.length === 0) {
      setActiveNativeCue(null);
      return;
    }

    const active = findActiveCue(nativeCues, currentTime);
    setActiveNativeCue(active);
  }, [nativeCues, currentTime]);

  // Scramble words when active cue changes
  useEffect(() => {
    if (!activeCue) {
      resetExercise();
      return;
    }

    // Reset exercise for new text
    const text = activeCue.text.replace(/\n/g, ' ').trim();
    setOriginalText(text);
    
    // Split into words and scramble
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const scrambled = [...words].sort(() => Math.random() - 0.5);
    
    setScrambledWords(scrambled);
    setSelectedWords([]);
    setShowResult(false);
    setIsCorrect(false);
    setExerciseCompleted(false);
  }, [activeCue]);

  const resetExercise = () => {
    setScrambledWords([]);
    setSelectedWords([]);
    setOriginalText('');
    setShowResult(false);
    setIsCorrect(false);
    setExerciseCompleted(false);
  };

  const handleWordClick = (word: string, index: number) => {
    if (exerciseCompleted) return;
    
    setSelectedWords(prev => [...prev, word]);
    setScrambledWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (index: number) => {
    if (exerciseCompleted) return;
    
    const word = selectedWords[index];
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setScrambledWords(prev => [...prev, word]);
  };

  const handleSubmit = () => {
    if (selectedWords.length === 0) return;
    
    const userText = selectedWords.join(' ');
    const correct = userText === originalText;
    
    setIsCorrect(correct);
    setShowResult(true);
    setExerciseCompleted(true);
  };

  const handleReset = () => {
    const words = originalText.split(/\s+/).filter(word => word.length > 0);
    const scrambled = [...words].sort(() => Math.random() - 0.5);
    
    setScrambledWords(scrambled);
    setSelectedWords([]);
    setShowResult(false);
    setIsCorrect(false);
    setExerciseCompleted(false);
  };

  // Don't render anything if not enabled, not visible from parent, loading, or no active cue
  if (!enabled || !isVisible || loading || !activeCue) {
    return null;
  }

  // Show minimal toggle button when UI is hidden (functionality continues running)
  if (!isUIVisible) {
    return (
      <div 
        className="absolute z-50" 
        style={{ right: '100px', top: '120px' }}
      >
        <button
          onClick={() =>  setIsUIVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
          title="Show Language Learning Exercise"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="absolute z-50" 
      style={{ right: '80px', top: '120px' }}
      onClick={() => onPause?.()}
    >
      <div
        className="bg-blue-900 bg-opacity-20 text-white p-4 rounded-lg shadow-lg relative"
        style={{
          fontSize: `${Math.max(12, fontSize - 2)}px`,
          lineHeight: '1.4',
          maxWidth: `${Math.max(400, fontSize * 25)}px`,
          minWidth: '300px',
        }}
      >
        {/* Header with title and hide button */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex-1 text-center font-semibold text-blue-200">
            {language} Exercise
          </div>
          <button
            onClick={(ev) => { 
              ev.stopPropagation();
              setIsUIVisible(false) }}
            className="bg-blue-700 hover:bg-blue-600 text-white p-1 rounded transition-colors ml-2"
            title="Hide Language Learning Exercise"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
            </svg>
          </button>
        </div>

        {/* Native Language Reference */}
        {activeNativeCue && (
          <div className="mb-4 p-3 bg-gray-800 bg-opacity-20 rounded-lg border border-gray-600">
            <div className="text-xs text-gray-300 mb-1">Reference (Native Language):</div>
            <div 
              className="text-white text-center leading-relaxed"
              style={{ fontSize: `${Math.max(12, fontSize - 1)}px` }}
            >
              {activeNativeCue.text.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>
        )}

        {/* User's current arrangement */}
        <div className="mb-3">
          <div className="text-xs text-blue-200 mb-1">Your arrangement:</div>
          <div 
            className="bg-blue-800 bg-opacity-20 p-2 rounded min-h-[40px] border-2 border-dashed border-blue-400"
            style={{ fontSize: `${fontSize}px` }}
          >
            {selectedWords.length === 0 ? (
              <span className="text-blue-300 italic">Click words below to arrange them...</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedWords.map((word, index) => (
                  <button
                    key={`selected-${index}`}
                    onClick={() => handleRemoveWord(index)}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-sm transition-colors"
                    disabled={exerciseCompleted}
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scrambled words */}
        <div className="mb-3">
          <div className="text-xs text-blue-200 mb-1">Available words:</div>
          <div className="flex flex-wrap gap-2">
            {scrambledWords.map((word, index) => (
              <button
                key={`scrambled-${index}`}
                onClick={() => handleWordClick(word, index)}
                className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-white transition-colors disabled:opacity-50"
                disabled={exerciseCompleted}
                style={{ fontSize: `${fontSize}px` }}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleSubmit}
            disabled={selectedWords.length === 0 || exerciseCompleted}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:opacity-50 px-4 py-2 rounded text-white font-medium transition-colors"
          >
            Submit
          </button>
          <button
            onClick={handleReset}
            className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white font-medium transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Result feedback */}
        {showResult && (
          <div className="mt-3 text-center">
            <div className={`font-bold text-lg ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            {!isCorrect && (
              <div className="text-xs text-blue-200 mt-1">
                Correct: "{originalText}"
              </div>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
};

export default LanguageLearning;