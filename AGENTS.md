# AGENTS.md

This file provides guidance to AGENTS when working with code in this repository.

## Project Structure

This repository contains two main components:

- **`/reference/watchy`**: Reference implementation of Watchy (Electron desktop app)
- **`/hicc`**: "High C's Cinema" - A React Native TV app targeting Android TV

## Reference Implementation: Watchy

### Location
`/reference/watchy`

### Purpose
Watchy is an **Electron desktop application** for searching P2P content, caching it via AllDebrid, and streaming directly to VLC Media Player. It serves as a reference implementation for the HICC project.

### Key Technologies
- **Electron**: Desktop application framework
- **React + Tailwind CSS**: UI framework and styling
- **electron-vite**: Build tooling
- **AllDebrid API**: Torrent caching and streaming service
- **Apibay API**: P2P/torrent search
- **VLC Media Player**: Video playback
- **better-sqlite3**: Local database for media catalog and posters

### Core Features (for reference)
- Search P2P networks via Apibay API
- Upload magnet links to AllDebrid for caching
- Unlock video files and stream to VLC
- Download unlocked files to device
- Personal library (saved searches, saved magnets)
- Watch history with resume functionality
- Media catalog with poster images

### Architecture Highlights
- **Main Process**: Window management, IPC coordination
- **Preload Script**: Secure IPC bridge
- **Renderer Process**: React-based UI
- **Service Layer**: AllDebrid, scraper, VLC, library, mediaCatalog, posters
- **IPC Communication**: Pattern using `ipcMain.handle()` and `ipcRenderer.invoke()`

**Note**: This code is for reference only. Do not modify unless updating reference to match new patterns.

## HICC: React Native TV App

### Location
`/hicc`

### Purpose
HICC ("High C's Cinema") is a **React Native Android TV application** that reimagines the Watchy experience for the big screen. It's a rewrite/remake of Watchy specifically designed for Android TV platforms.

### Target Platform
**Android TV only** - This project should exclusively target Android TV devices, not mobile phones or tablets.

### Key Technologies
- **React Native**: Cross-platform mobile framework
- **React Navigation**: Navigation between screens
- **react-native-vlc-media-player**: Video playback using VLC
- **axios**: HTTP client for API calls
- **@react-native-async-storage/async-storage**: Local data persistence

### MVP Features
Currently implementing the following core features from Watchy:

1. **Search P2P**: Search Apibay for magnet links
2. **Unlock Magnets**: Unlock magnet links via AllDebrid API
3. **View Files**: Display video files from an unlocked magnet
4. **Play Videos**: Stream video files using VLC player

### Development Commands

```bash
cd hicc

# Start Metro bundler
npm start

# Build and run on Android TV
npm run android

# Lint code
npm run lint

# Run tests
npm test
```

### Android TV Development Notes

- Target minimum SDK: 24 (Android 7.0) or higher
- TV-specific UI considerations: D-pad navigation, focus management, 10-foot interface
- Video player must handle TV-specific events (remote control inputs)
- Consider TV launcher integration and app icon design

### Installation on Android TV Device

See parent directory `README.md` for installation methods using ADB, file manager, or USB drive.

## Development Workflow

When working on HICC:

1. **Reference Watchy** first - Check `/reference/watchy` for patterns, API integration details, and architectural decisions
2. **Adapt for React Native** - Convert Electron/Node.js patterns to React Native equivalents
3. **TV-specific considerations** - Ensure all UI/UX decisions work well with TV remotes and 10-foot interfaces
4. **Test on real device** - Android TV emulator works, but real TV device testing is critical

## Important Notes

- **Do not modify** `/reference/watchy` EVER
- **Always prioritize TV experience** over mobile conventions - TV has different navigation patterns (D-pad, focus) and constraints
- **AllDebrid API key** is required for core functionality (same as Watchy)
- **VLC integration** is critical - TV playback must be smooth and handle remote control inputs

## Future Roadmap

Beyond MVP, potential features include:

- Personal library (saved searches, saved magnets)
- Watch history with resume functionality
- Media catalog integration with posters
- Download to device capability
- Settings/preferences management
