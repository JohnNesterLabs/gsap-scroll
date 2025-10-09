# Cycling Text Sets Guide

## Overview
This guide explains how to use the **cycling text sets** feature in ScrollSyncModel. You can now display multiple sets of text lines that automatically cycle through with customizable timing and animations!

---

## 🔄 What is Cycling Text?

Cycling text allows you to show multiple sets of text lines in sequence within the same section:
1. **Set 1 appears** with animation (e.g., 2 lines)
2. **After 4 seconds**, Set 1 fades out
3. **Set 2 appears** with animation (e.g., 2 different lines)
4. **Cycle continues** to Set 3, Set 4, etc.
5. **Loops back** to Set 1 (optional)

---

## 📝 Configuration Structure

### New Structure (Cycling Multiple Sets):

```javascript
{
  // Define multiple text sets as an object
  textSets: {
    set1: [
      'First line of set 1',
      'Second line of set 1'
    ],
    set2: [
      'First line of set 2',
      'Second line of set 2'
    ],
    set3: [
      'First line of set 3',
      'Second line of set 3'
    ]
  },
  
  // Timing configuration (optional - uses defaults if not provided)
  textSetTiming: {
    displayDuration: 4000,      // Show each set for 4 seconds (milliseconds)
    fadeOutDuration: 0.5,       // Fade out in 0.5 seconds
    delayBetweenSets: 0.3,      // 0.3s delay between fade out and next fade in
    loop: true                   // Loop back to first set (true/false)
  },
  
  // Animation config (same as before)
  animationConfig: {
    type: 'fadeSlideUp',
    staggerDelay: 0.3,
    duration: 0.8,
    ease: 'power2.out'
  }
}
```

### Old Structure (Single Set - Still Supported):

```javascript
{
  // Simple array - no cycling
  textSets: [
    'Line 1',
    'Line 2'
  ],
  
  animationConfig: {
    type: 'fadeSlideUp',
    staggerDelay: 0.3,
    duration: 0.8,
    ease: 'power2.out'
  }
}
```

---

## ⚙️ Timing Configuration Options

### textSetTiming Properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `displayDuration` | number (ms) | `4000` | How long to show each text set |
| `fadeOutDuration` | number (seconds) | `0.5` | Fade out animation duration |
| `delayBetweenSets` | number (seconds) | `0.3` | Delay between fade out and fade in |
| `loop` | boolean | `true` | Whether to loop back to first set |

---

## 🎯 Complete Example

### Section 1 with Cycling Text (Current Implementation):

```javascript
{
  // Two sets cycling every 4 seconds
  textSets: {
    set1: [
      'Vast and intricate,',
      'products never stop evolving.'
    ],
    set2: [
      'Enterprise customers have an',
      'endless spectrum of realities.'
    ]
  },
  
  // Timing: Show each set for 4 seconds
  textSetTiming: {
    displayDuration: 4000,
    fadeOutDuration: 0.5,
    delayBetweenSets: 0.3,
    loop: true
  },
  
  // Fade slide up animation
  animationConfig: {
    type: 'fadeSlideUp',
    staggerDelay: 0.3,
    duration: 0.8,
    ease: 'power2.out'
  },
  
  background: '#000000',
  border: '1px solid #ffffff',
  showNumber: false,
  showScrollHint: true
}
```

---

## 💡 Use Case Examples

### 1. Feature Highlights (3 Sets)
```javascript
{
  textSets: {
    set1: ['Fast Performance', 'Lightning quick response'],
    set2: ['Enterprise Security', 'Bank-grade protection'],
    set3: ['Global Scale', 'Available worldwide']
  },
  textSetTiming: {
    displayDuration: 3000,  // 3 seconds per set
    fadeOutDuration: 0.4,
    delayBetweenSets: 0.2,
    loop: true
  },
  animationConfig: {
    type: 'stagger',
    staggerDelay: 0.2,
    duration: 0.6,
    ease: 'power3.out'
  }
}
```

### 2. Customer Testimonials
```javascript
{
  textSets: {
    testimonial1: [
      '"Transformed our workflow"',
      '- Fortune 500 CEO'
    ],
    testimonial2: [
      '"Best investment we made"',
      '- Startup Founder'
    ],
    testimonial3: [
      '"Game-changing technology"',
      '- Tech Director'
    ]
  },
  textSetTiming: {
    displayDuration: 5000,  // 5 seconds - longer for reading
    fadeOutDuration: 0.6,
    delayBetweenSets: 0.4,
    loop: true
  },
  animationConfig: {
    type: 'fadeIn',
    staggerDelay: 0.4,
    duration: 0.8,
    ease: 'power2.out'
  }
}
```

### 3. Value Propositions (No Loop)
```javascript
{
  textSets: {
    step1: ['Step 1:', 'Sign up in seconds'],
    step2: ['Step 2:', 'Configure your workspace'],
    step3: ['Step 3:', 'Start building']
  },
  textSetTiming: {
    displayDuration: 4000,
    fadeOutDuration: 0.5,
    delayBetweenSets: 0.3,
    loop: false  // Stop after last set
  },
  animationConfig: {
    type: 'slideRight',
    staggerDelay: 0.3,
    duration: 0.7,
    ease: 'power2.out'
  }
}
```

### 4. Statistics Showcase
```javascript
{
  textSets: {
    stat1: ['99.9% Uptime', 'Always available'],
    stat2: ['10M+ Users', 'Trusted worldwide'],
    stat3: ['50ms Response', 'Lightning fast'],
    stat4: ['ISO Certified', 'Enterprise ready']
  },
  textSetTiming: {
    displayDuration: 2500,  // Fast cycling for stats
    fadeOutDuration: 0.3,
    delayBetweenSets: 0.2,
    loop: true
  },
  animationConfig: {
    type: 'fadeSlideUp',
    staggerDelay: 0.2,
    duration: 0.5,
    ease: 'power2.out'
  }
}
```

---

## 🎨 Animation Type Recommendations

| Use Case | Animation Type | Reason |
|----------|---------------|--------|
| Feature highlights | `stagger` | Adds energy and excitement |
| Testimonials | `fadeIn` | Elegant and readable |
| Statistics | `fadeSlideUp` | Professional and clear |
| Steps/Process | `slideRight` or `slideLeft` | Shows progression |
| Headlines | `fadeSlideUp` | Impactful and modern |

---

## 📱 Responsive Behavior

The cycling text system is fully responsive:

| Viewport | Timing Impact | Visual Impact |
|----------|--------------|---------------|
| Large Desktop | Full timing | Large text (4.5rem) |
| Desktop | Full timing | Large text (3.75rem) |
| Tablet | Full timing | Medium text (2.5rem) |
| Mobile | Full timing | Smaller text (1.75-2rem) |

**Note:** Display duration and cycling timings remain the same across all devices for consistent experience.

---

## 🔧 Customization Per Section

Each section can have **different cycling configurations**:

```javascript
const sections = [
  {
    // Section 1: Fast cycling (2 sets)
    textSets: {
      set1: ['Line 1', 'Line 2'],
      set2: ['Line 3', 'Line 4']
    },
    textSetTiming: {
      displayDuration: 3000,  // 3 seconds
      loop: true
    }
  },
  {
    // Section 2: Slow cycling (3 sets)
    textSets: {
      set1: ['Line A', 'Line B'],
      set2: ['Line C', 'Line D'],
      set3: ['Line E', 'Line F']
    },
    textSetTiming: {
      displayDuration: 6000,  // 6 seconds
      loop: true
    }
  },
  {
    // Section 3: No cycling (simple array)
    textSets: ['Static line 1', 'Static line 2'],
    // No textSetTiming - won't cycle
  }
];
```

---

## ⏱️ Timing Guidelines

### Display Duration:
- **2-3 seconds**: Quick facts, statistics
- **4-5 seconds**: Standard content, features (recommended)
- **6-8 seconds**: Testimonials, longer reading time
- **10+ seconds**: Detailed content, important messages

### Fade Out Duration:
- **0.3s**: Quick, snappy transitions
- **0.5s**: Balanced, professional (recommended)
- **0.7s**: Slow, elegant transitions

### Delay Between Sets:
- **0.2s**: Minimal gap, continuous flow
- **0.3s**: Comfortable gap (recommended)
- **0.5s**: Noticeable pause between sets

---

## 🚀 How It Works

### Technical Flow:
1. Component renders all text sets (overlapped absolutely)
2. Only the current set's lines are visible (opacity: 1)
3. Timer counts down `displayDuration`
4. GSAP fades out current set over `fadeOutDuration`
5. After `delayBetweenSets`, next set index is activated
6. GSAP animates in the new set
7. Process repeats (loops if `loop: true`)

### Performance:
- ✅ Efficient GSAP animations
- ✅ Minimal DOM manipulation
- ✅ GPU-accelerated transforms
- ✅ Automatic timer cleanup on section change

---

## 📊 Comparison: Single vs. Cycling

| Feature | Single Set | Cycling Sets |
|---------|-----------|-------------|
| Structure | Array | Object with keys |
| Animation | Once on enter | Repeats with timing |
| Config | Simple | Requires `textSetTiming` |
| Use Case | Static content | Dynamic, rotating content |
| Complexity | Low | Medium |

---

## 💡 Best Practices

### 1. Content Length
- **Keep sets similar length** for smooth transitions
- **2-3 lines per set** works best
- **Short, punchy text** for fast cycling

### 2. Number of Sets
- **2-3 sets**: Simple cycling, easy to follow
- **4-5 sets**: Feature showcases
- **6+ sets**: Avoid unless necessary (too long to cycle through)

### 3. Timing Balance
```javascript
// Good balance for most cases
textSetTiming: {
  displayDuration: 4000,   // 4 seconds to read
  fadeOutDuration: 0.5,    // Half second fade
  delayBetweenSets: 0.3,   // Brief pause
  loop: true
}
```

### 4. Animation Choice
- **Match animation to content mood**
- **Faster animations** for quick facts
- **Slower animations** for important messages
- **Consistent animation** across all sets in a section

---

## 🐛 Troubleshooting

### Issue: Text overlapping
**Solution**: All sets are absolutely positioned. This is intentional. Only one set should be visible at a time due to opacity.

### Issue: Cycling too fast/slow
**Solution**: Adjust `displayDuration` in `textSetTiming` config.

### Issue: No cycling happening
**Solution**: 
- Check that `textSets` is an **object** (not array)
- Verify `textSetTiming` is defined
- Ensure section is active (scroll to it)

### Issue: Animation not smooth
**Solution**: 
- Increase `fadeOutDuration` for smoother fade
- Add `delayBetweenSets` for a pause
- Try different `ease` functions

---

## 📍 File Locations

- **Main Component**: `ScrollSyncModel.jsx`
- **Configuration**: Lines 928-969 (Section 1 example)
- **Animation Logic**: Lines 133-326 (useEffect hook)
- **Timing Logic**: Lines 262-307 (cycling logic)
- **CSS**: `ScrollSyncModel.css` lines 793-826

---

## 🎓 Advanced Tips

### Tip 1: Different Line Counts Per Set
```javascript
textSets: {
  short: ['One line'],
  medium: ['Line 1', 'Line 2'],
  long: ['Line 1', 'Line 2', 'Line 3']
}
```
**Note**: Container height adjusts automatically!

### Tip 2: Mixing Cycling and Static Sections
Use cycling in Section 1, static in Section 2, cycling in Section 3, etc.

### Tip 3: Synchronized Timing
Set all cycling sections to the same `displayDuration` for rhythmic effect.

---

## 📚 Related Documentation

- **Text Animation Guide**: `TEXT-ANIMATION-GUIDE.md` - All animation types
- **Content Customization**: `CONTENT-CUSTOMIZATION-GUIDE.md` - Positioning
- **Quick Start**: `README-ANIMATION-SYSTEM.md` - Overview

---

## 🎉 You're Ready!

Start creating dynamic, cycling text content that captures attention and keeps your users engaged!

**Example to get started:**
```javascript
{
  textSets: {
    set1: ['Your first message', 'Line 2'],
    set2: ['Your second message', 'Line 2']
  },
  textSetTiming: {
    displayDuration: 4000,
    loop: true
  },
  animationConfig: {
    type: 'fadeSlideUp',
    staggerDelay: 0.3,
    duration: 0.8,
    ease: 'power2.out'
  }
}
```

Happy cycling! 🔄✨

