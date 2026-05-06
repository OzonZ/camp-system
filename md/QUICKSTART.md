# ⚡ Quick Start Guide - Guild Camp System

## 5 นาที ติดตั้งระบบให้พร้อมใช้งาน

### ขั้นตอนที่ 1: สร้าง Supabase Project (2 นาที)

1. ไปที่ https://supabase.com
2. คลิก **"New project"**
3. ใส่ชื่อ project: `guild-camp-system`
4. เลือก region ที่ใกล้ที่สุด
5. ตั้งรหัสผ่าน database
6. คลิก **"Create new project"** (รอประมาณ 2 นาที)

### ขั้นตอนที่ 2: สร้าง Database Tables (1.5 นาที)

1. ไปที่ **SQL Editor** ใน Supabase dashboard
2. คลิก **"New Query"**
3. คัดลอกโค้ด SQL ทั้งหมดจาก `SETUP_SUPABASE.md`
4. วาง (Paste) ลงใน editor
5. คลิก **"Run"** (สีน้ำเงินขวา)
6. รอให้สำเร็จ ✅

### ขั้นตอนที่ 3: นำข้อมูลตัวอย่างเข้า (1 นาที)

1. ใน **SQL Editor** คลิก **"New Query"** อีกครั้ง
2. คัดลอกจาก `init-data.js` ส่วน INSERT queries
3. วาง (Paste) ลงใน editor
4. คลิก **"Run"**
5. เสร็จ ✅

### ขั้นตอนที่ 4: หาข้อมูล Supabase (1 นาที)

1. ไปที่ **Settings** → **API**
2. หา:
   - **Project URL** (เช่น: `https://xxxxx.supabase.co`)
   - **anon public** key (Anon Key)
3. คัดลอกทั้งคู่

### ขั้นตอนที่ 5: ตั้งค่า index.html (30 วินาที)

1. เปิด `index.html` ด้วย Text Editor (Notepad++, VSCode)
2. ค้นหา (Ctrl+F): `const SUPA_URL`
3. หาบรรทัด:
   ```javascript
   const SUPA_URL = 'https://wguugymlanmshiulphft.supabase.co';
   const SUPA_KEY = 'eyJhbGc...';
   ```
4. แทนที่ด้วยของคุณ:
   ```javascript
   const SUPA_URL = 'YOUR_PROJECT_URL';  // paste URL จาก step 4
   const SUPA_KEY = 'YOUR_ANON_KEY';      // paste Anon Key จาก step 4
   ```
5. บันทึก (Ctrl+S)

---

## ✅ ทดสอบการทำงาน

### สำหรับผู้เข้าร่วม (Member)
1. เปิด `index.html` ในเบราว์เซอร์
2. ป้อนชื่อ เช่น: `สมชาย`
3. คลิก **⚔️ เข้าสู่ระบบ**
4. เลือก guild ที่มีอยู่ หรือสร้างใหม่
5. ลองดูแต่ละแท็บ (เควส, กลุ่ม, สมาชิก, การ์ด, แข่งขัน)

### สำหรับ Admin
1. คลิก **🛠️ เข้าสู่ระบบ Admin**
2. ใส่รหัสผ่าน: `camp2025`
3. ลองแต่ละ tab:
   - **Guilds**: ดูกิลด์และปรับแต้ม
   - **Teams**: จัดการกลุ่ม
   - **Quests**: สร้างเควส
   - **Cards**: มอบการ์ด
   - **Competitions**: สร้างการแข่งขัน
   - **Log**: ดูกิจกรรมทั้งหมด

---

## 🎯 สิ่งที่ต้องทำต่อไป

### ในการ์ด (Cards)
- หาไฟล์ `init-data.js` 
- ดูส่วน "Create Initial Cards"
- Run ใน SQL Editor

### สร้างเควส
1. เข้า Admin mode
2. ไปที่ **📜 จัดการเควส**
3. ใส่ชื่อเควส เช่น: "เขียนโค้ด 100 บรรทัด"
4. ตั้งแต้ม เช่น: 50
5. เลือก emoji
6. คลิก **✨ สร้างเควส**

### ลองใช้การ์ด
1. เข้า Admin → **🃏 จัดการการ์ด**
2. เลือก Guild
3. เลือก Card
4. คลิก **🎁 มอบการ์ด**
5. Log out แล้ว login เป็น leader
6. ไปที่ **🃏 การ์ด** tab
7. คลิก **✨ ใช้การ์ด**
8. เห็นใน Admin → **📡 Console Log**

---

## ❓ FAQ

**Q: ไม่เห็นข้อมูล?**
A: 
- Refresh หน้า (F5)
- ตรวจสอบ Supabase URL ถูกต้อง
- ดูใน Console (F12 → Console tab)

**Q: Admin password ไม่ได้?**
A: 
- Default: `camp2025`
- Check ตัวพิมพ์ใหญ่/เล็ก
- Refresh หน้า

**Q: ต้องการเปลี่ยน Admin password?**
A:
- เปิด index.html
- ค้นหา: `const ADMIN_PASSWORD`
- เปลี่ยนเป็นรหัสใหม่
- บันทึก

**Q: ต้องการเพิ่มกลุ่ม (Teams)?**
A:
- Admin → **👥 จัดการกลุ่ม**
- เลือก Guild
- ใน Supabase dashboard
  - SQL Editor → Insert ลงใน `teams` table
  - แล้ว refresh

**Q: ต้องการเพิ่มสมาชิกในกลุ่ม?**
A:
- ใน Supabase → SQL Editor
- Insert ลงใน `team_members` table

---

## 🚀 เพิ่มเติม

### ทำให้ Live บน Internet
1. GitHub Pages (ฟรี)
   - Push ไป GitHub
   - Enable Pages ใน Settings
   
2. Netlify (ฟรี)
   - เชื่อม GitHub
   - Auto deploy

3. Vercel (ฟรี)
   - Import จาก GitHub

ดูรายละเอียดใน `DEPLOYMENT.md`

---

## 📞 Support

หากมีปัญหา:
1. ดู Console (F12)
2. ตรวจสอบ Supabase connection
3. ค้นหาใน README.md
4. ดู log ใน Admin panel

---

**ยินดีต้อนรับเข้าสู่ Guild Camp System! 🎮⚔️**
