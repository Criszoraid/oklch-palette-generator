# Setup Instructions for OKLCH Palette Generator Plugin

## 📋 Prerequisites

- Node.js installed (v18 or higher)
- Figma Desktop App installed
- Code editor (Cursor, VS Code, etc.)

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Plugin

```bash
# Build once
npm run build:code
npm run build:ui

# Or watch for changes (recommended during development)
npm run build:watch
```

This will create:
- `dist/code.js` - The plugin backend code
- `dist/index.html` - The plugin UI

### 3. Load Plugin in Figma

1. Open **Figma Desktop App**
2. Go to **Menu → Plugins → Development → Import plugin from manifest...**
3. Select the `manifest.json` file from this project
4. The plugin will now appear in **Plugins → Development → OKLCH Palette Generator**

### 4. Test the Plugin

1. Open any Figma file
2. Run the plugin: **Plugins → Development → OKLCH Palette Generator**
3. The plugin UI should open
4. Try generating a palette:
   - Select HEX mode
   - Choose a color (default is blue #4169E1)
   - Enter a color name (e.g., "blue")
   - Check the options you want
   - Click "✨ Generar Paleta en Figma"

## 🔧 Development Workflow

1. Make changes to the code
2. If you're running `npm run build:watch`, changes will auto-compile
3. In Figma, close and reopen the plugin to see changes
4. Alternatively: Right-click on plugin → **Reload plugin** (but this doesn't always work)

## 📁 File Structure

```
.
├── manifest.json          # Plugin manifest (required by Figma)
├── code.ts               # Plugin backend code (runs in Figma sandbox)
├── App.tsx               # Main React component
├── components/           # React components for UI
│   ├── PaletteConfigurator.tsx
│   ├── JsonImport.tsx
│   └── PalettePreview.tsx
├── public/
│   └── index.html        # HTML template
├── src/
│   └── main.tsx          # React entry point
├── dist/                 # Build output (generated)
│   ├── code.js
│   └── index.html
└── package.json
```

## ✨ Features

- ✅ HEX or OKLCH input
- ✅ Generate 9-shade palettes (100-900)
- ✅ Light and Dark mode variants
- ✅ Create Figma components (parent + instances)
- ✅ Create Figma color variables
- ✅ Multiple naming formats (kebab-case, camelCase, etc.)
- ✅ JSON batch import

## 🐛 Troubleshooting

### Plugin doesn't load
- Make sure you built the project first: `npm run build:code && npm run build:ui`
- Check that `dist/code.js` and `dist/index.html` exist
- Verify `manifest.json` points to the correct files

### UI doesn't show
- Check browser console in Figma (Help → Toggle Developer Tools)
- Make sure React is building correctly: `npm run build:ui`

### Changes don't appear
- Make sure to rebuild: `npm run build:code && npm run build:ui`
- Close and reopen the plugin in Figma

### Font errors
- The plugin uses "Inter" font (default in Figma)
- If you get font errors, the font loading will fallback to available fonts

## 📝 Notes

- The preview component is included but hidden from users (only for development testing)
- Color calculations use precise OKLCH → RGB conversion
- All palettes maintain the 100-900 scale (light to dark)
- Dark mode palettes have adjusted lightness for better visibility on dark backgrounds

## 🤝 Support

If you encounter issues, check:
1. Node modules are installed: `npm install`
2. Build completed successfully: `npm run build:code && npm run build:ui`
3. Figma Desktop App is up to date
4. `manifest.json` is in the root directory
