# Text Alignment Configuration - Quick Guide

## ✨ New Feature: Per-Section Text Alignment

You can now control the text alignment for each section independently!

---

## 🚀 Usage

### Simple Configuration
Add `textAlign` to your section config:

```javascript
{
  textSets: [...],
  animationConfig: {...},
  textAlign: 'center'  // Options: 'left', 'center', 'right'
}
```

---

## 📝 Examples

### Section 1: Center-Aligned (Default)
```javascript
{
  textSets: {
    set1: ['Vast and intricate,', 'products never stop evolving.'],
    set2: ['Enterprise customers have an', 'endless spectrum of realities.']
  },
  textAlign: 'center',  // Centered text
  animationConfig: { type: 'fadeSlideUp', duration: 0.8 }
}
```

### Section 2: Left-Aligned
```javascript
{
  textSets: {
    set1: ['The support landscape is', 'boundless and shifting'],
    set2: ["You're lost.", '', 'and fractional knowledge', 'cripple frontline actions.']
  },
  textAlign: 'left',    // Left-aligned text
  animationConfig: { type: 'stagger', duration: 0.6 }
}
```

### Section 3: Right-Aligned
```javascript
{
  textSets: ['Discover', 'Transform', 'Succeed'],
  textAlign: 'right',   // Right-aligned text
  animationConfig: { type: 'fadeIn', duration: 0.7 }
}
```

---

## 🎯 Options

| Value | Effect | Best For |
|-------|--------|----------|
| `'left'` | Left-aligned text | Narrative content, lists, reading flow |
| `'center'` | Center-aligned text | Hero sections, impact statements, symmetry |
| `'right'` | Right-aligned text | Unique layouts, RTL languages, visual balance |

---

## 💡 How It Works

### 1. Text Alignment Applies To:
- ✅ Text set lines
- ✅ Section titles
- ✅ Section subtitles
- ✅ Section descriptions
- ✅ Section numbers

### 2. Works With All Text Types:
- ✅ Cycling text sets (object)
- ✅ Simple text sets (array)
- ✅ Traditional title/subtitle

### 3. Responsive:
- ✅ Maintains alignment across all screen sizes
- ✅ Auto-adjusts for mobile layouts

---

## 🎨 Visual Design Tips

### Center Alignment
**Best for:**
- Hero sections
- Main statements
- Symmetrical designs
- Impact messages

**Example:**
```javascript
textAlign: 'center'
// Result: Text centered, balanced, professional
```

### Left Alignment
**Best for:**
- Reading-heavy content
- Story-telling sections
- Lists and features
- Natural reading flow

**Example:**
```javascript
textAlign: 'left'
// Result: Text aligned left, easy to read
```

### Right Alignment
**Best for:**
- Visual variety
- Complementary sections
- Creative layouts
- Design emphasis

**Example:**
```javascript
textAlign: 'right'
// Result: Text aligned right, unique look
```

---

## 🔧 Configuration Location

Edit your section configurations in `ScrollSyncModel.jsx` at **line 967**:

```javascript
const sections = [
  {
    textSets: {...},
    textAlign: 'center'  // Add this line
  },
  {
    textSets: {...},
    textAlign: 'left'    // Different alignment per section
  }
];
```

---

## 📱 Responsive Behavior

Text alignment is consistent across all devices:

| Device | Alignment | Result |
|--------|-----------|--------|
| Desktop | As configured | Full control |
| Tablet | As configured | Maintains alignment |
| Mobile | As configured | Scales but keeps alignment |

---

## 💼 Real-World Examples

### Marketing Site
```javascript
// Section 1: Hero - Center
{ textAlign: 'center', textSets: ['Welcome', 'to Innovation'] }

// Section 2: Features - Left
{ textAlign: 'left', textSets: ['Fast', 'Secure', 'Reliable'] }

// Section 3: CTA - Center
{ textAlign: 'center', textSets: ['Ready?', "Let's Start"] }
```

### Portfolio Site
```javascript
// Section 1: Intro - Left
{ textAlign: 'left', textSets: ['Designer', '& Developer'] }

// Section 2: Work - Right
{ textAlign: 'right', textSets: ['Projects', 'Case Studies'] }

// Section 3: Contact - Center
{ textAlign: 'center', textSets: ['Get in', 'Touch'] }
```

### Product Launch
```javascript
// Section 1: Announcement - Center
{ textAlign: 'center', textSets: ['Introducing', 'Product X'] }

// Section 2: Details - Left
{ textAlign: 'left', textSets: ['Features', 'that matter'] }

// Section 3: Pricing - Center
{ textAlign: 'center', textSets: ['$99', 'per month'] }
```

---

## 🎯 Default Behavior

If you **don't specify** `textAlign`, it defaults to `'center'`:

```javascript
{
  textSets: [...],
  // textAlign not specified
}
// Result: Text will be center-aligned (default)
```

---

## ✨ Current Implementation

Your current sections are configured with:

- **Section 1**: `textAlign: 'center'` - Center-aligned
- **Section 2**: `textAlign: 'left'` - Left-aligned
- **Section 3**: `textAlign: 'center'` - Center-aligned
- **Section 4**: `textAlign: 'right'` - Right-aligned
- **Section 5**: `textAlign: 'center'` - Center-aligned

---

## 🚀 Quick Start

### Step 1: Find Your Section
Open `ScrollSyncModel.jsx` and locate the section you want to modify (around line 931).

### Step 2: Add textAlign
```javascript
{
  textSets: {...},
  animationConfig: {...},
  textAlign: 'left'  // Add this
}
```

### Step 3: Save & Test
Save the file and scroll to see your changes!

---

## 🎨 Combining with Other Features

### With Cycling Text
```javascript
{
  textSets: {
    set1: ['Line 1', 'Line 2'],
    set2: ['Line 3', 'Line 4']
  },
  textSetTiming: { displayDuration: 4000, loop: true },
  textAlign: 'left',  // Left-aligned cycling text
  animationConfig: { type: 'fadeSlideUp' }
}
```

### With Content Positioning
```javascript
// Content box on left, text left-aligned
getContentPositionConfig(): { horizontal: 'left', vertical: 'center' }
section: { textAlign: 'left' }
```

### With Different Animations
```javascript
// Left-aligned with slide right animation
{
  textSets: [...],
  textAlign: 'left',
  animationConfig: { type: 'slideRight' }  // Animates from left
}
```

---

## 💡 Pro Tips

1. **Match content box position with text alignment** for visual consistency:
   - Left position + left align
   - Center position + center align
   - Right position + right align

2. **Use different alignments** to create visual flow through sections

3. **Center alignment** works best for short, impactful statements

4. **Left alignment** is easier to read for longer text

5. **Right alignment** can create unique visual interest

---

## 📚 Related Features

- **Content Positioning**: Control where the content box appears (horizontal/vertical)
- **Text Animation**: Choose from 6 animation types
- **Cycling Text**: Rotate through multiple text sets
- **Responsive Design**: Auto-scales across all devices

---

## 🎉 You're Ready!

Start using text alignment to create more dynamic and visually interesting sections!

**Quick example:**
```javascript
{
  textSets: { set1: ['Your text'], set2: ['More text'] },
  textAlign: 'left',  // Simple as that!
  animationConfig: { type: 'fadeSlideUp' }
}
```

Happy aligning! ✨

