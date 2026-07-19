import { registerIpcHandlers as registerAllIpcHandlers } from "../shared-handlers/register-all-handlers";

/**
 * Registers all IPC handlers for the Electron main process.
 * Delegates to the shared-handlers infrastructure which consolidates
 * both IPC and Socket.IO registration into a single source of truth per domain.
 */
export function registerIpcHandlers() {
  registerAllIpcHandlers();
}