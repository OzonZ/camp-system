# 🃏 Card Inventory System (Void Storage) - Guide

## Overview

The card inventory system allows admins to manage physical card copies with unique 3-digit numbers. Cards are stored in a central storage called "Void" where they can be managed and assigned to guilds.

## Key Features

### 1. **Void (คลังสมบัติ)**
- Central storage for all card copies
- Accessible only to admins
- Shows all unassigned and returned cards
- Quick view of inventory status

### 2. **Card Copies (สำเนาการ์ด)**
- Each card has a unique 3-digit number (001-999)
- Created by admin with customizable numbers
- Can be moved between Void and guilds
- History of all movements tracked

### 3. **Card Status Tracking**
- **Void** (✓): In storage, ready to assign
- **Guild** (🎯): Currently assigned to a guild
- **Used** (✔️): Has been used by a guild

## Database Tables

### `card_copies`
Tracks individual card copies with their current state:
- `id`: Unique identifier
- `card_id`: Reference to card template
- `card_number`: 3-digit number (e.g., "001")
- `status`: 'void', 'guild', or 'used'
- `guild_id`: Which guild it's assigned to (NULL if in Void)
- `assigned_at`: Timestamp when assigned to guild
- `used_at`: Timestamp when used (if applicable)
- `used_by_member_name`: Which member used it

### `card_inventory_history`
Complete audit trail of all card movements:
- `card_copy_id`: Which card copy
- `action`: 'create', 'move_to_void', 'assign_to_guild', 'use_card', etc.
- `admin_name`: Which admin performed the action
- `from_status` / `to_status`: State transition
- `from_guild_id` / `to_guild_id`: Guild transitions
- `notes`: Additional notes about the action

## How to Use

### Creating Card Copies

1. Go to **Admin Panel → Cards Tab**
2. Look for "📦 สร้างสำเนาการ์ด (Card Copy)" section
3. Select a card template
4. Enter a 3-digit number (e.g., "001")
5. Click "✨ สร้างสำเนาการ์ด"
6. New card copy automatically goes to Void

**Example:**
```
- Select: ⚔️ แรงปาฐาน
- Number: 001
- Result: Card #001 is created and stored in Void
```

### Assigning Cards to Guilds

1. In "🎁 มอบการ์ดให้กิลด์" section
2. Select a card from Void (shows as "📦 #XXX - Card Name")
3. Select the guild to receive it
4. Click "🎁 มอบการ์ด"
5. Card status changes to "Guild" and is now accessible to that guild

### Returning Cards to Void

When a guild leader uses a card, it can be returned to Void for reuse:

1. In "📋 สถานะการ์ดทั้งหมด" section, find the card
2. If it's in a guild (🎯 status), a "🔄 คืนไปVoid" button appears
3. Click the button to return it to Void
4. Card is now available for other guilds

### Viewing Card History

1. Click on any card in the Void inventory
2. A modal opens showing:
   - Card details (number, name, effect)
   - Current status
   - Complete history of movements
   - Which admin performed each action
   - Timestamps

## Admin Activities Logged

All the following actions are logged in the **Activity Console**:

1. **Create Card Copy**: `Admin — สร้างสำเนาการ์ด #XXX "Card Name"`
2. **Assign to Guild**: `Admin — มอบการ์ด #XXX ให้กิลด์ "Guild Name"`
3. **Return to Void**: `Admin — คืนการ์ด #XXX ไปคลังสมบัติ (Void)`
4. **Use Card**: Logged when guild leader uses the card

## Status Dashboard

The "📋 สถานะการ์ดทั้งหมด" section shows:

```
✓ #001 - แรงปาฐาน (void)
🎯 #002 - แรงปาฐาน · 🏰 Dragon Slayers (guild)
✔️ #003 - โล่ป้องกัน · Used (used)
```

This gives a quick overview of:
- All card copies in the system
- Current status of each
- Which guild (if any) it's assigned to

## Example Workflow

### Scenario: Guild Leader Uses a Card

1. **Setup**:
   - Admin creates card copy #001 "⚔️ แรงปาฐาน"
   - Card goes to Void

2. **Assignment**:
   - Admin assigns #001 to "Dragon Slayers" guild
   - Card status changes to "🎯 Guild"

3. **Usage**:
   - Guild leader clicks "ใช้การ์ด" in member view
   - System logs: `Leader Name — ใช้การ์ด "แรงปาฐาน"` with timestamp

4. **Return (Optional)**:
   - Admin can click "🔄 คืนไปVoid" to return it to storage
   - Card becomes available for other guilds
   - System logs: `Admin — คืนการ์ด #001 ไปคลังสมบัติ (Void)`

## Numbering System

### 3-Digit Numbers

Cards use a simple 3-digit numbering system:
- `001` to `999` available
- Must be unique (no duplicates allowed)
- Recommended: Sequential (001, 002, 003...)
- Can be custom (e.g., 100, 200, 999)

### Numbering Tips

```
Sequential:     001, 002, 003, 004, 005...
By Type:        101 (Type A), 201 (Type B), 301 (Type C)
Custom Pattern: 111, 222, 333, 444, 555...
```

## Audit & Compliance

### Card Inventory History

Every card movement is recorded with:
- **Timestamp**: Exact time of action
- **Admin Name**: Who performed the action
- **Action Type**: What was done
- **Before/After Status**: State transition
- **Notes**: Additional context

### Viewing History

Click any card copy to see its complete audit trail, perfect for:
- Tracking card movements
- Verifying admin actions
- Identifying lost/missing cards
- Compliance reporting

## Troubleshooting

### Duplicate Card Number Error
**Problem**: "หมายเลข XXX มีการใช้แล้ว"
**Solution**: Each card number must be unique. Choose a different 3-digit number.

### Card Not in Void
**Problem**: Can't find a card to assign to a guild
**Solution**: Check if it's already assigned to another guild. Use the status dashboard to find it.

### Need to Recover a Card
**Problem**: Want to reuse a card that's already assigned
**Solution**: Use the "🔄 คืนไปVoid" button on the card status to return it to Void, then reassign.

## Related Documentation

- [SETUP_SUPABASE.md](SETUP_SUPABASE.md) - Database schema
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin panel guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - System overview
