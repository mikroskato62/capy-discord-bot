// @mikroskato62 - Capybara Discord Bot - Button Interaction Handlers.
// Processes interactive button clicks, author security guards, and reaction management.
// Import: const { handleButtonInteraction } = require("./interactions/buttons");

// [#1] Core dependencies & setups ...
const { MessageFlags } = require("discord.js");
const { CUSTOM_EMOJI_ID, DEFAULT_CAPY_EMOJI } = require("../config");
const capydex = require("../services/capydex");
const {
  capybaraResponses,
  getRandomColor,
  getCapybaraData,
  getWebCapybaraData,
} = require("../services/capybaraData");
const {
  createCapybaraButtonRow,
  createCapywebButtonRow,
} = require("../components/buttons");
const {
  getCooldownRemaining,
  setCooldown,
  getActionOwnerId,
  getRandomReactionEmoji,
} = require("../services/reactions");

// [#2] Main button interaction router ...
async function handleButtonInteraction(interaction, client)
{
  const [actionType] = interaction.customId.split(":");

  // Action: view personal capydex collection:
  if (actionType === "capydex_view")
  {
    const remainingMs = getCooldownRemaining(interaction.user.id);
    if (remainingMs > 0)
    {
      return interaction.reply({
        content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
        flags: MessageFlags.Ephemeral,
      });
    }
    setCooldown(interaction.user.id);

    if (interaction.user?.id)
    {
      capydex.updateUserInfo(interaction.user.id, interaction.user.tag || interaction.user.username);
    }

    const capydexData = capydex.buildCapydexEmbed(
      interaction.user,
      client,
      capybaraResponses.length,
      capydex.getWebTotal(),
      getRandomColor()
    );

    return interaction.reply({
      embeds: capydexData.embeds,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Author-only button guard (prevents other users from hijacking buttons):
  const ownerId = getActionOwnerId(interaction);
  if (ownerId && interaction.user.id !== ownerId)
  {
    return interaction.reply({
      content: `- **These capybaras are chillin' with <@${ownerId}> right now!** \n> || Run \`/capybaras\` or \`/capyweb\` to summon your own capybara companion :) ||`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Action: next local capybara photo:
  if (actionType === "capybara_next")
  {
    const remainingMs = getCooldownRemaining(interaction.user.id);
    if (remainingMs > 0)
    {
      return interaction.reply({
        content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
        flags: MessageFlags.Ephemeral,
      });
    }
    setCooldown(interaction.user.id);

    const data = getCapybaraData(interaction.user, client);

    await interaction.update({
      embeds: data.embeds,
      files: data.files,
      components: [createCapybaraButtonRow(interaction.user.id)],
    });
  }

  // Action: next web capybara photo:
  else if (actionType === "capyweb_next")
  {
    const remainingMs = getCooldownRemaining(interaction.user.id);
    if (remainingMs > 0)
    {
      return interaction.reply({
        content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
        flags: MessageFlags.Ephemeral,
      });
    }
    setCooldown(interaction.user.id);

    await interaction.deferUpdate();

    const data = await getWebCapybaraData(interaction.user, client);

    await interaction.editReply({
      embeds: data.embeds,
      files: data.files,
      components: [createCapywebButtonRow(interaction.user.id)],
    });
  }

  // Action: show project and creator links:
  else if (actionType === "capyinfo_links")
  {
    const remainingMs = getCooldownRemaining(interaction.user.id);
    if (remainingMs > 0)
    {
      return interaction.reply({
        content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
        flags: MessageFlags.Ephemeral,
      });
    }
    setCooldown(interaction.user.id);

    return interaction.reply({
      content: `- **Capybara Discord Bot - Official Links:** \n> • **Discord Server:** [Weboardies™ (1052989877781803070)](https://discord.gg/d8pawxdSqG)\n> • **GitHub Repo:** [mikroskato62/capy-discord-bot](https://github.com/mikroskato62/capy-discord-bot)\n> • **Creator Website:** [weboardies.com/mikroskato62](https://www.weboardies.com/mikroskato62)`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Action: add random reaction on button click (FIFO rotation at 20 reactions):
  else if (actionType === "capybara_react")
  {
    const remainingMs = getCooldownRemaining(interaction.user.id);
    if (remainingMs > 0)
    {
      return interaction.reply({
        content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
        flags: MessageFlags.Ephemeral,
      });
    }
    setCooldown(interaction.user.id);

    await interaction.deferUpdate();

    try
    {
      const message = await interaction.message.fetch().catch(() => interaction.message);

      const existingEmojiKeys = new Set( message.reactions.cache.map((r) => r.emoji.id || r.emoji.name) );

      // Remove oldest reaction when reaching Discord's 20-reaction maximum:
      if (message.reactions.cache.size >= 20)
      {
        const oldestNonCustom = message.reactions.cache.find( (r) => (CUSTOM_EMOJI_ID ? r.emoji.id !== CUSTOM_EMOJI_ID : r.emoji.name !== DEFAULT_CAPY_EMOJI) );
        if (oldestNonCustom)
        {
          await oldestNonCustom.remove().catch(async () => { await oldestNonCustom.users.remove(client.user.id).catch(() => null); });
          existingEmojiKeys.delete(oldestNonCustom.emoji.id || oldestNonCustom.emoji.name);
        }
      }

      const emoji = getRandomReactionEmoji(client, existingEmojiKeys);
      await message.react(emoji);
    }
    catch (error)
    {
      if (error.code === 30010 || error.message?.includes("Maximum number of reactions"))
      {
        try
        {
          const message = await interaction.message.fetch().catch(() => interaction.message);
          const oldestNonCustom = message.reactions.cache.find(
            (r) => (CUSTOM_EMOJI_ID ? r.emoji.id !== CUSTOM_EMOJI_ID : r.emoji.name !== DEFAULT_CAPY_EMOJI)
          );
          if (oldestNonCustom)
          {
            await oldestNonCustom.remove().catch(async () => { await oldestNonCustom.users.remove(client.user.id).catch(() => null); });
            const emoji = getRandomReactionEmoji(client);
            await message.react(emoji).catch(() => null);
          }
        }
        catch (retryErr) { console.warn("[!] Warning: Could not cycle reaction: ", retryErr.message, " ..."); }
      }
      else
      {
        console.warn("[!] Warning: Could not add reaction on click: ", error.message, " ...");
      }
    }
  }

  // Action: view leaderboard:
  else if (actionType === "capyleaderboard_view")
  {
    const remainingMs = getCooldownRemaining(interaction.user.id);
    if (remainingMs > 0)
    {
      return interaction.reply({
        content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
        flags: MessageFlags.Ephemeral,
      });
    }
    setCooldown(interaction.user.id);

    if (interaction.user?.id)
    { capydex.updateUserInfo(interaction.user.id, interaction.user.tag || interaction.user.username); }

    // Fetch guild members for server ranking:
    let guildMemberIds = null;
    if (interaction.guild)
    {
      if (interaction.guild.members?.cache && interaction.guild.members.cache.size > 1)
      {
        guildMemberIds = new Set(interaction.guild.members.cache.keys());
      }
      else
      {
        try
        {
          const members = await interaction.guild.members.fetch({ time: 2000 }).catch(() => null);
          if (members && members.size > 0) { guildMemberIds = new Set(members.keys()); }
        }
        catch
        {
          guildMemberIds = interaction.guild.members?.cache ? new Set(interaction.guild.members.cache.keys()) : null;
        }
      }
    }

    const leaderboardData = capydex.buildLeaderboardEmbed({
      user: interaction.user,
      guild: interaction.guild,
      clientInstance: client,
      guildMemberIds,
      limit: 5,
      totalLocal: capybaraResponses.length,
      totalWeb: capydex.getWebTotal(),
      color: getRandomColor(),
    });

    return interaction.reply({
      embeds: leaderboardData.embeds,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Action: dismiss and leave message:
  else if (actionType === "capybara_leave")
  {
    if (interaction.message?.reactions)
    {
      await interaction.message.reactions.removeAll().catch((error) =>
      { console.warn("[!] Warning: Could not clear reactions on leave: ", error.message, " ..."); });
    }
    await interaction.update({
      content: `- **So, you did not like that capybara @${interaction.user.tag} ?** \n> || **You made __capybaras__ leave angry - but they still __love you__ :)** ||`,
      embeds: [],
      components: [],
      files: [],
    }).catch((err) => {
      console.warn("[!] Warning: Could not update message on leave: ", err.message, " ...");
    });
  }
}

module.exports = {
  handleButtonInteraction,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Button Interaction Handlers.
//   
