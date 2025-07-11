import { rendererLoggingService as log } from "../util/renderer-logging.service";

const secondsTohhmmss = (valueInseconds: number): string => {
  const totalSeconds = Math.round(valueInseconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const h = hours > 0 ? String(hours).padStart(2, "0") + ":" : "";
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");

  return `${h}${m}:${s}`;
};

const sec = (seconds: number): number => {
  return seconds * 1000;
};

const isEmptyObject = (obj: object): boolean => {
  return !Object.keys(obj).length;
};

const getFilename = (filePath: string): string => {
  const parts = filePath.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1];
};

const trimFileName = (fileName: string, maxLength = 15) => {
  const nameWithoutExtension = removeVidExt(fileName);
  return nameWithoutExtension.length > maxLength
    ? `${nameWithoutExtension.substring(0, maxLength)}...`
    : nameWithoutExtension;
};

const getYearFromDate = (dateString: string | undefined): string => {
  return dateString ? dateString.split("-")[0] : "";
};

const getPlayedPercentage = (current: number, total: number) => {
  return total > 0 ? ((current / total) * 100).toFixed(2) : "0.00";
};

const hasExtension = (filename: string) => {
  // The regex ensures there's at least one character after the final dot
  // and the dot is not the first character in the string
  return /\.[^.]+$/.test(filename);
};

const removeVidExt = (filename?: string) => {
  if (!filename) return "";
  return filename.replace(/\.(mp4|mkv|avi)$/i, "");
};

const removeLastSegments = (filePath: string, count: number) => {
  const parts = filePath?.split("/");
  if (count < 1 || count >= parts?.length) {
    log.info("Invalid segment count:", count);
    log.info("Returning original filePath:", filePath);
    return filePath;
  }
  return parts?.slice(0, -count).join("/");
};

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

const getUrl = (
  type: "video" | "file",
  filePath: string | null | undefined,
  start: number | null = null,
  port: string,
) => {
  if (isExternalUrl(filePath)) return filePath;

  return `http://localhost:${port}/${type}?path=${encodeURIComponent(
    filePath || "",
  )}&start=${start || 0}`;
};

const isExternalUrl = (url: string) => {
  return url?.startsWith("http://") || url?.startsWith("https://");
};

const selectFolder = async (): Promise<string | null> => {
  return window.openDialogAPI.openFolderDialog();
};

const selectFile = async (
  fileDialogOptions = [
    { name: ".vtt and .srt files", extensions: ["vtt", "srt"] },
  ],
): Promise<string | null> => {
  return window.openDialogAPI.openFileDialog(fileDialogOptions);
};

const getFileExtension = (filePath: string): string => {
  const match = filePath.match(/\.([^.]+)$/);
  return match ? match[1] : "";
};

function parseIpcError(error: Error) {
  if (!error?.message) return { name: error?.name, message: error?.message };
  const match = error.message.match(/: ([A-Za-z0-9]+Error): (.+)$/);
  if (match) {
    return { name: match[1], message: match[2] };
  }
  return { name: error?.name, message: error?.message };
}

function secondsToHms(value: number | null | undefined): string {
  if (value == null || isNaN(value) || value < 0) {
    return "00:00";
  }

  const totalSeconds = Math.round(value); // No division by 1000 needed
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  if (hours > 0) {
    return [
      hours.toString(),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  } else {
    return [
      minutes.toString(),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  }
}

export {
  secondsTohhmmss,
  isEmptyObject,
  trimFileName,
  getYearFromDate,
  getPlayedPercentage,
  hasExtension,
  removeLastSegments,
  sec,
  getFilename,
  formatDate,
  getUrl,
  selectFolder,
  selectFile,
  removeVidExt,
  getFileExtension,
  parseIpcError,
  secondsToHms,
  formatTime,
};
