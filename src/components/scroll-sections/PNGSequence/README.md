# PNG Sequence Animation Component

This component displays a sequence of PNG frames based on scroll progress, allowing for smooth animation synchronization with the page scroll.

## Features

- **Configurable Start Section**: Control when the PNG sequence starts (section 4 or 5)
- **Smooth Frame Progression**: Frames progress based on scroll position
- **Responsive Design**: Works across all device sizes
- **Performance Optimized**: Uses efficient image loading and transitions

## Configuration

To change when the PNG sequence starts, modify the `PNG_SEQUENCE_CONFIG` in `Demo.jsx`:

```javascript
const PNG_SEQUENCE_CONFIG = {
  startSection: 4, // Change this to 4 or 5
  totalFrames: 378,
  framePrefix: 'frame_',
  frameSuffix: '.png',
  folderPath: '/frames-journey/'
};
```

### Start Section Options:
- `startSection: 4` - PNG sequence starts from section 4 (after L657 section)
- `startSection: 5` - PNG sequence starts from section 5 (after section 4)

## Frame Sequence

The component expects PNG files in the following format:
- **Location**: `/public/frames-journey/`
- **Naming**: `frame_0001.png` to `frame_0378.png`
- **Total Frames**: 378 frames
- **Format**: PNG files with consistent dimensions

## Integration

The component is integrated into the Demo component and automatically:
1. Shows/hides based on the configured start section
2. Progresses frames based on scroll position
3. Maintains aspect ratio across all devices
4. Provides smooth transitions between frames

## Video Synchronization

This PNG sequence is designed to work alongside your video content, allowing you to:
- Stitch the PNG sequence with your video timeline
- Control exactly when the sequence starts
- Ensure smooth transitions between video and PNG content

## Development

The component includes debug information in development mode showing:
- Current section
- Section progress percentage
- Current frame number
- Start section configuration
