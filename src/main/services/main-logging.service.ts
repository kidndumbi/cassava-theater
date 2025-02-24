import log from "electron-log/main";
import { app } from "electron";

class LoggingService {
  private isProduction: boolean;
  private context = " [Main] ";

  constructor() {
    this.isProduction = app.isPackaged;
  }

  info(message: string, ...args: unknown[]) {
    if (this.isProduction) {
      log.info(this.context + message, ...args);
    } else {
      console.info(message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.isProduction) {
      log.warn(this.context + message, ...args);
    } else {
      console.warn(message, ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    if (this.isProduction) {
      log.error(this.context + message, ...args);
    } else {
      console.error(message, ...args);
    }
  }

  debug(message: string, ...args: unknown[]) {
    if (this.isProduction) {
      log.debug(this.context + message, ...args);
    } else {
      console.debug(message, ...args);
    }
  }
}

const loggingService = new LoggingService();
export { loggingService };
