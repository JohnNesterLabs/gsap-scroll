# WebP Sequence Standalone Package

This is a **self-contained, portable package** containing all the code needed to run the WebP sequence animation in any React project.

## 📦 What's Included

### **Files (9 total):**
1. `WebPSequenceTest.jsx` - Main component with animation logic
2. `components/WebPSequence/WebPSequence.js` - Display component
3. `components/WebPSequence/WebPSequence.css` - Styles
4. `components/VideoModal/VideoModal.js` - Video popup component
5. `components/VideoModal/VideoModal.css` - Modal styles
6. `components/VideoIcon/VideoIcon.js` - Play icon component
7. `components/VideoIcon/VideoIcon.css` - Icon styles
8. `config/constants.js` - Configuration file
9. `utils/frameUtils.js` - Utility functions

### **Required Assets:**
- Frame images in your `public/` folder (paths configured in `config/constants.js`)
- Video file (optional, for video modal)

---

## 🚀 Quick Start

### 1. Copy to Your Project
Copy the entire `webp-sequence-standalone/` folder into your React project's `src/` directory.

### 2. Update Configuration
Edit `config/constants.js` to match your setup:

```javascript
export const CONFIG = {
  totalFramesDesktop: 189,        // Your desktop frame count
  totalFramesMobile: 158,         // Your mobile frame count
  folderPathDesktop: '/your-desktop-frames/',
  folderPathMobile: '/your-mobile-frames/',
  framePrefix: 'frame_',          // Your frame naming pattern
  frameSuffix: '.webp',           // Your frame file extension
  framesPerSecond: 15,            // Animation speed
  scrollThreshold: 100,           // Scroll pixels to resume
  pauseFramesDesktop: [65, 102, 127, 157],  // Your pause frames
  pauseFramesMobile: [39, 67, 93, 119],     // Your pause frames
};
```

### 3. Copy Frame Assets
Place your frame images in the `public/` folder:
- Desktop frames: `/public/final-frames-desktop-webp/frame_0001.webp`, etc.
- Mobile frames: `/public/frames-full-mobile 3/frame_0001.webp`, etc.

### 4. Use the Component

```jsx
import WebPSequenceTest from './webp-sequence-standalone/WebPSequenceTest';

function App() {
  return <WebPSequenceTest />;
}
```

---

## ⚙️ Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `totalFramesDesktop` | Total frames for desktop | 189 |
| `totalFramesMobile` | Total frames for mobile | 158 |
| `folderPathDesktop` | Path to desktop frames | `/final-frames-desktop-webp/` |
| `folderPathMobile` | Path to mobile frames | `/frames-full-mobile 3/` |
| `framePrefix` | Frame filename prefix | `frame_` |
| `frameSuffix` | Frame file extension | `.webp` |
| `framesPerSecond` | Animation playback speed | 15 |
| `scrollThreshold` | Pixels to scroll to resume | 100 |
| `pauseFramesDesktop` | Frame numbers to pause at | `[65, 102, 127, 157]` |
| `pauseFramesMobile` | Frame numbers to pause at | `[39, 67, 93, 119]` |

---

## ✅ Checklist for Migration

- [ ] Copy `webp-sequence-standalone/` folder to new project
- [ ] Update frame paths in `config/constants.js`
- [ ] Update frame counts in `config/constants.js`
- [ ] Update pause frames arrays in `config/constants.js`
- [ ] Copy frame images to public folder
- [ ] Update video path in `VideoModal.js` (if using video)
- [ ] Test animation works
- [ ] Remove debug panel if not needed (in `WebPSequenceTest.jsx`)

---

## 📝 Notes

- All import paths are relative and self-contained
- No external dependencies beyond React
- Works on both desktop and mobile
- Touch events supported
- Debug panel can be removed for production

---

## 🐛 Troubleshooting

**Animation doesn't start:**
- Check frame paths match your public folder
- Verify frame naming (e.g., `frame_0001.webp`)
- Check browser console for 404 errors

**Pause frames not working:**
- Verify pause frame numbers in config match your frames
- Ensure frame numbers start from 1

---

## 📄 File Structure

```
webp-sequence-standalone/
├── README.md
├── WebPSequenceTest.jsx
├── components/
│   ├── WebPSequence/
│   │   ├── WebPSequence.js
│   │   └── WebPSequence.css
│   ├── VideoModal/
│   │   ├── VideoModal.js
│   │   └── VideoModal.css
│   └── VideoIcon/
│       ├── VideoIcon.js
│       └── VideoIcon.css
├── config/
│   └── constants.js
└── utils/
    └── frameUtils.js
```

That's it! Just copy this folder and configure it for your project. 🎉
