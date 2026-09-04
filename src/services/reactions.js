// @mikroskato62 - Capybara Discord Bot - Emoji Reactions, Cooldowns & Ownership Security.
// Manages Unicode emoji database filtering, random reactions, anti-spam cooldowns, and action ownership.
// Import: const { getRandomReactionEmoji, ... } = require("./services/reactions");

// [#1] Core dependencies & setups ...
const emojiData = require("unicode-emoji-json");
const {
  CUSTOM_EMOJI_ID,
  DEFAULT_CAPY_EMOJI,
  COOLDOWN_DURATION,
} = require("../config");

// [#2] Emoji reactions & anti-spam cooldowns ...
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

// [#3] User action ownership & permission resolution ...
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

module.exports = {
  allUnicodeEmojis,
  getRandomReactionEmoji,
  addInitialReaction,
  getCooldownRemaining,
  setCooldown,
  getActionOwnerId,
  cooldowns,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Emoji Reactions, Cooldowns & Ownership Security.
//   
