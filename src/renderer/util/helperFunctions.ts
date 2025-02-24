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

const trimFileName = (fileName: string, maxLength = 20) => {
  const nameWithoutExtension = fileName.replace(/\.(mp4|mkv|avi)$/i, "");
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

const getUrl = (
  type: "video" | "file",
  filePath: string | null | undefined,
  start: number | null = null,
  port: string
) => {
  if (isExternalUrl(filePath)) return filePath;

  return `http://localhost:${port}/${type}?path=${encodeURIComponent(
    filePath || ""
  )}&start=${start || 0}`;
};

const isExternalUrl = (url: string) => {
  return url.startsWith("http://") || url.startsWith("https://");
};

const selectFolder = async (): Promise<string | null> => {
  return window.openDialogAPI.openFolderDialog();
};

const selectFile = async (
  fileDialogOptions = [
    { name: ".vtt and .srt files", extensions: ["vtt", "srt"] },
  ]
): Promise<string | null> => {
  return window.openDialogAPI.openFileDialog(fileDialogOptions);
};

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
};
