// @mikroskato62 - Capybara Discord Bot - Capydex Collection Tracker & Leaderboard Subsystem.
// Handles user progress tracking, disk persistence, dynamic web pool probing, and embed formatting.
// Import: const capydex = require("./services/capydex");

// [#1] Core dependencies & setups ...
const fs = require("fs");
const path = require("path");
const {
  DATA_DIR,
  CAPYDATA_FILE,
  LEGACY_CAPYDEX_FILE,
  DEFAULT_WEB_TOTAL,
} = require("../config");

// Baseline fallback total if api.capy.lol is offline or unreachable:
let totalWebCapybaras = DEFAULT_WEB_TOTAL;

// In-memory user collections store: Map<userId, { local: Set<number>, web: Set<number>, recentWeb: Array<number> }> ...
const collections = new Map();
let saveTimeout = null;
let currentStorageFile = CAPYDATA_FILE;

// [#2] Capydex collection storage & disk persistence ...
// Initialize data directory and load existing collections from disk:
function initStorage(customFilePath = null)
{
  let defaultFile = CAPYDATA_FILE;
  if (!customFilePath && !fs.existsSync(CAPYDATA_FILE) && fs.existsSync(LEGACY_CAPYDEX_FILE))
  {
    defaultFile = LEGACY_CAPYDEX_FILE;
  }
  currentStorageFile = customFilePath || defaultFile;

  if (saveTimeout)
  {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  const filePath = currentStorageFile;
  const dirPath = path.dirname(filePath);

  // Ensure target data directory exists:
  if (!fs.existsSync(dirPath))
  {
    try { fs.mkdirSync(dirPath, { recursive: true }); }
    catch (err) { console.warn("[!] Warning: Could not create data directory: ", err.message, " ..."); }
  }

  collections.clear();

  // Load and deserialize stored user collections:
  if (fs.existsSync(filePath))
  {
    try
    {
      const raw = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(raw);
      for (const [userId, record] of Object.entries(data))
      {
        collections.set(userId, {
          local: new Set(Array.isArray(record.local) ? record.local.map(Number).filter((n) => !isNaN(n)) : []),
          web: new Set(Array.isArray(record.web) ? record.web.map(Number).filter((n) => !isNaN(n)) : []),
          recentWeb: Array.isArray(record.recentWeb) ? record.recentWeb.map(Number).filter((n) => !isNaN(n)) : [],
          username: typeof record.username === "string" && record.username.trim() ? record.username.trim() : "User",
          updatedAt: typeof record.updatedAt === "number" ? record.updatedAt : Date.now(),
          completedAt: typeof record.completedAt === "number" ? record.completedAt : null,
        });
      }
    }
    catch (err) { console.warn("[!] Warning: Could not parse capydata.json, starting with clean memory state: ", err.message, " ..."); }
  }
}

// Save collections to disk (debounced to prevent disk I/O thrashing):
function saveStorage(customFilePath = null, immediate = false)
{
  const filePath = customFilePath || currentStorageFile;
  const doWrite = () =>
  {
    try
    {
      const exportData = {};
      for (const [userId, record] of collections.entries())
      {
        exportData[userId] = {
          local: Array.from(record.local),
          web: Array.from(record.web),
          recentWeb: record.recentWeb.slice(0, 10),
          username: record.username || "User",
          updatedAt: record.updatedAt || Date.now(),
          completedAt: record.completedAt || null,
        };
      }
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), "utf8");
    }
    catch (err) { console.warn("[!] Warning: Could not write to capydata.json: ", err.message, " ..."); }
  };

  // Immediate write on application exit or 300ms debounce during runtime:
  if (immediate)
  {
    if (saveTimeout)
    {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    doWrite();
  }
  else
  {
    if (!saveTimeout)
    {
      saveTimeout = setTimeout(() =>
      {
        saveTimeout = null;
        doWrite();
      }, 300);
    }
  }
}

// Auto-flush storage cache on application exit:
process.on("beforeExit", () => saveStorage(null, true));

// Ensure storage initialized on module load:
initStorage();

// [#3] Dynamic web capybara pool synchronization ...
// Probes api.capy.lol using binary search to detect total available live images:
async function syncWebCapybarasTotal(customFetch = null)
{
  const fetchFn = customFetch || globalThis.fetch;
  let low = 1;
  let high = 5000;
  let detected = totalWebCapybaras;

  try
  {
    while (low <= high)
    {
      const mid = Math.floor((low + high) / 2);
      const res = await fetchFn(`https://api.capy.lol/v1/capybaras?from=${mid}&take=1`, { signal: AbortSignal.timeout(3000), }).then((r) => r.json());

      if (res && res.success && Array.isArray(res.data) && res.data.length > 0)
      {
        detected = res.data[0].index + 1;
        low = mid + 1;
      }
      else
      {
        high = mid - 1;
      }
    }

    if (detected >= 50 && detected <= 10000)
    {
      totalWebCapybaras = detected;
      console.log("[!] Capybara: Dynamic Web pool verified: ", totalWebCapybaras, " total images ...");
    }
  }
  catch (err) { console.warn("[!] Warning: Could not probe live api.capy.lol pool: ", err.message, " ..."); }

  return totalWebCapybaras;
}

// Getters and setters for web total count:
function getWebTotal() { return totalWebCapybaras; }
function setWebTotal(value) { if (typeof value === "number" && value > 0) { totalWebCapybaras = value; } }
function bumpWebTotalIfHigher(index) { if (typeof index === "number" && index > totalWebCapybaras) { totalWebCapybaras = index; } }

// [#4] Collection unlock helpers & player statistics ...
// Retrieve or initialize collection data for a user:
function getOrCreateUserRecord(userId, username = null)
{
  if (!collections.has(userId))
  {
    collections.set(userId, {
      local: new Set(),
      web: new Set(),
      recentWeb: [],
      username: username || "User",
      updatedAt: Date.now(),
      completedAt: null,
    });
  }
  else if (username && (!collections.get(userId).username || collections.get(userId).username === "User"))
  {
    collections.get(userId).username = username;
  }
  return collections.get(userId);
}

// Update stored username metadata on user activity:
function updateUserInfo(userId, username)
{
  if (!userId) { return; }
  const userRecord = getOrCreateUserRecord(userId, username);
  if (username && userRecord.username !== username)
  {
    userRecord.username = username;
    saveStorage();
  }
}

// Record newly unlocked local capybara image index:
function recordLocalUnlock(userId, imageIndex, username = null, totalLocal = 25, totalWeb = null)
{
  if (!userId || typeof imageIndex !== "number" || imageIndex <= 0) { return false; }
  const userRecord = getOrCreateUserRecord(userId, username);
  if (username) { userRecord.username = username; }
  const isNew = !userRecord.local.has(imageIndex);
  if (isNew)
  {
    userRecord.local.add(imageIndex);
    userRecord.updatedAt = Date.now();
    const effectiveWeb = totalWeb || totalWebCapybaras;
    if (userRecord.local.size >= totalLocal && userRecord.web.size >= effectiveWeb && !userRecord.completedAt)
    {
      userRecord.completedAt = Date.now();
    }
    saveStorage();
  }
  return isNew;
}

// Record newly unlocked web capybara photo index:
function recordWebUnlock(userId, photoIndex, username = null, totalLocal = 25)
{
  if (!userId || typeof photoIndex !== "number" || photoIndex <= 0) { return false; }
  bumpWebTotalIfHigher(photoIndex);

  const userRecord = getOrCreateUserRecord(userId, username);
  if (username) { userRecord.username = username; }
  const isNew = !userRecord.web.has(photoIndex);

  if (isNew)
  {
    userRecord.web.add(photoIndex);
    userRecord.updatedAt = Date.now();
    if (userRecord.local.size >= totalLocal && userRecord.web.size >= totalWebCapybaras && !userRecord.completedAt)
    {
      userRecord.completedAt = Date.now();
    }
  }

  // Update recent discoveries list (unique FIFO, max 5 recent):
  userRecord.recentWeb = [photoIndex, ...userRecord.recentWeb.filter((id) => id !== photoIndex)].slice(0, 5);
  saveStorage();

  return isNew;
}

// Calculate comprehensive collection statistics for a user:
function getUserStats(userId, totalLocal = 25, totalWeb = null)
{
  const effectiveTotalWeb = totalWeb || totalWebCapybaras;
  const userRecord = collections.get(userId) || { local: new Set(), web: new Set(), recentWeb: [] };

  const localUnlocked = Array.from(userRecord.local).sort((a, b) => a - b);
  const webUnlocked = Array.from(userRecord.web).sort((a, b) => a - b);

  const localCount = localUnlocked.length;
  const webCount = webUnlocked.length;

  const localPercent = totalLocal > 0 ? Math.min(100, Math.round((localCount / totalLocal) * 100)) : 0;
  const webPercent = effectiveTotalWeb > 0 ? Math.min(100, Math.round((webCount / effectiveTotalWeb) * 100)) : 0;

  return {
    localCount,
    localTotal: totalLocal,
    localPercent,
    localUnlocked,
    webCount,
    webTotal: effectiveTotalWeb,
    webPercent,
    webUnlocked,
    recentWeb: userRecord.recentWeb || [],
  };
}

// [#5] Capydex progress bar & embed builders ...
// Compact visual progress bar builder (5 blocks for Discord mobile):
function createProgressBar(current, total, barLength = 5)
{
  if (total <= 0) { return `[${"░".repeat(barLength)}]`; }
  const ratio = Math.max(0, Math.min(1, current / total));
  const filledCount = Math.round(ratio * barLength);
  const emptyCount = barLength - filledCount;
  return `[${"█".repeat(filledCount)}${"░".repeat(emptyCount)}]`;
}

// Construct detailed personal Capydex collection embed:
function buildCapydexEmbed(user, clientInstance, totalLocal = 25, totalWeb = null, color = 0x8d5524)
{
  const stats = getUserStats(user.id, totalLocal, totalWeb);
  const avatarUrl = user?.displayAvatarURL ? (typeof user.displayAvatarURL === "function" ? user.displayAvatarURL() : user.displayAvatarURL) : undefined;
  const timeString = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const userTag = user?.tag || user?.username || "User";

  // Local Checklist (25 items, grouped in a clean 5x5 grid):
  const localItems = [];
  const localSet = new Set(stats.localUnlocked);
  for (let i = 1; i <= stats.localTotal; i++)
  {
    const isUnlocked = localSet.has(i);
    const icon = isUnlocked ? "✅" : "🔒";
    localItems.push(`\`#${String(i).padStart(2, "0")}\` ${icon}`);
  }

  // Format into rows of 5 items:
  const localRows = [];
  for (let i = 0; i < localItems.length; i += 5)
  {
    localRows.push(localItems.slice(i, i + 5).join("  "));
  }

  const localRangeStr = `\`#01–#${String(stats.localTotal).padStart(2, "0")}\``;
  const localBar = createProgressBar(stats.localCount, stats.localTotal, 5);
  const localCountStr = `**${String(stats.localCount).padStart(2, "0")}**/${String(stats.localTotal).padStart(2, "0")}`;
  const localHeaderLine = `${localRangeStr}  ${localBar}  ${localCountStr} (${stats.localPercent}%)`;
  const localVictoryLine 
    = stats.localCount >= stats.localTotal && stats.localTotal > 0
    ? "\n• 🏆 **All capybaras unlocked! A true capy lover!**"
    : "";

  // Web 100-Block Progress Bars (Chapter breakdown):
  const webBlocks = [];
  const webSet = new Set(stats.webUnlocked);
  const chunkSize = 100;
  const totalChunks = Math.ceil(stats.webTotal / chunkSize);

  for (let c = 0; c < totalChunks; c++)
  {
    const start = c * chunkSize + 1;
    const end = Math.min((c + 1) * chunkSize, stats.webTotal);
    const chunkTotal = end - start + 1;

    let unlockedInChunk = 0;
    for (let idx = start; idx <= end; idx++)
    { if (webSet.has(idx)) { unlockedInChunk++; } }

    const chunkPercent = Math.round((unlockedInChunk / chunkTotal) * 100);
    const bar = createProgressBar(unlockedInChunk, chunkTotal, 5);
    const rangeStr = `\`#${String(start).padStart(3, "0")}–#${String(end).padStart(3, "0")}\``;
    const countStr = `**${String(unlockedInChunk).padStart(2, "0")}**/${String(chunkTotal).padStart(2, "0")}`;
    webBlocks.push(`${rangeStr}  ${bar}  ${countStr} (${chunkPercent}%)`);
  }

  // Next missing milestones discovery suggestions:
  const nextMissing = [];
  for (let i = 1; i <= stats.webTotal && nextMissing.length < 5; i++)
  { if (!webSet.has(i)) { nextMissing.push(`\`#${i}\``); } }
  const missingLine 
    = nextMissing.length > 0
    ? `• **Next Missing:** ${nextMissing.join(", ")}`
    : "🏆 **All capybaras unlocked! A true capy lover!**";

  const embed = 
  {
    author: 
    {
      name: `${user.username || user.tag || "User"}`,
      icon_url: avatarUrl,
    },
    description: 
    [
      `🌟 **Your Capydex Mastery Collection:**`,
      `• Local Capys: ${stats.localCount}/${stats.localTotal} (${stats.localPercent}%)`,
      `• Live Web Capys: ${stats.webCount}/${stats.webTotal} (${stats.webPercent}%)`,
    ]
    .join("\n"),
    fields: 
    [
      {
        name: `📁 Hand-Curated Photos:`,
        value: `${localHeaderLine}\n${localRows.join("\n")}${localVictoryLine}`,
        inline: false,
      },
      {
        name: `🌐 Web Gallery Chapters:`,
        value: `${webBlocks.join("\n")}\n${missingLine}`,
        inline: false,
      },
    ],
    footer: 
    {
      text: `* Capydex Tracker for @${userTag} ...\n* Keep exploring with /capybaras & /capyweb ...\n* Requested by @${userTag} • Today at ${timeString} ...`,
    },
    color,
  };

  return { embeds: [embed] };
}

// [#6] Leaderboard rankings & tiebreaker engine ...
// Compute player standings with gaming tiebreaker rules:
function getLeaderboard(guildMemberIds = null, limit = 5, requestingUserId = null)
{
  const memberSet 
    = guildMemberIds && (guildMemberIds.size > 0 || guildMemberIds.length > 0)
    ? new Set(guildMemberIds)
    : null;

  if (memberSet && requestingUserId) { memberSet.add(requestingUserId); }

  const participants = [];

  for (const [userId, record] of collections.entries())
  {
    const localCount = record.local ? record.local.size : 0;
    const webCount = record.web ? record.web.size : 0;
    const total = localCount + webCount;

    // Filter rules: must have at least 1 unlock and match guild members if specified:
    if (total <= 0) { continue; }
    if (memberSet && !memberSet.has(userId)) { continue; }

    participants.push({
      userId,
      username: record.username || "User",
      localCount,
      webCount,
      total,
      updatedAt: record.updatedAt || 0,
      completedAt: record.completedAt || null,
    });
  }

  // Gaming tiebreaker hierarchy: Total -> Rare Local -> 100% Completion -> Earliest Activity:
  participants.sort((a, b) =>
  {
    if (b.total !== a.total) { return b.total - a.total; }
    if (b.localCount !== a.localCount) { return b.localCount - a.localCount; }
    if (a.completedAt && b.completedAt && a.completedAt !== b.completedAt) { return a.completedAt - b.completedAt; }
    if (a.completedAt && !b.completedAt) { return -1; }
    if (!a.completedAt && b.completedAt) { return 1; }
    return (a.updatedAt || 0) - (b.updatedAt || 0);
  });

  // Assign 1-indexed ranks:
  participants.forEach((p, idx) => { p.rank = idx + 1; });

  const topPlayers = participants.slice(0, limit);

  let userStanding = null;
  if (requestingUserId)
  {
    const found = participants.find((p) => p.userId === requestingUserId);
    if (found) { userStanding = found; }
  }

  const isUserInTop = userStanding ? userStanding.rank <= limit : false;

  return {
    topPlayers,
    userStanding,
    isUserInTop,
    totalParticipants: participants.length,
  };
}

// Build visual Discord embed for server and worldwide leaderboards:
function buildLeaderboardEmbed({
  user,
  guild = null,
  clientInstance = null,
  guildMemberIds = null,
  limit = 5,
  totalLocal = 25,
  totalWeb = null,
  color = 0xf5a623,
}){
  const effectiveTotalWeb = totalWeb || totalWebCapybaras;
  const totalCatalogMax = totalLocal + effectiveTotalWeb;
  const serverName = guild?.name ? guild.name : "Worldwide";
  const iconUrl 
    = guild?.iconURL
    ? (typeof guild.iconURL === "function" ? guild.iconURL() : guild.iconURL)
    : (clientInstance?.user?.displayAvatarURL ? clientInstance.user.displayAvatarURL() : undefined);

  const rankIcons = { 1: "🥇", 2: "🥈", 3: "🥉", 4: "4️⃣", 5: "5️⃣" };

  const formatRow = (player) =>
  {
    const icon = rankIcons[player.rank] || `#${player.rank}`;
    const percent = totalCatalogMax > 0 ? Math.round((player.total / totalCatalogMax) * 100) : 0;
    const isCurrentUser = player.userId === user?.id;
    const indicator = isCurrentUser ? " 👈🏼" : "";
    return `${icon} @${player.username} (${player.total} Capys • ${percent}%)${indicator}`;
  };

  const timeString = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, });
  const userTag = user?.username || user?.tag || "User";

  const descriptionLines = ["\u200B"];

  // 1. Server-specific leaderboard section:
  if (guild)
  {
    const serverLeaderboard = getLeaderboard(guildMemberIds, limit, user?.id);
    let serverListText = "";
    if (serverLeaderboard.topPlayers.length === 0)
    {
      serverListText = "• *No capybara lovers in this server yet!*";
    }
    else
    {
      serverListText = serverLeaderboard.topPlayers.map((p) => formatRow(p)).join("\n");
    }

    let serverStanding = "";
    if (!serverLeaderboard.isUserInTop)
    {
      if (serverLeaderboard.userStanding) { serverStanding = `\n• • •\n${formatRow(serverLeaderboard.userStanding)}`; }
      else { serverStanding = `\n• • •\n👉 **Unranked** • *You haven't unlocked any capybaras!*`; }
    }

    descriptionLines.push(`🌟 **Top Capybara Lovers in this Server:**`);
    descriptionLines.push(serverListText);
    if (serverStanding) { descriptionLines.push(serverStanding); }
    descriptionLines.push("");
  }

  // 2. Worldwide global leaderboard section:
  const globalLeaderboard = getLeaderboard(null, limit, user?.id);
  let globalListText = "";
  if (globalLeaderboard.topPlayers.length === 0)
  {
    globalListText = "• *No capybara lovers worldwide yet!*";
  }
  else
  {
    globalListText = globalLeaderboard.topPlayers.map((p) => formatRow(p)).join("\n");
  }

  let globalStanding = "";
  if (!globalLeaderboard.isUserInTop)
  {
    if (globalLeaderboard.userStanding) { globalStanding = `\n• • •\n${formatRow(globalLeaderboard.userStanding)}`; }
    else { globalStanding = `\n• • •\n👉 **Unranked** • *You haven't unlocked any capybaras!*`; }
  }

  descriptionLines.push(`🌍 **Top Capybara Lovers Worldwide (Global):**`);
  descriptionLines.push(globalListText);
  if (globalStanding) { descriptionLines.push(globalStanding); }
  descriptionLines.push("\u200B");

  const embed = {
    author: {
      name: `${serverName} • Capydex Leaderboard`,
      icon_url: iconUrl,
    },
    description: descriptionLines.join("\n"),
    footer: {
      text: `* Capydex Leaderboard • ${serverName} & Global ...\n* Keep exploring with /capybaras & /capyweb ...\n* Requested by @${userTag} • Today at ${timeString} ...`,
    },
    color,
  };

  return { embeds: [embed] };
}

// Integrated Capydex subsystem module object:
const capydex = {
  DEFAULT_WEB_TOTAL,
  initStorage,
  saveStorage,
  syncWebCapybarasTotal,
  getWebTotal,
  setWebTotal,
  bumpWebTotalIfHigher,
  recordLocalUnlock,
  recordWebUnlock,
  updateUserInfo,
  getUserStats,
  getLeaderboard,
  createProgressBar,
  buildCapydexEmbed,
  buildLeaderboardEmbed,
  collections,
};

module.exports = capydex;

// The end ...
// @mikroskato62 - Capybara Discord Bot - Capydex Collection Tracker & Leaderboard Subsystem.
//   
