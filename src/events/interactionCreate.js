// @mikroskato62 - Capybara Discord Bot - Interaction Create Event Dispatcher.
// Routes incoming slash commands and button component interactions with error recovery.
// Import: const interactionCreateEvent = require("./events/interactionCreate");

// [#1] Core dependencies & setups ...
const { Events, MessageFlags } = require("discord.js");
const { commandsMap } = require("../commands");
const { handleButtonInteraction } = require("../interactions/buttons");

// [#2] Interaction create event dispatcher ...
async function handleInteraction(interaction, client)
{
  try
  {
    // Handle slash command executions:
    if (interaction.isChatInputCommand())
    {
      const command = commandsMap.get(interaction.commandName);
      if (command)
      {
        await command.execute(interaction, client);
      }
    }

    // Handle interactive button clicks:
    else if (interaction.isButton())
    {
      await handleButtonInteraction(interaction, client);
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
}

module.exports = {
  name: Events.InteractionCreate,
  once: false,
  execute: handleInteraction,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Interaction Create Event Dispatcher.
//   
