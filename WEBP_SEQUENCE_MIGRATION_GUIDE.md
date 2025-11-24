# WebP Sequence Migration Guide

## 📋 Complete Dependency List

To use `WebPSequenceTest.jsx` in a separate project, you need these files:

### **Main Files:**
1. ✅ `WebPSequenceTest.jsx` - Main component with all animation logic

### **Components (Required):**
2. ✅ `components/WebPSequence/WebPSequence.js` - WebP sequence display component
3. ✅ `components/WebPSequence/WebPSequence.css` - Styles for WebP sequence
4. ✅ `components/VideoModal/VideoModal.js` - Video popup modal component
5. ✅ `components/VideoModal/VideoModal.css` - Styles for video modal
6. ✅ `components/VideoIcon/VideoIcon.js` - Play icon component (used by WebPSequence)
7. ✅ `components/VideoIcon/VideoIcon.css` - Styles for video icon

### **Configuration & Utils (Required):**
8. ✅ `config/constants.js` - Configuration constants (frame counts, paths, etc.)
9. ✅ `utils/frameUtils.js` - Frame utility functions (formatting, detection, etc.)

### **Public Assets (Required):**
10. ✅ Frame images in `/public/final-frames-desktop-webp/` (desktop frames)
11. ✅ Frame images in `/public/frames-full-mobile 3/` (mobile frames)
12. ✅ Video file at `/public/Ticket 1 Final (Compressed).mp4` (optional, for video modal)

---

## 📦 Standalone Folder Structure

All files have been copied to: `webp-sequence-standalone/`

```
webp-sequence-standalone/
├── README.md                          # This migration guide
├── WebPSequenceTest.jsx              # Main component (ready to use)
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

---

## 🚀 How to Use in New Project

### Step 1: Copy the Standalone Folder
Copy the entire `webp-sequence-standalone/` folder to your new project's `src/` directory.

### Step 2: Update Import Paths (if needed)
All imports in the standalone files are already relative, so they should work as-is if you maintain the folder structure.

### Step 3: Update Configuration
Edit `config/constants.js` to match your frame paths and settings:

```javascript
export const CONFIG = {
  totalFramesDesktop: 189,        // Update with your desktop frame count
  totalFramesMobile: 158,         // Update with your mobile frame count
  folderPathDesktop: '/your-desktop-frames-path/',
  folderPathMobile: '/your-mobile-frames-path/',
  framePrefix: 'frame_',          // Your frame naming prefix
  frameSuffix: '.webp',           // Your frame file extension
  framesPerSecond: 15,            // Animation speed
  scrollThreshold: 100,           // Scroll amount to resume from pause
  pauseFramesDesktop: [65, 102, 127, 157],  // Your pause frames
  pauseFramesMobile: [39, 67, 93, 119],     // Your pause frames
};
```

### Step 4: Copy Frame Assets
1. Copy your desktop frames to `public/final-frames-desktop-webp/` (or update path in config)
2. Copy your mobile frames to `public/frames-full-mobile 3/` (or update path in config)
3. Ensure frames are named: `frame_0001.webp`, `frame_0002.webp`, etc. (or match your config)

### Step 5: Use the Component
Import and use `WebPSequenceTest` in your project:

```jsx
import WebPSequenceTest from './webp-sequence-standalone/WebPSequenceTest';

function App() {
  return <WebPSequenceTest />;
}
```

---

## 📝 File Dependencies Map

```
WebPSequenceTest.jsx
├── components/WebPSequence/WebPSequence.js
│   ├── components/VideoIcon/VideoIcon.js
│   │   └── components/VideoIcon/VideoIcon.css
│   └── components/WebPSequence/WebPSequence.css
├── components/VideoModal/VideoModal.js
│   └── components/VideoModal/VideoModal.css
├── config/constants.js
└── utils/frameUtils.js
    └── config/constants.js (imports CONFIG)
```

---

## ⚙️ Configuration Options Explained

| Option | Description | Default |
|--------|-------------|---------|
| `totalFramesDesktop` | Total frames for desktop | 189 |
| `totalFramesMobile` | Total frames for mobile | 158 |
| `folderPathDesktop` | Path to desktop frames folder | `/final-frames-desktop-webp/` |
| `folderPathMobile` | Path to mobile frames folder | `/frames-full-mobile 3/` |
| `framePrefix` | Frame filename prefix | `frame_` |
| `frameSuffix` | Frame filename extension | `.webp` |
| `framesPerSecond` | Animation playback speed | 15 |
| `scrollThreshold` | Pixels to scroll to resume from pause | 100 |
| `pauseFramesDesktop` | Array of frame numbers to pause at (desktop) | `[65, 102, 127, 157]` |
| `pauseFramesMobile` | Array of frame numbers to pause at (mobile) | `[39, 67, 93, 119]` |

---

## 🎯 Features Included

- ✅ Auto-play animation loop
- ✅ Pause/resume at specific frames
- ✅ Scroll direction control (forward/backward)
- ✅ Boundary protection (frame 1 and last frame)
- ✅ Mobile device detection
- ✅ Video modal popup at pause frames
- ✅ Touch event support
- ✅ Debug panel (can be removed in production)

---

## 🔧 Customization Tips

1. **Remove Debug Panel**: Delete the debug div in `WebPSequenceTest.jsx` return statement
2. **Change Text Overlay**: Edit the text in `WebPSequence.js` line 31
3. **Update Video Source**: Change video path in `VideoModal.js` line 30
4. **Customize Pause Frames**: Update arrays in `config/constants.js`
5. **Adjust Animation Speed**: Change `framesPerSecond` in config

---

## ✅ Checklist for Migration

- [ ] Copy `webp-sequence-standalone/` folder to new project
- [ ] Update frame paths in `config/constants.js`
- [ ] Update frame counts in `config/constants.js`
- [ ] Update pause frames arrays in `config/constants.js`
- [ ] Copy frame image files to public folder
- [ ] Update video path in `VideoModal.js` (if using video)
- [ ] Test animation works correctly
- [ ] Remove debug panel if not needed
- [ ] Customize text overlay if needed

---

## 🐛 Troubleshooting

**Animation doesn't start:**
- Check frame paths in config match your public folder structure
- Verify frames are named correctly (e.g., `frame_0001.webp`)
- Check browser console for 404 errors on frame images

**Pause frames not working:**
- Verify pause frame numbers in config match actual frame numbers
- Check frame numbers start from 1 (not 0)

**Video modal not opening:**
- Check video path in `VideoModal.js`
- Verify video file exists in public folder
- Check browser console for errors

---

## 📦 Total Files to Copy: 9 files

1. WebPSequenceTest.jsx
2. WebPSequence.js
3. WebPSequence.css
4. VideoModal.js
5. VideoModal.css
6. VideoIcon.js
7. VideoIcon.css
8. constants.js
9. frameUtils.js

Plus frame image files in public folder.
