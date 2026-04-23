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

  // Auto-save exercise data when both native and practice cues are available
  useEffect(() => {
    if (!activeCue || !activeNativeCue || !currentVideo?.filePath || !subtitleOverlayLanguage) {
      return;
    }

    // Extract and validate both language texts
    const practiceText = activeCue.text.replace(/\n/g, ' ').trim();
    const nativeText = activeNativeCue.text.replace(/\n/g, ' ').trim();
    
    // Only save if we have meaningful text in BOTH languages
    if (!practiceText || !nativeText) {
      console.log('Skipping exercise save: Missing text in one or both languages', {
        hasPracticeText: !!practiceText,
        hasNativeText: !!nativeText
      });
      return;
    }
    
    if (practiceText.length < 3 || nativeText.length < 3) {
      console.log('Skipping exercise save: Text too short in one or both languages', {
        practiceLength: practiceText.length,
        nativeLength: nativeText.length
      });
      return;
    }

    // Prepare exercise data for saving
    const exerciseData = {
      videoFilePath: currentVideo.filePath,
      videoFileName: currentVideo.fileName,
      nativeLanguageText: nativeText,
      practiceLanguageText: practiceText,
      nativeLanguage: 'en' as const, // Assuming English is always native
      practiceLanguage: subtitleOverlayLanguage,
      startTime: activeCue.startTime,
      endTime: activeCue.endTime,
      duration: activeCue.endTime - activeCue.startTime,
      wordCount: practiceText.split(/\s+/).length
    };

    // Save to database via IPC
    if (window.languageLearningAPI && window.languageLearningAPI.saveExercise) {
      window.languageLearningAPI.saveExercise(exerciseData)
        .then(() => {
          console.log('Exercise data saved:', {
            practice: practiceText.substring(0, 50) + '...',
            native: nativeText.substring(0, 50) + '...',
            language: subtitleOverlayLanguage
          });
        })
        .catch((error: any) => {
          console.error('Failed to save exercise data:', error);
        });
    }
  }, [activeCue, activeNativeCue, currentVideo, subtitleOverlayLanguage]);

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

  // Don't render anything if not enabled, not visible, loading, or no active cue
  if (!enabled || !isVisible || loading || !activeCue) {
    return null;
  }

  return (
    <div 
      className="absolute z-50" 
      style={{ right: '80px', top: '120px' }}
      onClick={() => onPause?.()}
    >
      <div
        className="bg-blue-900 bg-opacity-90 text-white p-4 rounded-lg shadow-lg relative"
        style={{
          fontSize: `${Math.max(12, fontSize - 2)}px`,
          lineHeight: '1.4',
          maxWidth: `${Math.max(400, fontSize * 25)}px`,
          minWidth: '300px',
        }}
      >
        {/* Title */}
        <div className="text-center mb-3 font-semibold text-blue-200">
          {language} Exercise
        </div>

        {/* Native Language Reference */}
        {activeNativeCue && (
          <div className="mb-4 p-3 bg-gray-800 bg-opacity-60 rounded-lg border border-gray-600">
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
            className="bg-blue-800 bg-opacity-50 p-2 rounded min-h-[40px] border-2 border-dashed border-blue-400"
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
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-full right-0 mt-2 text-xs text-white bg-blue-800 px-2 py-1 rounded">
          Language Learning Cue #{activeCue?.id} ({activeCue?.startTime.toFixed(1)}s - {activeCue?.endTime.toFixed(1)}s)
        </div>
      )}
    </div>
  );
};

export default LanguageLearning;