// @mikroskato62 - Capybara Discord Bot - Main Application Entry Point & Orchestrator.
// Initializes Discord client gateway, lifecycle events, process handlers, and exports.
// Run: node src/index.js.

// Check if running as main process:
if (require.main === module) { console.log("[!] Capybara: Hello World!"); }

// [#1] Core dependencies & environment setups ...
const {
  Client,
  GatewayIntentBits,
} = require("discord.js");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

// Configuration & Subsystems imports:
const config = require("./config");
const capydex = require("./services/capydex");
const {
  capybaraResponses,
  getRandomColor,
  getRandomCapybaraIndex,
  getCapybaraData,
  getWebCapybaraData,
  getCapyInfoData,
} = require("./services/capybaraData");
const {
  getRandomReactionEmoji,
  getCooldownRemaining,
  setCooldown,
  getActionOwnerId,
} = require("./services/reactions");
const {
  createCapybaraButtonRow,
  createCapywebButtonRow,
  createCapyinfoButtonRow,
} = require("./components/buttons");
const { registerEvents } = require("./events");
const { commandsMap, commandsArray } = require("./commands");

// [#2] Process error listeners for 24/7 uptime protection ...
process.on("unhandledRejection", (reason) => { console.error("[!] Error: Unhandled Promise Rejection: ", reason, " ..."); });
process.on("uncaughtException", (error) => { console.error("[!] Error: Uncaught Exception: ", error, " ..."); });

// [#3] Discord gateway client initialization ...
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Register all gateway event listeners:
registerEvents(client);

// [#4] Graceful process shutdown handlers ...
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

// [#5] Login to Discord gateway ...
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

// [#6] Module exports & backwards-compatibility interface ...
module.exports = {
  // Discord Client & Handlers:
  client,
  config,
  commandsMap,
  commandsArray,
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
  DEFAULT_WEB_TOTAL: capydex.DEFAULT_WEB_TOTAL,
  initStorage: capydex.initStorage,
  saveStorage: capydex.saveStorage,
  syncWebCapybarasTotal: capydex.syncWebCapybarasTotal,
  getWebTotal: capydex.getWebTotal,
  setWebTotal: capydex.setWebTotal,
  bumpWebTotalIfHigher: capydex.bumpWebTotalIfHigher,
  recordLocalUnlock: capydex.recordLocalUnlock,
  recordWebUnlock: capydex.recordWebUnlock,
  updateUserInfo: capydex.updateUserInfo,
  getUserStats: capydex.getUserStats,
  getLeaderboard: capydex.getLeaderboard,
  createProgressBar: capydex.createProgressBar,
  buildCapydexEmbed: capydex.buildCapydexEmbed,
  buildLeaderboardEmbed: capydex.buildLeaderboardEmbed,
  collections: capydex.collections,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Main Application Entry Point & Orchestrator.
//   