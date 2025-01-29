import _ from "lodash";
// import { basename, extname } from "path";

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

// const getFilename = (filePath: string): string => {
//   return basename(filePath);
// };

// const getFilenameWithoutExtension = (filePath: string): string => {
//   return basename(filePath, extname(filePath));
// };

const trimFileName = (fileName: string, maxLength: number = 20) => {
  const nameWithoutExtension = fileName.replace(/\.mp4$/, "");
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
    console.error("Invalid segment count:", count);
    return filePath;
  }
  return parts?.slice(0, -count).join("/");
};

export {
  secondsTohhmmss,
  isEmptyObject,
//   getFilename,
//   getFilenameWithoutExtension,
  trimFileName,
  getYearFromDate,
  getPlayedPercentage,
  hasExtension,
  removeLastSegments,
  sec,
};
