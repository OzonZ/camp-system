import { db } from './supabase.js';
import { state, saveState } from './state.js';

export const LEVELS = [
  { lv: 1, name: 'Novice', xpNeeded: 0, icon: '🪨' },
  { lv: 2, name: 'Apprentice', xpNeeded: 100, icon: '⚗️' },
  { lv: 3, name: 'Adept', xpNeeded: 250, icon: '🗡️' },
  { lv: 4, name: 'Expert', xpNeeded: 500, icon: '🔮' },
  { lv: 5, name: 'Master', xpNeeded: 1000, icon: '👑' },
  { lv: 6, name: 'Legend', xpNeeded: 2000, icon: '🌟' },
];

export function getLevelInfo(xp) {
  let current = LEVELS[0], next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpNeeded) { current = LEVELS[i]; next = LEVELS[i + 1] || null; break; }
  }
  const xpInLevel = xp - current.xpNeeded;
  const xpToNext = next ? next.xpNeeded - current.xpNeeded : 0;
  const pct = next ? Math.min(100, Math.round((xpInLevel / xpToNext) * 100)) : 100;
  return { current, next, xpInLevel, xpToNext, pct, totalXp: xp };
}

export function typeIcon(t) { return t === 'Unity' ? '🎮' : t === 'Roblox' ? '🟠' : t === 'WebApp' ? '🌐' : '🏰'; }
export function typeClass(t) { return t === 'Unity' ? 'unity' : t === 'Roblox' ? 'roblox' : t === 'WebApp' ? 'webapp' : 'guild'; }
export function escStr(s) { return (s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;'); }

export function toast(msg, color = 'var(--green)') {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg; t.style.color = color; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

export function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('theme-toggle');
  if(btn) btn.textContent = isDark ? '☀️' : '🌓';
}

export function closeModal(id) { document.getElementById(id).classList.remove('open'); }

export async function logActivity(actor, desc, guildId, type) {
  try { await db.from('activity_log').insert({ actor_name: actor, description: desc, guild_id: guildId || null, action_type: type || 'general' }); } catch (e) { }
}

export function showScreen(id) {
  saveState();
  if (id === 'screen-login' || id === 'screen-admin-pw') window.location.href = 'login.html#' + id;
  else if (id === 'screen-guild-select' || id === 'screen-create-guild') window.location.href = 'index.html#' + id;
  else if (id === 'screen-member') window.location.href = 'member.html';
  else if (id === 'screen-admin') window.location.href = 'admin.html';
  else {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) el.classList.add('active');
    window.scrollTo(0, 0);
  }
}