import { BrowserWindow } from "electron";
import { Server as SocketIoServer } from "socket.io";

/**
 * Application context singleton that holds references to core runtime objects
 * that were previously managed via global mutable variables:
 * - mainWindow (was setMainWindow/getMainWindow in mainWindowManager.ts)
 * - socketIo (was setSocketIoGlobal/getSocketIoGlobal in socketGlobalManager.ts)
 *
 * This centralized context improves testability by allowing dependency injection
 * rather than relying on module-level mutable state.
 */
class AppContext {
  private mainWindow: BrowserWindow | null = null;
  private socketIo: SocketIoServer | null = null;

  // --- Main Window ---

  setMainWindow(window: BrowserWindow | null): void {
    this.mainWindow = window;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /** Throws if mainWindow is null — use when the window MUST exist */
  getMainWindowOrThrow(): BrowserWindow {
    if (!this.mainWindow) {
      throw new Error("Main window is not initialized");
    }
    return this.mainWindow;
  }

  // --- Socket.IO ---

  setSocketIo(io: SocketIoServer | null): void {
    this.socketIo = io;
  }

  getSocketIo(): SocketIoServer | null {
    return this.socketIo;
  }
}

export const appContext = new AppContext();