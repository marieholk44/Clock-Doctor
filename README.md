# ClockTick Analyzer

A specialized web application for clock repair professionals, leveraging advanced audio-based timing analysis through interactive spectrogram and waveform visualizations.

![ClockTick Analyzer](https://via.placeholder.com/800x400?text=ClockTick+Analyzer)

## About the Application

ClockTick Analyzer is a tool designed specifically for clock repair technicians to analyze the timing accuracy of mechanical clocks. The application:

- Records audio from mechanical clocks
- Displays waveform visualizations for timing analysis
- Shows spectrogram visualizations for frequency analysis
- Measures intervals between consecutive sounds (ticks and tocks)
- Calculates beat frequency and timing deviation
- Provides in-depth analysis of time-keeping accuracy

## Key Features

- **Audio Recording**: Capture clock sounds with microphone selection
- **Real-time Analysis**: Process and analyze audio in real-time
- **Waveform Display**: Visualize amplitude patterns of clock sounds
- **Spectrogram View**: Analyze frequency components of each tick
- **Timing Calculations**: Measure intervals between consecutive sounds
- **Deviation Detection**: Identify inconsistencies in timing
- **Frontend-only Mode**: Works entirely in the browser with localStorage

## Technical Details

- Built with React and TypeScript
- Uses Web Audio API for audio processing
- Canvas-based visualization for waveform and spectrogram
- Frontend-only application with localStorage for data persistence
- No backend dependencies

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Start the development server with `npm run dev`
4. Open your browser to the displayed URL

## Deployment

This application is designed to be deployed to Netlify as a frontend-only application. See the [GitHub and Netlify Deployment Guide](GITHUB_NETLIFY_DEPLOYMENT.md) for detailed instructions.

## Using the Application

1. **Connect a microphone** and select the appropriate input device
2. **Adjust sensitivity** using the threshold and noise reduction controls
3. **Start recording** to begin capturing clock sounds
4. **Review measurements** in the timing analysis section
5. **Analyze waveform** to visualize the timing pattern
6. **Examine spectrogram** to identify frequency characteristics

## For Clock Repair Technicians

This tool helps you:
- Diagnose timing issues in mechanical clocks
- Measure beat accuracy and consistency
- Detect irregular patterns in escapement mechanisms
- Identify problems in the clockwork that affect timing
- Document improvements after repairs

## License

MIT License