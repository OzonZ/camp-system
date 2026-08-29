import { db } from './supabase.js';
import { state, saveState, shared, MAX_TEAM_MEMBERS } from './state.js';
import { toast, showScreen, getLevelInfo, typeIcon, typeClass, escStr, logActivity, closeModal } from './utils.js';

export async function loadGuildList() {
  const wrap = document.getElementById('guild-list-select');
  const banner = document.getElementById('my-guild-banner');
  if(!wrap) return;
  wrap.innerHTML = '<div class="muted" style="padding:20px;">กำลังโหลด…</div>';

  try {
    const { data: guilds, error: guildsErr } = await db.from('guilds').select('*, members(*)');
    if (guildsErr) throw guildsErr;
    const { data: allTeams, error: teamsErr } = await db.from('teams').select('guild_id, type');
    if (teamsErr) throw teamsErr;

    let myGuildId = null, myGuildName = '';
    if (state.name) {
      const { data: me } = await db.from('members').select('guild_id, guilds(name)').eq('name', state.name).maybeSingle();
      if (me) { myGuildId = me.guild_id; myGuildName = me.guilds?.name || ''; }
    }

    if (myGuildId && banner) {
      banner.style.display = '';
      banner.innerHTML = `🏰 คุณอยู่ในกิลด์ <strong>${myGuildName}</strong> แล้ว — คลิกเพื่อเข้ากิลด์ของคุณหรือออกก่อนค่อยเปลี่ยน`;
    } else if(banner) { banner.style.display = 'none'; }

    if (!guilds || guilds.length === 0) {
      wrap.innerHTML = '<div class="empty">ยังไม่มีกิลด์ — สร้างกิลด์แรก!</div>'; return;
    }

    wrap.innerHTML = guilds.map(g => {
      const lvInfo = getLevelInfo(g.xp || 0);
      const isMine = g.id === myGuildId;
      const isLocked = myGuildId && !isMine;
      const members = g.members || [];
      const leader = members.find(m => m.role === 'leader');
      const memberChips = members.map(m =>
        `<div class="guild-member-chip ${m.role === 'leader' ? 'leader-chip' : ''}">
          ${m.role === 'leader' ? '👑 ' : '👤 '}${m.name}
        </div>`
      ).join('');
      const guildTeams = (allTeams || []).filter(t => t.guild_id === g.id);
      const types = [...new Set(guildTeams.map(t => t.type).filter(Boolean))];
      const typeChips = types.map(tp => `<span class="badge badge-${typeClass(tp)}">${typeIcon(tp)} ${tp}</span>`).join('');

      return `
        <div class="guild-big-card ${isLocked ? 'locked' : ''} ${isMine ? 'mine' : ''}"
          onclick="${isLocked ? `toast('ออกจากกิลด์ของคุณก่อน','var(--amber)')` : (`joinGuild(${g.id})`)}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div style="flex:1;min-width:0;">
              <div style="font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:800;color:var(--text);
                text-shadow:0 2px 8px rgba(0,0,0,.08);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${g.name}${isMine ? ` <span style="color:var(--blue);font-size:.7rem;font-weight:700;">● คุณ</span>` : ''}
              </div>
              ${leader ? `<div style="font-size:.78rem;color:var(--gold);font-weight:700;margin-top:2px;">👑 ${leader.name}</div>` : `<div style="font-size:.76rem;color:var(--red);margin-top:2px;">⚠️ ไม่มีหัวกิลด์</div>`}
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
              <span class="level-badge lv-${lvInfo.current.lv}" style="font-size:.72rem;padding:3px 8px;">
                ${lvInfo.current.icon} Lv.${lvInfo.current.lv}
              </span>
              <div style="font-size:.7rem;color:var(--muted);">${g.xp || 0} XP</div>
            </div>
          </div>
          ${typeChips ? `<div class="flex-gap" style="margin:6px 0 4px;">${typeChips}</div>` : ''}
          <div style="height:1px;background:var(--border);margin:8px 0;"></div>
          <div class="news-members-preview" style="gap:4px;">
            ${memberChips || '<span class="muted" style="font-size:.76rem;">ยังไม่มีสมาชิก</span>'}
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('loadGuildList error:', err);
    wrap.innerHTML = `
      <div style="grid-column: 1 / -1; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 1rem; padding: 1.5rem; text-align: center; color: #fca5a5;">
        <div style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #f87171;">⚠️ ไม่สามารถเชื่อมต่อกับฐานข้อมูล Supabase ได้</div>
        <div style="font-size: 0.875rem; color: #cbd5e1; margin-bottom: 1rem;">${err.message || 'Failed to fetch database'}</div>
        <div style="font-size: 0.8rem; color: #94a3b8; max-width: 480px; margin: 0 auto 1.25rem auto; background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 0.5rem;">
          💡 <strong>สาเหตุที่พบบ่อย:</strong> โปรเจกต์ Supabase อาจถูกหยุดทำงานชั่วคราว (Paused) ให้เข้าไปกู้คืนโปรเจกต์ที่ Supabase Dashboard หรือตรวจสอบ URL ใน <code>js/supabase.js</code>
        </div>
        <button onclick="loadGuildList()" style="padding: 0.5rem 1.25rem; background: linear-gradient(to right, #ff2a2a, #ff6b00); color: white; font-weight: 700; border-radius: 0.75rem; border: none; cursor: pointer;">
          🔄 ลองโหลดใหม่อีกครั้ง
        </button>
      </div>
    `;
    toast('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + (err.message || 'Failed to fetch'), 'var(--red)');
  }
}

export async function createGuild() {
  const name = document.getElementById('new-guild-name').value.trim();
  const desc = document.getElementById('new-guild-desc').value.trim();
  if (!name) return toast('กรุณาใส่ชื่อกิลด์', 'var(--red)');
  if (state.name) {
    const { data: me } = await db.from('members').select('guild_id').eq('name', state.name).maybeSingle();
    if (me) return toast('คุณอยู่ในกิลด์แล้ว ออกก่อนค่อยสร้างใหม่', 'var(--amber)');
  }
  const { data: g, error } = await db.from('guilds').insert({ name, description: desc, xp: 0 }).select().single();
  if (error) return toast('เกิดข้อผิดพลาด: ' + error.message, 'var(--red)');
  const { data: m } = await db.from('members').insert({ name: state.name, guild_id: g.id, role: 'leader' }).select().single();
  await logActivity(state.name, `สร้างกิลด์ "${name}"`, g.id, 'create_guild');
  state.guildId = g.id; state.guildData = g; state.role = 'leader'; state.memberId = m?.id;
  saveState(); showScreen('screen-member');
}

export async function joinGuild(guildId) {
  const { data: g } = await db.from('guilds').select('*').eq('id', guildId).single();
  if (!g) return;
  const { data: existing } = await db.from('members').select('*').eq('guild_id', guildId).eq('name', state.name).maybeSingle();
  if (existing) {
    state.guildId = guildId; state.guildData = g;
    state.role = existing.role === 'leader' ? 'leader' : 'member';
    state.memberId = existing.id;
    saveState(); showScreen('screen-member');
    return;
  }
  const { data: otherMembership } = await db.from('members').select('guild_id').eq('name', state.name).maybeSingle();
  if (otherMembership) return toast('คุณอยู่ในกิลด์อื่นอยู่แล้ว', 'var(--amber)');
  const { data: m } = await db.from('members').insert({ name: state.name, guild_id: guildId, role: 'member' }).select().single();
  await logActivity(state.name, `เข้าร่วมกิลด์ "${g.name}"`, guildId, 'join_guild');
  state.guildId = guildId; state.guildData = g; state.role = 'member'; state.memberId = m?.id;
  saveState(); showScreen('screen-member');
}

export function toggleCreateTeamBox() {
  const box = document.getElementById('create-team-box');
  if (box) box.style.display = box.style.display === 'none' ? '' : 'none';
}

export async function deleteTeamAsLeader(teamId) {
  if (!confirm('ลบกลุ่มนี้?')) return;
  await db.from('team_members').delete().eq('team_id', teamId);
  await db.from('teams').delete().eq('id', teamId);
  toast('ลบกลุ่มแล้ว', 'var(--red)'); loadMemberTeams();
}

export async function loadNewsGuilds() {
  const wrap = document.getElementById('news-guild-list'); if (!wrap) return;
  wrap.innerHTML = '<div class="muted" style="padding:20px;">กำลังโหลด…</div>';
  const { data: guilds } = await db.from('guilds').select('*, members(*)');
  const { data: comps } = await db.from('competitions').select('*, competition_participants(*)').order('created_at', { ascending: false });

  shared._newsGuildsCache = (guilds || []).filter(g => g.id !== state.guildId);
  shared._newsCompsCache = comps || [];
  renderNewsGuilds(shared._newsGuildsCache, shared._newsCompsCache);
}

export function renderNewsGuilds(guildList, compList = []) {
  const wrap = document.getElementById('news-guild-list'); if (!wrap) return;
  let html = '<div class="news-feed">';
  if (compList && compList.length > 0) {
    compList.forEach(c => {
      const sorted = (c.competition_participants || []).sort((a, b) => b.score - a.score);
      const rankEmoji = ['🥇', '🥈', '🥉'];
      html += `
        <div class="news-card" style="border-left:4px solid var(--purple); background: linear-gradient(to right, rgba(111, 66, 193, 0.05), transparent);">
          <div class="news-card-header">
            <div class="news-card-avatar" style="background:var(--purple);">🏁</div>
            <div class="news-card-info">
              <div class="news-card-guild">กิจกรรมการแข่งขัน: ${c.name}</div>
              <div class="news-card-meta">${c.finished ? '✅ การแข่งขันสิ้นสุดแล้ว' : '🔥 กำลังแข่งขัน'} · ${new Date(c.created_at).toLocaleDateString('th-TH')}</div>
            </div>
            ${c.finished ? '<span class="badge badge-approved">จบแล้ว</span>' : '<span class="badge badge-pending">LIVE</span>'}
          </div>
          <div class="news-card-content">
            <div class="section-title" style="margin-bottom:8px;font-size:.7rem;">อันดับปัจจุบัน</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${sorted.slice(0, 3).map((p, i) => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--raised);border-radius:8px;font-size:.85rem;">
                  <span>${rankEmoji[i] || i + 1} <strong>${p.guild_name}</strong></span>
                  <span style="font-weight:700;color:var(--gold);">${p.score} pts</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    });
  }

  if (!guildList || guildList.length === 0) {
    if (compList.length === 0) html += '<div class="empty">ไม่มีข่าวสารใหม่</div>';
  } else {
    html += guildList.map(g => {
      const members = g.members || [];
      const lv = getLevelInfo(g.xp || 0);
      const chips = members.map(m =>
        `<div class="guild-member-chip ${m.role === 'leader' ? 'leader-chip' : ''}" style="font-size:.74rem;">${m.role === 'leader' ? '👑' : '👤'} ${m.name}</div>`
      ).join('');
      return `
      <div class="news-card">
        <div class="guild-big-visual" style="background:var(--surface); aspect-ratio: 16/10; font-size: 4rem;">🏰</div>
        <div class="news-card-header" style="margin-top:12px; margin-bottom:8px;">
          <div class="news-card-info">
            <div class="news-card-guild" style="text-shadow: 0 2px 4px rgba(0,0,0,0.15); font-size: 1.25rem;">${g.name}</div>
            <div class="news-card-meta">Lv.${lv.current.lv} · ${members.length} สมาชิก</div>
          </div>
        </div>
        <div class="news-card-content" style="color:var(--muted); font-size:0.85rem; margin-bottom:12px; min-height: 40px;">${g.description || 'กิลด์นี้ยังไม่มีคำอธิบาย…'}</div>
        <div class="news-members-preview">${chips || '<span class="muted">ไม่มีสมาชิก</span>'}</div>
      </div>`;
    }).join('');
  }
  html += '</div>';
  wrap.innerHTML = html;
}

export function filterNewsGuilds() {
  const q = document.getElementById('news-search')?.value?.toLowerCase() || '';
  renderNewsGuilds(shared._newsGuildsCache.filter(g => g.name.toLowerCase().includes(q)), shared._newsCompsCache);
}

export async function loadMemberQuests() {
  const wrap = document.getElementById('member-quests'); if (!wrap) return;
  const progressWrap = document.getElementById('guild-quest-progress');
  wrap.innerHTML = '<div class="muted">กำลังโหลด…</div>';
  const { data: quests } = await db.from('quests').select('*').or(`guild_id.is.null,guild_id.eq.${state.guildId}`);
  if (!quests || quests.length === 0) { wrap.innerHTML = '<div class="empty">ยังไม่มีเควส</div>'; return; }

  const { data: teams } = await db.from('teams').select('*, team_members(*)').eq('guild_id', state.guildId);
  const totalTeams = (teams || []).length;
  const myTeams = (teams || []).filter(t => (t.team_members || []).some(m => m.member_name === state.name));
  const { data: allSubs } = await db.from('quest_submissions').select('*').eq('guild_id', state.guildId);

  if (progressWrap && totalTeams > 0) {
    const approvedTeamIds = new Set((allSubs || []).filter(s => s.status === 'approved' && s.team_id).map(s => s.team_id));
    const done = approvedTeamIds.size;
    const pct = Math.round((done / totalTeams) * 100);
    progressWrap.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;background:var(--raised);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;">
        <div style="flex:1;">
          <div style="font-weight:700;color:var(--text);font-size:.85rem;margin-bottom:4px;">📊 ความคืบหน้ากิลด์</div>
          <div class="prog-wrap" style="height:6px;margin:0;"><div class="prog-fill prog-green" style="width:${pct}%"></div></div>
        </div>
        <div style="font-size:.88rem;font-weight:800;color:${pct >= 100 ? 'var(--green)' : 'var(--blue)'};">
          ${done}/${totalTeams}<span style="font-size:.7rem;font-weight:500;color:var(--muted);margin-left:2px;">กลุ่ม</span>
        </div>
      </div>`;
  } else if (progressWrap) { progressWrap.innerHTML = ''; }

  const subMap = {};
  (allSubs || []).forEach(s => {
    if (!subMap[s.quest_id]) subMap[s.quest_id] = {};
    subMap[s.quest_id][s.team_id || `solo_${s.member_name}`] = s;
  });
  const mySubMap = {};
  (allSubs || []).forEach(s => { if (s.member_name === state.name) mySubMap[s.quest_id] = s; });

  wrap.innerHTML = quests.map(q => {
    const allTeamSubs = subMap[q.id] || {};
    const approvedCount = Object.values(allTeamSubs).filter(s => s.status === 'approved').length;
    const pendingCount = Object.values(allTeamSubs).filter(s => s.status === 'pending').length;
    const progressPct = totalTeams > 0 ? Math.round((approvedCount / totalTeams) * 100) : 0;
    const isComplete = totalTeams > 0 && approvedCount >= totalTeams;

    const myTeam = myTeams[0];
    const myTeamSub = myTeam ? allTeamSubs[myTeam.id] : null;
    const mySoloSub = mySubMap[q.id];
    const activeSub = myTeamSub || mySoloSub;

    let statusHtml = '';
    let borderClass = isComplete ? 'done' : (pendingCount > 0 ? 'partial' : '');

    if (activeSub) {
      if (activeSub.status === 'pending') statusHtml = `<span class="badge badge-pending">⏳ กลุ่มของคุณรอ Approve</span>`;
      else if (activeSub.status === 'approved') { statusHtml = `<span class="badge badge-approved">✅ กลุ่มของคุณผ่านแล้ว</span>`; borderClass = 'done'; }
      else if (activeSub.status === 'rejected') { statusHtml = `<span class="badge badge-rejected">❌ ถูกปฏิเสธ</span>`; borderClass = 'rejected'; }
    }

    const canSubmit = !activeSub || activeSub.status === 'rejected';
    const teamNote = myTeam
      ? `<div class="muted" style="font-size:.78rem;">👥 กลุ่มของคุณ: ${myTeam.name} <span class="badge badge-${typeClass(myTeam.type)}" style="font-size:.66rem;">${typeIcon(myTeam.type)} ${myTeam.type || ''}</span></div>`
      : `<div class="muted" style="font-size:.78rem;">⚠️ คุณยังไม่ได้อยู่ในกลุ่ม</div>`;

    let leaderBreakdown = '';
    if (state.role === 'leader' && totalTeams > 0) {
      const breakdownItems = teams.map(t => {
        const ts = allTeamSubs[t.id];
        let st = '<span class="muted">ยังไม่ได้ส่ง</span>';
        if (ts?.status === 'approved') st = '<span style="color:var(--green);font-weight:700;">✅ ผ่านแล้ว</span>';
        else if (ts?.status === 'pending') st = '<span style="color:var(--amber);font-weight:700;">⏳ รอตรวจ</span>';
        else if (ts?.status === 'rejected') st = '<span style="color:var(--red);font-weight:700;">❌ ไม่ผ่าน</span>';
        return `<div style="display:flex;justify-content:space-between;font-size:.74rem;padding:4px 0;border-bottom:1px solid #f0f0f0;"><span>👥 ${t.name}</span>${st}</div>`;
      }).join('');
      leaderBreakdown = `<div style="margin-top:12px;padding:10px;background:#f8f9fa;border-radius:10px;border:1px solid var(--border);"><div style="font-size:.72rem;font-weight:700;color:var(--muted);margin-bottom:6px;text-transform:uppercase;">📊 สถานะแต่ละกลุ่ม</div>${breakdownItems}</div>`;
    }

    return `
      <div class="quest-item ${borderClass}">
        <div class="quest-icon">${q.icon || '⚔️'}</div>
        <div style="flex:1;">
          <div class="quest-title">${q.title}</div>
          <div class="quest-desc">${q.description || ''}</div>
          <div class="quest-xp">⭐ ${q.xp_reward || q.points || 0} XP</div>
          ${teamNote}
          ${totalTeams > 0 ? `<div style="margin-top:8px;"><div style="font-size:.78rem;color:var(--muted);margin-bottom:4px;">ความคืบหน้ากิลด์: ${approvedCount}/${totalTeams} กลุ่ม ${isComplete ? '✅ ครบแล้ว!' : ''}</div><div class="prog-wrap"><div class="prog-fill prog-green" style="width:${progressPct}%"></div></div></div>` : ''}
          ${leaderBreakdown}
          <div style="margin-top:10px;" class="flex-gap">
            ${statusHtml}
            ${canSubmit ? `<button class="btn btn-sm btn-accent" onclick="openSubmitQuest(${q.id},'${escStr(q.title)}',${myTeam ? myTeam.id : 'null'})">📤 ส่งงาน</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

export function openSubmitQuest(questId, questTitle, teamId) {
  state.pendingQuestId = questId;
  state.pendingQuestTitle = questTitle;
  state.pendingQuestTeamId = teamId;
  document.getElementById('modal-quest-info').innerHTML = `<strong>${questTitle}</strong>${teamId ? `<br><span class="muted">ส่งแทนกลุ่มของคุณ</span>` : '<br><span style="color:var(--amber);font-size:.8rem;">⚠️ คุณไม่ได้อยู่ในกลุ่ม ส่งในนามส่วนตัว</span>'}`;
  document.getElementById('submit-text').value = '';
  document.getElementById('submit-img-preview').style.display = 'none';
  document.getElementById('img-upload-placeholder').style.display = '';
  document.getElementById('submit-img-input').value = '';
  document.getElementById('modal-submit-quest').classList.add('open');
}

export function previewSubmitImage(e) {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('ไฟล์ใหญ่เกิน 5MB', 'var(--red)'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('submit-img-preview').src = ev.target.result;
    document.getElementById('submit-img-preview').style.display = 'block';
    document.getElementById('img-upload-placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

export async function confirmSubmitQuest() {
  const text = document.getElementById('submit-text').value.trim();
  const imgEl = document.getElementById('submit-img-preview');
  const imgData = imgEl.style.display !== 'none' ? imgEl.src : null;
  if (!text && !imgData) return toast('กรุณาใส่คำอธิบายหรือรูปภาพ', 'var(--red)');
  closeModal('modal-submit-quest');
  const payload = {
    quest_id: state.pendingQuestId, guild_id: state.guildId, member_name: state.name,
    team_id: state.pendingQuestTeamId || null,
    submission_text: text, image_data: imgData, status: 'pending',
    submitted_at: new Date().toISOString(),
  };
  if (state.pendingQuestTeamId) {
    await db.from('quest_submissions').upsert(payload, { onConflict: 'quest_id,guild_id,team_id' });
  } else {
    await db.from('quest_submissions').upsert(payload, { onConflict: 'quest_id,guild_id,member_name' });
  }
  await logActivity(state.name, `ส่งงานเควส "${state.pendingQuestTitle}"`, state.guildId, 'submit_quest');
  toast('📤 ส่งงานแล้ว รอ Admin Approve!', 'var(--amber)');
  loadMemberQuests();
}

export function updateMTeamCountChip() {
  const chip = document.getElementById('m-team-count-chip'); if (!chip) return;
  const n = shared.mTeamMembersList.length;
  chip.textContent = `${n}/${MAX_TEAM_MEMBERS}`;
  chip.className = `count-chip ${n >= MAX_TEAM_MEMBERS ? 'chip-max' : 'chip-ok'}`;
}

export function renderMTeamMembersDisplay() {
  const wrap = document.getElementById('m-team-members-display'); if (!wrap) return;
  if (shared.mTeamMembersList.length === 0) { wrap.innerHTML = '<span class="muted" style="font-size:.8rem;">ยังไม่มีสมาชิก</span>'; return; }
  wrap.innerHTML = shared.mTeamMembersList.map(n => `<span class="badge badge-member" style="cursor:pointer;" onclick="removeMTeamMember('${escStr(n)}')">${n} ✕</span>`).join('');
}

export function removeMTeamMember(name) {
  shared.mTeamMembersList = shared.mTeamMembersList.filter(n => n !== name);
  renderMTeamMembersDisplay(); updateMTeamCountChip();
}

export function memberAddTeamMember() {
  const input = document.getElementById('m-team-member-input');
  const name = input.value.trim(); if (!name) return;
  if (shared.mTeamMembersList.length >= MAX_TEAM_MEMBERS) { toast(`สูงสุด ${MAX_TEAM_MEMBERS} คน`, 'var(--red)'); return; }
  if (shared.mTeamMembersList.includes(name)) { toast('ชื่อซ้ำ', 'var(--amber)'); return; }
  shared.mTeamMembersList.push(name); input.value = '';
  renderMTeamMembersDisplay(); updateMTeamCountChip();
}

export async function memberCreateTeam() {
  const teamName = document.getElementById('m-team-name').value.trim();
  const teamType = document.getElementById('m-team-type').value;
  if (!teamName) return toast('กรุณาใส่ชื่อกลุ่ม', 'var(--red)');

  const { data: allTeams } = await db.from('teams').select('id, team_members(member_name)').eq('guild_id', state.guildId);
  const amIInATeam = (allTeams || []).some(t => (t.team_members || []).some(m => m.member_name === state.name));
  if (amIInATeam) return toast('คุณอยู่ในกลุ่มอื่นอยู่แล้ว', 'var(--amber)');

  if (shared.mTeamMembersList.length === 0) return toast('เพิ่มสมาชิกอย่างน้อย 1 คน', 'var(--red)');
  if (shared.mTeamMembersList.length > MAX_TEAM_MEMBERS) return toast(`สมาชิกเกิน ${MAX_TEAM_MEMBERS} คน`, 'var(--red)');
  const { data: team, error } = await db.from('teams').insert({ name: teamName, guild_id: state.guildId, type: teamType }).select().single();
  if (error) return toast('เกิดข้อผิดพลาด: ' + error.message, 'var(--red)');
  for (const mn of shared.mTeamMembersList) {
    await db.from('team_members').insert({ team_id: team.id, member_name: mn });
  }
  await logActivity(state.name, `สร้างกลุ่ม "${teamName}" (${teamType})`, state.guildId, 'create_team');
  toast(`✨ สร้างกลุ่ม "${teamName}" แล้ว!`);
  document.getElementById('m-team-name').value = '';
  shared.mTeamMembersList = []; renderMTeamMembersDisplay(); updateMTeamCountChip();
  loadMemberTeams();
}

export async function loadMemberTeams() {
  const wrap = document.getElementById('member-teams'); if (!wrap) return;
  const { data: teams } = await db.from('teams').select('*, team_members(*)').eq('guild_id', state.guildId);
  const isLeader = state.role === 'leader';
  const amIInATeam = (teams || []).some(t => (t.team_members || []).some(m => m.member_name === state.name));

  const btnCreate = document.getElementById('btn-create-team');
  if (btnCreate) {
    const canCreate = !amIInATeam && (teams && teams.length < 3);
    btnCreate.style.display = canCreate ? '' : 'none';
  }

  if (!teams || teams.length === 0) {
    wrap.innerHTML = '<div class="empty" style="grid-column:1/-1;padding:24px;">ยังไม่มีกลุ่ม — กด <strong>+ สร้างกลุ่ม</strong> เพื่อเริ่มต้น</div>'; return;
  }
  wrap.innerHTML = teams.slice(0, 3).map(t => {
    const members = t.team_members || [];
    const isMember = members.some(m => m.member_name === state.name);
    const isFull = members.length >= MAX_TEAM_MEMBERS;
    const tc = typeClass(t.type);
    const memberRows = members.map(m => `<div class="team-block-member ${m.member_name === state.name ? 'me' : ''}">${m.member_name === state.name ? '⭐' : '👤'} ${m.member_name}</div>`).join('');
    const joinBtn = !isMember && !isFull && !isLeader ? `<button class="btn btn-green btn-sm" style="margin-top:10px;width:100%;" onclick="joinTeam(${t.id},'${escStr(t.name)}')">เข้าร่วมกลุ่ม</button>` : '';
    const deleteBtn = isLeader ? `<button class="btn btn-red btn-sm" style="margin-top:6px;width:100%;font-size:.74rem;" onclick="deleteTeamAsLeader(${t.id})">🗑️ ลบกลุ่ม</button>` : '';
    return `<div class="team-block"><div class="team-block-name">${t.name} <span class="badge badge-${tc}" style="margin-left:6px;font-size:.66rem;">${typeIcon(t.type)} ${t.type || 'Unity'}</span></div><div class="team-block-count">👥 สมาชิก ${members.length}/${MAX_TEAM_MEMBERS} คน ${isMember ? '<span class="badge badge-approved" style="font-size:.64rem;">✓ คุณอยู่ที่นี่</span>' : ''} ${!isMember && isFull ? '<span class="badge badge-rejected" style="font-size:.64rem;">เต็มแล้ว</span>' : ''}</div><div class="team-block-members">${memberRows || '<span class="muted" style="font-size:.8rem;">ยังไม่มีสมาชิก</span>'}</div>${joinBtn}${deleteBtn}</div>`;
  }).join('');
}

export async function joinTeam(teamId, teamName) {
  const { data: teams } = await db.from('teams').select('id, team_members(member_name)').eq('guild_id', state.guildId);
  for (const t of (teams || [])) {
    if ((t.team_members || []).some(m => m.member_name === state.name)) return toast('คุณอยู่ในกลุ่มอื่นอยู่แล้ว', 'var(--amber)');
  }
  const { data: tm } = await db.from('team_members').select('id').eq('team_id', teamId);
  if ((tm || []).length >= MAX_TEAM_MEMBERS) return toast('กลุ่มเต็มแล้ว', 'var(--red)');
  await db.from('team_members').insert({ team_id: teamId, member_name: state.name });
  await logActivity(state.name, `เข้าร่วมกลุ่ม "${teamName}"`, state.guildId, 'join_team');
  toast(`✅ เข้าร่วมกลุ่ม "${teamName}" แล้ว!`);
  loadMemberTeams();
}

export async function loadMemberList() {
  const wrap = document.getElementById('member-members'); if (!wrap) return;
  const { data: members } = await db.from('members').select('*').eq('guild_id', state.guildId);
  if (!members || members.length === 0) { wrap.innerHTML = '<div class="empty">ไม่พบสมาชิก</div>'; return; }
  wrap.innerHTML = members.map(m => `<div class="member-row"><div class="member-avatar" style="background:${m.role === 'leader' ? '#d97706' : 'var(--blue2)'};">${m.name[0].toUpperCase()}</div><div class="member-name">${m.name}</div><span class="badge ${m.role === 'leader' ? 'badge-leader' : 'badge-member'}">${m.role === 'leader' ? '👑 หัวกิลด์' : '⚔️ สมาชิก'}</span></div>`).join('');
}

export async function loadMemberCards() {
  const wrap = document.getElementById('member-cards');
  const redeemSection = document.getElementById('redeem-section');
  if (!wrap) return;
  if (redeemSection) redeemSection.style.display = state.role === 'leader' ? '' : 'none';
  if (state.role === 'leader') loadMyRedeemRequests();
  wrap.innerHTML = '<div class="muted">กำลังโหลด…</div>';
  const { data: gc } = await db.from('guild_cards').select('*, cards(*)').eq('guild_id', state.guildId);
  if (!gc || gc.length === 0) { wrap.innerHTML = '<div class="empty" style="grid-column:1/-1;">ยังไม่มีการ์ด</div>'; return; }
  wrap.innerHTML = gc.map(item => {
    const c = item.cards; if (!c) return '';
    const useBtn = state.role === 'leader' && !item.used ? `<button class="btn btn-sm btn-accent btn-full" onclick="openUseCard(${item.id},'${escStr(c.name)}','${escStr(c.effect || '')}')">✨ ใช้การ์ด</button>` : '';
    if (c.image_data) {
      return `<div class="card-item ${item.used ? 'card-used' : ''}" style="padding:0;overflow:hidden;"><div style="width:100%;aspect-ratio:3/4;overflow:hidden;"><img src="${c.image_data}" style="width:100%;height:100%;object-fit:cover;"/></div><div style="padding:10px;"><div class="card-name">${c.name}</div><div class="card-effect">${c.effect || ''}</div>${useBtn}</div></div>`;
    }
    return `<div class="card-item ${item.used ? 'card-used' : ''}"><div class="card-emoji">${c.icon || '🃏'}</div><div class="card-name">${c.name}</div><div class="card-effect">${c.effect || ''}</div>${useBtn}</div>`;
  }).join('');
}

export async function loadMyRedeemRequests() {
  const wrap = document.getElementById('my-redeem-requests'); if (!wrap) return;
  const { data: reqs } = await db.from('card_redemption_requests').select('*').eq('guild_id', state.guildId).order('created_at', { ascending: false }).limit(5);
  if (!reqs || reqs.length === 0) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `<div class="section-title" style="margin-top:8px;">คำขอล่าสุด</div>` + reqs.map(r => {
    const statusBadge = r.status === 'pending' ? `<span class="badge badge-pending">⏳ รอตรวจสอบ</span>` : r.status === 'approved' ? `<span class="badge badge-approved">✅ อนุมัติแล้ว</span>` : `<span class="badge badge-rejected">❌ ปฏิเสธ${r.admin_notes ? `: ${r.admin_notes}` : ''}</span>`;
    return `<div class="redeem-request-item"><div style="flex:1;"><div class="redeem-code">${r.card_code}</div><div class="muted" style="font-size:.76rem;">${new Date(r.created_at).toLocaleString('th-TH')}</div></div>${statusBadge}</div>`;
  }).join('');
}

export async function submitCardRedeemRequest() {
  const input = document.getElementById('card-redeem-code');
  const code = input.value.trim().toUpperCase();
  if (!code) return toast('กรุณาใส่รหัสการ์ด', 'var(--red)');
  if (state.role !== 'leader') return toast('เฉพาะหัวกิลด์เท่านั้น', 'var(--red)');
  const { data: dup } = await db.from('card_redemption_requests').select('id,status').eq('guild_id', state.guildId).eq('card_code', code).maybeSingle();
  if (dup) {
    if (dup.status === 'approved') return toast('รหัสนี้ถูกใช้ไปแล้ว', 'var(--amber)');
    if (dup.status === 'pending') return toast('ส่งรหัสนี้ไปแล้ว รอ Admin', 'var(--amber)');
  }
  const { error } = await db.from('card_redemption_requests').insert({ guild_id: state.guildId, guild_name: state.guildData?.name, leader_name: state.name, card_code: code, status: 'pending' });
  if (error) return toast('เกิดข้อผิดพลาด: ' + error.message, 'var(--red)');
  await logActivity(state.name, `ส่งรหัสการ์ด "${code}"`, state.guildId, 'redeem_request');
  toast('📩 ส่งรหัสแล้ว รอ Admin!', 'var(--purple)');
  input.value = '';
  loadMyRedeemRequests();
}

export function openUseCard(id, name, effect) {
  state.pendingGuildCardId = id;
  document.getElementById('modal-card-desc').innerHTML = `<strong>${name}</strong><br><span class="muted">${effect}</span>`;
  document.getElementById('modal-use-card').classList.add('open');
}

export async function confirmUseCard() {
  closeModal('modal-use-card');
  await db.from('guild_cards').update({ used: true }).eq('id', state.pendingGuildCardId);
  const { data: gc } = await db.from('guild_cards').select('cards(name)').eq('id', state.pendingGuildCardId).single();
  const cn = gc?.cards?.name || 'การ์ด';
  await logActivity(state.name, `ใช้การ์ด "${cn}"`, state.guildId, 'use_card');
  toast(`✨ ใช้การ์ด "${cn}" แล้ว!`, 'var(--purple)');
  loadMemberCards();
}

export async function loadMemberCompetitions() {
  const wrap = document.getElementById('member-competitions'); if (!wrap) return;
  const { data: comps } = await db.from('competitions').select('*, competition_participants(*)').order('created_at', { ascending: false });
  if (!comps || comps.length === 0) { wrap.innerHTML = '<div class="empty">ยังไม่มีการแข่งขัน</div>'; return; }
  const rankEmoji = ['🥇', '🥈', '🥉'];
  wrap.innerHTML = comps.map(c => {
    const sorted = (c.competition_participants || []).sort((a, b) => b.score - a.score);
    return `<div class="competition-card"><div class="comp-title">🏁 ${c.name}</div>${sorted.map((p, i) => `<div class="comp-guild-row"><span>${rankEmoji[i] || i + 1}</span><span class="comp-guild-name">${p.guild_name}</span><span class="comp-guild-score">${p.score} pts</span></div>`).join('')}${c.finished ? '<div class="badge badge-approved" style="margin-top:8px;">✅ จบแล้ว</div>' : ''}</div>`;
  }).join('');
}