// @mikroskato62 - Capybara Discord Bot - All-In-One Merged Core Logic. 
// Merged from: index.js + capydex.js.
// Run: node code.js.

// Check if running as main process:
if (require.main === module) { console.log("[!] Capybara: Hello World!"); }

// [#1] Core dependencies & environment setups ...
const {
  Client,
  GatewayIntentBits,
  Events,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
  MessageFlags
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const emojiData = require("unicode-emoji-json");
require("dotenv").config({ quiet: true });

// [#2] Capydex collection storage & disk persistence ...
// Persistent storage paths for Capydex records:
const DATA_DIR = path.join(__dirname, "data");
const CAPYDEX_FILE = path.join(DATA_DIR, "capydex.json");

// Baseline fallback total if api.capy.lol is offline or unreachable:
const DEFAULT_WEB_TOTAL = 747;
let totalWebCapybaras = DEFAULT_WEB_TOTAL;

// In-memory user collections store: Map<userId, { local: Set<number>, web: Set<number>, recentWeb: Array<number> }> ...
const collections = new Map();
let saveTimeout = null;
let currentStorageFile = CAPYDEX_FILE;

// Initialize data directory and load existing collections from disk:
function initStorage(customFilePath = null)
{
  currentStorageFile = customFilePath || CAPYDEX_FILE;
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
    catch (err) { console.warn("[!] Warning: Could not parse capydex.json, starting with clean memory state: ", err.message, " ..."); }
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
    catch (err) { console.warn("[!] Warning: Could not write to capydex.json: ", err.message, " ..."); }
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

// [#7] Bot configuration & local responses data ...
// Configurable custom emoji or default Unicode fallback:
const CUSTOM_EMOJI_ID = process.env.CUSTOM_EMOJI_ID ? process.env.CUSTOM_EMOJI_ID.trim() : null;
const DEFAULT_CAPY_EMOJI = "🦫";
const CAPY_EMOJI_STRING = CUSTOM_EMOJI_ID ? `<:capybara:${CUSTOM_EMOJI_ID}>` : DEFAULT_CAPY_EMOJI;

// Random Discord embed color generator:
function getRandomColor() { return Math.floor(Math.random() * 0xffffff); }

// Curated list of 25 local capybara pictures and captions:
const capybaraResponses = 
[
  { text: `( ${CAPY_EMOJI_STRING} )  This is a capybara ...`, image: "main.jpg" },
  { text: "( 👋🏻 )  This capybara says hi :D", image: "hello.jpg" },
  { text: "( 💤 )  This capybara is sleeping ...", image: "sleep.jpg" },
  { text: "( 🎮 )  This capybara is gaming !", image: "game.jpg" },
  { text: "( 💧 )  This capybara is bathing ...", image: "bath.jpg" },
  { text: "( 😎 )  This capybara is cool !", image: "cool.jpg" },
  { text: "( 🏠 )  These capybaras are home :(", image: "home.jpg" },
  { text: "( 🍪 )  This capybara is eating ...", image: "eat.jpg" },
  { text: "( 👥 )  These capybaras are a gang !", image: "gang.jpg" },
  { text: "( 👨‍👩‍👧‍👦 )  These capybaras are family :)", image: "family.jpg" },
  { text: "( 👶🏻 )  These capybaras are babies :)", image: "baby.jpg" },
  { text: "( 📚 )  This capybara is reading ...", image: "read.jpg" },
  { text: "( 🤖 )  This capybara is AI :(", image: "ai.jpg" },
  { text: "( 😀 )  This capybara is happy !", image: "happy.jpg" },
  { text: "( 🔪 )  This capybara is edited :(", image: "edited.jpg" },
  { text: "( 🥽 )  These capybaras are swimming ...", image: "swim.jpg" },
  { text: "( 😎 )  These capybaras are chilling ...", image: "chill.jpg" },
  { text: "( 🚽 )  This capybara is on the toilet ?", image: "toilet.jpg" },
  { text: "( 🥚 )  This capybara is an egg ?", image: "egg.jpg" },
  { text: "( 🖤 )  This capybara is black ?", image: "black.jpg" },
  { text: "( 🤍 )  This capybara is white ?", image: "white.jpg" },
  { text: "( ❤️ )  This capybara is red ?", image: "red.jpg" },
  { text: "( 1️⃣ )  Bonus 1: photo by @mikroskato62 !!!", image: "bonus1.jpg" },
  { text: "( 2️⃣ )  Bonus 2: photo by @mikroskato62 !!!", image: "bonus2.jpg" },
  { text: "( 3️⃣ )  Bonus 3: photo by @mikroskato62 !!!", image: "bonus3.jpg" },
];

// Process error listeners for 24/7 uptime protection:
process.on("unhandledRejection", (reason) => { console.error("[!] Error: Unhandled Promise Rejection: ", reason, " ..."); });
process.on("uncaughtException", (error) => { console.error("[!] Error: Uncaught Exception: ", error, " ..."); });

// [#8] Discord gateway client & activity presence ...
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.Error, (error) => { console.error("[!] Error: Discord Gateway Error: ", error?.message || error, " ..."); });
client.on(Events.Warn, (warning) => { console.warn("[!] Warning: Discord Gateway Warning: ", warning, " ..."); });

// Once client is logged in and ready:
client.once(Events.ClientReady, () =>
{
  console.log("[!] Capybara: Logged in on Discord as: ", client.user.tag, " ...");

  // Synchronize live web pool size:
  capydex.syncWebCapybarasTotal().catch((err) => { console.warn("[!] Warning: Web capybara pool sync failed: ", err.message, " ..."); });

  // Rotating status presence list:
  const statuses = 
  [
    { name: "/capybaras /capyweb /capyinfo", type: ActivityType.Watching },
    { name: "/capybaras /capyweb /capyinfo", type: ActivityType.Listening },
    { name: "/capybaras /capyweb /capyinfo", type: ActivityType.Playing },
  ];
  let index = 0;
  if (client?.user) { client.user.setActivity(statuses[index].name, { type: statuses[index].type }); }

  // Rotate activity presence every hour:
  setInterval(() => {
    if (!client?.user) { return; }
    index = (index + 1) % statuses.length;
    client.user.setActivity(statuses[index].name, { type: statuses[index].type });
  }, 1000 * 60 * 60);
});

// [#9] Embed data generators & API fetchers ...
// Weighted random selection: 94% standard images (0-21) and 6% rare bonus photos (22-24):
function getRandomCapybaraIndex(totalCount = capybaraResponses.length)
{
  if (totalCount <= 3) { return Math.floor(Math.random() * totalCount); }
  const bonusCount = 3;
  const standardCount = totalCount - bonusCount;
  const roll = Math.random();

  if (roll < 0.06) { return standardCount + Math.floor(Math.random() * bonusCount); }
  return Math.floor(Math.random() * standardCount);
}

// Generate embed and file attachment for random local capybara photo:
function getCapybaraData(user, clientInstance = client)
{
  const randomIndex = getRandomCapybaraIndex(capybaraResponses.length);
  const randomResponse = capybaraResponses[randomIndex];
  const isUrl = randomResponse.image.startsWith("http");

  let finalImage = randomResponse.image;
  let filesToSend = [];

  if (!isUrl)
  {
    const attachment = new AttachmentBuilder(`./images/${randomResponse.image}`, { name: "capy.jpg" });
    filesToSend = [attachment];
    finalImage = "attachment://capy.jpg";
  }

  const timeString = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const avatarUrl = clientInstance?.user?.displayAvatarURL ? clientInstance.user.displayAvatarURL() : undefined;
  const userTag = user?.tag || user?.username || "User";

  if (user?.id)
  {
    capydex.recordLocalUnlock(user.id, randomIndex + 1, userTag, capybaraResponses.length, capydex.getWebTotal());
  }
  const userStats = capydex.getUserStats(user?.id, capybaraResponses.length, capydex.getWebTotal());
  const collectionText = `* Collection: Capys: ${String(userStats.localCount).padStart(2, "0")}/${capybaraResponses.length} • Web: ${userStats.webCount}/${userStats.webTotal}`;

  const embed = {
    author: { name: "Capybara Bot", icon_url: avatarUrl },
    description: randomResponse.text,
    image: { url: finalImage },
    footer: {
      text: `* Command: /capybaras • Image ${String(randomIndex + 1).padStart(2, "0")}/${capybaraResponses.length} ...\n${collectionText}\n* Requested by @${userTag} • Today at ${timeString} ...`,
    },
    color: getRandomColor(),
  };

  return { embeds: [embed], files: filesToSend };
}

// Fetch random live capybara photo from api.capy.lol with offline fallback:
async function getWebCapybaraData(user, clientInstance = client)
{
  const timeString = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, });

  let imageUrl = null;
  let photoIdentifier = "Web";
  let altText = null;
  let isFallback = false;
  let photoIndex = null;

  try
  {
    const response = await fetch("https://api.capy.lol/v1/capybara?json=true", { signal: AbortSignal.timeout(4000), });
    if (!response.ok) { throw new Error(`HTTP ${response.status}`); }
    const json = await response.json();
    if (json.success && json.data && json.data.url)
    {
      imageUrl = json.data.url.replace(/^http:\/\//i, "https://");
      photoIdentifier = json.data.index ? `#${json.data.index}` : "Online";
      if (typeof json.data.index === "number") { photoIndex = json.data.index; }
      if (json.data.alt && typeof json.data.alt === "string" && json.data.alt.trim())
      {
        const trimmedAlt = json.data.alt.trim();
        const normalized = trimmedAlt.replace(/\.+$/, "").toLowerCase();
        if (normalized !== "a capybara" && normalized !== "capybara")
        {
          let formattedAlt = trimmedAlt.charAt(0).toUpperCase() + trimmedAlt.slice(1);
          if (!formattedAlt.endsWith(".")) { formattedAlt += "..."; }
          altText = formattedAlt;
        }
      }
    }
    else
    {
      throw new Error("Invalid API response format.");
    }
  }
  catch (error)
  {
    console.warn("[!] Warning: Live capybara API request failed, falling back to local images: ", error.message, " ...");
    isFallback = true;
  }

  let finalImage = imageUrl;
  let filesToSend = [];
  let descriptionText = altText ? `( 🌐 )  ${altText}` : "( 🌐 )  This image was found on the web ...";

  if (!isFallback && photoIndex && user?.id)
  {
    capydex.recordWebUnlock(user.id, photoIndex, user?.tag || user?.username, capybaraResponses.length);
  }

  const userStats = capydex.getUserStats(user?.id, capybaraResponses.length, capydex.getWebTotal());
  const collectionText = `* Collection: Capys: ${String(userStats.localCount).padStart(2, "0")}/${capybaraResponses.length} • Web: ${userStats.webCount}/${userStats.webTotal}`;
  const userTag = user?.tag || user?.username || "User";
  let footerText = `* CMD: /capyweb • API: api.capy.lol • Web Photo ${photoIdentifier} ...\n${collectionText}\n* Requested by @${userTag} • Today at ${timeString} ...`;

  // Fallback to local image when API is offline:
  if (isFallback || !imageUrl)
  {
    const fallbackImage = fs.existsSync("./images/hello.png") ? "hello.png" : "hello.jpg";
    const attachment = new AttachmentBuilder(`./images/${fallbackImage}`, { name: "fallback.jpg" });
    filesToSend = [attachment];
    finalImage = "attachment://fallback.jpg";
    descriptionText = "( 👋🏻 )  This capybara says hi :D (Offline Fallback)";
    footerText = `* CMD: /capyweb • Offline Fallback Image ...\n${collectionText}\n* Requested by @${userTag} • Today at ${timeString} ...`;
  }

  const avatarUrl = clientInstance?.user?.displayAvatarURL ? clientInstance.user.displayAvatarURL() : undefined;

  const embed = 
  {
    author: { name: "Capybara Bot", icon_url: avatarUrl },
    description: descriptionText,
    image: { url: finalImage },
    footer: { text: footerText },
    color: getRandomColor(),
  };

  return { embeds: [embed], files: filesToSend };
}

// Generate bot guide and documentation embed (/capyinfo):
function getCapyInfoData(user, clientInstance = client)
{
  if (user?.id) { capydex.updateUserInfo(user.id, user?.tag || user?.username); }

  const timeString = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, });

  const bannerPath = "./assets/logo.png";
  let filesToSend = [];
  let imageUrl = undefined;

  if (fs.existsSync(bannerPath))
  {
    const attachment = new AttachmentBuilder(bannerPath, { name: "logo.png" });
    filesToSend = [attachment];
    imageUrl = "attachment://logo.png";
  }

  const avatarUrl = clientInstance?.user?.displayAvatarURL ? clientInstance.user.displayAvatarURL() : undefined;
  const botTag = clientInstance?.user?.tag || "CapybaraBot#0000";
  const botId = clientInstance?.user?.id || process.env.CLIENT_ID || "";

  const embed = 
  {
    author: 
    {
      name: "Capybara Bot",
      icon_url: avatarUrl,
    },
    description: `${CAPY_EMOJI_STRING} ​ **Information & Guide About Capybara Discord Bot ...**\n> *Thank you for using this app - created by capybara lovers for capybara lovers!*`,
    fields: 
    [
      {
        name: "⁉️ ​ What is this bot?",
        value: 
        [
          "▸ **Capybara Discord Bot** is your server’s dedicated chill companion, bringing wholesome vibes, delightful capybara photos, and relaxing energy to your server!",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: "✨ ​ What can this bot do?",
        value: 
        [
          "▸ **Capybara Discord Bot** currently has the following commands available:",
          "▸ **`/capybaras`** - Delivers hand-curated capybara photos with descriptions.",
          "▸ **`/capyweb`** - Fetches infinite web photos in real-time from across the internet.",
          "▸ **`/capyinfo`** - Displays this styled guide you are currently reading!",
          "▸ You can learn how to use each one below...",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: "⚙️ ​ How to use this bot?",
        value: 
        [
          "▸ Here are the steps on how to use **Capybara Discord Bot**:",
          "▸ Choose a command to run from the above list.",
          "▸ Type that command in any server channel where the bot has access.",
          "▸ The bot will send a delightful embed message instantly.",
          "▸ Check and enjoy the attached photo with its unique description!",
          "▸ Interact with that photo by clicking any of the buttons below:",
          "▸ Click the blue (left) button to get a new random capybara photo.",
          "▸ Click the green (middle-left) button to view your personal capydex collection.",
          "▸ Click the grey (middle) button to add a random reaction emoji.",
          "▸ Click the green (middle-right) button to view the server leaderboard.",
          "▸ Click the red (right) button to exit and dismiss the message.",
          "▸ Note: please avoid spamming as a built-in 1-second cooldown exists!",
          "▸ That's all - relax, have fun, and enjoy the capybaras :)",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: "✅ ​ Is the bot completed?",
        value: 
        [
          "▸ **Capybara Discord Bot** is ready for use, but more things coming soon:",
          "▸ **`/capyfacts`** - On-demand educational trivia and fascinating capybara facts.",
          "▸ **`/capyquiz`** - Interactive trivia questions to test your capybara knowledge.",
          "▸ **`/capyrate`** - Fun chill-o-meter personality scanner (0–100%).",
          "▸ **`/capyother`** - Exciting new features suggested by you and our community!",
          "▸ **`/capygame`** - Engaging mini-games and interactive Discord activities.",
          "▸ **Want to help?** Join our Discord Server by checking the information below...",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: "ℹ️ ​ Advanced info about the bot?",
        value: 
        [
          "▸ **Name: Capybara Discord Bot**",
          `▸ **Tag:** [@${botTag}](https://discord.com/oauth2/authorize?client_id=${botId})`,
          "▸ **Server:** Created at [Weboardies™](https://discord.gg/d8pawxdSqG) - invitable anywhere!",
          "▸ **Developer:** Built for [Capybaras](https://en.wikipedia.org/wiki/Capybara) by [@mikroskato62](https://www.weboardies.com/mikroskato62).",
          "▸ **Architecture:** Modern [Node.js](https://nodejs.org) & [Discord.js](https://discord.js.org).",
          "▸ **APIs & Data:** Powered by [api.capy.lol](https://api.capy.lol/) & [unicode-emoji-json](https://www.npmjs.com/package/unicode-emoji-json).",
          "▸ **Hosting:** Online 24/7 with [Wispbyte](https://wispbyte.com/).",
          "▸ **License:** Open-source under the [ISC License](https://opensource.org/license/isc).",
          "▸ **Source Code:** View repository on [GitHub](https://github.com/mikroskato62/capy-discord-bot).",
          "▸ **Mission:** Spread smiles & wholesome energy to everyone worldwide ...",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: `|| ${CAPY_EMOJI_STRING} ||`,
        value: "\u200B",
        inline: true,
      },
    ],
    image: imageUrl ? { url: imageUrl } : undefined,
    footer: 
    {
      text: `* Command: /capyinfo • Capybara Bot v1.0.0 ...\n* Requested by @${user.tag} • Today at ${timeString} ...`,
    },
    color: getRandomColor(),
  };

  return { embeds: [embed], files: filesToSend };
}

// [#10] Emoji reactions & anti-spam cooldowns ...
// Filter out flag emojis from reaction selection pool:
const EXCLUDED_EMOJI_GROUPS = new Set(["Flags"]);

const allUnicodeEmojis 
  = Object.entries(emojiData)
  .filter(([_, info]) => !EXCLUDED_EMOJI_GROUPS.has(info.group))
  .map(([emoji]) => emoji);

// Select random reaction from Unicode and custom guild emojis:
function getRandomReactionEmoji(clientInstance, excludedSet = new Set())
{
  const customEmojis = clientInstance?.emojis?.cache ? Array.from(clientInstance.emojis.cache.filter((e) => e.available).values()).map((e) => e.id) : [];
  const emojiPool = customEmojis.length > 0 ? [...allUnicodeEmojis, ...customEmojis] : allUnicodeEmojis;
  const availablePool = emojiPool.filter((e) => !excludedSet.has(e));
  const poolToUse = availablePool.length > 0 ? availablePool : emojiPool;
  const randomIndex = Math.floor(Math.random() * poolToUse.length);
  return poolToUse[randomIndex];
}

// Automatically react with default capybara emoji on command response:
async function addInitialReaction(interaction, response)
{
  try
  {
    const targetMessage = response?.resource?.message || (await interaction.fetchReply().catch(() => null));
    if (!targetMessage) return;

    if (CUSTOM_EMOJI_ID)
    {
      await targetMessage.react(CUSTOM_EMOJI_ID).catch(async () => { await targetMessage.react(DEFAULT_CAPY_EMOJI).catch(() => null); });
    }
    else
    {
      await targetMessage.react(DEFAULT_CAPY_EMOJI).catch(() => null);
    }
  }
  catch (error) { console.warn("[!] Warning: Could not add default reaction: ", error.message, " ..."); }
}

// Cooldown anti-spam protection (1 second per user):
const COOLDOWN_DURATION = 1000;
const cooldowns = new Map();

// Check if a user currently has an active cooldown:
function getCooldownRemaining(userId)
{
  if (!cooldowns.has(userId)) { return 0; }
  const lastUsed = cooldowns.get(userId);
  const remaining = COOLDOWN_DURATION - (Date.now() - lastUsed);
  if (remaining <= 0)
  {
    cooldowns.delete(userId);
    return 0;
  }
  return remaining;
}

// Mark user timestamp for anti-spam cooldown:
function setCooldown(userId) { cooldowns.set(userId, Date.now()); }

// Periodic cooldown cleanup to prevent memory leaks:
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamp] of cooldowns.entries()) { if (now - timestamp > COOLDOWN_DURATION * 5) { cooldowns.delete(userId); } }
}, 5 * 60 * 1000).unref?.();

// [#11] Interactive button action row builders ...
const buttonReactEmoji = CUSTOM_EMOJI_ID || DEFAULT_CAPY_EMOJI;

// Button row for local capybara command responses:
function createCapybaraButtonRow(userId = "")
{
  const suffix = userId ? `:${userId}` : "";
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`capybara_next${suffix}`)
      .setLabel("👍🏻")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`capydex_view${suffix}`)
      .setEmoji("📖")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`capybara_react${suffix}`)
      .setEmoji(buttonReactEmoji)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`capyleaderboard_view${suffix}`)
      .setEmoji("🏆")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`capybara_leave${suffix}`)
      .setLabel("👎🏻")
      .setStyle(ButtonStyle.Danger)
  );
}

// Button row for web capybara command responses:
function createCapywebButtonRow(userId = "")
{
  const suffix = userId ? `:${userId}` : "";
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`capyweb_next${suffix}`)
      .setLabel("👍🏻")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`capydex_view${suffix}`)
      .setEmoji("📖")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`capybara_react${suffix}`)
      .setEmoji(buttonReactEmoji)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`capyleaderboard_view${suffix}`)
      .setEmoji("🏆")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`capybara_leave${suffix}`)
      .setLabel("👎🏻")
      .setStyle(ButtonStyle.Danger)
  );
}

// Button row for bot info command responses:
function createCapyinfoButtonRow(userId = "")
{
  const suffix = userId ? `:${userId}` : "";
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`capyinfo_links${suffix}`)
      .setLabel("👍🏻")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`capydex_view${suffix}`)
      .setEmoji("📖")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`capybara_react${suffix}`)
      .setEmoji(buttonReactEmoji)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`capyleaderboard_view${suffix}`)
      .setEmoji("🏆")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`capybara_leave${suffix}`)
      .setLabel("👎🏻")
      .setStyle(ButtonStyle.Danger)
  );
}

// Extract original invoker user ID from button custom ID or interaction metadata:
function getActionOwnerId(interaction)
{
  if (interaction.customId && interaction.customId.includes(":"))
  {
    const parts = interaction.customId.split(":");
    if (parts[1]) { return parts[1]; }
  }
  if (interaction.message?.interactionMetadata?.user?.id)
  {
    return interaction.message.interactionMetadata.user.id;
  }
  if (interaction.message?.interaction?.user?.id)
  {
    return interaction.message.interaction.user.id;
  }
  return null;
}

// [#12] Discord interaction create event dispatcher ...
client.on(Events.InteractionCreate, async (interaction) =>
{
  try
  {
    // Handle slash command executions:
    if (interaction.isChatInputCommand())
    {
      // Slash command: /capybaras ...
      if (interaction.commandName === "capybaras")
      {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0)
        {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setCooldown(interaction.user.id);

        const data = getCapybaraData(interaction.user);

        const response = await interaction.reply({
          embeds: data.embeds,
          files: data.files,
          components: [createCapybaraButtonRow(interaction.user.id)],
          withResponse: true,
        });

        await addInitialReaction(interaction, response);
      }
      // Slash command: /capyweb ...
      else if (interaction.commandName === "capyweb")
      {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0)
        {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setCooldown(interaction.user.id);

        await interaction.deferReply();

        const data = await getWebCapybaraData(interaction.user);

        const response = await interaction.editReply({
          embeds: data.embeds,
          files: data.files,
          components: [createCapywebButtonRow(interaction.user.id)],
        });

        await addInitialReaction(interaction, response);
      }
      // Slash command: /capyinfo ...
      else if (interaction.commandName === "capyinfo")
      {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0)
        {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setCooldown(interaction.user.id);

        const data = getCapyInfoData(interaction.user);

        const response = await interaction.reply({
          embeds: data.embeds,
          files: data.files,
          components: [createCapyinfoButtonRow(interaction.user.id)],
          withResponse: true,
        });

        await addInitialReaction(interaction, response);
      }
    }

    // Handle interactive button clicks:
    else if (interaction.isButton())
    {
      const [actionType] = interaction.customId.split(":");

      // Action: view personal capydex collection:
      if (actionType === "capydex_view")
      {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0)
        {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setCooldown(interaction.user.id);

        if (interaction.user?.id)
        {
          capydex.updateUserInfo(interaction.user.id, interaction.user.tag || interaction.user.username);
        }

        const capydexData = capydex.buildCapydexEmbed(
          interaction.user,
          client,
          capybaraResponses.length,
          capydex.getWebTotal(),
          getRandomColor()
        );

        return interaction.reply({
          embeds: capydexData.embeds,
          flags: MessageFlags.Ephemeral,
        });
      }

      // Author-only button guard (prevents other users from hijacking buttons):
      const ownerId = getActionOwnerId(interaction);
      if (ownerId && interaction.user.id !== ownerId)
      {
        return interaction.reply({
          content: `- **These capybaras are chillin' with <@${ownerId}> right now!** \n> || Run \`/capybaras\` or \`/capyweb\` to summon your own capybara companion :) ||`,
          flags: MessageFlags.Ephemeral,
        });
      }

      // Action: next local capybara photo:
      if (actionType === "capybara_next")
      {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0)
        {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setCooldown(interaction.user.id);

        const data = getCapybaraData(interaction.user);

        await interaction.update({
          embeds: data.embeds,
          files: data.files,
          components: [createCapybaraButtonRow(interaction.user.id)],
        });
      }

      // Action: next web capybara photo:
      else if (actionType === "capyweb_next")
      {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0)
        {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setCooldown(interaction.user.id);

        await interaction.deferUpdate();

        const data = await getWebCapybaraData(interaction.user);

        await interaction.editReply({
          embeds: data.embeds,
          files: data.files,
          components: [createCapywebButtonRow(interaction.user.id)],
        });
      }

      // Action: show project and creator links:
      else if (actionType === "capyinfo_links")
      {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0)
        {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setCooldown(interaction.user.id);

        return interaction.reply({
          content: `- **Capybara Discord Bot - Official Links:** \n> • **Discord Server:** [Weboardies™ (1052989877781803070)](https://discord.gg/d8pawxdSqG)\n> • **GitHub Repo:** [mikroskato62/capy-discord-bot](https://github.com/mikroskato62/capy-discord-bot)\n> • **Creator Website:** [weboardies.com/mikroskato62](https://www.weboardies.com/mikroskato62)`,
          flags: MessageFlags.Ephemeral,
        });
      }

      // Action: add random reaction on button click (FIFO rotation at 20 reactions):
      else if (actionType === "capybara_react")
      {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0)
        {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setCooldown(interaction.user.id);

        await interaction.deferUpdate();

        try
        {
          const message = await interaction.message.fetch().catch(() => interaction.message);

          const existingEmojiKeys = new Set( message.reactions.cache.map((r) => r.emoji.id || r.emoji.name) );

          // Remove oldest reaction when reaching Discord's 20-reaction maximum:
          if (message.reactions.cache.size >= 20)
          {
            const oldestNonCustom = message.reactions.cache.find( (r) => (CUSTOM_EMOJI_ID ? r.emoji.id !== CUSTOM_EMOJI_ID : r.emoji.name !== DEFAULT_CAPY_EMOJI) );
            if (oldestNonCustom)
            {
              await oldestNonCustom.remove().catch(async () => { await oldestNonCustom.users.remove(client.user.id).catch(() => null); });
              existingEmojiKeys.delete(oldestNonCustom.emoji.id || oldestNonCustom.emoji.name);
            }
          }

          const emoji = getRandomReactionEmoji(client, existingEmojiKeys);
          await message.react(emoji);
        }
        catch (error)
        {
          if (error.code === 30010 || error.message?.includes("Maximum number of reactions"))
          {
            try
            {
              const message = await interaction.message.fetch().catch(() => interaction.message);
              const oldestNonCustom = message.reactions.cache.find(
                (r) => (CUSTOM_EMOJI_ID ? r.emoji.id !== CUSTOM_EMOJI_ID : r.emoji.name !== DEFAULT_CAPY_EMOJI)
              );
              if (oldestNonCustom)
              {
                await oldestNonCustom.remove().catch(async () => { await oldestNonCustom.users.remove(client.user.id).catch(() => null); });
                const emoji = getRandomReactionEmoji(client);
                await message.react(emoji).catch(() => null);
              }
            }
            catch (retryErr) { console.warn("[!] Warning: Could not cycle reaction: ", retryErr.message, " ..."); }
          }
          else
          {
            console.warn("[!] Warning: Could not add reaction on click: ", error.message, " ...");
          }
        }
      }

      // Action: view leaderboard:
      else if (actionType === "capyleaderboard_view")
      {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0)
        {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setCooldown(interaction.user.id);

        if (interaction.user?.id)
        { capydex.updateUserInfo(interaction.user.id, interaction.user.tag || interaction.user.username); }

        // Fetch guild members for server ranking:
        let guildMemberIds = null;
        if (interaction.guild)
        {
          if (interaction.guild.members?.cache && interaction.guild.members.cache.size > 1)
          {
            guildMemberIds = new Set(interaction.guild.members.cache.keys());
          }
          else
          {
            try
            {
              const members = await interaction.guild.members.fetch({ time: 2000 }).catch(() => null);
              if (members && members.size > 0) { guildMemberIds = new Set(members.keys()); }
            }
            catch
            {
              guildMemberIds = interaction.guild.members?.cache ? new Set(interaction.guild.members.cache.keys()) : null;
            }
          }
        }

        const leaderboardData = capydex.buildLeaderboardEmbed({
          user: interaction.user,
          guild: interaction.guild,
          clientInstance: client,
          guildMemberIds,
          limit: 5,
          totalLocal: capybaraResponses.length,
          totalWeb: capydex.getWebTotal(),
          color: getRandomColor(),
        });

        return interaction.reply({
          embeds: leaderboardData.embeds,
          flags: MessageFlags.Ephemeral,
        });
      }

      // Action: dismiss and leave message:
      else if (actionType === "capybara_leave")
      {
        if (interaction.message?.reactions)
        {
          await interaction.message.reactions.removeAll().catch((error) =>
          { console.warn("[!] Warning: Could not clear reactions on leave: ", error.message, " ..."); });
        }
        await interaction.update({
          content: `- **So, you did not like that capybara @${interaction.user.tag} ?** \n> || **You made __capybaras__ leave angry - but they still __love you__ :)** ||`,
          embeds: [],
          components: [],
          files: [],
        }).catch((err) => {
          console.warn("[!] Warning: Could not update message on leave: ", err.message, " ...");
        });
      }
    }
  }
  catch (error)
  {
    console.error("[!] Error: Interaction Error: ", error, " ...");
    try
    {
      const errorPayload = 
      {
        content: "- **Oh no! Capybaras got confused... Please try again in a moment!** \n> || An unexpected error occurred while processing the requested action. ||",
        flags: MessageFlags.Ephemeral,
      };
      if (interaction.isRepliable())
      {
        if (interaction.deferred || interaction.replied) { await interaction.followUp(errorPayload).catch(() => null); }
        else { await interaction.reply(errorPayload).catch(() => null); }
      }
    }
    catch (fallbackErr) { console.warn("[!] Warning: Could not send interaction error notification: ", fallbackErr.message, " ..."); }
  }
});

// [#13] Graceful process shutdown & exports ...
// Disconnect from Discord gateway cleanly:
const handleShutdown = (signal) =>
{
  console.log("[!] Capybara: Received ", signal, " - shutting down gracefully ...");
  try { client.destroy(); }
  catch (err) { console.warn("[!] Warning: Could not destroy client during shutdown: ", err.message, " ..."); }
  process.exit(0);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// Login to Discord (only when running standalone, not when imported by tests):
if (require.main === module)
{
  if (process.env.TOKEN)
  {
    client.login(process.env.TOKEN).catch((err) => { console.error("[!] Error: Discord Login Error: ", err.message, " ..."); });
  }
  else
  {
    console.error("[!] Error: Discord bot TOKEN is missing in environment variables: ", ".env", " ...");
  }
}

module.exports = {
  // Discord Client & Handlers:
  client,
  capybaraResponses,
  getRandomColor,
  getRandomCapybaraIndex,
  getCapybaraData,
  getWebCapybaraData,
  getCapyInfoData,
  getRandomReactionEmoji,
  getCooldownRemaining,
  setCooldown,
  createCapybaraButtonRow,
  createCapywebButtonRow,
  createCapyinfoButtonRow,
  getActionOwnerId,

  // Capydex & Leaderboard Subsystem:
  capydex,
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

// The end ...
// @mikroskato62 - Capybara Discord Bot - All-In-One Merged Core Logic.
//   