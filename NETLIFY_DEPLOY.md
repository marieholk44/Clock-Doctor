# Deploying to Netlify

This document provides steps for deploying the ClockTick Analyzer to Netlify as a frontend-only application.

## Pre-deployment Steps

1. Make sure you're using the frontend-only version of the application
2. Run a test build to verify everything works: `npm run build-frontend`

## Netlify Configuration

Create a `netlify.toml` file in your project root with the following content:

```toml
[build]
  base = "."
  publish = "dist"
  command = "npm run build-frontend"

# Redirects for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Deployment Steps

1. Create a new site on Netlify
2. Connect your repository or upload the built files directly
3. Configure the build settings as follows:
   - Build command: `npm run build-frontend`
   - Publish directory: `dist`
   - Node version: Select an appropriate version (14+ recommended)

4. Add the following environment variables in Netlify:
   - `VITE_STANDALONE_MODE`: Set to `true`

5. Deploy the site

## Post-deployment

After deployment, verify that:
1. The app loads correctly
2. localStorage is working for saving recordings
3. The "Frontend-Only Mode" indicator is visible

## Troubleshooting

If you encounter issues:
1. Check the browser console for errors
2. Verify that localStorage is available and not blocked
3. Ensure all paths in the app are relative rather than absolute