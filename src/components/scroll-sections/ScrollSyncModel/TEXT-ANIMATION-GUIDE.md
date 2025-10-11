# ScrollSyncModel Text Animation System Guide

## Overview
This guide explains how to use the powerful **textSets** animation system in ScrollSyncModel. You can now define multiple animated text lines for each section with different animation types and configurations.

---

## 🎬 Animation System Features

### Supported Animation Types:
1. **fadeSlideUp** - Text fades in while sliding up from below
2. **fadeIn** - Simple fade-in animation
3. **slideLeft** - Text slides in from the right
4. **slideRight** - Text slides in from the left
5. **stagger** - Text appears with scale and position effects in sequence
6. **typewriter** - Text appears character-by-character (fade variation)

### Key Features:
- ✅ Multiple text lines per section
- ✅ Custom animation per section
- ✅ Adjustable animation duration, delay, and easing
- ✅ GSAP-powered smooth animations
- ✅ Automatic triggering on section scroll
- ✅ Fully responsive across all devices

---

## 📝 Configuration Structure

### Basic Section with textSets:

```javascript
{
  // Define multiple text lines for animation
  textSets: [
    'First line of text',
    'Second line of text',
    'Third line of text'
  ],
  
  // Animation configuration for this section
  animationConfig: {
    type: 'fadeSlideUp',       // Animation type
    staggerDelay: 0.3,         // Delay between each line (seconds)
    duration: 0.8,             // Animation duration (seconds)
    ease: 'power2.out'         // GSAP easing function
  },
  
  // Other section properties
  background: '#000000',
  border: '1px solid #ffffff',
  showNumber: false,           // Hide section number
  showScrollHint: true         // Show scroll indicator
}
```

---

## 🎨 Animation Type Examples

### 1. fadeSlideUp (Recommended)
Best for hero sections and impactful statements.

```javascript
{
  textSets: [
    'Vast and intricate,',
    'products never stop evolving.'
  ],
  animationConfig: {
    type: 'fadeSlideUp',
    staggerDelay: 0.3,
    duration: 0.8,
    ease: 'power2.out'
  }
}
```

### 2. stagger
Great for feature lists or multi-point content.

```javascript
{
  textSets: [
    'Powerful Features',
    'Built for Scale',
    'Enterprise-grade security',
    'and performance'
  ],
  animationConfig: {
    type: 'stagger',
    staggerDelay: 0.2,
    duration: 0.6,
    ease: 'power3.out'
  }
}
```

### 3. slideLeft
Perfect for directional flow and narrative.

```javascript
{
  textSets: [
    'Innovation',
    'at Every Turn'
  ],
  animationConfig: {
    type: 'slideLeft',
    staggerDelay: 0.4,
    duration: 1,
    ease: 'power2.inOut'
  }
}
```

### 4. fadeIn
Simple and elegant for subtle emphasis.

```javascript
{
  textSets: [
    'Discover',
    'Transform',
    'Succeed'
  ],
  animationConfig: {
    type: 'fadeIn',
    staggerDelay: 0.3,
    duration: 0.7,
    ease: 'power1.out'
  }
}
```

### 5. slideRight
Creates dynamic left-to-right movement.

```javascript
{
  textSets: [
    'Welcome to',
    'the future'
  ],
  animationConfig: {
    type: 'slideRight',
    staggerDelay: 0.25,
    duration: 0.9,
    ease: 'power2.out'
  }
}
```

### 6. typewriter
Character-by-character reveal effect.

```javascript
{
  textSets: [
    'Line 1',
    'Line 2',
    'Line 3'
  ],
  animationConfig: {
    type: 'typewriter',
    staggerDelay: 0.5,
    duration: 0.6,
    ease: 'none'
  }
}
```

---

## ⚙️ Animation Configuration Options

### animationConfig Properties:

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `type` | string | Animation type (see above) | `'fadeSlideUp'` |
| `staggerDelay` | number | Delay between text lines (seconds) | `0.2` |
| `duration` | number | Animation duration (seconds) | `0.8` |
| `ease` | string | GSAP easing function | `'power2.out'` |

### GSAP Easing Options:

Popular easing functions you can use:
- `'power1.out'` - Gentle deceleration
- `'power2.out'` - Moderate deceleration (recommended)
- `'power3.out'` - Strong deceleration
- `'power2.inOut'` - Smooth acceleration and deceleration
- `'elastic.out'` - Bouncy effect
- `'back.out'` - Slight overshoot
- `'none'` - Linear (no easing)

[Full GSAP Easing Reference](https://greensock.com/docs/v3/Eases)

---

## 🔄 Mixing textSets with Traditional Content

You can use either **textSets** OR **title/subtitle/description**:

### Option 1: textSets (Animated)
```javascript
{
  textSets: [
    'Animated Line 1',
    'Animated Line 2'
  ],
  animationConfig: { ... }
}
```

### Option 2: Traditional (No Animation)
```javascript
{
  title: 'Section Title',
  subtitle: 'Section Subtitle',
  description: 'Additional description text'
}
```

**Note:** If `textSets` is provided, it takes priority over title/subtitle/description.

---

## 📱 Responsive Behavior

Text animations are fully responsive with automatic font size adjustments:

| Viewport | Font Size | Container Width |
|----------|-----------|-----------------|
| Large Desktop (1925px+) | 4.5rem | 1000px |
| Desktop (1024-1924px) | 3.75rem | 900px |
| Tablet (768-1023px) | 2.5rem | 90% |
| Mobile Large (481-767px) | 2rem | 90% |
| Mobile Small (320-480px) | 1.75rem | 90% |
| Extra Small (<320px) | 1.5rem | 95% |

---

## 💡 Best Practices

### 1. Text Length
- **Short lines** (2-4 words) work best for impact
- **Keep total lines** to 4 or less per section
- **Mobile consideration**: Shorter text is crucial

### 2. Animation Timing
- **staggerDelay**: 0.2-0.4s between lines is ideal
- **duration**: 0.6-1.0s works for most animations
- **Total animation time**: Keep under 3 seconds

### 3. Animation Type Selection
- **Hero sections**: `fadeSlideUp` or `stagger`
- **Feature lists**: `stagger` or `fadeIn`
- **Directional content**: `slideLeft` or `slideRight`
- **Simple emphasis**: `fadeIn`

### 4. Easing Functions
- **Start with**: `'power2.out'` (most versatile)
- **For drama**: `'power3.out'` or `'back.out'`
- **For smoothness**: `'power2.inOut'`

---

## 🎯 Complete Example

Here's a complete section configuration with all options:

```javascript
{
  // Animated text lines
  textSets: [
    'Transform Your Business',
    'with AI-Powered Solutions',
    'Built for the Future'
  ],
  
  // Animation settings
  animationConfig: {
    type: 'fadeSlideUp',
    staggerDelay: 0.3,
    duration: 0.8,
    ease: 'power2.out'
  },
  
  // Visual styling
  background: '#000000',
  border: '1px solid #ffffff',
  
  // Display options
  showNumber: false,         // Hide "SECTION 1"
  showScrollHint: true,      // Show scroll indicator
  
  // Header visibility (Section 1 only)
  hasHeader: showHeader
}
```

---

## 🔧 Advanced Customization

### Custom Animation Delays Per Line

You can create more complex animations by adjusting the `staggerDelay`:

```javascript
// Fast stagger for short lines
{
  textSets: ['Quick', 'Impact', 'Words'],
  animationConfig: {
    type: 'stagger',
    staggerDelay: 0.15,  // Very quick
    duration: 0.5
  }
}

// Slow dramatic reveal
{
  textSets: ['Elegant', 'Refined', 'Sophisticated'],
  animationConfig: {
    type: 'fadeSlideUp',
    staggerDelay: 0.6,   // Slower, more dramatic
    duration: 1.2
  }
}
```

### Combining with Section Position

Text animations work perfectly with section content positioning:

```javascript
// Section config (line ~729 in ScrollSyncModel.jsx)
{
  textSets: ['Left Aligned', 'Content'],
  animationConfig: { type: 'slideRight', ... }
}

// Position config (line ~686)
'desktop': [
  { horizontal: 'left', vertical: 'center' },  // Animates from left
  // ...
]
```

---

## 🚀 How It Works

### Animation Trigger:
1. Component tracks the **active section** via scroll position
2. When section changes, GSAP animations are triggered
3. Each `.text-set-line` element is animated based on config
4. Animations are **retriggered** when returning to a section

### Performance:
- Uses GSAP for GPU-accelerated animations
- `will-change: transform, opacity` for smooth rendering
- Minimal DOM manipulation
- Optimized for 60fps on all devices

---

## 📊 Quick Reference Table

| Use Case | Animation Type | staggerDelay | duration | ease |
|----------|---------------|--------------|----------|------|
| Hero Impact | fadeSlideUp | 0.3 | 0.8 | power2.out |
| Feature List | stagger | 0.2 | 0.6 | power3.out |
| Narrative Flow | slideLeft/Right | 0.4 | 1.0 | power2.inOut |
| Simple Fade | fadeIn | 0.3 | 0.7 | power1.out |
| Dramatic | fadeSlideUp | 0.5 | 1.2 | back.out |
| Playful | stagger | 0.25 | 0.7 | elastic.out |

---

## 🐛 Troubleshooting

### Issue: Animations not triggering
**Solution**: Ensure `textSets` array is not empty and section index is correct.

### Issue: Text appears immediately (no animation)
**Solution**: Check that `animationConfig` is properly defined. Default will be applied if missing.

### Issue: Animation too fast/slow
**Solution**: Adjust `duration` and `staggerDelay` values in `animationConfig`.

### Issue: Text overlapping on mobile
**Solution**: Reduce number of text lines or use shorter text for mobile viewports.

---

## 📍 File Locations

- **Main Component**: `src/components/scroll-sections/ScrollSyncModel/ScrollSyncModel.jsx`
- **Configuration**: Lines 729-829 (sections array)
- **Animation Logic**: Lines 131-276 (useEffect hook)
- **CSS Styling**: `src/components/scroll-sections/ScrollSyncModel/ScrollSyncModel.css`
- **Text Styles**: Lines 793-812 (.text-sets-container, .text-set-line)

---

## 🎓 Learning Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [GSAP Easing Visualizer](https://greensock.com/ease-visualizer/)
- [React GSAP Guide](https://greensock.com/react/)

---

## 💻 Example Sections

Check the current implementation (lines 729-829) for 5 fully configured example sections showing different animation types and configurations!

---

For questions or issues, refer to:
- `ScrollSyncModel.jsx` - Main component
- `CONTENT-CUSTOMIZATION-GUIDE.md` - Content positioning guide
- GSAP documentation for advanced animations

