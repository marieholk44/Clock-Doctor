# ClockTick Analyzer

A specialized web application for clock repair professionals, leveraging advanced audio-based timing analysis through interactive spectrogram and waveform visualizations.

## Features

- **Audio Recording and Analysis**: Record clock ticking sounds for precise timing analysis.
- **Waveform Visualization**: Real-time visual representation of audio patterns.
- **Spectrogram Display**: Frequency analysis for detecting sound variations.
- **Interval Measurements**: Calculate and analyze time intervals between consecutive sounds.
- **Precision Timing**: Track deviations for clock mechanism diagnostics.
- **Frontend-Only Operation**: No backend dependencies, using localStorage for persistence.

## Running the Application

### Standard Mode (with Backend)

```bash
npm run dev
```

This starts both the backend server and frontend client in development mode.

### Frontend-Only Mode (No Backend)

```bash
npm run dev-frontend
```

This runs the application in frontend-only mode, with all data stored in the browser's localStorage.

## Technical Details

- **Frontend**: React with TypeScript, Tailwind CSS
- **UI Components**: ShadcnUI component library
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Audio Processing**: Web Audio API with custom analyzer
- **Data Storage**: LocalStorage (frontend-only mode)

## Developer Notes

- Backend configuration is stored in `server/` directory but not required for frontend-only mode
- Audio processing configuration can be adjusted in `client/src/lib/audio-processor.ts`
- Visual theme is customizable via `theme.json`

## Building For Production

### Complete Application (Frontend + Backend)

```bash
npm run build
npm run start
```

### Frontend-Only

```bash
npm run build-frontend
```

This creates a standalone frontend build in the `dist/` directory.