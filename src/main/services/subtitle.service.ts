import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { loggingService as log } from "./main-logging.service";
import { normalizeFilePath } from "./helpers";
import { 
  SubtitleGeneration, 
  SubtitleGenerationRequest, 
  SubtitleGenerationResponse 
} from "../../models/subtitle.model";
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for active subtitle generation jobs
const activeJobs = new Map<string, SubtitleGeneration>();

export const generateSubtitles = async (
  request: SubtitleGenerationRequest
): Promise<SubtitleGenerationResponse> => {
  const jobId = uuidv4();
  const normalizedVideoPath = normalizeFilePath(request.videoPath);
  
  // Validate video file exists
  try {
    await fs.access(normalizedVideoPath);
  } catch (error) {
    log.error(`Video file not found: ${normalizedVideoPath}`, error);
    return {
      success: false,
      error: "Video file not found",
      jobId
    };
  }

  // Determine output path and format
  const videoDir = path.dirname(normalizedVideoPath);
  const videoBaseName = path.parse(normalizedVideoPath).name;
  const format = request.format || 'vtt';
  const subtitlePath = path.join(videoDir, `${videoBaseName}.${format}`);
  
  // Check if subtitle already exists
  try {
    await fs.access(subtitlePath);
    log.info(`Subtitle file already exists: ${subtitlePath}`);
    return {
      success: true,
      subtitlePath,
      jobId
    };
  } catch {
    // Subtitle doesn't exist, proceed with generation
  }

  // Create job entry
  const job: SubtitleGeneration = {
    videoPath: normalizedVideoPath,
    subtitlePath,
    status: 'pending',
    language: request.language || 'en',
    format,
    createdAt: new Date()
  };
  
  activeJobs.set(jobId, job);

  // Start subtitle generation asynchronously
  generateSubtitlesAsync(jobId, normalizedVideoPath, subtitlePath, request)
    .catch(error => {
      log.error(`Subtitle generation failed for job ${jobId}:`, error);
      const job = activeJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
      }
    });

  return {
    success: true,
    jobId
  };
};

const generateSubtitlesAsync = async (
  jobId: string,
  videoPath: string,
  subtitlePath: string,
  request: SubtitleGenerationRequest
): Promise<void> => {
  const job = activeJobs.get(jobId);
  if (!job) return;

  job.status = 'generating';
  log.info(`🎬 Starting subtitle generation for: ${path.basename(videoPath)}`);
  log.info(`📂 Video directory: ${path.dirname(videoPath)}`);
  log.info(`🎯 Target subtitle file: ${subtitlePath}`);
  
  return new Promise<void>((resolve, reject) => {
    const videoDir = path.dirname(videoPath);
    const args = [
      videoPath,
      '--output_format', request.format || 'vtt',
      '--output_dir', videoDir,  // Explicitly use video directory
      '--model', request.model || 'base'
    ];

    // Add language if specified
    if (request.language) {
      args.push('--language', request.language);
    }

    log.info(`Starting Whisper subtitle generation for: ${path.basename(videoPath)}`);
    log.info(`Output directory: ${videoDir}`);
    log.info(`Expected subtitle file: ${subtitlePath}`);
    log.debug(`Whisper command args:`, args);

    const whisperProcess = spawn('whisper', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    log.info(`🚀 Whisper process started with PID: ${whisperProcess.pid}`);
    
    // Set up a heartbeat to show the process is still running
    const heartbeatInterval = setInterval(() => {
      if (job && job.status === 'generating') {
        log.info(`⏳ Subtitle generation in progress... (PID: ${whisperProcess.pid})`);
      }
    }, 10000); // Log every 10 seconds

    let stdout = '';
    let stderr = '';

    whisperProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
      const output = data.toString().trim();
      if (output) {
        log.info(`📝 Whisper stdout: ${output}`);
      }
      // Try to parse progress from whisper output if possible
      const progressMatch = stdout.match(/(\d+)%/);
      if (progressMatch && job) {
        job.progress = parseInt(progressMatch[1]);
        log.info(`📊 Subtitle generation progress: ${job.progress}%`);
      }
    });

    whisperProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
      const errorOutput = data.toString().trim();
      if (errorOutput) {
        // Don't log FP16 warning as error - it's normal
        if (errorOutput.includes('FP16 is not supported on CPU')) {
          log.info(`ℹ️  Whisper info: Using FP32 instead of FP16 (normal for CPU)`);
        } else if (errorOutput.includes('Detecting language')) {
          log.info(`🔍 Whisper: ${errorOutput}`);
        } else if (errorOutput.includes('loading model')) {
          log.info(`📂 Whisper: ${errorOutput}`);
        } else {
          log.info(`🔧 Whisper: ${errorOutput}`);
        }
      }
    });

    whisperProcess.on('close', async (code) => {
      clearInterval(heartbeatInterval); // Stop the heartbeat
      const job = activeJobs.get(jobId);
      if (!job) return;

      log.info(`🏁 Whisper process completed with exit code: ${code}`);

      if (code === 0) {
        try {
          // Verify the subtitle file was created
          await fs.access(subtitlePath);
          job.status = 'completed';
          job.completedAt = new Date();
          log.info(`✅ Subtitle generation completed successfully!`);
          log.info(`📁 Subtitle file created: ${subtitlePath}`);
          resolve();
        } catch (error) {
          log.error(`❌ Subtitle file not found after generation: ${subtitlePath}`);
          job.status = 'failed';
          job.error = 'Subtitle file not created';
          reject(new Error('Subtitle file not created'));
        }
      } else {
        const errorMessage = `Whisper process failed with exit code ${code}`;
        if (stderr.trim()) {
          log.error(`${errorMessage}. Error output: ${stderr.trim()}`);
        } else {
          log.error(errorMessage);
        }
        job.status = 'failed';
        job.error = errorMessage;
        reject(new Error(errorMessage));
      }
    });

    whisperProcess.on('error', (error) => {
      clearInterval(heartbeatInterval); // Stop the heartbeat
      log.error(`❌ Failed to start Whisper process:`, error);
      const job = activeJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = `Failed to start Whisper: ${error.message}`;
      }
      reject(error);
    });
  });
};

export const checkSubtitleStatus = (jobId: string): SubtitleGeneration | null => {
  return activeJobs.get(jobId) || null;
};

export const getExistingSubtitles = async (videoPath: string): Promise<string[]> => {
  const normalizedVideoPath = normalizeFilePath(videoPath);
  const videoDir = path.dirname(normalizedVideoPath);
  const videoBaseName = path.parse(normalizedVideoPath).name;
  
  const subtitleExtensions = ['srt', 'vtt', 'ass'];
  const existingSubtitles: string[] = [];
  
  for (const ext of subtitleExtensions) {
    const subtitlePath = path.join(videoDir, `${videoBaseName}.${ext}`);
    try {
      await fs.access(subtitlePath);
      existingSubtitles.push(subtitlePath);
    } catch {
      // Subtitle file doesn't exist, continue
    }
  }
  
  return existingSubtitles;
};

export const cleanupCompletedJobs = () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  for (const [jobId, job] of activeJobs.entries()) {
    if ((job.status === 'completed' || job.status === 'failed') && 
        job.completedAt && job.completedAt < oneHourAgo) {
      activeJobs.delete(jobId);
    }
  }
};

// Clean up old jobs every hour
setInterval(cleanupCompletedJobs, 60 * 60 * 1000);