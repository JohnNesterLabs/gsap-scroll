# WebP Sequence Test File - Standalone Testing

## Overview

`WebPSequenceTest.jsx` is a **standalone, self-contained test file** that includes all the WebP sequence animation logic extracted from `App.js`. This file allows you to test the WebP sequence functionality independently without running the full application.

## What's Included

The test file contains all the core WebP sequence functionality:

### ✅ **Core Features:**
- **Auto-play animation loop** - Automatically plays frames at configurable FPS
- **Pause/Resume logic** - Pauses at specific frames, resumes with scroll
- **Scroll direction control** - Scroll up/down to reverse animation direction
- **Scroll lock/unlock** - Locks scroll during animation, unlocks when done
- **Frame navigation** - Forward and backward frame navigation
- **Touch support** - Works on mobile devices with touch events
- **Section tracking** - Detects scroll sections and triggers animation
- **Debug info** - Real-time debug panel showing current state

### 📋 **State Management:**
- Current frame number
- Animation visibility
- Auto-play status
- Play direction (forward/backward)
- Pause state
- Section tracking
- Mobile detection

### 🎮 **Controls:**
- **Scroll down** - Moves animation forward (or resumes from pause)
- **Scroll up** - Moves animation backward (or resumes from pause)
- **Click icon at pause frames** - Opens video modal

## How to Test

### Option 1: Replace App.js temporarily

1. **Backup your current App.js:**
   ```bash
   cp src/App.js src/App.js.backup
   ```

2. **Import the test file in index.js:**
   ```jsx
   // In src/index.js
   import WebPSequenceTest from './WebPSequenceTest';
   
   ReactDOM.render(<WebPSequenceTest />, document.getElementById('root'));
   ```

3. **Run your dev server:**
   ```bash
   npm start
   # or
   yarn start
   ```

### Option 2: Create a separate route/page

1. **In your router** (if using React Router):
   ```jsx
   import WebPSequenceTest from './WebPSequenceTest';
   
   <Route path="/test-webp" component={WebPSequenceTest} />
   ```

2. **Navigate to** `/test-webp` in your browser

### Option 3: Use as a component in existing app

```jsx
import WebPSequenceTest from './WebPSequenceTest';

function MyApp() {
  return (
    <div>
      <WebPSequenceTest />
    </div>
  );
}
```

## Dependencies

The test file requires these components and utilities:

### Required Files:
```
src/
├── WebPSequenceTest.jsx          ← Test file
├── components/
│   ├── WebPSequence/             ← Component (already exists)
│   ├── VideoIcon/                ← Component (already exists)
│   └── VideoModal/               ← Component (already exists)
├── config/
│   └── constants.js              ← Config (already exists)
└── utils/
    └── frameUtils.js             ← Utilities (already exists)
```

### Required Imports:
- `CONFIG` from `./config/constants`
- `getTotalFrames, getFrameImageSrc, isPauseFrame, detectMobile` from `./utils/frameUtils`
- `WebPSequence` component
- `VideoModal` component

## Configuration

You can customize the animation by editing `src/config/constants.js`:

```javascript
export const CONFIG = {
  startSection: 1,                    // Which section triggers animation
  totalFramesDesktop: 189,            // Total desktop frames
  totalFramesMobile: 158,             // Total mobile frames
  framesPerSecond: 15,                // Animation speed
  scrollThreshold: 100,               // Scroll amount to resume from pause
  pauseFramesDesktop: [65, 102, 127, 157],  // Pause frames (desktop)
  pauseFramesMobile: [39, 67, 93, 119],     // Pause frames (mobile)
  animationTriggerOffset: -1          // When to start animation
};
```

## How It Works

### 1. **Initialization**
- Component mounts and detects mobile/desktop
- Sets up scroll container reference
- Waits for user to scroll to section 2

### 2. **Animation Start**
- When section 2 becomes visible (based on `animationTriggerOffset`)
- Locks scroll position
- Starts auto-playing frames forward
- Shows WebPSequence component

### 3. **During Animation**
- Frames play automatically at configured FPS
- User can scroll up/down to change direction
- When reaching a pause frame → animation pauses
- Shows clickable icon at pause frames

### 4. **Pause/Resume**
- Animation pauses at configured pause frames
- User must scroll (threshold: 100px) to resume
- Scroll down → resume forward
- Scroll up → resume backward

### 5. **Completion**
- When reaching last frame → unlocks scroll
- Hides WebPSequence
- Scrolls to footer section

## Testing Checklist

- [ ] Animation starts when scrolling to section 2
- [ ] Frames play automatically forward
- [ ] Animation pauses at configured pause frames
- [ ] Icon appears at pause frames
- [ ] Clicking icon opens video modal
- [ ] Scrolling down resumes forward from pause
- [ ] Scrolling up resumes backward from pause
- [ ] Scrolling up during play reverses direction
- [ ] Scrolling down during backward play reverses forward
- [ ] Animation completes and unlocks scroll
- [ ] Scrolls back up works (backward animation)
- [ ] Mobile device detection works
- [ ] Touch events work on mobile

## Debug Panel

The test file includes a **debug panel** in the top-right corner showing:
- Current frame number / total frames
- Active section
- Playing status
- Direction (forward/backward)
- Pause status
- Visibility status
- Mobile detection

## Using in Another Project

To use this in a different project:

1. **Copy the test file:**
   ```bash
   cp src/WebPSequenceTest.jsx /path/to/new/project/
   ```

2. **Copy dependencies:**
   - `src/config/constants.js`
   - `src/utils/frameUtils.js`
   - `src/components/WebPSequence/`
   - `src/components/VideoIcon/`
   - `src/components/VideoModal/`

3. **Update paths:**
   - Adjust import paths as needed
   - Update frame folder paths in `constants.js`
   - Update video paths if different

4. **Customize:**
   - Edit `CONFIG` values for your frame counts
   - Adjust pause frames for your sequence
   - Modify styling as needed

## Troubleshooting

### Animation doesn't start
- Check console for errors
- Verify section 2 is scrollable
- Check `animationTriggerOffset` value
- Ensure frames are loading (check network tab)

### Animation pauses unexpectedly
- Check if current frame is in `pauseFrames` array
- Verify `isPauseFrame()` function works correctly

### Scroll doesn't work
- Check if scroll is locked (should be during animation)
- Verify scroll container ref is set
- Check console for scroll prevention messages

### Frames don't load
- Verify frame paths in `constants.js`
- Check frame naming format (e.g., `frame_0001.webp`)
- Ensure frames exist in public folder
- Check browser console for 404 errors

## Notes

- The test file uses the same logic as `App.js` but in a standalone format
- All state management is self-contained
- Debug panel helps visualize current state
- Works on both desktop and mobile
- Touch events supported for mobile testing

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all dependencies are imported correctly
3. Check that frame files exist in correct paths
4. Review CONFIG values match your frame setup
