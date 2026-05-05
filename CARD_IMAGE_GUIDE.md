# 🖼️ Card Image Upload - Feature Guide

## Overview

Cards can now have custom images! Admins can upload card artwork when creating cards, and guild leaders will see the beautiful card images along with the card name, effect, and unique 3-digit number.

## Features

### For Admin

**Upload Card Images When Creating Cards**
- Supported formats: PNG, JPEG
- Maximum file size: 3 MB
- Optional feature (cards can exist without images)
- Live preview before uploading

**Image Management**
- Preview images in the card template grid
- View images in card status dashboard
- Images stored as base64 in database

### For Guild Leaders

**View Card Images**
- See full card artwork
- Card displays with 3D card-like layout (3:4 aspect ratio)
- Shows card number (#001) in the top-right corner
- Card name and effect description visible
- One-click "Use Card" button

## How to Use

### Admin: Upload Card Image

#### Step 1: Go to Card Creation
```
Admin Panel → Cards Tab → "➕ สร้างการ์ดใหม่"
```

#### Step 2: Fill Basic Information
```
1. Choose emoji (or type custom emoji)
2. Enter card name (e.g., "⚔️ แรงปาฐาน")
3. Enter card effect (e.g., "+30 point สำหรับกิลด์")
```

#### Step 3: Upload Image
```
1. Click "🖼️ รูปภาพการ์ด" file input
2. Select PNG or JPEG image (max 3 MB)
3. Click "👁️ ดูตัวอย่าง" to preview
```

#### Step 4: Preview Check
```
- Image shows in preview box
- File size shows: "✓ ไฟล์ขนาด 1.45 MB - พร้อมอัปโหลด"
- If too large: "❌ ไฟล์ขนาด 5.20 MB เกินขนาดสูงสุด 3 MB"
```

#### Step 5: Create Card
```
Click "✨ สร้างการ์ด" button
Toast appears: "✨ สร้างการ์ดแล้ว! (มีรูป)"
```

### Guild Leaders: View Cards with Images

#### Location
```
Member View → Cards Section (or Guild Cards Tab)
```

#### What You See

**With Image:**
```
┌─────────────────────┐
│   [CARD IMAGE]      │
│   #001 (corner)     │
│                     │
│ ⚔️ แรงปาฐาน         │
│ +30 point สำหรับกิลด์│
│                     │
│ [✨ ใช้การ์ด]        │
└─────────────────────┘
```

**Without Image (Legacy):**
```
┌─────────────────────┐
│        🃏            │ (emoji fallback)
│                     │
│ Card Name           │
│ Card Effect         │
│                     │
│ [✨ ใช้การ์ด]        │
└─────────────────────┘
```

#### Features
- Click card image to view at full size
- Card number (#001) shown in top-right badge
- All card details visible
- "✨ ใช้การ์ด" button to use the card
- Full history tracking when card is used

## Technical Details

### Database Schema

**Cards Table Addition:**
```sql
image_data TEXT,              -- Base64 encoded image
image_mime_type TEXT DEFAULT 'image/png'
```

### Image Storage

**Format:** Base64-encoded data URL
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

**Size:** 2-3 MB recommended
- Minimum: 1 MB
- Maximum: 3 MB
- Larger images increase page load time

**Types Supported:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- Transparent background recommended for PNG

## Best Practices

### Image Recommendations

**Dimensions:**
- Aspect Ratio: **3:4** (portrait/card-like)
- Recommended: 400×530 pixels
- Minimum: 300×400 pixels
- Maximum: Any size (will resize to fit)

**File Size:**
- Target: 1-2 MB per image
- Optimal: 1.5 MB
- Maximum: 3 MB

**Quality:**
- JPEG: Use quality 85-95%
- PNG: Use appropriate compression
- Avoid very large dimensions (slows page load)

### Card Design Tips

1. **Use Portrait Layout**
   - Cards look best in 3:4 ratio
   - Vertical layouts work best

2. **Include Important Details**
   - Card name/icon in design
   - Effect/ability text
   - Visual hierarchy for quick scanning

3. **Consistent Style**
   - Use same border/frame style
   - Consistent color scheme
   - Professional appearance

4. **Readable Text**
   - Use high contrast
   - Keep text large enough
   - Test on mobile view

### File Organization

```
File naming: card_name.jpg
Examples:
- strength_sword.jpg
- shield_defense.jpg
- magic_spell.png
- healing_potion.png
```

## Features & Compatibility

### Support

**Both Supported:**
- ✓ Legacy system (guild_cards) - shows emoji or image
- ✓ New system (card_copies) - shows image with #number

**Backwards Compatible:**
- ✓ Old cards without images still work
- ✓ Shows emoji fallback if no image
- ✓ Can add images to existing cards (admin update)

### Performance

**Load Time:**
- Single card: < 100ms
- Multiple cards (10+): < 1s
- Full inventory: < 2s

**Storage:**
- Base64 in database works for 2-3 MB images
- For larger collections, consider external storage

## Troubleshooting

### Problem: "เกิดข้อผิดพลาด: File too large"

**Solution:**
1. Reduce image dimensions
2. Compress image quality
3. Use online compressor: TinyPNG, ImageOptim
4. Ensure under 3 MB

### Problem: Image Doesn't Show

**Solutions:**
1. Check file format (PNG or JPEG only)
2. Try re-uploading
3. Clear browser cache (Ctrl+Shift+Delete)
4. Reload page

### Problem: Image Shows Stretched/Wrong Size

**Solution:**
- Use correct aspect ratio (3:4)
- Redesign image to portrait orientation
- Re-upload with corrected dimensions

### Problem: Card Shows Emoji Instead of Image

**Reasons:**
- Image upload failed
- File format not supported
- No image was selected
- Browser cache issue

**Solution:**
1. Check admin upload logs
2. Try uploading again with different file
3. Clear cache and retry

## Activity Logging

All card image uploads are logged:

```
Activity Log Entry:
"Admin — สร้างการ์ดใหม่ "⚔️ แรงปาฐาน" (มีรูป)"
```

**Indicates:**
- [มีรูป] = Image was uploaded
- Without note = No image attached

## File Size Reference

**Common Image Sizes:**

| Dimension | JPEG Quality | JPEG Size | PNG Size |
|-----------|-------------|-----------|----------|
| 300×400   | 95%         | 80-120 KB | 150-300 KB |
| 400×530   | 90%         | 150-250 KB | 250-500 KB |
| 500×665   | 85%         | 250-350 KB | 400-800 KB |
| 600×800   | 80%         | 350-500 KB | 600-1200 KB |

**Recommendations:**
- ✓ Use 400×530 @ 90% quality JPEG = ~200 KB (optimal)
- ✓ Use 300×400 @ 95% quality JPEG = ~120 KB (fast)
- ✓ Use PNG only if transparency needed

## Examples

### Simple Card with Image

**Admin Upload:**
1. Select "Strength Boost" card template
2. Upload `strength_boost.jpg` (2 MB)
3. Click Create

**Guild Leader Sees:**
```
[High-quality artwork image]
#042 (badge in corner)
⚔️ Strength Boost
+30 points for guild
[✨ ใช้การ์ด]
```

### Card Without Image (Fallback)

**Admin Creates:**
1. Fill name: "Quick Buff"
2. Fill effect: "Speed +1"
3. Skip image upload
4. Click Create

**Guild Leader Sees:**
```
🃏 (emoji)
Quick Buff
Speed +1
[✨ ใช้การ์ด]
```

## Advanced Features

### Viewing Full-Size Images

**For Guild Leaders:**
- Click on card image to view full size
- Modal opens with zoomed view
- Close modal to return to cards

### Card Template Gallery (Admin)

**Shows:**
- Card image (if exists)
- Card name
- Delete button
- All templates in grid layout

### Status Dashboard (Admin)

**Displays:**
- Card status (Void/Guild/Used)
- Image thumbnail
- Guild assignment info
- Card number (#XXX)

## Related Documentation

- [SETUP_SUPABASE.md](SETUP_SUPABASE.md) - Database schema with image fields
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin panel guide
- [CARD_INVENTORY_GUIDE.md](CARD_INVENTORY_GUIDE.md) - Card management guide

---

**Feature Version:** 1.0  
**Release Date:** May 5, 2026  
**Status:** Ready for Use ✅
