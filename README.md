# WW Operator Pro-Calc

A Progressive Web App (PWA) for wastewater treatment operators. Works offline and can be installed on mobile devices.

## Features

- **7 Essential Calculators:**
  1. Pounds Formula (lbs/day)
  2. SVI – Sludge Volume Index
  3. Mass Balance – Mixed Concentration
  4. F/M Ratio – Food to Microorganism
  5. SRT – Solids Retention Time
  6. Detention Time
  7. Removal Efficiency

- **Detailed Interpretations** – Each result includes operational guidance
- **Works Offline** – Install once, use anywhere
- **Mobile Optimized** – Touch-friendly interface

## Deploy to GitHub Pages

### Option 1: Quick Setup

1. Create a new repository on GitHub
2. Upload all files from this folder
3. Go to **Settings** → **Pages**
4. Under "Source", select **main** branch
5. Click **Save**
6. Your app will be live at: `https://yourusername.github.io/repository-name/`

### Option 2: Using Git

```bash
# Initialize git in this folder
git init

# Add all files
git add .

# Commit
git commit -m "Initial PWA release"

# Add your GitHub repo as remote
git remote add origin https://github.com/yourusername/ww-pro-calc.git

# Push to main branch
git push -u origin main
```

Then enable GitHub Pages in repository settings.

## Install as App

### On Mobile (Android/iOS):
1. Open the PWA URL in Chrome/Safari
2. Tap "Add to Home Screen" or the install prompt
3. The app will appear on your home screen

### On Desktop (Chrome/Edge):
1. Look for the install icon (⊕) in the address bar
2. Click "Install"

## Files

- `index.html` – Main application
- `manifest.json` – PWA configuration
- `sw.js` – Service worker for offline support
- `icon-192.png` – App icon (192×192)
- `icon-512.png` – App icon (512×512)

## Version

v1.0 – February 2025
