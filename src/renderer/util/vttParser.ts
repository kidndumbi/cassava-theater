export interface VTTCue {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  text: string;
}

/**
 * Converts VTT timestamp (HH:MM:SS.mmm) to seconds
 */
function parseTimestamp(timestamp: string): number {
  const [time, milliseconds] = timestamp.split('.');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const ms = milliseconds ? parseInt(milliseconds.padEnd(3, '0')) : 0;
  
  return hours * 3600 + minutes * 60 + seconds + ms / 1000;
}

/**
 * Parses VTT file content into subtitle cues
 */
export function parseVTT(vttContent: string): VTTCue[] {
  const cues: VTTCue[] = [];
  const lines = vttContent.split('\n').map(line => line.trim());
  
  // Skip the WEBVTT header
  let i = 0;
  while (i < lines.length && !lines[i].startsWith('WEBVTT')) {
    i++;
  }
  i++; // Skip WEBVTT line
  
  // Skip any additional header lines until we find cues
  while (i < lines.length && lines[i] === '') {
    i++;
  }
  
  while (i < lines.length) {
    // Skip empty lines
    if (lines[i] === '') {
      i++;
      continue;
    }
    
    // Check if this line is a cue ID (number or text before timing)
    let cueId = '';
    let timingLine = '';
    
    if (i < lines.length && lines[i] && !lines[i].includes('-->')) {
      // This line is a cue ID
      cueId = lines[i];
      i++;
    }
    
    // Next line should be the timing line
    if (i < lines.length && lines[i].includes('-->')) {
      timingLine = lines[i];
      i++;
    } else {
      // Skip lines that don't contain timing
      i++;
      continue;
    }
    
    // Parse timing
    const [startStr, endStr] = timingLine.split('-->').map(s => s.trim());
    const startTime = parseTimestamp(startStr);
    const endTime = parseTimestamp(endStr);
    
    // Collect subtitle text lines
    const textLines: string[] = [];
    while (i < lines.length && lines[i] !== '') {
      textLines.push(lines[i]);
      i++;
    }
    
    if (textLines.length > 0) {
      cues.push({
        id: cueId || cues.length.toString(),
        startTime,
        endTime,
        text: textLines.join('\n')
      });
    }
  }
  
  return cues;
}

/**
 * Finds the active subtitle cue for a given time
 */
export function findActiveCue(cues: VTTCue[], currentTime: number): VTTCue | null {
  return cues.find(cue => 
    currentTime >= cue.startTime && currentTime <= cue.endTime
  ) || null;
}