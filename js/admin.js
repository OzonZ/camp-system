import { db } from "./supabase.js";
import { state, shared, MAX_TEAM_MEMBERS } from "./state.js";
import {
  toast,
  getLevelInfo,
  typeClass,
  typeIcon,
  escStr,
  logActivity,
  closeModal,
} from "./utils.js";
import { handleLeaderLeft } from "./auth.js";

export async function loadLeaderboard(targetId) {
  const wrap = document.getElementById(targetId);
  if (!wrap) return;
  const { data: guilds } = await db
    .from("guilds")
    .select("*")
    .order("xp", { ascending: false });
  if (!guilds || guilds.length === 0) {
    wrap.innerHTML = '<div class="empty">ยังไม่มีข้อมูล</div>';
    return;
  }
  const { data: allTeams } = await db.from("teams").select("guild_id, type");
  const re = ["🥇", "🥈", "🥉"];
  wrap.innerHTML = guilds
    .map((g, i) => {
      const lv = getLevelInfo(g.xp || 0);
      const guildTeams = (allTeams || []).filter((t) => t.guild_id === g.id);
      const types = [...new Set(guildTeams.map((t) => t.type).filter(Boolean))];
      const typeChips = types
        .map(
          (tp) =>
            `<span class="badge badge-${typeClass(tp)}" style="font-size:.65rem;">${typeIcon(tp)} ${tp}</span>`,
        )
        .join("");
      return `<div class="lb-row ${g.id === state.guildId ? "current-guild" : ""}"><div class="lb-rank" style="color:${i === 0 ? "var(--gold)" : i === 1 ? "#aaa" : i === 2 ? "#cd7f32" : "var(--muted)"}">${re[i] || i + 1}</div><div style="flex:1;"><div class="lb-name">🏰 ${g.name}</div><div class="flex-gap" style="margin-top:3px;">${typeChips}</div></div><div><div class="level-badge lv-${lv.current.lv}">${lv.current.icon} Lv.${lv.current.lv}</div><div class="lb-xp">${g.xp || 0} XP</div></div></div><div class="prog-wrap" style="margin-bottom:8px;"><div class="prog-fill prog-lv" style="width:${lv.pct}%"></div></div>`;
    })
    .join("");
}

export async function loadAdminGuilds() {
  const wrap = document.getElementById("admin-guilds-list");
  if (!wrap) return;
  wrap.innerHTML = '<div class="muted" style="padding:20px;">กำลังโหลด…</div>';
  const { data: guilds } = await db.from("guilds").select("*, members(*)");
  const { data: allTeams } = await db.from("teams").select("guild_id, type");
  if (!guilds || guilds.length === 0) {
    wrap.innerHTML = '<div class="empty">ยังไม่มีกิลด์</div>';
    return;
  }
  wrap.innerHTML = guilds
    .map((g) => {
      const members = g.members || [];
      const leader = members.find((m) => m.role === "leader");
      const lv = getLevelInfo(g.xp || 0);
      const guildTeams = (allTeams || []).filter((t) => t.guild_id === g.id);
      const types = [...new Set(guildTeams.map((t) => t.type).filter(Boolean))];
      const typeChipsHtml = types
        .map(
          (tp) =>
            `<span class="badge badge-${typeClass(tp)}">${typeIcon(tp)} ${tp}</span>`,
        )
        .join("");
      return `<div class="admin-guild-item"><div class="admin-guild-header"><div><div style="font-family:'Space Grotesk',sans-serif;font-size:1.05rem;font-weight:700;color:var(--gold);">🏰 ${g.name}</div><div class="flex-gap" style="margin-top:6px;">${typeChipsHtml || '<span class="muted" style="font-size:.78rem;">ยังไม่มีกลุ่ม</span>'}</div><div class="level-badge lv-${lv.current.lv}" style="margin-top:6px;width:fit-content;">${lv.current.icon} Lv.${lv.current.lv} — ${g.xp || 0} XP</div>${leader ? `<div class="muted mt-s" style="font-size:.8rem;">👑 ${leader.name}</div>` : '<div class="muted mt-s" style="font-size:.8rem;color:var(--red);">⚠️ ไม่มีหัวกิลด์</div>'}</div><div class="admin-guild-actions"><button class="btn btn-green btn-sm" onclick="addXP(${g.id},${g.xp || 0},50)">+50</button><button class="btn btn-accent btn-sm" onclick="addXP(${g.id},${g.xp || 0},100)">+100</button><button class="btn btn-red btn-sm" onclick="addXP(${g.id},${g.xp || 0},-50)">−50</button><button class="btn btn-ghost btn-sm" onclick="adminSetXP(${g.id})">✏️ XP</button></div></div><div class="prog-wrap"><div class="prog-fill prog-lv" style="width:${lv.pct}%"></div></div><div class="mt-s flex-gap">${members.map((m) => `<span class="badge ${m.role === "leader" ? "badge-leader" : "badge-member"}">${m.name}</span>`).join("")}</div><div class="flex-gap" style="margin-top:12px;"><button class="btn btn-accent btn-sm" onclick="openManageMembers(${g.id},'${escStr(g.name)}')">👥 สมาชิก (${members.length})</button><button class="btn btn-ghost btn-sm" onclick="openEditGuild(${g.id},'${escStr(g.name)}','${escStr(g.description || "")}',${g.xp || 0})">✏️ แก้ไข</button><button class="btn btn-red btn-sm" onclick="openDeleteGuild(${g.id},'${escStr(g.name)}')">🗑️ ลบ</button></div></div>`;
    })
    .join("");
}

export async function addXP(guildId, current, delta) {
  const newXp = Math.max(0, current + delta);
  await db.from("guilds").update({ xp: newXp }).eq("id", guildId);
  await logActivity(
    "Admin",
    `${delta > 0 ? "+" : ""}${delta} XP กิลด์ id=${guildId}`,
    guildId,
    "admin_xp",
  );
  toast(
    `${delta > 0 ? "+" : ""}${delta} XP!`,
    delta > 0 ? "var(--green)" : "var(--red)",
  );
  loadAdminGuilds();
}

export function adminSetXP(guildId) {
  const val = prompt("ตั้งค่า XP ใหม่:");
  if (val === null) return;
  const xp = parseInt(val);
  if (isNaN(xp) || xp < 0) return toast("ค่าไม่ถูกต้อง", "var(--red)");
  db.from("guilds")
    .update({ xp })
    .eq("id", guildId)
    .then(() => {
      toast("อัปเดต XP แล้ว");
      loadAdminGuilds();
    });
}

export function openEditGuild(id, name, desc, xp) {
  document.getElementById("edit-guild-id").value = id;
  document.getElementById("edit-guild-name").value = name;
  document.getElementById("edit-guild-desc").value = desc;
  document.getElementById("edit-guild-xp").value = xp;
  document.getElementById("modal-edit-guild").classList.add("open");
}

export async function confirmEditGuild() {
  const id = document.getElementById("edit-guild-id").value;
  const name = document.getElementById("edit-guild-name").value.trim();
  const desc = document.getElementById("edit-guild-desc").value.trim();
  const xp = parseInt(document.getElementById("edit-guild-xp").value) || 0;
  if (!name) return toast("กรุณาใส่ชื่อ", "var(--red)");
  const { error } = await db
    .from("guilds")
    .update({ name, description: desc, xp })
    .eq("id", id);
  if (error) return toast("เกิดข้อผิดพลาด: " + error.message, "var(--red)");
  closeModal("modal-edit-guild");
  toast("💾 บันทึกแล้ว");
  loadAdminGuilds();
}

export function openDeleteGuild(id, name) {
  state.pendingDeleteGuildId = id;
  state.pendingDeleteGuildName = name;
  document.getElementById("modal-delete-guild-desc").textContent =
    `ลบกิลด์ "${name}" ?`;
  document.getElementById("delete-guild-confirm-input").value = "";
  document.getElementById("modal-delete-guild").classList.add("open");
}

export async function confirmDeleteGuild() {
  const input = document
    .getElementById("delete-guild-confirm-input")
    .value.trim();
  if (input !== state.pendingDeleteGuildName)
    return toast("ชื่อกิลด์ไม่ตรง", "var(--red)");
  const id = state.pendingDeleteGuildId;
  const name = state.pendingDeleteGuildName;
  try {
    await db.from("card_copies").delete().eq("guild_id", id);
    await db.from("card_redemption_requests").delete().eq("guild_id", id);
    await db.from("quest_submissions").delete().eq("guild_id", id);
    await db.from("guild_cards").delete().eq("guild_id", id);
    await db.from("competition_participants").delete().eq("guild_id", id);
    const { data: teams } = await db
      .from("teams")
      .select("id")
      .eq("guild_id", id);
    for (const t of teams || [])
      await db.from("team_members").delete().eq("team_id", t.id);
    await db.from("teams").delete().eq("guild_id", id);
    await db.from("members").delete().eq("guild_id", id);
    const { error } = await db.from("guilds").delete().eq("id", id);
    if (error) throw error;
    await logActivity("Admin", `ลบกิลด์ "${name}"`, null, "delete_guild");
    closeModal("modal-delete-guild");
    toast(`🗑️ ลบ "${name}" แล้ว`, "var(--red)");
    loadAdminGuilds();
  } catch (err) {
    toast("ลบไม่ได้: " + err.message, "var(--red)");
  }
}

export async function openManageMembers(guildId, guildName) {
  state.managingGuildId = guildId;
  document.getElementById("modal-members-guild-name").textContent = guildName;
  document.getElementById("add-member-name").value = "";
  document.getElementById("modal-manage-members").classList.add("open");
  await renderManageMembersList(guildId);
}

export async function renderManageMembersList(guildId) {
  const wrap = document.getElementById("modal-members-list");
  const countEl = document.getElementById("modal-member-count");
  wrap.innerHTML = '<div class="muted" style="padding:8px;">กำลังโหลด…</div>';
  const { data: members } = await db
    .from("members")
    .select("*")
    .eq("guild_id", guildId)
    .order("role", { ascending: false });
  if (!members || members.length === 0) {
    wrap.innerHTML =
      '<div class="empty" style="padding:16px;">ยังไม่มีสมาชิก</div>';
    if (countEl) countEl.textContent = "0";
    return;
  }
  if (countEl) countEl.textContent = members.length;
  wrap.innerHTML = members
    .map(
      (m) =>
        `<div class="manage-member-row"><div class="manage-member-avatar" style="background:${m.role === "leader" ? "#d97706" : "var(--blue2)"};">${m.name[0].toUpperCase()}</div><div class="manage-member-name">${m.name}</div><span class="badge ${m.role === "leader" ? "badge-leader" : "badge-member"}">${m.role === "leader" ? "👑" : ""}</span><div style="display:flex;gap:5px;"><button class="btn btn-ghost btn-sm" onclick="openEditMember(${m.id},'${escStr(m.name)}','${m.role}')">✏️</button><button class="btn btn-red btn-sm" onclick="adminRemoveMember(${m.id},'${escStr(m.name)}')">🗑️</button></div></div>`,
    )
    .join("");
}

export async function adminAddMember() {
  const name = document.getElementById("add-member-name").value.trim();
  const role = document.getElementById("add-member-role").value;
  if (!name || !state.managingGuildId)
    return toast("กรุณาใส่ชื่อ", "var(--red)");
  const { data: existing } = await db
    .from("members")
    .select("id")
    .eq("guild_id", state.managingGuildId)
    .eq("name", name)
    .maybeSingle();
  if (existing) return toast("มีชื่อนี้แล้ว", "var(--amber)");
  const { error } = await db
    .from("members")
    .insert({ name, guild_id: state.managingGuildId, role });
  if (error) return toast("เกิดข้อผิดพลาด: " + error.message, "var(--red)");
  document.getElementById("add-member-name").value = "";
  toast(`✅ เพิ่ม "${name}" แล้ว`);
  await renderManageMembersList(state.managingGuildId);
  loadAdminGuilds();
}

export async function adminRemoveMember(memberId, memberName) {
  if (!confirm(`ลบ "${memberName}" ออก?`)) return;
  const { data: m } = await db
    .from("members")
    .select("role,guild_id")
    .eq("id", memberId)
    .single();
  const isLeader = m?.role === "leader";
  const guildId = m?.guild_id || state.managingGuildId;
  await db.from("members").delete().eq("id", memberId);
  if (isLeader) await handleLeaderLeft(guildId, "?");
  toast(`🗑️ ลบ "${memberName}" แล้ว`, "var(--amber)");
  await renderManageMembersList(state.managingGuildId);
  loadAdminGuilds();
}

export function openEditMember(id, name, role) {
  document.getElementById("edit-member-id").value = id;
  document.getElementById("edit-member-name").value = name;
  document.getElementById("edit-member-role").value = role;
  document.getElementById("modal-edit-member").classList.add("open");
}

export async function confirmEditMember() {
  const id = document.getElementById("edit-member-id").value;
  const name = document.getElementById("edit-member-name").value.trim();
  const role = document.getElementById("edit-member-role").value;
  if (!name) return toast("กรุณาใส่ชื่อ", "var(--red)");
  const { error } = await db
    .from("members")
    .update({ name, role })
    .eq("id", id);
  if (error) return toast("เกิดข้อผิดพลาด: " + error.message, "var(--red)");
  closeModal("modal-edit-member");
  toast("💾 บันทึกแล้ว");
  await renderManageMembersList(state.managingGuildId);
  loadAdminGuilds();
}

export async function loadAdminQuestTab() {
  const sel = document.getElementById("q-guild");
  if (sel) {
    const { data: guilds } = await db.from("guilds").select("id,name");
    sel.innerHTML =
      '<option value="">— ทุกกิลด์ —</option>' +
      (guilds || [])
        .map((g) => `<option value="${g.id}">${g.name}</option>`)
        .join("");
  }
  loadAdminQuestList();
}

export async function loadAdminQuestList() {
  const wrap = document.getElementById("admin-quest-list");
  if (!wrap) return;
  const { data: quests } = await db
    .from("quests")
    .select("*, guilds(name)")
    .order("created_at", { ascending: false });
  if (!quests || quests.length === 0) {
    wrap.innerHTML = '<div class="empty">ยังไม่มีเควส</div>';
    return;
  }
  wrap.innerHTML = quests
    .map(
      (q) =>
        `<div class="quest-item"><div class="quest-icon">${q.icon || "⚔️"}</div><div style="flex:1;"><div class="quest-title">${q.title}</div><div class="quest-desc">${q.description || ""}</div><div class="quest-xp">⭐ ${q.xp_reward || q.points || 0} XP · ${q.guild_id ? `กิลด์: ${q.guilds?.name}` : "ทุกกิลด์"}</div></div><button class="btn btn-red btn-sm" onclick="deleteQuest(${q.id})">ลบ</button></div>`,
    )
    .join("");
}

export async function adminCreateQuest() {
  const title = document.getElementById("q-title").value.trim();
  const desc = document.getElementById("q-desc").value.trim();
  const xp = parseInt(document.getElementById("q-pts").value) || 50;
  const icon = document.getElementById("q-icon").value.trim() || "⚔️";
  const guildId = document.getElementById("q-guild").value || null;
  if (!title) return toast("กรุณาใส่ชื่อเควส", "var(--red)");
  await db.from("quests").insert({
    title,
    description: desc,
    xp_reward: xp,
    points: xp,
    icon,
    guild_id: guildId,
  });
  await logActivity("Admin", `สร้างเควส "${title}"`, null, "create_quest");
  toast("✨ สร้างเควสแล้ว!");
  document.getElementById("q-title").value = "";
  document.getElementById("q-desc").value = "";
  loadAdminQuestList();
}

export async function deleteQuest(id) {
  if (!confirm("ลบเควสนี้?")) return;
  await db.from("quest_submissions").delete().eq("quest_id", id);
  await db.from("quests").delete().eq("id", id);
  toast("ลบเควสแล้ว", "var(--muted)");
  loadAdminQuestList();
}

export async function loadAdminSubmissions() {
  const wrap = document.getElementById("admin-submissions");
  const countEl = document.getElementById("pending-count");
  if (!wrap) return;
  wrap.innerHTML = '<div class="muted">กำลังโหลด…</div>';
  const { data: subs } = await db
    .from("quest_submissions")
    .select(
      "*, quests(title,xp_reward,points,icon), guilds(name,xp), teams(name,type)",
    )
    .order("submitted_at", { ascending: false });
  if (!subs || subs.length === 0) {
    wrap.innerHTML = '<div class="empty">ยังไม่มีการส่งงาน</div>';
    if (countEl) countEl.style.display = "none";
    return;
  }
  const pending = subs.filter((s) => s.status === "pending");
  if (countEl) {
    countEl.textContent = pending.length;
    countEl.style.display = pending.length > 0 ? "" : "none";
  }
  wrap.innerHTML = subs
    .map((s) => {
      const q = s.quests,
        g = s.guilds;
      const statusColor =
        s.status === "approved"
          ? "var(--green)"
          : s.status === "rejected"
            ? "var(--red)"
            : "var(--amber)";
      const statusLabel =
        s.status === "approved"
          ? "✅ อนุมัติ"
          : s.status === "rejected"
            ? "❌ ปฏิเสธ"
            : "⏳ รอ Approve";
      const teamInfo = s.teams
        ? ` · 👥 ${s.teams.name}${s.teams.type ? ` <span class="badge badge-${typeClass(s.teams.type)}" style="font-size:.65rem;">${typeIcon(s.teams.type)} ${s.teams.type}</span>` : ""}`
        : "";
      return `<div class="submission-item"><div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;"><div><div style="font-weight:700;">${q?.icon || "⚔️"} ${q?.title || "?"}</div><div class="muted" style="font-size:.8rem;">👤 ${s.member_name} · 🏰 ${g?.name || "?"}${teamInfo}</div><div class="muted" style="font-size:.76rem;">${new Date(s.submitted_at).toLocaleString("th-TH")}</div></div><span class="badge" style="background:rgba(0,0,0,.3);color:${statusColor};border:1px solid ${statusColor}40;">${statusLabel}</span></div>${s.submission_text ? `<div style="margin-top:10px;font-size:.88rem;background:var(--card);padding:10px;border-radius:8px;border:1px solid var(--border);">${s.submission_text}</div>` : ""}${s.image_data ? `<img src="${s.image_data}" class="submission-img" onclick="viewBigImage('${s.image_data}')" alt="งาน"/>` : ""}${s.status === "pending" ? `<div class="flex-gap mt-s"><button class="btn btn-green btn-sm" onclick="approveSubmission('${s.id}',${s.guild_id},${q?.xp_reward || q?.points || 50},'${escStr(q?.title || "")}','${escStr(s.member_name)}')">✅ Approve (+${q?.xp_reward || q?.points || 50} XP)</button><button class="btn btn-red btn-sm" onclick="rejectSubmission('${s.id}','${escStr(s.member_name)}')">❌ ปฏิเสธ</button></div>` : ""}</div>`;
    })
    .join("");
}

export function viewBigImage(src) {
  document.getElementById("modal-big-img").src = src;
  document.getElementById("modal-view-img").classList.add("open");
}

export async function approveSubmission(
  subId,
  guildId,
  xpReward,
  questTitle,
  memberName,
) {
  await db
    .from("quest_submissions")
    .update({ status: "approved" })
    .eq("id", subId);
  const { data: g } = await db
    .from("guilds")
    .select("xp")
    .eq("id", guildId)
    .single();
  await db
    .from("guilds")
    .update({ xp: (g?.xp || 0) + xpReward })
    .eq("id", guildId);
  await logActivity(
    "Admin",
    `Approve "${questTitle}" ของ ${memberName} (+${xpReward} XP)`,
    guildId,
    "approve_quest",
  );
  toast(`✅ Approve! +${xpReward} XP`, "var(--green)");
  loadAdminSubmissions();
  loadAdminGuilds();
}

export async function rejectSubmission(subId, memberName) {
  const reason = prompt("เหตุผล (optional):") ?? "";
  await db
    .from("quest_submissions")
    .update({ status: "rejected", reject_reason: reason })
    .eq("id", subId);
  toast("ปฏิเสธแล้ว", "var(--red)");
  loadAdminSubmissions();
}

export function updateAdminTeamCountChip() {
  const chip = document.getElementById("admin-team-count-chip");
  if (!chip) return;
  const n = shared.teamMembersBuilder.length;
  chip.textContent = `${n}/${MAX_TEAM_MEMBERS}`;
  chip.className = `count-chip ${n >= MAX_TEAM_MEMBERS ? "chip-max" : "chip-ok"}`;
}

export function addTeamMemberInput() {
  const input = document.getElementById("team-member-input");
  const name = input.value.trim();
  if (!name) return;
  if (shared.teamMembersBuilder.length >= MAX_TEAM_MEMBERS) {
    toast(`สูงสุด ${MAX_TEAM_MEMBERS} คน`, "var(--red)");
    return;
  }
  if (shared.teamMembersBuilder.includes(name)) {
    toast("ชื่อซ้ำ", "var(--amber)");
    return;
  }
  shared.teamMembersBuilder.push(name);
  input.value = "";
  renderTeamMembersBuilder();
  updateAdminTeamCountChip();
}

export function removeTeamMember(name) {
  shared.teamMembersBuilder = shared.teamMembersBuilder.filter(
    (n) => n !== name,
  );
  renderTeamMembersBuilder();
  updateAdminTeamCountChip();
}

export function renderTeamMembersBuilder() {
  const wrap = document.getElementById("team-members-builder");
  if (!wrap) return;
  if (shared.teamMembersBuilder.length === 0) {
    wrap.innerHTML =
      '<span class="muted" style="font-size:.8rem;">ยังไม่มีสมาชิก</span>';
    return;
  }
  wrap.innerHTML = shared.teamMembersBuilder
    .map(
      (n) =>
        `<span class="badge badge-member" style="cursor:pointer;" onclick="removeTeamMember('${escStr(n)}')">${n} ✕</span>`,
    )
    .join("");
}

export async function loadAdminTeamsTab() {
  const sel = document.getElementById("admin-team-guild-sel");
  if (sel) {
    const { data: guilds } = await db.from("guilds").select("id,name");
    sel.innerHTML =
      '<option value="">-- เลือกกิลด์ --</option>' +
      (guilds || [])
        .map((g) => `<option value="${g.id}">${g.name}</option>`)
        .join("");
  }
  shared.teamMembersBuilder = [];
  renderTeamMembersBuilder();
  updateAdminTeamCountChip();
  loadAdminAllTeams();
}

export async function adminCreateTeam() {
  const guildId = document.getElementById("admin-team-guild-sel").value;
  const teamName = document.getElementById("new-team-name").value.trim();
  const teamType = document.getElementById("admin-team-type").value;
  if (!guildId || !teamName)
    return toast("เลือกกิลด์และใส่ชื่อกลุ่ม", "var(--red)");
  if (shared.teamMembersBuilder.length === 0)
    return toast("เพิ่มสมาชิกอย่างน้อย 1 คน", "var(--red)");
  if (shared.teamMembersBuilder.length > MAX_TEAM_MEMBERS)
    return toast(`สมาชิกเกิน ${MAX_TEAM_MEMBERS}`, "var(--red)");
  const { data: team, error } = await db
    .from("teams")
    .insert({ name: teamName, guild_id: parseInt(guildId), type: teamType })
    .select()
    .single();
  if (error) return toast("เกิดข้อผิดพลาด: " + error.message, "var(--red)");
  for (const mn of shared.teamMembersBuilder)
    await db.from("team_members").insert({ team_id: team.id, member_name: mn });
  await logActivity(
    "Admin",
    `สร้างกลุ่ม "${teamName}" (${teamType})`,
    parseInt(guildId),
    "create_team",
  );
  toast("✨ สร้างกลุ่มแล้ว!");
  document.getElementById("new-team-name").value = "";
  shared.teamMembersBuilder = [];
  renderTeamMembersBuilder();
  updateAdminTeamCountChip();
  loadAdminAllTeams();
}

export async function loadAdminAllTeams() {
  const wrap = document.getElementById("admin-teams-list");
  if (!wrap) return;
  const { data: teams } = await db
    .from("teams")
    .select("*, team_members(*), guilds(name)")
    .order("guild_id");
  if (!teams || teams.length === 0) {
    wrap.innerHTML = '<div class="empty">ยังไม่มีกลุ่ม</div>';
    return;
  }
  wrap.innerHTML = teams
    .map((t) => {
      const tc = typeClass(t.type);
      return `<div class="team-item" style="border-left-color:${t.type === "Roblox" ? "#fb923c" : t.type === "WebApp" ? "var(--green)" : "var(--cyan)"}"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;"><div><div class="team-header" style="margin-bottom:4px;">👥 ${t.name} <span class="muted" style="font-size:.8rem;font-weight:400;">(${(t.team_members || []).length}/${MAX_TEAM_MEMBERS})</span></div><div class="flex-gap"><span class="badge badge-${tc}">${typeIcon(t.type)} ${t.type || "Unity"}</span><span class="muted" style="font-size:.8rem;">🏰 ${t.guilds?.name || "?"}</span></div></div><button class="btn btn-red btn-sm" onclick="deleteTeam(${t.id})">ลบ</button></div><div class="team-members-grid">${(t.team_members || []).map((m) => `<div class="team-member-badge">${m.member_name}</div>`).join("")}</div></div>`;
    })
    .join("");
}

export async function deleteTeam(teamId) {
  if (!confirm("ลบกลุ่มนี้?")) return;
  await db.from("team_members").delete().eq("team_id", teamId);
  await db.from("teams").delete().eq("id", teamId);
  toast("ลบกลุ่มแล้ว", "var(--muted)");
  loadAdminAllTeams();
}

export async function loadAdminCardsTab() {
  loadAdminRedeemRequests();
  loadAdminAllCards();
  const imageInput = document.getElementById("card-image-input");
  if (imageInput && !imageInput._listenerAdded) {
    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (!file) return;
      const preview = document.getElementById("card-image-preview");
      const wrap = document.getElementById("card-image-preview-wrap");
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        wrap.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
    imageInput._listenerAdded = true;
  }
}

export async function loadAdminRedeemRequests() {
  const wrap = document.getElementById("admin-redeem-requests");
  const countEl = document.getElementById("redeem-pending-count");
  if (!wrap) return;
  const { data: reqs } = await db
    .from("card_redemption_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (!reqs || reqs.length === 0) {
    wrap.innerHTML = '<div class="empty">ยังไม่มีคำขอ</div>';
    if (countEl) countEl.style.display = "none";
    return;
  }
  const pending = reqs.filter((r) => r.status === "pending");
  if (countEl) {
    countEl.textContent = pending.length;
    countEl.style.display = pending.length > 0 ? "" : "none";
  }
  wrap.innerHTML = reqs
    .map((r) => {
      const statusBadge =
        r.status === "pending"
          ? `<span class="badge badge-pending">⏳ รอตรวจสอบ</span>`
          : r.status === "approved"
            ? `<span class="badge badge-approved">✅ อนุมัติแล้ว</span>`
            : `<span class="badge badge-rejected">❌ ปฏิเสธ${r.admin_notes ? `: ${r.admin_notes}` : ""}</span>`;
      return `<div class="redeem-request-item"><div style="flex:1;"><div style="font-weight:700;">${r.guild_name || "?"} <span class="muted" style="font-size:.8rem;">— ${r.leader_name}</span></div><div class="redeem-code">${r.card_code}</div><div class="muted" style="font-size:.76rem;">${new Date(r.created_at).toLocaleString("th-TH")}</div></div>${statusBadge}${r.status === "pending" ? `<button class="btn btn-accent btn-sm" onclick="openApproveRedeem(${r.id},'${escStr(r.card_code)}','${escStr(r.guild_name || "")}',${r.guild_id})">ตรวจสอบ</button>` : ""}</div>`;
    })
    .join("");
}

export function openApproveRedeem(reqId, cardCode, guildName, guildId) {
  state.pendingRedeemId = reqId;
  state._pendingRedeemCode = cardCode;
  state._pendingRedeemGuildId = guildId;
  state._pendingRedeemGuildName = guildName;
  document.getElementById("modal-approve-redeem-content").innerHTML =
    `<div class="notice notice-info">รหัสการ์ด: <strong>${cardCode}</strong></div><div style="margin-top:10px;">กิลด์: <strong>${guildName}</strong></div><div class="muted mt-s" style="font-size:.84rem;">ตรวจสอบรหัสใน Discord ก่อนอนุมัติ</div>`;
  document.getElementById("modal-approve-redeem").classList.add("open");
}

export async function confirmApproveRedeem(approve) {
  closeModal("modal-approve-redeem");
  const reqId = state.pendingRedeemId;
  if (approve) {
    const { data: card } = await db
      .from("cards")
      .select("*")
      .eq("card_code", state._pendingRedeemCode)
      .maybeSingle();
    if (!card) {
      toast(`❌ ไม่พบการ์ดรหัส "${state._pendingRedeemCode}"`, "var(--red)");
      await db
        .from("card_redemption_requests")
        .update({ status: "rejected", admin_notes: "ไม่พบรหัสในระบบ" })
        .eq("id", reqId);
      loadAdminRedeemRequests();
      return;
    }
    const { data: alreadyUsed } = await db
      .from("guild_cards")
      .select("id,used")
      .eq("card_id", card.id)
      .maybeSingle();
    if (alreadyUsed && alreadyUsed.used) {
      toast(`❌ การ์ด "${card.name}" ถูกใช้ไปแล้ว`, "var(--red)");
      await db
        .from("card_redemption_requests")
        .update({ status: "rejected", admin_notes: "การ์ดถูกใช้ไปแล้ว" })
        .eq("id", reqId);
      loadAdminRedeemRequests();
      return;
    }
    const { data: existingAssign } = await db
      .from("guild_cards")
      .select("id,guild_id")
      .eq("card_id", card.id)
      .maybeSingle();
    if (
      existingAssign &&
      existingAssign.guild_id !== state._pendingRedeemGuildId
    ) {
      toast(`❌ การ์ด "${card.name}" อยู่กับกิลด์อื่นแล้ว`, "var(--red)");
      await db
        .from("card_redemption_requests")
        .update({
          status: "rejected",
          admin_notes: "การ์ดอยู่กับกิลด์อื่นแล้ว",
        })
        .eq("id", reqId);
      loadAdminRedeemRequests();
      return;
    }
    if (existingAssign)
      await db
        .from("guild_cards")
        .update({ guild_id: state._pendingRedeemGuildId })
        .eq("id", existingAssign.id);
    else
      await db.from("guild_cards").insert({
        card_id: card.id,
        guild_id: state._pendingRedeemGuildId,
        used: false,
      });

    await db
      .from("card_redemption_requests")
      .update({ status: "approved", card_id: card.id })
      .eq("id", reqId);
    await logActivity(
      "Admin",
      `อนุมัติรหัส "${state._pendingRedeemCode}" → "${card.name}" ให้ "${state._pendingRedeemGuildName}"`,
      state._pendingRedeemGuildId,
      "approve_redeem",
    );
    toast(
      `✅ อนุมัติ! การ์ด "${card.name}" เข้ากิลด์ "${state._pendingRedeemGuildName}"`,
      "var(--green)",
    );
  } else {
    const reason = prompt("เหตุผลที่ปฏิเสธ:") ?? "ไม่ผ่านการตรวจสอบ";
    await db
      .from("card_redemption_requests")
      .update({ status: "rejected", admin_notes: reason })
      .eq("id", reqId);
    toast("ปฏิเสธคำขอแล้ว", "var(--red)");
  }
  loadAdminRedeemRequests();
}

export async function adminCreateCard() {
  const icon = document.getElementById("card-icon-input").value.trim() || "🃏";
  const name = document.getElementById("card-name-input").value.trim();
  const effect = document.getElementById("card-effect-input").value.trim();
  const code = document
    .getElementById("card-code-input")
    .value.trim()
    .toUpperCase();
  if (!name) return toast("กรุณาใส่ชื่อการ์ด", "var(--red)");
  if (!code) return toast("กรุณาใส่รหัสการ์ด", "var(--red)");
  const { data: dup } = await db
    .from("cards")
    .select("id")
    .eq("card_code", code)
    .maybeSingle();
  if (dup) return toast(`รหัส "${code}" มีแล้วในระบบ`, "var(--amber)");
  let imageData = null;
  const imageInput = document.getElementById("card-image-input");
  if (imageInput.files && imageInput.files[0]) {
    const file = imageInput.files[0];
    if (file.size > 3 * 1024 * 1024) return toast("รูปเกิน 3MB", "var(--red)");
    try {
      imageData = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
    } catch (e) {
      return toast("อ่านรูปผิดพลาด", "var(--red)");
    }
  }
  const { error } = await db
    .from("cards")
    .insert({ icon, name, effect, card_code: code, image_data: imageData });
  if (error) return toast("เกิดข้อผิดพลาด: " + error.message, "var(--red)");
  await logActivity(
    "Admin",
    `สร้างการ์ด "${name}" รหัส ${code}`,
    null,
    "create_card",
  );
  toast(`✨ สร้างการ์ด "${name}" แล้ว!`);
  document.getElementById("card-icon-input").value = "🃏";
  document.getElementById("card-name-input").value = "";
  document.getElementById("card-effect-input").value = "";
  document.getElementById("card-code-input").value = "";
  document.getElementById("card-image-input").value = "";
  document.getElementById("card-image-preview-wrap").style.display = "none";
  loadAdminAllCards();
}

export async function loadAdminAllCards() {
  const wrap = document.getElementById("admin-all-cards");
  if (!wrap) return;
  const { data: cards } = await db
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });
  if (!cards || cards.length === 0) {
    wrap.innerHTML =
      '<div class="muted" style="grid-column:1/-1;">ยังไม่มีการ์ด</div>';
    return;
  }
  const { data: gc } = await db
    .from("guild_cards")
    .select("card_id,used,guild_id,guilds(name)");
  const gcMap = {};
  (gc || []).forEach((g) => {
    gcMap[g.card_id] = g;
  });
  wrap.innerHTML = cards
    .map((c) => {
      const assign = gcMap[c.id];
      const isUsed = assign?.used;
      const statusHtml = isUsed
        ? `<span class="badge badge-rejected" style="margin-top:6px;">✔️ ใช้แล้ว (${assign.guilds?.name || "?"})</span>`
        : assign
          ? `<span class="badge badge-approved" style="margin-top:6px;">🎯 กับ ${assign.guilds?.name || "?"}</span>`
          : `<span class="badge badge-pending" style="margin-top:6px;">📦 ว่าง</span>`;
      const assignBtn = isUsed
        ? ""
        : !assign
          ? `<button class="btn btn-green btn-sm btn-full" style="margin-top:6px;" onclick="openAssignCard(${c.id},'${escStr(c.name)}')">🎁 มอบให้กิลด์</button>`
          : `<button class="btn btn-ghost btn-sm btn-full" style="margin-top:6px;" onclick="openAssignCard(${c.id},'${escStr(c.name)}')">🔄 เปลี่ยนกิลด์</button>`;
      const deleteBtn = isUsed
        ? `<div class="muted" style="font-size:.72rem;margin-top:6px;">🔒 ใช้แล้ว ลบไม่ได้</div>`
        : `<button class="btn btn-red btn-sm btn-full" style="margin-top:8px;" onclick="askDeleteCard(${c.id},'${escStr(c.name)}')">🗑️ ลบ</button>`;
      if (c.image_data) {
        return `<div class="card-item" style="padding:0;overflow:hidden;"><div style="width:100%;aspect-ratio:3/4;overflow:hidden;"><img src="${c.image_data}" style="width:100%;height:100%;object-fit:cover;"/></div><div style="padding:10px;"><div class="card-name">${c.name}</div><div class="muted" style="font-size:.72rem;">🔑 ${c.card_code}</div>${statusHtml}${assignBtn}${deleteBtn}</div></div>`;
      }
      return `<div class="card-item"><div class="card-emoji">${c.icon || "🃏"}</div><div class="card-name">${c.name}</div><div class="card-effect">${c.effect || ""}</div><div class="muted" style="font-size:.72rem;">🔑 ${c.card_code || "-"}</div>${statusHtml}${assignBtn}${deleteBtn}</div>`;
    })
    .join("");
}

export function askDeleteCard(cardId, cardName) {
  state.pendingDeleteCardId = cardId;
  document.getElementById("modal-delete-card-desc").textContent =
    `ลบการ์ด "${cardName}" ออกจากระบบถาวร?`;
  document.getElementById("modal-delete-card").classList.add("open");
}

export async function confirmDeleteCard() {
  closeModal("modal-delete-card");
  const id = state.pendingDeleteCardId;
  const { data: gc } = await db
    .from("guild_cards")
    .select("used")
    .eq("card_id", id)
    .maybeSingle();
  if (gc?.used) {
    toast("การ์ดนี้ถูกใช้แล้ว ลบไม่ได้", "var(--red)");
    return;
  }
  await db.from("guild_cards").delete().eq("card_id", id);
  await db.from("card_redemption_requests").delete().eq("card_id", id);
  await db.from("cards").delete().eq("id", id);
  await logActivity("Admin", `ลบการ์ด id=${id}`, null, "delete_card");
  toast("ลบการ์ดแล้ว", "var(--muted)");
  loadAdminAllCards();
}

export async function loadAdminCompTab() {
  loadAdminCompList();
}

export async function loadAdminCompList() {
  const wrap = document.getElementById("admin-comp-list");
  if (!wrap) return;
  const { data: comps } = await db
    .from("competitions")
    .select("*, competition_participants(*)")
    .order("created_at", { ascending: false });
  if (!comps || comps.length === 0) {
    wrap.innerHTML = '<div class="empty">ยังไม่มีการแข่งขัน</div>';
    return;
  }
  const rankEmoji = ["🥇", "🥈", "🥉"];
  wrap.innerHTML = comps
    .map((c) => {
      const sorted = (c.competition_participants || []).sort(
        (a, b) => b.score - a.score,
      );
      return `<div class="competition-card"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;"><div class="comp-title" style="margin-bottom:0;">🏁 ${c.name}</div>${c.finished ? '<span class="badge badge-approved">✅ จบแล้ว</span>' : ""}</div>${sorted.map((p, i) => `<div class="comp-guild-row"><span>${rankEmoji[i] || i + 1}</span><span class="comp-guild-name">${p.guild_name}</span><span class="comp-guild-score">${p.score} pts</span>${!c.finished ? `<button class="btn btn-green btn-sm" onclick="updateCompScore('${c.id}',${p.guild_id},${p.score},5)">+5</button><button class="btn btn-red btn-sm" onclick="updateCompScore('${c.id}',${p.guild_id},${p.score},-5)">−5</button>` : ""}</div>`).join("")}${!c.finished ? `<div class="flex-gap" style="margin-top:10px;"><button class="btn btn-gold btn-sm" onclick="openFinishComp('${c.id}')">🏆 จบการแข่งขัน</button><button class="btn btn-red btn-sm" onclick="deleteCompetition('${c.id}')">🗑️ ลบ</button></div>` : `<button class="btn btn-red btn-sm mt-s" onclick="deleteCompetition('${c.id}')">🗑️ ลบ</button>`}</div>`;
    })
    .join("");
}

export async function adminCreateCompetition() {
  const name = document.getElementById("comp-name").value.trim();
  if (!name) return toast("กรุณาใส่ชื่อ", "var(--red)");
  const { data: comp, error } = await db
    .from("competitions")
    .insert({ name, finished: false })
    .select()
    .single();
  if (error) return toast("เกิดข้อผิดพลาด: " + error.message, "var(--red)");
  const { data: guilds } = await db.from("guilds").select("id,name");
  for (const g of guilds || []) {
    await db.from("competition_participants").insert({
      competition_id: comp.id,
      guild_id: g.id,
      guild_name: g.name,
      score: 0,
    });
  }
  await logActivity(
    "Admin",
    `สร้างการแข่งขัน "${name}"`,
    null,
    "create_competition",
  );
  toast("🏁 สร้างการแข่งขันแล้ว!");
  document.getElementById("comp-name").value = "";
  loadAdminCompList();
}

export async function updateCompScore(compId, guildId, current, delta) {
  const newScore = Math.max(0, current + delta);
  await db
    .from("competition_participants")
    .update({ score: newScore })
    .eq("competition_id", compId)
    .eq("guild_id", guildId);
  loadAdminCompList();
}

export async function openFinishComp(compId) {
  const { data: comp } = await db
    .from("competitions")
    .select("*, competition_participants(*)")
    .eq("id", compId)
    .single();
  if (!comp) return;
  state.pendingFinishCompId = compId;
  const sorted = (comp.competition_participants || []).sort(
    (a, b) => b.score - a.score,
  );
  const rankEmoji = ["🥇", "🥈", "🥉"];
  let html =
    '<div class="muted" style="margin-bottom:12px;font-size:.85rem;">ยืนยันจบการแข่งขัน</div>';
  sorted.slice(0, 3).forEach((p, i) => {
    html += `<div style="background:var(--surface);border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid var(--border);"><div style="font-weight:700;">${rankEmoji[i] || ""} ${p.guild_name}</div><div class="muted" style="font-size:.82rem;">${p.score} pts</div></div>`;
  });
  document.getElementById("modal-finish-comp-content").innerHTML = html;
  document.getElementById("modal-finish-comp").classList.add("open");
}

export async function confirmFinishComp() {
  closeModal("modal-finish-comp");
  await db
    .from("competitions")
    .update({ finished: true })
    .eq("id", state.pendingFinishCompId);
  await logActivity(
    "Admin",
    `จบการแข่งขัน id=${state.pendingFinishCompId}`,
    null,
    "finish_competition",
  );
  toast("🏆 จบการแข่งขันแล้ว!", "var(--gold)");
  loadAdminCompList();
}

export async function deleteCompetition(compId) {
  if (!confirm("ลบการแข่งขันนี้?")) return;
  await db
    .from("competition_participants")
    .delete()
    .eq("competition_id", compId);
  await db.from("competitions").delete().eq("id", compId);
  toast("ลบแล้ว", "var(--muted)");
  loadAdminCompList();
}

export async function loadAdminLog() {
  const wrap = document.getElementById("console-log");
  if (!wrap) return;
  const { data: logs } = await db
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (!logs || logs.length === 0) {
    wrap.innerHTML = '<div class="log-line">ยังไม่มี activity</div>';
    return;
  }
  wrap.innerHTML = logs
    .map((l) => {
      const ts = new Date(l.created_at).toLocaleTimeString("th-TH");
      return `<div class="log-line"><span class="ts">[${ts}]</span><span class="act">${l.actor_name}</span><span style="color:var(--text);"> — ${l.description}</span></div>`;
    })
    .join("");
}

export function openAssignCard(cardId, cardName) {
  state.pendingAssignCardId = cardId;
  state.pendingAssignCardName = cardName;

  // โหลดรายชื่อกิลด์ลง select
  db.from("guilds")
    .select("id,name")
    .then(({ data: guilds }) => {
      const sel = document.getElementById("assign-card-guild-sel");
      sel.innerHTML =
        '<option value="">-- เลือกกิลด์ --</option>' +
        (guilds || [])
          .map((g) => `<option value="${g.id}">${g.name}</option>`)
          .join("");
    });

  document.getElementById("modal-assign-card-title").textContent =
    `🎁 มอบ "${cardName}" ให้กิลด์`;
  document.getElementById("modal-assign-card").classList.add("open");
}

export async function confirmAssignCard() {
  const guildId = parseInt(
    document.getElementById("assign-card-guild-sel").value,
  );
  if (!guildId) return toast("กรุณาเลือกกิลด์", "var(--red)");

  const cardId = state.pendingAssignCardId;
  const cardName = state.pendingAssignCardName;

  // ตรวจว่ามี guild_cards record ของการ์ดนี้อยู่แล้วหรือเปล่า
  const { data: existing } = await db
    .from("guild_cards")
    .select("id, used, guild_id")
    .eq("card_id", cardId)
    .maybeSingle();

  if (existing?.used) {
    toast("การ์ดนี้ถูกใช้ไปแล้ว", "var(--red)");
    closeModal("modal-assign-card");
    return;
  }

  const { data: guild } = await db
    .from("guilds")
    .select("name")
    .eq("id", guildId)
    .single();

  if (existing) {
    // อัปเดตกิลด์ใหม่
    await db
      .from("guild_cards")
      .update({ guild_id: guildId, used: false })
      .eq("id", existing.id);
  } else {
    // สร้าง record ใหม่
    await db
      .from("guild_cards")
      .insert({ card_id: cardId, guild_id: guildId, used: false });
  }

  await logActivity(
    "Admin",
    `มอบการ์ด "${cardName}" ให้กิลด์ "${guild?.name}"`,
    guildId,
    "assign_card",
  );

  closeModal("modal-assign-card");
  toast(`✅ มอบ "${cardName}" ให้ "${guild?.name}" แล้ว!`, "var(--green)");
  loadAdminAllCards();
}

// ============================================================
// PATCH 2: guild.js (ฝั่ง Leader) — ฟังก์ชันแสดงการ์ดและกดใช้
// ============================================================

// โหลดการ์ดของกิลด์ — เรียกในหน้า guild leader
export async function loadGuildCards(guildId, isLeader) {
  const wrap = document.getElementById("guild-cards-list");
  if (!wrap) return;

  const { data: guildCards } = await db
    .from("guild_cards")
    .select("*, cards(*)")
    .eq("guild_id", guildId);

  if (!guildCards || guildCards.length === 0) {
    wrap.innerHTML = '<div class="empty">ยังไม่มีการ์ด</div>';
    return;
  }

  wrap.innerHTML = guildCards
    .map((gc) => {
      const c = gc.cards;
      if (!c) return "";

      const usedOverlay = gc.used
        ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,.55);border-radius:inherit;display:flex;align-items:center;justify-content:center;font-size:2rem;">✔️</div>`
        : "";

      const useBtn =
        !gc.used && isLeader
          ? `<button class="btn btn-gold btn-sm btn-full" style="margin-top:8px;" onclick="useGuildCard(${gc.id},'${escStr(c.name)}')">⚡ ใช้การ์ด</button>`
          : gc.used
            ? `<div class="muted" style="font-size:.76rem;margin-top:6px;text-align:center;">✅ ใช้แล้ว</div>`
            : `<div class="muted" style="font-size:.76rem;margin-top:6px;text-align:center;">🔒 เฉพาะหัวกิลด์</div>`;

      if (c.image_data) {
        return `<div class="card-item" style="padding:0;overflow:hidden;position:relative;">
        <div style="width:100%;aspect-ratio:3/4;overflow:hidden;position:relative;">
          <img src="${c.image_data}" style="width:100%;height:100%;object-fit:cover;"/>
          ${usedOverlay}
        </div>
        <div style="padding:10px;">
          <div class="card-name">${c.name}</div>
          <div class="card-effect" style="font-size:.8rem;color:var(--muted);">${c.effect || ""}</div>
          ${useBtn}
        </div>
      </div>`;
      }

      return `<div class="card-item" style="position:relative;">
      ${usedOverlay}
      <div class="card-emoji">${c.icon || "🃏"}</div>
      <div class="card-name">${c.name}</div>
      <div class="card-effect">${c.effect || ""}</div>
      ${useBtn}
    </div>`;
    })
    .join("");
}

// กดใช้การ์ด — เฉพาะหัวกิลด์
export async function useGuildCard(guildCardId, cardName) {
  if (
    !confirm(
      `ใช้การ์ด "${cardName}" เลยไหม?\n\nการ์ดจะถูกใช้ถาวรและไม่สามารถย้อนกลับได้`,
    )
  )
    return;

  // ตรวจสอบอีกครั้งก่อนใช้ (race condition guard)
  const { data: gc } = await db
    .from("guild_cards")
    .select("used, guild_id")
    .eq("id", guildCardId)
    .single();

  if (gc?.used) {
    toast("การ์ดนี้ถูกใช้ไปแล้ว", "var(--red)");
    return;
  }

  const { error } = await db
    .from("guild_cards")
    .update({ used: true })
    .eq("id", guildCardId);

  if (error) {
    toast("เกิดข้อผิดพลาด: " + error.message, "var(--red)");
    return;
  }

  await logActivity(
    state.memberName || "Leader",
    `ใช้การ์ด "${cardName}"`,
    gc.guild_id,
    "use_card",
  );

  toast(`⚡ ใช้การ์ด "${cardName}" แล้ว!`, "var(--gold)");
  loadGuildCards(gc.guild_id, true); // refresh
}
