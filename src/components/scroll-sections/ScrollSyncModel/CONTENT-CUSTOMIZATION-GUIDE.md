# ScrollSyncModel Content Customization Guide

## Overview
This guide explains how to customize the text content and positioning of section content boxes in the ScrollSyncModel component. The configuration system is responsive and works across all viewport sizes.

---

## 📝 Text Content Customization

### Section Configuration
You can customize the following text properties for each section in the `sections` array (around line 726):

```javascript
{
  title: 'Section Title',           // Main heading
  subtitle: 'Section Subtitle',     // Subheading
  description: 'Description text',  // Additional description (optional)
  showNumber: true,                 // Show/hide section number (optional, default: true)
  showScrollHint: true,             // Show/hide scroll hint (optional, default: true)
  background: '#000000',            // Background color
  border: '1px solid #ffffff'       // Border style
}
```

### Example - Customizing Section 1:
```javascript
{ 
  title: 'Welcome', 
  subtitle: 'To Our Platform', 
  description: 'Experience the future of interactive design',
  background: '#000000', 
  border: '1px solid #ffffff',
  hasHeader: showHeader,
  showNumber: false,              // Hide section number
  showScrollHint: true            // Show scroll hint
}
```

---

## 📍 Position Configuration

### Content Position Config Function
The `getContentPositionConfig()` function (around line 674) controls where the content box appears in each section.

### Position Properties:
- **horizontal**: `'left'`, `'center'`, or `'right'`
- **vertical**: `'top'`, `'center'`, or `'bottom'`

### Current Configuration by Viewport:

#### Desktop & Large Desktop:
```javascript
'desktop': [
  { horizontal: 'center', vertical: 'top' },     // Section 1
  { horizontal: 'left', vertical: 'center' },    // Section 2
  { horizontal: 'center', vertical: 'center' },  // Section 3
  { horizontal: 'right', vertical: 'center' },   // Section 4
  { horizontal: 'center', vertical: 'top' }      // Section 5
]
```

#### Mobile & Tablet:
```javascript
'mobile-large': [
  { horizontal: 'center', vertical: 'center' },  // Section 1
  { horizontal: 'left', vertical: 'center' },    // Section 2
  { horizontal: 'center', vertical: 'center' },  // Section 3
  { horizontal: 'right', vertical: 'center' },   // Section 4
  { horizontal: 'center', vertical: 'top' }      // Section 5
]
```

---

## 🎨 Customization Examples

### Example 1: Move Section 1 content to bottom-right
```javascript
'desktop': [
  { horizontal: 'right', vertical: 'bottom' },   // Section 1 - bottom-right
  { horizontal: 'left', vertical: 'center' },    // Section 2
  // ... rest of sections
]
```

### Example 2: Center all sections
```javascript
'desktop': [
  { horizontal: 'center', vertical: 'center' },  // All sections centered
  { horizontal: 'center', vertical: 'center' },
  { horizontal: 'center', vertical: 'center' },
  { horizontal: 'center', vertical: 'center' },
  { horizontal: 'center', vertical: 'center' }
]
```

### Example 3: Custom text for marketing page
```javascript
const sections = [
  { 
    title: 'Transform Your Business', 
    subtitle: 'AI-Powered Solutions', 
    description: 'Discover how our platform can revolutionize your workflow',
    background: '#000000', 
    border: '1px solid #ffffff',
    hasHeader: showHeader,
    showNumber: false,
    showScrollHint: true
  },
  { 
    title: 'Powerful Features', 
    subtitle: 'Built for Scale', 
    description: 'Enterprise-grade security and performance',
    background: '#000000', 
    border: '1px solid #ffffff',
    showNumber: false,
    showScrollHint: true
  },
  // ... more sections
];
```

---

## 📱 Responsive Behavior

The system automatically adjusts content positioning and sizing based on viewport size:

### Viewport Breakpoints:
- **mobile-small**: ≤ 480px
- **mobile-large**: 481px - 767px
- **tablet**: 768px - 1023px
- **desktop**: 1024px - 1924px
- **large-desktop**: ≥ 1925px

### Responsive Features:
- Content box max-width adjusts per viewport
- Font sizes scale proportionally
- Padding adjusts for smaller screens
- Position configs can differ per viewport

---

## 🎯 Best Practices

### 1. Content Length
- **Title**: Keep titles short (2-4 words)
- **Subtitle**: 3-6 words works best
- **Description**: 1-2 sentences maximum

### 2. Position Guidelines
- Use `vertical: 'top'` when header is visible (Section 1)
- Avoid `vertical: 'bottom'` in first section to prevent overlap with scroll indicators
- Test positioning with your video/model placement to avoid overlap

### 3. Consistency
- Maintain consistent styling across sections
- Use similar position patterns for better UX
- Keep text concise and readable

### 4. Mobile Considerations
- Test on mobile devices - content boxes are smaller
- Center alignment works best on mobile
- Shorter text is crucial for mobile readability

---

## 🔧 Advanced Customization

### Adding Custom Fields
You can extend the section config with custom fields:

```javascript
{
  title: 'Section Title',
  subtitle: 'Subtitle',
  description: 'Description',
  customField: 'Custom data',
  buttonText: 'Learn More',
  buttonUrl: '/learn-more'
}
```

Then access them in the JSX (around line 958):
```jsx
<div className="section-content">
  {section.showNumber !== false && (
    <div className="section-number">SECTION {index + 1}</div>
  )}
  <h2 className="section-title">{section.title}</h2>
  <p className="section-subtitle">{section.subtitle}</p>
  {section.description && (
    <p className="section-description">{section.description}</p>
  )}
  {section.buttonText && (
    <button onClick={() => window.location.href = section.buttonUrl}>
      {section.buttonText}
    </button>
  )}
</div>
```

---

## 📊 Configuration Summary

### Quick Reference Table

| Section | Default Position (Desktop) | Default Position (Mobile) | Customizable Text Fields |
|---------|---------------------------|---------------------------|-------------------------|
| 1 | Center-Top | Center-Center | title, subtitle, description |
| 2 | Left-Center | Left-Center | title, subtitle, description |
| 3 | Center-Center | Center-Center | title, subtitle, description |
| 4 | Right-Center | Right-Center | title, subtitle, description |
| 5 | Center-Top | Center-Top | title, subtitle, description |

### CSS Classes Applied:
- `.section-justify-left/center/right` - Horizontal positioning
- `.section-align-top/center/bottom` - Vertical positioning
- `.section-content` - Content box styling
- `.section-number` - Section number
- `.section-title` - Main heading
- `.section-subtitle` - Subheading
- `.section-description` - Description text

---

## 🚀 Next Steps

1. Modify the `sections` array for your content
2. Adjust `getContentPositionConfig()` for positioning
3. Test across different viewport sizes
4. Customize CSS in `ScrollSyncModel.css` if needed

---

## 💡 Tips

- Use the debug controls to test different positions in real-time
- Check the browser's responsive mode to preview all viewports
- Keep video position and content position in mind to avoid overlaps
- Update the configuration before building for production

---

For questions or issues, refer to the main component file:
`src/components/scroll-sections/ScrollSyncModel/ScrollSyncModel.jsx`

