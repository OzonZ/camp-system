import { db } from './supabase.js';
import { state, saveState, ADMIN_PASSWORD } from './state.js';
import { toast, logActivity, showScreen } from './utils.js';
import { loadGuildList } from './member.js'; // ดึงมาจาก member.js

export async function loginUser() {
  const name = document.getElementById('login-name').value.trim();
  if (!name) return toast('กรุณาใส่ชื่อก่อน', 'var(--red)');
  state.name = name;
  saveState();
  showScreen('screen-guild-select');
}

export function checkAdminPw() {
  if (document.getElementById('admin-pw-input').value === ADMIN_PASSWORD) {
    state.role = 'admin';
    saveState();
    showScreen('screen-admin');
  } else {
    toast('รหัสผ่านไม่ถูกต้อง', 'var(--red)');
  }
}

export function logout() {
  Object.keys(state).forEach(k => state[k] = null);
  state.name = ''; state.role = '';
  sessionStorage.removeItem('guild_camp_state');
  window.location.href = 'login.html';
}

// 🔴 อัปเกรดระบบออกกิลด์ให้เด้งเป็น Modal สวยๆ 
export async function leaveGuild() {
  const modal = document.getElementById('modal-confirm');

  // ตรวจสอบว่าใน HTML มีกล่อง modal-confirm เตรียมไว้หรือยัง
  if (modal) {
    // 1. เปลี่ยนข้อความในกล่อง
    document.getElementById('modal-confirm-desc').innerHTML = `<i class="fa-solid fa-person-walking-arrow-right text-brand-orange"></i> คุณต้องการออกจากกิลด์ "<strong>${state.guildData?.name || ''}</strong>" ใช่หรือไม่?`;
    
    // 2. เปิดกล่อง
    modal.classList.add('open');

    // 3. ป้องกันบั๊กกดปุ่มเบิ้ล
    const btnYes = document.getElementById('btn-confirm-yes');
    const newBtnYes = btnYes.cloneNode(true);
    btnYes.parentNode.replaceChild(newBtnYes, btnYes);

    // 4. ถ้ายืนยันการออกกิลด์
    newBtnYes.addEventListener('click', async () => {
      modal.classList.remove('open'); // ปิดหน้าต่าง
      await executeLeave(); // เรียกฟังก์ชันด้านล่าง
    });
  } else {
    // Fallback เผื่อหาหน้าต่างไม่เจอ ก็ให้ใช้ Alert ธรรมดา
    if (!confirm(`ออกจากกิลด์ "${state.guildData?.name}" ?`)) return;
    await executeLeave();
  }
}

// แยกการทำงานตอนออกกิลด์มาไว้ตรงนี้ โค้ดเดิมของคุณเป๊ะๆ
async function executeLeave() {
  if (state.memberId) {
    const isLeader = (state.role === 'leader');
    await db.from('members').delete().eq('id', state.memberId);
    await logActivity(state.name, `ออกจากกิลด์ "${state.guildData?.name}"`, state.guildId, 'leave_guild');
    if (isLeader) await handleLeaderLeft(state.guildId, state.guildData?.name);
  }
  state.guildId = null; state.guildData = null; state.memberId = null; state.role = '';
  saveState();
  showScreen('screen-guild-select');
}

export async function handleLeaderLeft(guildId, guildName) {
  const { data: remaining } = await db.from('members').select('*').eq('guild_id', guildId);
  if (!remaining || remaining.length === 0) {
    await db.from('card_copies').delete().eq('guild_id', guildId);
    await db.from('card_redemption_requests').delete().eq('guild_id', guildId);
    await db.from('guild_cards').delete().eq('guild_id', guildId);
    await db.from('competition_participants').delete().eq('guild_id', guildId);
    const { data: teams } = await db.from('teams').select('id').eq('guild_id', guildId);
    for (const t of (teams || [])) await db.from('team_members').delete().eq('team_id', t.id);
    await db.from('teams').delete().eq('guild_id', guildId);
    await db.from('quest_submissions').delete().eq('guild_id', guildId);
    await db.from('guilds').delete().eq('id', guildId);
    await logActivity('System', `ยุบกิลด์ "${guildName}" เนื่องจากไม่มีสมาชิก`, null, 'disband_guild');
  } else {
    const newLeader = remaining[Math.floor(Math.random() * remaining.length)];
    await db.from('members').update({ role: 'leader' }).eq('id', newLeader.id);
    await logActivity('System', `"${newLeader.name}" เป็นหัวกิลด์ "${guildName}" ใหม่`, guildId, 'new_leader');
  }
}