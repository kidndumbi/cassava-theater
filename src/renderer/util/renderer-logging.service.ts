import log from "electron-log/renderer";

class RendererLoggingService {
  private isProduction: boolean | undefined;
  private context: string = " [Renderer] ";

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

  log(message: string, ...args: any[]) {
    this.ensureIsProductionSet(() => {
      if (this.isProduction) {
        log.log(this.context + message, ...args);
      } else {
        console.log(message, ...args);
      }
    });
  }

  info(message: string, ...args: any[]) {
    this.ensureIsProductionSet(() => {
      if (this.isProduction) {
        log.info(this.context + message, ...args);
      } else {
        console.info(message, ...args);
      }
    });
  }

  warn(message: string, ...args: any[]) {
    this.ensureIsProductionSet(() => {
      if (this.isProduction) {
        log.warn(this.context + message, ...args);
      } else {
        console.warn(message, ...args);
      }
    });
  }

  error(message: string, ...args: any[]) {
    this.ensureIsProductionSet(() => {
      if (this.isProduction) {
        log.error(this.context + message, ...args);
      } else {
        console.error(message, ...args);
      }
    });
  }

  debug(message: string, ...args: any[]) {
    this.ensureIsProductionSet(() => {
      if (this.isProduction) {
        log.debug(this.context + message, ...args);
      } else {
        console.debug(message, ...args);
      }
    });
  }
}

const rendererLoggingService = new RendererLoggingService();
export { rendererLoggingService };
