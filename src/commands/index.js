// @mikroskato62 - Capybara Discord Bot - Command Registry & Module Loader.
// Loads, registers, and maps all slash command definitions and their execution handlers.
// Import: const { commandsMap, commandsArray } = require("./commands");

// [#1] Core dependencies & command imports ...
const { Collection } = require("discord.js");
const capybaras = require("./capybaras");
const capyweb = require("./capyweb");
const capyinfo = require("./capyinfo");

// [#2] Command registry mapping & JSON definitions ...
const commandsList = [capybaras, capyweb, capyinfo];
const commandsMap = new Collection();
const commandsArray = [];

for (const cmd of commandsList)
{
  if (cmd?.data?.name)
  {
    commandsMap.set(cmd.data.name, cmd);
    commandsArray.push(cmd.data.toJSON());
  }
}

module.exports = {
  commandsMap,
  commandsArray,
  commandsList,
  capybaras,
  capyweb,
  capyinfo,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Command Registry & Module Loader.
//   
