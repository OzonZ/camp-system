# ⚔️ Guild Camp System

ระบบจัดการกิจกรรมแคมป์เรียนด้วยระบบกิลด์ เควส การ์ด และการแข่งขัน

## 🚀 Features

### 👤 Member Features
- **Login**: ใส่ชื่อ > เลือก/สร้างกิลด์
- **Quests**: ดูเควสของกิลด์พร้อมความคืบหน้า
- **Teams**: ดูโครงสร้างกลุ่ม (1-4 คน/กลุ่ม)
- **Guild Members**: ดูรายชื่อสมาชิกทั้งหมด
- **Cards**: ดูการ์ดของกิลด์
  - **Leader Only**: สามารถใช้การ์ดได้ (บันทึกใน Admin Log)
- **Competitions**: ดูการแข่งขันระหว่างกิลด์
- **Leaderboard**: ดูอันดับกิลด์

### 👑 Guild Leader Features
- ทำได้ทุกอย่างที่สมาชิกทำได้
- **ใช้การ์ด**: คลิกใช้การ์ดเพื่อให้ปรากฏใน Admin Log

### 🛠️ Admin Features

#### 🏰 Guild Management
- ดูรายชื่อกิลด์ทั้งหมด
- ดูสมาชิกในแต่ละกิลด์
- บวก/ลบแต้มกิลด์ (+10, +25, -10)
- ดูความคืบหน้า

#### 👥 Team Management
- สร้างกลุ่มสำหรับกิลด์
- จัดการสมาชิกในกลุ่ม
- ลบกลุ่ม

#### 📜 Quest Management
- สร้างเควสใหม่
  - ตั้งชื่อ, คำอธิบาย
  - กำหนดแต้มรางวัล
  - เลือก emoji
  - มอบให้กิลด์เฉพาะ หรือ ทุกกิลด์
- ดูรายชื่อเควสทั้งหมด
- ลบเควส
- ติดตามความคืบหน้า

#### 🃏 Card Management
- มอบการ์ดให้กิลด์
- ดูการ์ดทั้งหมด
- ติดตามการใช้การ์ด (ใคร, เมื่อไร)

#### 🏁 Competitions
- สร้างการแข่งขัน
- ปรับแต่งคะแนน (+5, -5)
- ดูอันดับแบบ Real-time
- ลบการแข่งขัน

#### 📡 Console Log
- ตรวจสอบกิจกรรมทั้งหมด
  - ใครสร้างกิลด์, เข้าร่วม
  - ใครใช้การ์ดอะไร
  - Admin จัดการแต้ม
- Timestamp ของแต่ละกิจกรรม

#### 🏆 Leaderboard
- ดูอันดับกิลด์ (คะแนนสูงต่ำ)
- Progress bar

## 🛠️ Setup

### 1. Supabase Setup
- ไปที่ [Supabase](https://supabase.com)
- สร้าง project ใหม่
- Run SQL queries จาก `SETUP_SUPABASE.md`

### 2. Update Credentials
แก้ไขใน `index.html`:
```javascript
const SUPA_URL = 'YOUR_SUPABASE_URL';
const SUPA_KEY = 'YOUR_SUPABASE_KEY';
const ADMIN_PASSWORD = 'YOUR_PASSWORD'; // default: 'camp2025'
```

### 3. Open in Browser
เปิด `index.html` ในเบราว์เซอร์

## 📱 Usage Flow

### สำหรับผู้เข้าร่วม (Participants)
1. ป้อนชื่อ
2. สร้างกิลด์ใหม่ หรือ เข้าร่วมกิลด์ที่มี
3. ดูเควส, ทีมของตัวเอง, การ์ด, แข่งขัน
4. ถ้าเป็นหัวกิลด์ → ใช้การ์ดได้

### สำหรับ Admin
1. คลิก "🛠️ เข้าสู่ระบบ Admin"
2. ใส่รหัสผ่าน (default: `camp2025`)
3. จัดการกิลด์, เควส, การ์ด, แข่งขัน
4. ตรวจสอบ Console Log

## 🎨 Structure

```
index.html
├── Login Screen
├── Guild Select Screen
├── Create Guild Screen
├── Member Dashboard
│   ├── Quests Tab
│   ├── Teams Tab
│   ├── Guild Members Tab
│   ├── Cards Tab
│   ├── Competitions Tab
│   └── Leaderboard Tab
└── Admin Dashboard
    ├── Guilds Tab
    ├── Teams Management Tab
    ├── Quests Tab
    ├── Cards Tab
    ├── Competitions Tab
    ├── Console Log Tab
    └── Leaderboard Tab
```

## 🗄️ Database Schema

11 Tables:
- `guilds` - กิลด์หลัก
- `members` - สมาชิก
- `teams` - กลุ่ม (3 กลุ่ม/กิลด์)
- `team_members` - สมาชิกในกลุ่ม
- `quests` - เควส
- `guild_quests` - ความคืบหน้าเควส
- `cards` - ระบบการ์ด
- `guild_cards` - การ์ดของกิลด์
- `competitions` - การแข่งขัน
- `competition_participants` - คะแนนแข่งขัน
- `activity_log` - บันทึก log

## 🎯 Admin Password

Default: `camp2025`

เปลี่ยนได้ใน `ADMIN_PASSWORD` constant

## 🌐 Browser Support

- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## 📝 Notes

- ทุกข้อมูลเก็บใน Supabase (Cloud)
- Real-time updates ด้วย Supabase JS Client
- การ์ด preset 6 ชิ้น (สามารถเพิ่มเติมได้)
- RLS (Row Level Security) แนะนำให้ enable เพื่อความปลอดภัย

## 🤝 Support

หากมีปัญหา:
1. ตรวจสอบ Supabase connection
2. ดู Console Log (F12)
3. ตรวจสอบรหัสผ่าน Admin
