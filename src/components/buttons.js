// @mikroskato62 - Capybara Discord Bot - Interactive Button Components.
// Action row builders providing interactive navigation, collection views, and reactions.
// Import: const { createCapybaraButtonRow, ... } = require("./components/buttons");

// [#1] Core dependencies & setups ...
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { CUSTOM_EMOJI_ID, DEFAULT_CAPY_EMOJI } = require("../config");

// Configurable button emoji for random reaction:
const buttonReactEmoji = CUSTOM_EMOJI_ID || DEFAULT_CAPY_EMOJI;

// [#2] Interactive button action row builders ...
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

module.exports = {
  buttonReactEmoji,
  createCapybaraButtonRow,
  createCapywebButtonRow,
  createCapyinfoButtonRow,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Interactive Button Components.
//   
