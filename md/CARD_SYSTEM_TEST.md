# 🧪 Card Inventory System - Test Checklist

## Pre-Setup Requirements
- [ ] Supabase project created
- [ ] Database connected to HTML file
- [ ] All tables created (card_copies, card_inventory_history)
- [ ] Initial card templates inserted
- [ ] Admin access working

## Database Schema Tests

### Table: `card_copies`
- [ ] Can create new card copy with unique 3-digit number
- [ ] Status defaults to 'void'
- [ ] Guild ID is NULL for void cards
- [ ] Card number constraint works (no duplicates)
- [ ] Indexes created correctly

### Table: `card_inventory_history`
- [ ] Records created action on card creation
- [ ] Records action when assigning to guild
- [ ] Records admin name
- [ ] Records timestamp correctly
- [ ] Records from/to status transitions

### Legacy Table: `guild_cards`
- [ ] Still works for backwards compatibility
- [ ] Existing data preserved

## UI/Frontend Tests

### Card Inventory Tab - Card Copy Creation

**Test 1: Basic Card Copy Creation**
```
Steps:
1. Go to Admin → Cards Tab
2. In "📦 สร้างสำเนาการ์ด" section:
   - Select a card template
   - Enter number: 001
   - Click "✨ สร้างสำเนาการ์ด"

Expected:
✓ Toast: "✨ สร้างสำเนาการ์ด #001 [card name] เข้าคลังสมบัติแล้ว!"
✓ Card appears in Void section
✓ Entry in Activity Log
```

**Test 2: Duplicate Number Prevention**
```
Steps:
1. Create card #002
2. Try to create another card #002

Expected:
✗ Toast: "หมายเลข 002 มีการใช้แล้ว"
✗ Card not created
```

**Test 3: Invalid Number Format**
```
Steps:
1. Enter number: "12" (only 2 digits)
2. Click create

Expected:
✗ Toast: "หมายเลขต้องเป็นตัวเลข 3 หลัก"
✗ Card not created
```

### Void Inventory Display

**Test 4: Void Card Display**
```
Steps:
1. Create multiple cards (001, 002, 003)
2. Look at "🌀 คลังสมบัติ" section

Expected:
✓ Shows all cards
✓ Count shows 3
✓ Cards display with number and name
✓ Clickable to view details
```

**Test 5: Click on Card Details**
```
Steps:
1. Create card #001
2. Click on card in Void

Expected:
✓ Modal opens with:
  - Card icon
  - Number (#001)
  - Name
  - Effect
  - Status (✓ Void)
  - History section (first entry: "create")
```

### Card Assignment to Guild

**Test 6: Assign Card to Guild**
```
Steps:
1. Create cards #001, #002
2. In "🎁 มอบการ์ดให้กิลด์" section:
   - Select: #001 from dropdown
   - Select: A guild
   - Click "🎁 มอบการ์ด"

Expected:
✓ Toast: "🎁 มอบการ์ด #001 ให้ '[guild]' แล้ว!"
✓ Card disappears from Void
✓ Count decreases
✓ Card shows in Status section with 🎯 GUILD
✓ Activity log entry created
```

**Test 7: Card Status After Assignment**
```
Steps:
1. Assign #001 to "Dragon Slayers"
2. Look at "📋 สถานะการ์ดทั้งหมด" section

Expected:
✓ Card shows: "🎯 #001 - [name] · 🏰 Dragon Slayers"
✓ Shows "🔄 คืนไปVoid" button
```

### Return Card to Void

**Test 8: Return Card from Guild to Void**
```
Steps:
1. Assign #001 to a guild
2. In Status section, click "🔄 คืนไปVoid"
3. Confirm in modal

Expected:
✓ Modal: "🔄 คืนการ์ดไปคลังสมบัติ"
✓ Toast: "🔄 คืนการ์ด #001 ไปคลังสมบัติแล้ว!"
✓ Card returns to Void section
✓ Void count increases
✓ Status shows: "✓ #001" (no guild)
```

## Activity Logging Tests

**Test 9: All Actions Logged**
```
Steps:
1. Create card #001
2. Assign to guild
3. Return to Void
4. Check Activity Log

Expected:
✓ Three entries appear:
  1. "Admin — สร้างสำเนาการ์ด #001"
  2. "Admin — มอบการ์ด #001 ให้กิลด์"
  3. "Admin — คืนการ์ด #001 ไปคลังสมบัติ"
✓ Each has timestamp
✓ Each shows correct admin name
```

**Test 10: Card History Trail**
```
Steps:
1. Create #003, assign to guild, return to Void
2. Click card #003 in Void to see details

Expected:
✓ History section shows 3 actions:
  - create: 'create' action
  - assign_to_guild: 'assign_to_guild' action
  - move_to_void: 'move_to_void' action
✓ Each entry shows timestamp
✓ Each shows "Admin" name
```

## Integration Tests

**Test 11: Multiple Cards Workflow**
```
Steps:
1. Create 5 cards: #010-#014
2. Assign 3 to Guild 1
3. Assign 1 to Guild 2
4. Return 1 to Void
5. Check counts

Expected:
✓ Void shows 1 card
✓ Guild 1 status shows 3 cards (🎯)
✓ Guild 2 status shows 1 card (🎯)
✓ All logged correctly
```

**Test 12: Guild View Integration**
```
Prerequisites:
- Assign card #001 to "Dragon Slayers"

Steps:
1. Login as Dragon Slayers member
2. Go to Cards section
3. See assigned card #001

Expected:
✓ Card visible to guild members
✓ Shows card details
✓ Leader can click "ใช้การ์ด"
✓ Usage logged in Activity Log
```

## Performance Tests

**Test 13: Handle Large Dataset**
```
Steps:
1. Create 50 cards (001-050)
2. Assign half to various guilds
3. Load Void page

Expected:
✓ Loads within 2 seconds
✓ All cards display correctly
✓ No performance degradation
✓ Pagination/scrolling works
```

## Edge Cases

**Test 14: Boundary Numbers**
```
Steps:
1. Create cards: #001, #999
2. Try to create #1000

Expected:
✓ #001 works (minimum)
✓ #999 works (maximum)
✗ #1000 fails (invalid format)
✗ #0 fails (invalid format)
```

**Test 15: Non-Numeric Numbers**
```
Steps:
1. Try to enter: "ABC", "00A", "99X"

Expected:
✗ All fail with format error
✗ Toast: "หมายเลขต้องเป็นตัวเลข 3 หลัก"
```

## Cleanup & Admin Tests

**Test 16: Create/Delete Card Templates**
```
Steps:
1. Create new card template "🌟 Special Card"
2. Create copies (#100, #101, #102)
3. Delete template

Expected:
✓ Template can be created
✓ Copies created under template
✓ Template can be deleted
✓ History preserved
```

## Final Verification Checklist

Database:
- [ ] `card_copies` table working
- [ ] `card_inventory_history` table working
- [ ] All indexes created
- [ ] Foreign keys working
- [ ] Unique constraint on card_number

Frontend:
- [ ] Card creation UI functional
- [ ] Void inventory displays correctly
- [ ] Assignment workflow smooth
- [ ] Return to Void works
- [ ] Details modal shows history
- [ ] All buttons responsive

Logging:
- [ ] All actions logged
- [ ] Timestamps accurate
- [ ] Admin names captured
- [ ] History trail complete

Integration:
- [ ] Cards accessible to guilds
- [ ] Card usage logged
- [ ] Activity log shows everything
- [ ] No duplicate entries

Performance:
- [ ] Pages load quickly
- [ ] No lag with many cards
- [ ] Smooth scrolling/navigation
- [ ] Modal opens/closes properly

---

## Test Result Summary

Date Tested: _______________
Tester: ____________________

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | [ ] Pass [ ] Fail | |
| Card Creation | [ ] Pass [ ] Fail | |
| Void Management | [ ] Pass [ ] Fail | |
| Assignment | [ ] Pass [ ] Fail | |
| Return to Void | [ ] Pass [ ] Fail | |
| Logging | [ ] Pass [ ] Fail | |
| UI/UX | [ ] Pass [ ] Fail | |
| Performance | [ ] Pass [ ] Fail | |
| Edge Cases | [ ] Pass [ ] Fail | |
| Integration | [ ] Pass [ ] Fail | |

**Overall Status:** [ ] Ready for Production [ ] Needs Fixes

**Issues Found:**
1. ___________________________
2. ___________________________
3. ___________________________

**Fixed Issues:**
1. ___________________________
2. ___________________________
