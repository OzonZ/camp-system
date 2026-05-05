# ⚡ Card Inventory System - Quick Reference

## 🎯 At a Glance

| Task | Steps | Result |
|------|-------|--------|
| **Create Card Copy** | Select Template → Enter #001 → Click Create | Card in Void |
| **Assign to Guild** | Select Card #001 → Select Guild → Click Assign | Card in Guild |
| **Return to Void** | Click "🔄 คืนไปVoid" → Confirm | Card in Void |
| **View History** | Click Card → See All Actions | Full Audit Trail |
| **Check Void** | Open "🌀 คลังสมบัติ" | All Unassigned Cards |

---

## 🌀 Void Inventory Section

### What it Shows
```
✓ All cards NOT assigned to any guild
✓ Card count (top right)
✓ Card icon, number, name
✓ Ready to assign
```

### What You Can Do
- Click card to see full history
- Assign to guild (see "Assign" section)
- Monitor availability

---

## 🎁 Assign Cards Section

### How to Assign

```
1. "เลือกจากคลังสมบัติ" dropdown
   └─ Shows: 📦 #001 - Card Name
            📦 #002 - Card Name
            
2. "เลือกกิลด์" dropdown
   └─ Shows: Dragon Slayers
            Roblox Warriors
            Web Dev Masters
            
3. Click "🎁 มอบการ์ด"
   └─ Toast: "🎁 มอบการ์ด #001 ให้ Dragon Slayers แล้ว!"
```

---

## 📋 Card Status Dashboard

### Understanding Symbols

```
✓ #001 - Card Name
  ↓
  = Card in Void, unassigned

🎯 #002 - Card Name · 🏰 Guild Name
  ↓
  = Card assigned to Guild, ready to use
  = Has "🔄 คืนไปVoid" button

✔️ #003 - Card Name
  ↓
  = Card was used (archived)
```

### Actions Available

- **For ✓ (Void):** None - ready to assign
- **For 🎯 (Guild):** Click "🔄 คืนไปVoid" to return
- **For ✔️ (Used):** View history only

---

## 📖 Card Details Modal

### How to Open

```
Click any card in:
├─ 🌀 Void section
├─ 📋 Status dashboard
└─ Card grid
```

### What You See

```
┌─────────────────────┐
│     🃏 Icon        │
├─────────────────────┤
│   # Card Number     │
│   Card Name         │
│   Status            │
│   Effect            │
├─────────────────────┤
│   📋 History        │
│  ✓ Created: 2:00 PM │
│  🎯 Assigned: 2:05  │
│  🔄 Returned: 2:10  │
└─────────────────────┘
```

---

## 🔢 3-Digit Number Format

### Rules
- **Format:** 000-999 (must be 3 digits)
- **Unique:** Each number used only once
- **Required:** Can't skip entry

### Examples
```
✓ Valid:    001, 002, 003, 042, 100, 999
✗ Invalid:  1 (too short), 0001 (too long), ABC (letters)
```

### Best Practices
```
Sequential:      001, 002, 003, 004, 005...
By Section:      100 (Section 1), 200 (Section 2)...
By Type:         101 (Sword), 201 (Shield), 301 (Magic)...
```

---

## 📱 Common Workflows

### Workflow 1: One-Time Card Use

```
Mon 9:00
├─ Create #001
├─ Assign to Dragon Slayers
├─ Dragons use card
└─ Activity log records usage
```

### Workflow 2: Reusable Card

```
Mon 9:00
├─ Create #001
├─ Assign to Dragon Slayers
├─ Dragons use card
│
Wed 10:00
├─ Click "🔄 คืนไปVoid"
├─ Card returns to Void
│
Thu 11:00
├─ Assign #001 to Roblox Warriors
└─ Roblox Warriors use card
```

### Workflow 3: Multiple Cards

```
Create 3 cards: #010, #011, #012
Assign all to separate guilds:
├─ #010 → Dragon Slayers
├─ #011 → Roblox Warriors
└─ #012 → Web Dev Masters

Each guild can use their card
When done, return all to Void
Ready for next round
```

---

## ⚙️ Settings & Numbers

### Recommended Setup

```
First Setup:
├─ Create 1 copy per card type
├─ Use numbers 001-010
├─ Assign to first round guilds

Second Round:
├─ Create more copies: 011-020
├─ Or return from Void and reassign
└─ Use same numbering system

Large Events:
├─ Multiple sets: 100s, 200s, 300s
├─ Track by type, not sequence
└─ Clearer organization
```

---

## 🚨 Troubleshooting

### Problem: Number Says "Already Used"
```
❌ Error: "หมายเลข 001 มีการใช้แล้ว"

Solution:
1. Check card history (click it)
2. Number must be unique
3. Choose different number (002, 003, etc.)
```

### Problem: Can't Find Card
```
❌ Can't see card in Void

Reasons:
- Already assigned to guild
- Used and archived
- Check "📋 สถานะการ์ดทั้งหมด"

Solution:
1. Search in Status dashboard
2. Return from guild if needed
```

### Problem: Want to Reuse Card
```
❌ Card already assigned

Solution:
1. Find card in Status dashboard
2. Click "🔄 คืนไปVoid"
3. Card back in Void
4. Assign to new guild
```

### Problem: History Not Showing
```
❌ Modal not showing history

Solution:
1. Give system 1-2 seconds
2. Refresh page
3. Try again

Or:
1. Check Activity Console (📡 tab)
2. Search by card number
3. View from there
```

---

## 🎨 UI Guide

### Admin Panel Tabs

```
ADMIN PANEL
├─ Guilds (🏰)
├─ Members (👥)
├─ Teams (👥)
├─ Quests (⚔️)
├─ ★ Cards (🃏) ← Card Inventory Here
├─ Competitions (🏁)
├─ Submissions (📬)
├─ Console (📡)
└─ Leaderboard (🏆)
```

### Cards Tab Sections (Top to Bottom)

```
1. ➕ สร้างการ์ดใหม่
   └─ Make new card templates

2. 📦 สร้างสำเนาการ์ด ← CARD INVENTORY
   └─ Create card copies with numbers

3. 🌀 คลังสมบัติ (Void) ← CARD INVENTORY
   └─ View all unassigned cards

4. 🎁 มอบการ์ดให้กิลด์ ← CARD INVENTORY
   └─ Assign from Void to guild

5. 📋 สถานะการ์ดทั้งหมด ← CARD INVENTORY
   └─ See all cards + actions

6. 🃏 การ์ดเทมเพลตในระบบ
   └─ Manage card templates
```

---

## 📊 Data You Can See

### Card Copy Information
```
Number:  3-digit unique ID
Name:    Card template name
Icon:    Emoji representation
Effect:  What the card does
Status:  ✓ Void, 🎯 Guild, ✔️ Used
Guild:   Current owner (if any)
```

### Activity Logged
```
Created: Timestamp + Admin + Card Details
Assigned: Timestamp + Guild + Card Number
Returned: Timestamp + Card Number
Used: When guild leader activates
```

### History Available
```
Each card shows complete path:
- When created
- Which guild assigned to
- When used
- When returned
- Every admin action
```

---

## 🔒 Admin-Only Access

**Who Can Access?**
- Admin only
- Requires admin login

**What They Can Do?**
- Create cards
- Manage Void
- Assign cards
- Return cards
- View all history
- See all logs

**What They Can't?**
- Delete cards (only templates)
- Override status manually
- Skip logging

---

## 📞 Quick Tips

✓ **Always use 3-digit numbers** - No 1, 10, or 100

✓ **Check Void first** - Before creating new cards

✓ **Return cards properly** - Not just ignore them

✓ **View history** - Track movements and compliance

✓ **Use Activity Log** - See everything that happened

✓ **Name clearly** - Easy to identify cards

✓ **Organize numbers** - Sequential or by type

✓ **Keep backup** - Take screenshots of history

---

## 📋 Checklist for Event Setup

- [ ] Create card templates (if not exists)
- [ ] Create card copies with numbers (001, 002, ...)
- [ ] Verify in Void section (shows all)
- [ ] Assign to first guild
- [ ] Check Activity Log
- [ ] Verify card shows in Status
- [ ] Guild can see assigned card
- [ ] Guild leader can use card
- [ ] Log shows usage
- [ ] Can return to Void
- [ ] Test reuse workflow

---

**Last Updated:** May 5, 2026  
**Version:** 1.0  
**Status:** Ready for Use ✅
