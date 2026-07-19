# Cassava Theater

A media player and language learning desktop application built with Electron. Browse and play your local movie and TV show collection, download YouTube videos, generate and sync subtitles, translate content, create language learning exercises from video subtitles, and build vocabulary flashcards.

## Features

### Media Library
- Browse local movie and TV show collections
- Automatic metadata fetching from TheMovieDB
- Poster and backdrop image display
- Resume playback from where you left off
- Watch Later list
- Custom folder support

### Video Playback
- Support for MP4, MKV, and AVI formats
- MP4 conversion queue for non-MP4 files
- Subtitle support (SRT/VTT) with language selection (English, Spanish, French)
- Subtitle generation using AI models (via Ollama)
- Subtitle auto-sync with video
- Subtitle translation (via LibreTranslate)
- Theater mode and fullscreen
- Playback speed control

### YouTube Downloads
- Download videos from YouTube directly into your library
- Queue management with drag-and-drop reordering
- Progress tracking per download

### Language Learning
- Create vocabulary flashcards from subtitle words
- Multiple exercise modes (arrange words, fill in missing, spell the blanks, conversation)
- Verb conjugation tagging
- Practice session tracking and statistics
- AI-powered exercise generation (via Ollama LLM)

### Remote Control
- Built-in HTTP + Socket.IO server for mobile remote control
- Play/pause, seek, volume control, episode navigation from any device on your local network
- Browse your library and queue videos remotely

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- **FFmpeg** (for MP4 conversion and subtitle processing)
- **LibreTranslate** (optional, for subtitle translation)
- **Ollama** (optional, for AI-powered subtitle generation and language learning exercises)

## Setup

```bash
# Clone the repository
git clone https://github.com/kidndumbi/cassava-theater.git
cd cassava-theater

# Install dependencies
npm install

# Start the development server
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the app in development mode |
| `npm run package` | Package the app for distribution |
| `npm run make` | Create platform-specific installers |
| `npm run lint` | Run ESLint on the source code |

## Project Structure

```
src/
├── index.ts                 # Electron main process entry point
├── preload.ts               # Preload script (context bridge)
├── renderer.ts              # Renderer process entry point
├── enums/                   # IPC channel and event enums
├── models/                  # TypeScript interfaces and types
├── main/
│   ├── ipc-handlers/        # Electron IPC handler registration
│   ├── services/            # Business logic services
│   │   └── socket-io/       # Socket.IO handlers for remote control
│   └── shared-handlers/     # Unified IPC + Socket.IO handlers
├── renderer/
│   ├── components/          # React components
│   │   ├── common/          # Shared UI components
│   │   ├── home/            # Home page sections
│   │   ├── movies/          # Movie browsing
│   │   ├── playlists/       # Playlist management
│   │   ├── tv-shows/        # TV show browsing
│   │   └── video-player/    # Video player UI
│   ├── contexts/            # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page-level components
│   ├── store/               # Redux store and slices
│   └── util/                # Renderer-side utilities
```

## Configuration

The application stores settings in a local LevelDB database. Key configuration options include:

- **Movie folder path** – Root directory for your movie files
- **TV Shows folder path** – Root directory for your TV show files
- **Custom folders** – Additional video directories
- **Library Translate URL** – URL for the translation service (default: `http://localhost:5000`)
- **Port** – HTTP server port for remote control (default: `5000`)
- **Play non-MP4 videos** – Toggle playback of MKV/AVI files

## Technologies

- **Runtime**: Electron 34
- **UI**: React 19, Material UI 6, Tailwind CSS 3
- **State Management**: Redux Toolkit, React Query (TanStack)
- **Build**: Webpack 5, Electron Forge
- **Database**: LevelDB (via `classic-level`)
- **Video**: Fluent-FFmpeg, ffprobe-static
- **AI/ML**: Ollama integration for LLM-powered features
- **Remote Control**: Socket.IO, Express

## Architecture Decisions

The app uses a **shared handler** architecture for its communication layer. Each feature domain (videos, playlists, settings, etc.) has a single handler module that registers both Electron IPC handlers (for the desktop UI) and Socket.IO handlers (for the mobile remote control). This prevents code duplication and ensures both transport layers behave identically.

Error handling uses a `Result<T>` pattern with an `AppError` class that preserves original error stack traces, rather than ad-hoc `throw`/`return null` patterns.

## License

MIT