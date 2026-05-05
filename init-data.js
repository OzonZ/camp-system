// Auto-initialization script for Guild Camp System
// Run this when you first open the app to populate initial data

const INIT_SCRIPT = `
// 1. Create Initial Cards
INSERT INTO cards (icon, name, effect) VALUES
  ('⚔️', 'แรงปาฐาน', '+30 point สำหรับกิลด์'),
  ('🛡️', 'โล่ป้องกัน', 'ป้องกัน -20 point'),
  ('✨', 'เวทมนตร์ทำให้บวช', 'คูณแต้ม x1.5'),
  ('💎', 'ทอพเพนเดิยม', '+50 point'),
  ('🔥', 'ไฟประลัยพิษ', '-15 point ให้อีกกิลด์'),
  ('🌙', 'พื้นพลังจันทร์', 'คืนสมาชิก 1 เควส');

// 2. Create Sample Guilds (Optional)
INSERT INTO guilds (name, type, description, points) VALUES
  ('Dragon Slayers', 'Unity', 'ทีมเกมเมอร์ Unity', 0),
  ('Roblox Warriors', 'Roblox', 'ทีม Roblox มาตรฐาน', 0),
  ('Web Dev Masters', 'WebApp', 'ทีมพัฒนา Web App', 0);

// 3. Create Sample Quests (Optional)
INSERT INTO quests (title, description, icon, points) VALUES
  ('เขียนโค้ด 100 บรรทัด', 'เขียนโค้ดที่สมบูรณ์ 100 บรรทัดขึ้นไป', '💻', 50),
  ('แก้จุดบกพร่อง 5 เรื่อง', 'หาและแก้ไขข้อผิดพลาดในโค้ด', '🐛', 40),
  ('ร่วมมติครั้งแรก', 'มีส่วนร่วมในการประชุมครั้งแรก', '🤝', 30),
  ('สร้างฟีเจอร์ใหม่', 'พัฒนาฟีเจอร์ใหม่สำเร็จ', '✨', 60),
  ('ทดสอบแอป', 'ทดสอบฟังก์ชันต่างๆ ที่สมบูรณ์', '🧪', 25);

// 4. Create Initial Card Copies in Void (2 copies of each card)
-- First card copies
INSERT INTO card_copies (card_id, card_number, status) VALUES
  (1, '001', 'void'),
  (1, '002', 'void'),
  (2, '003', 'void'),
  (2, '004', 'void'),
  (3, '005', 'void'),
  (3, '006', 'void'),
  (4, '007', 'void'),
  (4, '008', 'void'),
  (5, '009', 'void'),
  (5, '010', 'void'),
  (6, '011', 'void'),
  (6, '012', 'void');

// 5. Create sample card inventory history entry
INSERT INTO card_inventory_history (card_copy_id, action, admin_name, to_status, notes) VALUES
  (1, 'create', 'System', 'void', 'Initial card copy created');
`;

console.log('Guild Camp System - Initialization Guide');
console.log('=========================================');
console.log('Copy the SQL below and run in Supabase SQL Editor:');
console.log(INIT_SCRIPT);
