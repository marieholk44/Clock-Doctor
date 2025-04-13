# GitHub and Netlify Deployment Guide

This guide will help you deploy the ClockTick Analyzer as a frontend-only application to GitHub and Netlify.

## Files Already Prepared

Your codebase has already been prepared for frontend-only deployment with these key files:

1. **clean-for-frontend-only.js** - Script that removes all backend code
2. **build-for-netlify.js** - Script that builds the app specifically for Netlify
3. **package.frontend.json** - Frontend-only package.json configuration
4. **netlify.toml** - Netlify deployment configuration

## Step 1: Clone the Repository Locally

First, clone this repository to your local machine:

```bash
git clone <your-repo-url>
cd <repository-name>
```

## Step 2: Clean up Backend Code

Run the cleanup script to remove all backend-related files:

```bash
node clean-for-frontend-only.js
```

This script will:
- Remove the server/ and shared/ directories
- Remove backend configuration files
- Replace package.json with frontend-only version
- Create netlify.toml configuration

## Step 3: Install Dependencies

After cleanup, install the frontend dependencies:

```bash
npm install
```

## Step 4: Verify Frontend-Only Functionality

Run the development server to verify everything works properly:

```bash
npm run dev
```

Make sure the application runs correctly with in-browser localStorage and the "Frontend-Only Mode" indicator is visible.

## Step 5: Build for Production

Create an optimized production build:

```bash
npm run build
```

This will create a `dist/` directory with the built application.

## Step 6: Push to GitHub

Initialize a new git repository and push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit - Frontend-only version"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Step 7: Deploy to Netlify

### Option 1: Netlify CLI

If you have the Netlify CLI installed:

```bash
netlify deploy --prod
```

Follow the prompts and specify `dist` as the publish directory.

### Option 2: Netlify Web Interface

1. Go to [app.netlify.com](https://app.netlify.com/) and log in
2. Click "Add new site" > "Import an existing project"
3. Connect to your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### Option 3: Drag and Drop

1. Run `npm run build` locally
2. Go to [app.netlify.com](https://app.netlify.com/) and log in
3. Drag and drop the `dist` folder to the Netlify dashboard

## Environment Variables

Make sure to set this environment variable in Netlify:
- `VITE_STANDALONE_MODE`: `true`

## Troubleshooting

If you encounter issues during deployment:

1. **404 errors on page refresh**: Make sure the _redirects file is in your dist folder
2. **Storage issues**: Check browser console for localStorage errors
3. **Audio not working**: Ensure your site is served over HTTPS for audio permissions

## Features of Frontend-Only Version

- All data stored in browser localStorage
- No server requirements or database dependencies
- Full audio recording and analysis capabilities
- Spectrogram and waveform visualization
- Timing analysis for clock ticks

For any questions or issues, please open a GitHub issue in the repository.