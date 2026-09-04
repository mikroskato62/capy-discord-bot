// @mikroskato62 - Capybara Discord Bot - /capyinfo Slash Command.
// Displays complete bot guide, command instructions, upcoming features roadmap, and advanced credits.
// Run: node src/commands/capyinfo.js (or imported via command handler).

// [#1] Core dependencies & setups ...
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { getCapyInfoData } = require("../services/capybaraData");
const { createCapyinfoButtonRow } = require("../components/buttons");
const { getCooldownRemaining, setCooldown, addInitialReaction } = require("../services/reactions");

// [#2] Command schema definition ...
const data = new SlashCommandBuilder()
  .setName("capyinfo")
  .setDescription("[ Command: view bot info, features & coming soon roadmap! ]");

// [#3] Command execution handler ...
async function execute(interaction, client = null)
{
  // Slash command: /capyinfo ...
  const remainingMs = getCooldownRemaining(interaction.user.id);
  if (remainingMs > 0)
  {
    return interaction.reply({
      content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
      flags: MessageFlags.Ephemeral,
    });
  }
  setCooldown(interaction.user.id);

  const embedData = getCapyInfoData(interaction.user, client);

  const response = await interaction.reply({
    embeds: embedData.embeds,
    files: embedData.files,
    components: [createCapyinfoButtonRow(interaction.user.id)],
    withResponse: true,
  });

  await addInitialReaction(interaction, response);
}

module.exports = {
  data,
  execute,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - /capyinfo Slash Command.
//   
