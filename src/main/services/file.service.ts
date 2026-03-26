import { IncomingMessage, ServerResponse } from "http";
import { loggingService as log } from "./main-logging.service";
import * as path from "path";
import * as fs from "fs";
import * as helpers from "./helpers";
import * as videoDbDataService from "./videoDbData.service";
import { spawn, execSync } from "child_process";

export function serveLocalFile(req: IncomingMessage, res: ServerResponse) {
  if (!req.url) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Missing URL.");
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const filePath = decodeURIComponent(url.searchParams.get("path") || "");
  if (!filePath) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Missing 'path' search parameter.");
    return;
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("File not found.");
    return;
  }

  // Determine the content type based on the file extension
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".mp4": "video/mp4",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".vtt": "text/vtt",
  };
  const contentType = mimeTypes[ext] || "application/octet-stream";

  const statData = fs.statSync(filePath);
  const fileSize = statData.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    if (start >= fileSize) {
      res.writeHead(416, { "Content-Range": `bytes */${fileSize}` });
      res.end();
      return;
    }
    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": contentType,
    });
    fileStream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": contentType,
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

export function convertSrtToVtt(srtFilePath: string): string {
  if (path.extname(srtFilePath).toLowerCase() !== ".srt") {
    throw new Error("Invalid file type. Expected a .srt file.");
  }

  // Determine the .vtt file path
  const vttFilePath = srtFilePath.replace(/\.srt$/i, ".vtt");
  // Check if .vtt file already exists and return if it does
  if (fs.existsSync(vttFilePath)) {
    return vttFilePath;
  }

  try {
    // Read the .srt file content
    const srtContent = fs.readFileSync(srtFilePath, { encoding: "utf-8" });

    // Convert .srt to .vtt:
    // 1. Prepend 'WEBVTT' header.
    // 2. Replace commas with periods in timestamp lines.
    const vttContent =
      "WEBVTT\n\n" +
      srtContent
        .split("\n")
        .map((line) => {
          const timestampRegex =
            /^(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/;
          if (timestampRegex.test(line)) {
            return line.replace(/,/g, ".");
          }
          return line;
        })
        .join("\n");

    // Write the new .vtt file
    fs.writeFileSync(vttFilePath, vttContent, { encoding: "utf-8" });
    // Delete the original .srt file after successful conversion
    fs.unlinkSync(srtFilePath);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `Error converting ${srtFilePath} to VTT: ${error.message}`,
      );
    } else {
      throw new Error(`Error converting ${srtFilePath} to VTT: Unknown error`);
    }
  }

  // Return the full file path of the created .vtt file
  return vttFilePath;
}

export function convertVttToSrt(vttFilePath: string): string {
  if (path.extname(vttFilePath).toLowerCase() !== ".vtt") {
    throw new Error("Invalid file type. Expected a .vtt file.");
  }

  // Determine the .srt file path 
  const srtFilePath = vttFilePath.replace(/\.vtt$/i, ".srt");

  try {
    // Read the .vtt file content
    const vttContent = fs.readFileSync(vttFilePath, { encoding: "utf-8" });

    // Convert .vtt to .srt:
    // 1. Remove 'WEBVTT' header and any styling info
    // 2. Replace periods with commas in timestamp lines
    // 3. Add sequence numbers
    const lines = vttContent.split("\n");
    const srtLines: string[] = [];
    let subtitleIndex = 1;
    let i = 0;

    // Skip WEBVTT header and any initial content until first timestamp
    while (i < lines.length && !lines[i].match(/^\d{2}:\d{2}:\d{2}\.\d{3}/)) {
      i++;
    }

    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Check if this is a timestamp line
      const timestampRegex = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
      if (timestampRegex.test(line)) {
        // Add sequence number
        srtLines.push(subtitleIndex.toString());
        // Convert timestamp format (periods to commas)
        srtLines.push(line.replace(/\./g, ","));
        
        // Collect subtitle text lines until next timestamp or empty line
        i++;
        const textLines: string[] = [];
        while (i < lines.length && lines[i].trim() && !timestampRegex.test(lines[i].trim())) {
          const textLine = lines[i].trim();
          if (textLine) {
            textLines.push(textLine);
          }
          i++;
        }
        
        // Add text lines
        textLines.forEach(textLine => srtLines.push(textLine));
        
        // Add empty line between subtitles
        srtLines.push("");
        subtitleIndex++;
      } else {
        i++;
      }
    }

    // Write the new .srt file
    fs.writeFileSync(srtFilePath, srtLines.join("\n"), { encoding: "utf-8" });

    // Return the full file path of the created .srt file
    return srtFilePath;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error converting ${vttFilePath} to SRT: ${error.message}`);
    } else {
      throw new Error(`Error converting ${vttFilePath} to SRT: Unknown error`);
    }
  }
}

export function adjustSubtitleTiming(
  vttFilePath: string,
  adjustmentMs: number,
  increase = true
): string {

  console.log(`Adjusting subtitle timing in ${vttFilePath} by ${increase ? '+' : '-'}${adjustmentMs}ms`);
  // Validate file extension
  if (path.extname(vttFilePath).toLowerCase() !== ".vtt") {
    throw new Error("Invalid file type. Expected a .vtt file.");
  }

  // Check if file exists
  if (!fs.existsSync(vttFilePath)) {
    throw new Error(`VTT file not found: ${vttFilePath}`);
  }

  try {
    // Read the VTT file content
    const vttContent = fs.readFileSync(vttFilePath, { encoding: "utf-8" });

    // Process each line
    const adjustedContent = vttContent
      .split("\n")
      .map((line) => {
        // Match timestamp lines (HH:MM:SS.mmm --> HH:MM:SS.mmm)
        const timestampRegex = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
        const match = timestampRegex.exec(line);
        
        if (match) {
          // Parse start timestamp
          const startHours = parseInt(match[1], 10);
          const startMinutes = parseInt(match[2], 10);
          const startSeconds = parseInt(match[3], 10);
          const startMs = parseInt(match[4], 10);
          
          // Parse end timestamp  
          const endHours = parseInt(match[5], 10);
          const endMinutes = parseInt(match[6], 10);
          const endSeconds = parseInt(match[7], 10);
          const endMs = parseInt(match[8], 10);
          
          // Convert to total milliseconds
          const startTotalMs = (startHours * 3600 + startMinutes * 60 + startSeconds) * 1000 + startMs;
          const endTotalMs = (endHours * 3600 + endMinutes * 60 + endSeconds) * 1000 + endMs;
          
          // Adjust timing
          const adjustment = increase ? adjustmentMs : -adjustmentMs;
          const newStartTotalMs = Math.max(0, startTotalMs + adjustment);
          const newEndTotalMs = Math.max(0, endTotalMs + adjustment);
          
          // Convert back to timestamp format
          const formatTimestamp = (totalMs: number): string => {
            const hours = Math.floor(totalMs / 3600000);
            const minutes = Math.floor((totalMs % 3600000) / 60000);
            const seconds = Math.floor((totalMs % 60000) / 1000);
            const ms = totalMs % 1000;
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
          };
          
          const newStartTime = formatTimestamp(newStartTotalMs);
          const newEndTime = formatTimestamp(newEndTotalMs);
          
          return `${newStartTime} --> ${newEndTime}`;
        }
        
        // Return line unchanged if it's not a timestamp
        return line;
      })
      .join("\n");

    // Write the adjusted content back to the file
    fs.writeFileSync(vttFilePath, adjustedContent, { encoding: "utf-8" });
    
    log.info(`Subtitle timing adjusted by ${increase ? '+' : '-'}${adjustmentMs}ms in: ${vttFilePath}`);
    
    return vttFilePath;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error adjusting subtitle timing in ${vttFilePath}: ${error.message}`);
    } else {
      throw new Error(`Error adjusting subtitle timing in ${vttFilePath}: Unknown error`);
    }
  }
}

export function syncSubtitleWithAlass(
  videoFilePath: string,
  subtitleFilePath: string,
  options?: {
    splitPenalty?: number; // 0-1000, default 7
    noSplits?: boolean; // only shift, don't introduce splits
    outputPath?: string; // custom output path, otherwise replaces original
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(`🎯 Starting alass subtitle sync...`);
    console.log(`📹 Video: ${videoFilePath}`);
    console.log(`📄 Subtitle: ${subtitleFilePath}`);
    
    // Debug: Check PATH and alass location
    console.log(`🔍 Debugging PATH and alass location:`);
    console.log(`PATH: ${process.env.PATH}`);
    console.log(`Platform: ${process.platform}`);
    
    // Try to find alass.bat in common locations
    const possiblePaths = [
      'C:\\alass\\alass.bat', // User's actual alass location
      'alass.bat', // Try PATH second
      'C:\\tools\\alass\\alass.bat',
      process.env.USERPROFILE + '\\alass\\alass.bat',
      process.env.USERPROFILE + '\\Downloads\\alass\\alass.bat',
      process.env.USERPROFILE + '\\Desktop\\alass\\alass.bat'
    ];
    
    let alassPath = null;
    for (const testPath of possiblePaths) {
      if (testPath === 'alass.bat' || fs.existsSync(testPath)) {
        alassPath = testPath;
        console.log(`✅ Found alass at: ${alassPath}`);
        break;
      }
    }
    
    // If we found alass.bat via PATH, try to get the full path
    if (alassPath === 'alass.bat') {
      console.log('🔍 Attempting to resolve full path for alass.bat...');
      try {
        // Try to get the full path using where command
        const fullPath = execSync('where alass.bat', { encoding: 'utf8' }).toString().trim().split('\n')[0];
        if (fullPath && fs.existsSync(fullPath)) {
          alassPath = fullPath;
          console.log(`✅ Resolved full path: ${alassPath}`);
        }
      } catch (error) {
        console.log('⚠️  Could not resolve full path, will use alass.bat as-is');
      }
    }
    
    if (!alassPath) {
      console.log('❌ Could not find alass.bat in any common location');
      console.log('🔍 Please tell me where you put the alass files');
      reject(new Error('alass.bat not found. Please provide the full path to alass.bat'));
      return;
    }
    
    // Validate inputs
    if (!fs.existsSync(videoFilePath)) {
      reject(new Error(`Video file not found: ${videoFilePath}`));
      return;
    }
    
    if (!fs.existsSync(subtitleFilePath)) {
      reject(new Error(`Subtitle file not found: ${subtitleFilePath}`));
      return;
    }
    
    // Check subtitle format and convert if needed
    const subtitleExt = path.extname(subtitleFilePath).toLowerCase();
    let workingSubtitlePath = subtitleFilePath;
    let isVttConversion = false;
    let tempSrtPath = '';
    
    if (subtitleExt === '.vtt') {
      console.log('📝 Converting VTT to SRT for alass compatibility...');
      try {
        tempSrtPath = convertVttToSrt(subtitleFilePath);
        workingSubtitlePath = tempSrtPath;
        isVttConversion = true;
        console.log(`✅ Temporary SRT created: ${tempSrtPath}`);
      } catch (error) {
        reject(new Error(`Failed to convert VTT to SRT: ${error instanceof Error ? error.message : 'Unknown error'}`));
        return;
      }
    } else if (!['.srt', '.ssa', '.ass'].includes(subtitleExt)) {
      reject(new Error(`Unsupported subtitle format: ${subtitleExt}. alass supports .srt, .ssa, .ass, and .vtt (via conversion) formats.`));
      return;
    }
    
    // Determine output path for the working format
    const workingExt = path.extname(workingSubtitlePath);
    const workingBaseName = path.basename(workingSubtitlePath, workingExt);
    const workingDir = path.dirname(workingSubtitlePath);
    const workingOutputPath = options?.outputPath || path.join(workingDir, `${workingBaseName}_synced${workingExt}`);
    
    console.log(`💾 Output will be saved to: ${workingOutputPath}`);
    
    // Build alass command arguments - quote paths that contain spaces
    const quotePath = (path: string) => path.includes(' ') ? `"${path}"` : path;
    const args = [quotePath(videoFilePath), quotePath(workingSubtitlePath), quotePath(workingOutputPath)];
    
    // Add optional parameters
    if (options?.splitPenalty !== undefined) {
      args.push('--split-penalty', options.splitPenalty.toString());
    }
    
    if (options?.noSplits) {
      args.push('--no-splits');
    }
    
    console.log(`🚀 Running: ${alassPath} ${args.join(' ')}`);
    
    // Spawn alass process - use shell:true on Windows to handle paths with spaces
    const alassProcess = spawn(alassPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32' // Use shell on Windows to handle paths with spaces
    });
    
    let stdout = '';
    let stderr = '';
    
    alassProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
      const output = data.toString().trim();
      if (output) {
        console.log(`📝 alass: ${output}`);
      }
    });
    
    alassProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
      const errorOutput = data.toString().trim();
      if (errorOutput) {
        console.log(`🔧 alass stderr: ${errorOutput}`);
      }
    });
    
    alassProcess.on('close', (code) => {
      console.log(`🏁 alass process completed with exit code: ${code}`);
      
      if (code === 0) {
        // Verify the synced file was created
        if (fs.existsSync(workingOutputPath)) {
          console.log(`✅ Subtitle sync completed successfully!`);
          console.log(`📁 Synced subtitle: ${workingOutputPath}`);
          
          let finalOutputPath = workingOutputPath;
          
          // If we converted VTT to SRT, convert back to VTT
          if (isVttConversion) {
            console.log('🔄 Converting synced SRT back to VTT...');
            try {
              const finalVttPath = convertSrtToVtt(workingOutputPath);
              finalOutputPath = finalVttPath;
              console.log(`✅ Converted back to VTT: ${finalVttPath}`);
              
              // Clean up temporary SRT files
              if (fs.existsSync(tempSrtPath)) {
                fs.unlinkSync(tempSrtPath);
                console.log(`🗑️ Cleaned up temporary SRT: ${tempSrtPath}`);
              }
            } catch (error) {
              // Clean up temporary files even on error
              if (fs.existsSync(tempSrtPath)) fs.unlinkSync(tempSrtPath);
              if (fs.existsSync(workingOutputPath)) fs.unlinkSync(workingOutputPath);
              reject(new Error(`Failed to convert synced SRT back to VTT: ${error instanceof Error ? error.message : 'Unknown error'}`));
              return;
            }
          }
          
          // If no custom output path was specified, replace the original file
          if (!options?.outputPath) {
            try {
              // Create backup of original
              const backupPath = subtitleFilePath + '.backup';
              console.log(`💾 Creating backup: ${backupPath}`);
              fs.copyFileSync(subtitleFilePath, backupPath);
              
              // Replace original with synced version
              console.log(`🔄 Replacing original with synced version`);
              if (isVttConversion) {
                // For VTT files, the finalOutputPath is already the VTT file
                fs.copyFileSync(finalOutputPath, subtitleFilePath);
                // Clean up the converted VTT file since we've copied it
                fs.unlinkSync(finalOutputPath);
              } else {
                fs.copyFileSync(finalOutputPath, subtitleFilePath);
                // Clean up temporary synced file
                fs.unlinkSync(finalOutputPath);
              }
              
              console.log(`✅ Original subtitle replaced with synced version`);
              resolve(subtitleFilePath);
            } catch (error) {
              reject(new Error(`Failed to replace original subtitle file: ${error}`));
            }
          } else {
            // Custom output path, return the synced file path
            resolve(finalOutputPath);
          }
        } else {
          // Clean up temporary files on failure
          if (isVttConversion && fs.existsSync(tempSrtPath)) {
            fs.unlinkSync(tempSrtPath);
          }
          reject(new Error(`Synced subtitle file was not created: ${workingOutputPath}`));
        }
      } else {
        // Clean up temporary files on failure
        if (isVttConversion && fs.existsSync(tempSrtPath)) {
          fs.unlinkSync(tempSrtPath);
        }
        let errorMessage = `alass process failed with exit code ${code}`;
        if (stderr.trim()) {
          errorMessage += `. Error: ${stderr.trim()}`;
        }
        if (stdout.trim()) {
          errorMessage += `. Output: ${stdout.trim()}`;
        }
        reject(new Error(errorMessage));
      }
    });
    
    alassProcess.on('error', (error) => {
      // Clean up temporary files on error
      if (isVttConversion && fs.existsSync(tempSrtPath)) {
        fs.unlinkSync(tempSrtPath);
      }
      console.error(`❌ Failed to start alass process:`, error);
      let errorMessage = `Failed to start alass process: ${error.message}`;
      
      if (error.message.includes('ENOENT')) {
        errorMessage += '. Make sure alass.bat is installed and available. Please provide the full path to alass.bat if it\'s not in PATH.';
      }
      
      reject(new Error(errorMessage));
    });
    
    // Set a generous timeout (5 minutes) based on docs: 10-20s for audio + 5-10s for alignment
    setTimeout(() => {
      if (!alassProcess.killed) {
        console.warn('⚠️  alass process timeout, killing process...');
        alassProcess.kill('SIGTERM');
        // Clean up temporary files on timeout
        if (isVttConversion && fs.existsSync(tempSrtPath)) {
          fs.unlinkSync(tempSrtPath);
        }
        reject(new Error('Subtitle sync timed out after 5 minutes. This may indicate an issue with the video/subtitle files or alass installation.'));
      }
    }, 5 * 60 * 1000);
  });
}

// Simple test function to verify alass works
export async function testAlass(): Promise<void> {
  console.log('🧪 Testing alass integration...');
  
  try {
    // Find alass.bat in common locations
    const possiblePaths = [
      'alass.bat',
      'C:\\alass\\alass.bat',
      'C:\\tools\\alass\\alass.bat',
      process.env.USERPROFILE + '\\alass\\alass.bat',
      process.env.USERPROFILE + '\\Downloads\\alass\\alass.bat',
      process.env.USERPROFILE + '\\Desktop\\alass\\alass.bat'
    ];
    
    let alassPath = null;
    for (const testPath of possiblePaths) {
      if (testPath === 'alass.bat' || fs.existsSync(testPath)) {
        alassPath = testPath;
        console.log(`✅ Found alass at: ${alassPath}`);
        break;
      }
    }
    
    if (!alassPath) {
      throw new Error('alass.bat not found. Please provide the full path to alass.bat');
    }
    
    // Test that alass.bat can be executed
    const testProcess = spawn(alassPath, ['--help'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });
    
    let output = '';
    
    testProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    testProcess.stderr?.on('data', (data) => {
      output += data.toString();
    });
    
    return new Promise((resolve, reject) => {
      testProcess.on('close', (code) => {
        console.log(`📋 alass.bat test completed with exit code: ${code}`);
        
        if (output.includes('USAGE') || output.includes('alass')) {
          console.log('✅ alass.bat is working correctly!');
          console.log('🎯 Ready to use syncSubtitleWithAlass function');
          console.log('');
          console.log('📝 To test with actual files, call:');
          console.log('   syncSubtitleWithAlass("path/to/video.mp4", "path/to/subtitle.vtt")');
          resolve();
        } else {
          console.log('⚠️  Unexpected output from alass.bat');
          console.log('Output:', output);
          reject(new Error('alass.bat test produced unexpected output'));
        }
      });
      
      testProcess.on('error', (error) => {
        console.error('❌ Failed to run alass.bat test:', error);
        if (error.message.includes('ENOENT')) {
          reject(new Error('alass.bat not found. Make sure you provide the full path to alass.bat'));
        } else {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

export const deleteFile = async (
  filePath: string,
): Promise<{ success: boolean; message: string }> => {
  const normalizedPath = helpers.normalizeFilePath(filePath);

  try {
    await helpers.verifyFileAccess(normalizedPath);
    const { isFile } = await helpers.getFileInfo(normalizedPath);

    const filesToProcess = isFile
      ? [normalizedPath]
      : [
          ...(await helpers.getVideoFilesInChildFolders(normalizedPath)),
          normalizedPath,
        ];

    await updateMetadataFile(filesToProcess);
    await helpers.deleteFileOrFolder(normalizedPath, isFile);

    log.info(normalizedPath, "File or folder permanently deleted:");
    return successResponse(normalizedPath);
  } catch (error: unknown) {
    return handleError(error, normalizedPath);
  }
};

async function updateMetadataFile(filePaths: string[]): Promise<void> {
  if (Array.isArray(filePaths)) {
    filePaths.forEach((filePath) => {
      videoDbDataService.deleteVideo(filePath);
    });
  }
}

function successResponse(path: string): { success: true; message: string } {
  return {
    success: true,
    message: `File or folder permanently deleted: ${path}`,
  };
}

function handleError(
  error: unknown,
  path: string,
): { success: false; message: string } {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const fullMessage = `Error deleting ${path}: ${errorMessage}`;

  log.error(fullMessage);
  return { success: false, message: fullMessage };
}
