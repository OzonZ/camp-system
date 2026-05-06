export const ADMIN_PASSWORD = '14124';
export const MAX_TEAM_MEMBERS = 3;

// โหลด State จาก sessionStorage
export let state = JSON.parse(sessionStorage.getItem('guild_camp_state')) || {
  name: '', role: '',
  guildId: null, guildData: null, memberId: null,
  pendingGuildCardId: null,
  pendingQuestId: null, pendingQuestTitle: '', pendingQuestTeamId: null,
  pendingDeleteCardId: null,
  pendingDeleteGuildId: null, pendingDeleteGuildName: null,
  managingGuildId: null,
  pendingFinishCompId: null,
  pendingRedeemId: null,
  _pendingRedeemCode: null, _pendingRedeemGuildId: null, _pendingRedeemGuildName: null,
};

export function saveState() {
  sessionStorage.setItem('guild_camp_state', JSON.stringify(state));
}

// แชร์ตัวแปร Array ต่างๆ ให้ดึงไปใช้ได้ทุกไฟล์
export let shared = {
  teamMembersBuilder: [],
  mTeamMembersList: [],
  _newsGuildsCache: [],
  _newsCompsCache: []
};