# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A collection of independent mini projects served under trevorhreed.com via GitHub Pages. Built with Vite, using two custom plugins for image resizing and data processing.

## Commands

- **Dev server**: `npm run dev`
- **Build**: `npm run build`
- **Preview built site**: `npm run preview`

No tests or linter configured.

## Deployment

- Branch `release` is the main/deploy branch
- Pushing to `release` triggers GitHub Actions: `npm ci` → `npm run build` → deploys `dist/` to GitHub Pages
- PR workflow runs the same build as a check

## Project Structure

```
src/
  images/                # Source images (input to sharp resize)
    images.config.yaml   # Glob patterns → sizes mapping
    profiles/            # Profile photos
  data/                  # Data source definitions (YAML)
    youtube-movies.yaml  # → dist/data/youtube-movies.json
  public/                # Static assets copied as-is to dist/
    CNAME
  site/                  # Vite source - each subdirectory is an independent mini project
    index.html           # Personal homepage (hash-based section routing)
    styles.scss          # Homepage styles
    script.js            # Homepage client-side routing
    pid/                 # PID generator tool
    youtube/             # Movie search app
    tabs/me/             # Personal browser new-tab page (petite-vue, seasonal backgrounds)
    dev/                 # Interactive terminal page
plugins/                 # Custom Vite plugins
  image-resize.js        # Reads images.config.yaml, resizes with sharp → dist/images/
  data-pipeline.js       # Processes src/data/ (scripts, transforms, YAML→JSON) → dist/data/
youtube-library/         # Offline Node scripts for movie data (separate package.json)
```

## Build Pipeline

All handled by `vite build` via two custom plugins:

1. **image-resize plugin** - reads `src/images/images.config.yaml`, globs source images, resizes with sharp to specified widths, emits to `dist/images/` with `_<width>` suffix (served via middleware in dev)
2. **data-pipeline plugin** - processes `src/data/*.yaml` files. Each YAML file is a config: `script` (dynamic, runs a module returning data), `data` (static, inline data), `transforms` (singleton or array of transform modules). Emits JSON to `dist/data/` (served via middleware in dev)
3. **Vite** - compiles `src/site/` + copies `src/public/` → `dist/`

## images.config.yaml

Glob patterns map source images to resize widths. Most specific match wins, falls back to `defaults`:

```yaml
defaults:
  - 400
  - 800
"profiles/*.jpg":
  - 200
  - 400
```

## Data Files

YAML files in `src/data/` define data sources. Output path defaults to `dist/data/<filename>.json`:

```yaml
# dynamic - script produces the data
script: path/to/script.js
transforms:
  - path/to/transform.js

# static - inline data
data:
  - title: "Example"
```

## Key Details

- Node >= 20 required
- The `[hide]` attribute in HTML hides elements via CSS
- Custom `[link]` attribute drives hash-based navigation on the homepage
- The tab page uses petite-vue (CDN import) and seasonal background images
- Generated images and data are emitted directly to `dist/` at build time (not staged through `src/public/`)
