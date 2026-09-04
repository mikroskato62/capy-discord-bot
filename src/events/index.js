// @mikroskato62 - Capybara Discord Bot - Gateway Event Register & Lifecycle Engine.
// Attaches all Discord gateway listeners, error loggers, and interaction dispatchers to the client.
// Import: const { registerEvents } = require("./events");

// [#1] Core dependencies & setups ...
const { Events } = require("discord.js");
const readyEvent = require("./ready");
const interactionCreateEvent = require("./interactionCreate");

// [#2] Event registration engine ...
function registerEvents(client)
{
  client.on(Events.Error, (error) =>
  { console.error("[!] Error: Discord Gateway Error: ", error?.message || error, " ..."); });

  client.on(Events.Warn, (warning) =>
  { console.warn("[!] Warning: Discord Gateway Warning: ", warning, " ..."); });

  client.once(readyEvent.name, () => readyEvent.execute(client));

  client.on(interactionCreateEvent.name, (interaction) => interactionCreateEvent.execute(interaction, client));
}

module.exports = {
  registerEvents,
  readyEvent,
  interactionCreateEvent,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Gateway Event Register & Lifecycle Engine.
//   
