// @mikroskato62 - Capybara Discord Bot - /capyweb Slash Command.
// Fetches live random capybara images from api.capy.lol with offline fallback resilience.
// Run: node src/commands/capyweb.js (or imported via command handler).

// [#1] Core dependencies & setups ...
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { getWebCapybaraData } = require("../services/capybaraData");
const { createCapywebButtonRow } = require("../components/buttons");
const { getCooldownRemaining, setCooldown, addInitialReaction } = require("../services/reactions");

// [#2] Command schema definition ...
const data = new SlashCommandBuilder()
  .setName("capyweb")
  .setDescription("[ Command: view a random capybara image from the web! ]");

// [#3] Command execution handler ...
async function execute(interaction, client = null)
{
  // Slash command: /capyweb ...
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

  const embedData = await getWebCapybaraData(interaction.user, client);

  const response = await interaction.editReply({
    embeds: embedData.embeds,
    files: embedData.files,
    components: [createCapywebButtonRow(interaction.user.id)],
  });

  await addInitialReaction(interaction, response);
}

module.exports = {
  data,
  execute,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - /capyweb Slash Command.
//   
