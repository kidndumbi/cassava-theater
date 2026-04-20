# Cassava Theater - AI Coding Assistant Instructions

## Project Overview
Cassava Theater is an Electron-based desktop media center application with mobile remote control capabilities. It manages video libraries, provides streaming, YouTube downloads, MP4 conversion, and AI chat features powered by Ollama.

## Architecture Patterns

### Electron Structure
- **Main Process** (`src/index.ts`): Entry point, window management, IPC handler registration
- **Renderer Process** (`src/app.tsx`): React UI with Material-UI, Redux, React Query
- **Preload Script** (`src/preload.ts`): Exposes APIs to renderer via `contextBridge`

### IPC Communication
All IPC follows a strict enum-based pattern:
```typescript
// Define channels in enums/
export enum VideoIPCChannels {
  FetchVideoData = "video:fetchVideosData"
}

// Register handlers in main/ipc-handlers/
ipcMain.handle(VideoIPCChannels.FetchVideoData, async (_event, filePath) => {
  return fetchVideosData({ filePath });
});

// Expose to renderer in preload.ts
contextBridge.exposeInMainWorld("videoAPI", {
  fetchVideosData: (filePath: string) => 
    ipcRenderer.invoke(VideoIPCChannels.FetchVideoData, filePath)
});
```

### Dual Communication System
The app uses **both IPC and Socket.IO**:
- **IPC**: Desktop app communication (main ↔ renderer)
- **Socket.IO**: Mobile remote control (`src/main/services/socket-io/`)

Both systems often mirror the same functionality - implement handlers in both `ipc-handlers/` and `socket-io/` directories.

### Data Storage (LevelDB)
All persistent data uses LevelDB through `src/main/services/levelDB.service.ts`:
```typescript
// Service pattern for each data type
export const putVideo = async (key: KeyType, value: Partial<VideoDataModel>) => {
  const existing = await getVideo(key) || {};
  return levelDBService.put("videos", key, { ...existing, ...value });
};
```

Collections: `videos`, `settings`, `playlists`, `converQueueItems`, `videoScreenshots`, `markedForDelete`.

## Key Services

### Video Processing
- **FFmpeg Integration**: Setup in `src/main/services/setup.service.ts`, used throughout for video operations
- **MP4 Conversion**: Queue-based processing in `src/main/services/mp4Conversion.service.ts`
- **Video Data**: File scanning, thumbnail generation, TMDB metadata in `src/main/services/video-data.service.ts`

### External Integrations
- **TMDB API**: Movie/TV metadata via `src/main/services/themoviedb.service.ts`
- **YouTube Downloads**: ytdl-core integration in `src/main/services/youtube.service.ts`
- **Ollama LLM**: Local AI chat in `src/main/services/llm.service.ts` with streaming support

## Development Workflow

### Commands
- `npm start` - Development with hot reload
- `npm run package` - Build for current platform
- `npm run make` - Create distributables
- `npm run lint` - ESLint check

### File Organization
- Models in `src/models/` - TypeScript interfaces
- Enums in `src/enums/` - IPC channels, events, constants
- Services in `src/main/services/` - Business logic
- React components in `src/renderer/components/`
- Custom hooks in `src/renderer/hooks/`

### Error Handling
Use the custom error service for specific errors:
```typescript
import { PathDoesNotExistError } from "./custom-errors.service";
throw new PathDoesNotExistError(filePath);
```

### Logging
- Main process: `loggingService` from `src/main/services/main-logging.service.ts`
- Renderer: `rendererLoggingService` from `src/renderer/util/renderer-logging.service.ts`

## Socket.IO Pattern
For mobile remote control features:
1. Define events in `src/enums/app-socket-events.enum.ts`
2. Create handlers in `src/main/services/socket-io/[feature]Socket.handlers.ts`
3. Register in `src/main/services/socket-io/socket.service.ts`
4. Use callback pattern for responses:
```typescript
socket.on(AppSocketEvents.GET_VIDEOS_DATA, async (requestData, callback) => {
  try {
    const data = await fetchVideosData(requestData.data);
    callback({ success: true, data });
  } catch (error) {
    callback({ success: false, error: error.message });
  }
});
```

## State Management
- Redux store in `src/renderer/store/`
- React Query for server state
- Local storage for UI preferences via `@uidotdev/usehooks`

## File Path Normalization
Always use `normalizeFilePath()` from `src/main/services/helpers.ts` for consistent path handling across platforms.

## Mobile-First Socket Events
When adding features, consider mobile remote control - most video operations should support both IPC (desktop) and Socket.IO (mobile) interfaces.