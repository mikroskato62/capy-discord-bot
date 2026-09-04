// @mikroskato62 - Capybara Discord Bot - /capybaras Slash Command.
// Delivers hand-curated local capybara pictures with unique descriptions and interactive buttons.
// Run: node src/commands/capybaras.js (or imported via command handler).

// [#1] Core dependencies & setups ...
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { getCapybaraData } = require("../services/capybaraData");
const { createCapybaraButtonRow } = require("../components/buttons");
const { getCooldownRemaining, setCooldown, addInitialReaction } = require("../services/reactions");

// [#2] Command schema definition ...
const data = new SlashCommandBuilder()
  .setName("capybaras")
  .setDescription("[ Command: view a random capybara image! ]");

// [#3] Command execution handler ...
async function execute(interaction, client = null)
{
  // Slash command: /capybaras ...
  const remainingMs = getCooldownRemaining(interaction.user.id);
  if (remainingMs > 0)
  {
    return interaction.reply({
      content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
      flags: MessageFlags.Ephemeral,
    });
  }
  setCooldown(interaction.user.id);

  const embedData = getCapybaraData(interaction.user, client);

  const response = await interaction.reply({
    embeds: embedData.embeds,
    files: embedData.files,
    components: [createCapybaraButtonRow(interaction.user.id)],
    withResponse: true,
  });

  await addInitialReaction(interaction, response);
}

module.exports = {
  data,
  execute,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - /capybaras Slash Command.
//   
