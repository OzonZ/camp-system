import { state } from './state.js';
import * as utils from './utils.js';
import * as auth from './auth.js';
import * as member from './member.js';
import * as admin from './admin.js';

// -------------------------------------------------------------
// 🔥 โยนฟังก์ชันทั้งหมดขึ้นไปผูกบน Window ให้ HTML มันมองเห็น 
// -------------------------------------------------------------

// --- Utils ---
window.showScreen = utils.showScreen;
window.toast = utils.toast;
window.toggleTheme = utils.toggleTheme;
window.closeModal = utils.closeModal;
window.customConfirm = utils.customConfirm;

// --- Auth ---
window.loginUser = auth.loginUser;
window.checkAdminPw = auth.checkAdminPw;
window.logout = auth.logout;
window.leaveGuild = auth.leaveGuild;

// --- Member ---
window.createGuild = member.createGuild;
window.joinGuild = member.joinGuild;
window.toggleCreateTeamBox = member.toggleCreateTeamBox;
window.deleteTeamAsLeader = member.deleteTeamAsLeader;
window.filterNewsGuilds = member.filterNewsGuilds;
window.openSubmitQuest = member.openSubmitQuest;
window.previewSubmitImage = member.previewSubmitImage;
window.confirmSubmitQuest = member.confirmSubmitQuest;
window.removeMTeamMember = member.removeMTeamMember;
window.memberAddTeamMember = member.memberAddTeamMember;
window.memberCreateTeam = member.memberCreateTeam;
window.joinTeam = member.joinTeam;
window.submitCardRedeemRequest = member.submitCardRedeemRequest;
window.openUseCard = member.openUseCard;
window.confirmUseCard = member.confirmUseCard;
window.loadGuildList = member.loadGuildList; 

// --- Admin ---
window.addXP = admin.addXP;
window.adminSetXP = admin.adminSetXP;
window.openEditGuild = admin.openEditGuild;
window.confirmEditGuild = admin.confirmEditGuild;
window.openDeleteGuild = admin.openDeleteGuild;
window.confirmDeleteGuild = admin.confirmDeleteGuild;
window.openManageMembers = admin.openManageMembers;
window.adminAddMember = admin.adminAddMember;
window.adminRemoveMember = admin.adminRemoveMember;
window.openEditMember = admin.openEditMember;
window.confirmEditMember = admin.confirmEditMember;
window.adminCreateQuest = admin.adminCreateQuest;
window.deleteQuest = admin.deleteQuest;
window.viewBigImage = admin.viewBigImage;
window.approveSubmission = admin.approveSubmission;
window.rejectSubmission = admin.rejectSubmission;
window.addTeamMemberInput = admin.addTeamMemberInput;
window.removeTeamMember = admin.removeTeamMember;
window.loadAdminAllTeams = admin.loadAdminAllTeams;
window.adminCreateTeam = admin.adminCreateTeam;
window.deleteTeam = admin.deleteTeam;
window.openApproveRedeem = admin.openApproveRedeem;
window.confirmApproveRedeem = admin.confirmApproveRedeem;
window.adminCreateCard = admin.adminCreateCard;
window.askDeleteCard = admin.askDeleteCard;
window.confirmDeleteCard = admin.confirmDeleteCard;
window.adminCreateCompetition = admin.adminCreateCompetition;
window.updateCompScore = admin.updateCompScore;
window.openFinishComp = admin.openFinishComp;
window.confirmFinishComp = admin.confirmFinishComp;
window.deleteCompetition = admin.deleteCompetition;
window.loadAdminLog = admin.loadAdminLog;


// -------------------------------------------------------------
// 🔥 ฟังก์ชันสลับเมนู (แท็บ) 
// -------------------------------------------------------------
window.showTab = function(id, group) {
  const panel = document.getElementById(group === 'admin' ? 'screen-admin' : 'screen-member');
  if(!panel) return;
  panel.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  panel.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  const activeElement = document.getElementById(id);
  if (activeElement) activeElement.classList.add('active');
  
  if (event && event.currentTarget) event.currentTarget.classList.add('active');
  
  // เรียกใช้ตัวโหลดข้อมูลตามหน้าที่คลิก
  const loaders = {
    'tab-quests': member.loadMemberQuests,
    'tab-teams': member.loadMemberTeams,
    'tab-cards': member.loadMemberCards,
    'tab-news': member.loadNewsGuilds,
    'a-tab-guilds': admin.loadAdminGuilds,
    'a-tab-teams': admin.loadAdminTeamsTab,
    'a-tab-quests': admin.loadAdminQuestTab,
    'a-tab-submissions': admin.loadAdminSubmissions,
    'a-tab-cards': admin.loadAdminCardsTab,
    'a-tab-comp': admin.loadAdminCompTab,
    'a-tab-log': admin.loadAdminLog,
    'a-tab-lb': () => admin.loadLeaderboard('admin-lb'),
  };
  if (loaders[id]) loaders[id]();
}


// -------------------------------------------------------------
// 🔥 แก้บั๊กตรงนี้! ตัวดักจับเวลากดปุ่มแล้ว Hash (#) เปลี่ยน
// -------------------------------------------------------------
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(hash);
    if(el) el.classList.add('active');
    window.scrollTo(0, 0);
  }
});


// -------------------------------------------------------------
// 🔥 INIT APP ตัวโหลดข้อมูลตอนเปิดเพจ อิงจาก SessionStorage
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(hash);
    if(el) el.classList.add('active');
  } else {
    const firstScreen = document.querySelector('.screen');
    if(firstScreen) firstScreen.classList.add('active');
  }

  const path = window.location.pathname;

  // โหลดค่าชื่อยูสเซอร์ต่างๆ ลงหน้า UI
  if(document.getElementById('nav-username') && state.name) document.getElementById('nav-username').textContent = state.name;
  
  // 🔴 ปรับการแยกสีชื่อและยศให้ชัดเจน และทำเป็นป้าย (Badge)
  if(document.getElementById('member-nav-user') && state.name) {
    const roleBadge = state.role === 'leader' 
      ? `<span style="color: #ffc107; background: rgba(255, 193, 7, 0.15); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255, 193, 7, 0.3);"><i class="fa-solid fa-crown"></i> หัวกิลด์</span>` 
      : `<span style="color: #cbd5e1; background: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);"><i class="fa-solid fa-khanda text-slate-400"></i> สมาชิก</span>`;
      
    document.getElementById('member-nav-user').innerHTML = `<span style="color: var(--brand-orange); font-weight: 700; font-size: 1rem;">${state.name}</span> <span style="color: var(--border2); margin: 0 8px;">|</span> ${roleBadge}`;
  }
  
  if(document.getElementById('member-guild-name-nav') && state.guildData) {
    document.getElementById('member-guild-name-nav').innerHTML = `<img src="image/logo.png" alt="Logo" style="height: 44px; display: inline-block; margin-right: 12px; vertical-align: middle; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));" /> <span style="font-size: 1.25rem;">${state.guildData.name}</span>`;
  }
  
  if(document.getElementById('admin-nav-user') && state.name) document.getElementById('admin-nav-user').textContent = `${state.name} (Admin)`;

  // สั่งรันฟังก์ชันให้ถูกหน้า
  if (path.includes('index.html') || path.endsWith('/')) {
    if(!state.name && !state.role) window.location.href = 'login.html';
    else member.loadGuildList();
  } else if (path.includes('member.html')) {
    if(!state.name) window.location.href = 'login.html';
    else member.loadMemberTeams();
  } else if (path.includes('admin.html')) {
    if(state.role !== 'admin') window.location.href = 'login.html';
    else admin.loadAdminGuilds();
  }
});