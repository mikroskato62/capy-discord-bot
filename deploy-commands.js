// [!] Capybara Discord Bot — Slash Command Deployment Script
// Run this standalone script with: npm run deploy (or node deploy-commands.js)
// You only need to run this ONCE, or whenever you add, remove, or modify slash command definitions.

require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("capybaras")
    .setDescription("[ Command: view a random capybara image! ]"),
  new SlashCommandBuilder()
    .setName("capyweb")
    .setDescription("[ Command: view a random capybara image from the web! ]"),
  new SlashCommandBuilder()
    .setName("capyinfo")
    .setDescription("[ Command: view bot info, features & coming soon roadmap! ]"),
].map((cmd) => cmd.toJSON());

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!TOKEN || !CLIENT_ID) {
  console.error("[!] Error: Missing TOKEN or CLIENT_ID in your environment variables (.env).");
  console.error("[!] Slash commands cannot be deployed without these credentials.");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log(`[*] Started refreshing ${commands.length} application (/) commands...`);

    // Optionally clear guild-specific commands to prevent duplicate entries if GUILD_ID is provided
    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: [] }
      ).catch((err) => {
        console.warn("[!] Warning: Could not clear legacy guild commands:", err.message);
      });
      console.log(`[+] Cleared legacy guild-specific commands for guild: ${GUILD_ID}`);
    }

    // Deploy global application commands
    const data = await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log(`[+] Successfully registered ${data.length} global application (/) commands! 🎉`);
    console.log("[+] Commands are now live across all servers where the bot is invited.");
  } catch (error) {
    console.error("[!] Error deploying slash commands:", error.message || error);
    process.exit(1);
  }
})();
