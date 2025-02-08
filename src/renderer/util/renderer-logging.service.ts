import log from "electron-log/renderer";

class RendererLoggingService {
  private isProduction: boolean | undefined;
  private context = " [Renderer] ";

  constructor() {
    window.mainUtilAPI.isPackaged().then((isPackaged: boolean) => {
      this.isProduction = isPackaged;
    });
  }

  private ensureIsProductionSet(callback: () => void) {
    if (this.isProduction !== undefined) {
      callback();
    } else {
      window.mainUtilAPI.isPackaged().then((isPackaged: boolean) => {
        this.isProduction = isPackaged;
        callback();
      });
    }
  }

  private getCallerFile() {
    const stack = new Error().stack;
    if (!stack) return "";
    const stackLines = stack.split("\n");
    // Adjust the index based on the stack trace structure
    for (let i = 2; i < stackLines.length; i++) {
      const line = stackLines[i];
      if (!line.includes("renderer-logging.service.ts")) {
        const match = line.match(/\((.*):\d+:\d+\)/);
        if (match) {
          return match[1] + " ";
        }
      }
    }
    return "";
  }

  log(message: string, ...args: unknown[]) {
    this.ensureIsProductionSet(() => {
      const file = this.getCallerFile();
      const logMessage = `${file}${this.context}${message}`;
      if (this.isProduction) {
        log.log(logMessage, ...args);
      } else {
        console.log(`${file}${message}`, ...args);
      }
    });
  }

  info(message: string, ...args: unknown[]) {
    this.ensureIsProductionSet(() => {
      const file = this.getCallerFile();
      const logMessage = `${file}${this.context}${message}`;
      if (this.isProduction) {
        log.info(logMessage, ...args);
      } else {
        console.info(`${file}${message}`, ...args);
      }
    });
  }

  warn(message: string, ...args: unknown[]) {
    this.ensureIsProductionSet(() => {
      const file = this.getCallerFile();
      const logMessage = `${file}${this.context}${message}`;
      if (this.isProduction) {
        log.warn(logMessage, ...args);
      } else {
        console.warn(`${file}${message}`, ...args);
      }
    });
  }

  error(message: string, ...args: unknown[]) {
    this.ensureIsProductionSet(() => {
      const file = this.getCallerFile();
      const logMessage = `${file}${this.context}${message}`;
      if (this.isProduction) {
        log.error(logMessage, ...args);
      } else {
        console.error(`${file}${message}`, ...args);
      }
    });
  }

  debug(message: string, ...args: unknown[]) {
    this.ensureIsProductionSet(() => {
      const file = this.getCallerFile();
      const logMessage = `${file}${this.context}${message}`;
      if (this.isProduction) {
        log.debug(logMessage, ...args);
      } else {
        console.debug(`${file}${message}`, ...args);
      }
    });
  }
}

const rendererLoggingService = new RendererLoggingService();
export { rendererLoggingService };
