// @mikroskato62 - Capybara Discord Bot - Slash Command Deployment Script.
// Registers global application slash commands to the Discord REST API.
// Run: npm run deploy (or node src/deploy-commands.js).

// [#1] Core dependencies & setups ...
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const { REST, Routes } = require("discord.js");
const { commandsArray } = require("./commands");

// [#2] Slash command schema aggregation ...
const commands = commandsArray;

// [#3] Command registration execution handler ...
async function deployCommands()
{
  const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

  if (!TOKEN || !CLIENT_ID)
  {
    console.error("[!] Error: Missing TOKEN or CLIENT_ID in environment variables: ", ".env", " ...");
    console.error("[!] Error: Slash commands cannot be deployed without these credentials: ", "TOKEN/CLIENT_ID", " ...");
    process.exit(1);
  }

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try
  {
    console.log("[!] Capybara: Started refreshing ", commands.length, " application commands ...");

    // Optionally clear guild-specific commands to prevent duplicate entries if GUILD_ID is provided:
    if (GUILD_ID)
    {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: [] }
      ).catch((err) =>
      {
        console.warn("[!] Warning: Could not clear legacy guild commands: ", err.message, " ...");
      });
      console.log("[!] Capybara: Cleared legacy guild-specific commands for guild: ", GUILD_ID, " ...");
    }

    // Deploy global application commands:
    const data = await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("[!] Capybara: Successfully registered ", data.length, " global application commands ...");
    console.log("[!] Capybara: Commands are now live across all servers where the bot is invited ...");
    return data;
  }
  catch (error)
  {
    console.error("[!] Error: Discord Command Deployment Error: ", error.message || error, " ...");
    process.exit(1);
  }
}

// Execute deployment if running directly:
if (require.main === module)
{
  deployCommands();
}

module.exports = {
  commands,
  deployCommands,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Slash Command Deployment Script.
//   
