// [!] Rapscallion62's Capybara Discord Bot Code ... 

if (require.main === module) {
  console.log("[!] Capybara: Hello World!");
}

// [!] SETUPS:
const {
  Client,
  GatewayIntentBits,
  Events,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActivityType,
  MessageFlags
} = require("discord.js");
const fs = require("fs");
require("dotenv").config({ quiet: true });

// [!] CONFIGURABLE EMOJI SETTINGS:
const CUSTOM_EMOJI_ID = process.env.CUSTOM_EMOJI_ID ? process.env.CUSTOM_EMOJI_ID.trim() : null;
const DEFAULT_CAPY_EMOJI = "🦫";
const CAPY_EMOJI_STRING = CUSTOM_EMOJI_ID ? `<:capybara:${CUSTOM_EMOJI_ID}>` : DEFAULT_CAPY_EMOJI;

// [!] RESPONSES DATA:
function getRandomColor() { return Math.floor(Math.random() * 0xffffff); }

const capybaraResponses = [
  { text: `( ${CAPY_EMOJI_STRING} )  This is a capybara ...`, image: "main.jpg" },
  { text: "( 👋🏻 )  This capybara says hi :D", image: "hello.jpg" },
  { text: "( 💤 )  This capybara is sleeping ...", image: "sleep.jpg" },
  { text: "( 🎮 )  This capybara is gaming !", image: "game.jpg" },
  { text: "( 💧 )  This capybara is bathing ...", image: "bath.jpg" },
  { text: "( 😎 )  This capybara is cool !", image: "cool.jpg" },
  { text: "( 🏠 )  These capybaras are home :(", image: "home.jpg" },
  { text: "( 🍪 )  This capybara is eating ...", image: "eat.jpg" },
  { text: "( 👥 )  These capybaras are a gang !", image: "gang.jpg" },
  { text: "( 👨‍👩‍👧‍👦 )  These capybaras are family :)", image: "family.jpg" },
  { text: "( 👶🏻 )  These capybaras are babies :)", image: "baby.jpg" },
  { text: "( 📚 )  This capybara is reading ...", image: "read.jpg" },
  { text: "( 💀 )  This capybara is fake :(", image: "fake.jpg" },
  { text: "( 😀 )  This capybara is happy !", image: "happy.jpg" },
  { text: "( 🥺 )  This capybara is cute ...", image: "cute.jpg" },
  { text: "( 🎤 )  This capybara is singing ...", image: "mic.jpg" },
  { text: "( 🥽 )  These capybaras are swimming ...", image: "swim.jpg" },
  { text: "( 🪑 )  These capybaras are chilling ...", image: "chill.jpg" },
  { text: "( 🚽 )  This capybara is on the toilet ?", image: "toilet.jpg" },
  { text: "( 🥚 )  This capybara is an egg ?", image: "egg.jpg" },
  { text: "( 🖤 )  This capybara is black ?", image: "black.jpg" },
  { text: "( 🤍 )  This capybara is white ?", image: "white.jpg" },
  { text: "( ❤️ )  This capybara is red ?", image: "red.jpg" },
  { text: "( 1️⃣ )  Bonus 1: photo by @mikroskato62 !!!", image: "bonus1.jpg" },
  { text: "( 2️⃣ )  Bonus 2: photo by @mikroskato62 !!!", image: "bonus2.jpg" },
  { text: "( 3️⃣ )  Bonus 3: photo by @mikroskato62 !!!", image: "bonus3.jpg" },
];

// [!] PROCESS ERROR LISTENERS (Prevents bot crashes on unhandled errors during 24/7 runtime):
process.on("unhandledRejection", (reason) => {
  console.error("[!] Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[!] Uncaught Exception:", error);
});

// [!] STARTING:
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.Error, (error) => {
  console.error("[!] Discord Gateway Error:", error?.message || error);
});

client.on(Events.Warn, (warning) => {
  console.warn("[!] Discord Gateway Warning:", warning);
});

client.once(Events.ClientReady, () => {
  console.log(`[!] Logged in on discord as ${client.user.tag} ...`);

  // [!] Rotating Bot Status / Activity Presence:
  const statuses = [
    { name: "/capybaras /capyweb /capyinfo", type: ActivityType.Watching },
    { name: "/capybaras /capyweb /capyinfo", type: ActivityType.Listening },
    { name: "/capybaras /capyweb /capyinfo", type: ActivityType.Playing },
  ];
  let index = 0;
  if (client?.user) {
    client.user.setActivity(statuses[index].name, { type: statuses[index].type });
  }
  setInterval(() => {
    if (!client?.user) return;
    index = (index + 1) % statuses.length;
    client.user.setActivity(statuses[index].name, { type: statuses[index].type });
  }, 1000 * 60 * 60);
});

// [!] Helper Function: Generates the Embed and Files for a Random Local Capybara:
function getCapybaraData(user, clientInstance = client) {
  const randomIndex = Math.floor(Math.random() * capybaraResponses.length);
  const randomResponse = capybaraResponses[randomIndex];
  const isUrl = randomResponse.image.startsWith("http");

  let finalImage = randomResponse.image;
  let filesToSend = [];

  if (!isUrl) {
    const attachment = new AttachmentBuilder(`./images/${randomResponse.image}`, { name: 'capy.jpg' });
    filesToSend = [attachment];
    finalImage = 'attachment://capy.jpg';
  }

  const timeString = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const avatarUrl = clientInstance?.user?.displayAvatarURL ? clientInstance.user.displayAvatarURL() : undefined;

  const embed = {
    author: { name: 'Capybara Bot', icon_url: avatarUrl },
    description: randomResponse.text,
    image: { url: finalImage },
    footer: { text: `* Command: /capybaras • Image ${String(randomIndex + 1).padStart(2, '0')}/${capybaraResponses.length} ...\n* Requested by @${user.tag} • Today at ${timeString} ...` },
    color: getRandomColor(),
  };

  return { embeds: [embed], files: filesToSend };
}

// [!] Helper Function: Generates the Embed and Files for a Random Live Web Capybara (Todo #8):
async function getWebCapybaraData(user, clientInstance = client) {
  const timeString = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  let imageUrl = null;
  let photoIdentifier = 'Web';
  let altText = null;
  let isFallback = false;

  try {
    const response = await fetch('https://api.capy.lol/v1/capybara?json=true', {
      signal: AbortSignal.timeout(4000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    if (json.success && json.data && json.data.url) {
      imageUrl = json.data.url.replace(/^http:\/\//i, 'https://');
      photoIdentifier = json.data.index ? `#${json.data.index}` : 'Online';
      if (json.data.alt && typeof json.data.alt === 'string' && json.data.alt.trim()) {
        const trimmedAlt = json.data.alt.trim();
        const normalized = trimmedAlt.replace(/\.+$/, '').toLowerCase();
        if (normalized !== 'a capybara' && normalized !== 'capybara') {
          let formattedAlt = trimmedAlt.charAt(0).toUpperCase() + trimmedAlt.slice(1);
          if (!formattedAlt.endsWith('.')) {
            formattedAlt += '...';
          }
          altText = formattedAlt;
        }
      }
    } else {
      throw new Error('Invalid API response format.');
    }
  } catch (error) {
    console.warn('[!] Warning: Live capybara API request failed, falling back to local images:', error.message);
    isFallback = true;
  }

  let finalImage = imageUrl;
  let filesToSend = [];
  let descriptionText = altText ? `( 🌐 )  ${altText}` : '( 🌐 )  This image was found on the web ...';
  let footerText = `* CMD: /capyweb • API: api.capy.lol • Web Photo ${photoIdentifier} ...\n* Requested by @${user.tag} • Today at ${timeString} ...`;

  if (isFallback || !imageUrl) {
    const fallbackImage = fs.existsSync('./images/hello.png') ? 'hello.png' : 'hello.jpg';
    const attachment = new AttachmentBuilder(`./images/${fallbackImage}`, { name: 'fallback.jpg' });
    filesToSend = [attachment];
    finalImage = 'attachment://fallback.jpg';
    descriptionText = '( 👋🏻 )  This capybara says hi :D (Offline Fallback)';
    footerText = `* CMD: /capyweb • Offline Fallback Image ...\n* Requested by @${user.tag} • Today at ${timeString} ...`;
  }

  const avatarUrl = clientInstance?.user?.displayAvatarURL ? clientInstance.user.displayAvatarURL() : undefined;

  const embed = {
    author: { name: 'Capybara Bot', icon_url: avatarUrl },
    description: descriptionText,
    image: { url: finalImage },
    footer: { text: footerText },
    color: getRandomColor(),
  };

  return { embeds: [embed], files: filesToSend };
}

// [!] Helper Function: Generates the Embed and Files for the Bot Info & Roadmap Command (/capyinfo):
function getCapyInfoData(user, clientInstance = client) {
  const timeString = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const bannerPath = './assets/logo.png';
  let filesToSend = [];
  let imageUrl = undefined;

  if (fs.existsSync(bannerPath)) {
    const attachment = new AttachmentBuilder(bannerPath, { name: 'logo.png' });
    filesToSend = [attachment];
    imageUrl = 'attachment://logo.png';
  }

  const avatarUrl = clientInstance?.user?.displayAvatarURL ? clientInstance.user.displayAvatarURL() : undefined;
  const botTag = clientInstance?.user?.tag || 'CapybaraBot#0000';
  const botId = clientInstance?.user?.id || '1395033511559172157';

  const embed = {
    author: {
      name: 'Capybara Bot',
      icon_url: avatarUrl
    },
    description: `${CAPY_EMOJI_STRING} ​ **Information & Guide About Capybara Discord Bot ...**\n> *Thank you for using this app - created by capybara lovers for capybara lovers!*`,
    fields: [
      {
        name: '⁉️ ​ What is this bot?',
        value: [
          '▸ **Capybara Discord Bot** is your server’s dedicated chill companion, bringing wholesome vibes, delightful capybara photos, and relaxing energy to your server!',
        ].join('\n'),
        inline: false,
      },
      {
        name: '✨ ​ What can this bot do?',
        value: [
          '▸ **Capybara Discord Bot** currently has the following commands available:',
          '▸ **`/capybaras`** - Delivers hand-curated capybara photos with descriptions.',
          '▸ **`/capyweb`** - Fetches infinite web photos in real-time from across the internet.',
          '▸ **`/capyinfo`** - Displays this styled guide you are currently reading!',
          '▸ You can learn how to use each one below...',
        ].join('\n'),
        inline: false,
      },
      {
        name: '⚙️ ​ How to use this bot?',
        value: [
          '▸ Here are the steps on how to use **Capybara Discord Bot**:',
          '▸ Choose a command to run from the above list.',
          '▸ Type that command in any server channel where the bot has access.',
          '▸ The bot will send a delightful embed message instantly.',
          '▸ Check and enjoy the attached photo with its unique description!',
          '▸ Interact with that photo by clicking any of the buttons below.',
          '▸ Click the blue (left) button to get a new random capybara photo.',
          '▸ Click the grey (middle) button to add a random reaction emoji.',
          '▸ Click the red (right) button to exit and dismiss the message.',
          '▸ Note: please avoid spamming as a built-in 1-second cooldown exists!',
          '▸ That\'s all - relax, have fun, and enjoy the capybaras :)',
        ].join('\n'),
        inline: false,
      },
      {
        name: '✅ ​ Is the bot completed?',
        value: [
          '▸ **Capybara Discord Bot** is ready for use, but more things coming soon:',
          '▸ **`/capyfacts`** - On-demand educational trivia and fascinating capybara facts.',
          '▸ **`/capyquiz`** - Interactive trivia questions to test your capybara knowledge.',
          '▸ **`/capyrate`** - Fun chill-o-meter personality scanner (0–100%).',
          '▸ **`/capyother`** - Exciting new features suggested by you and our community!',
          '▸ **`/capygame`** - Engaging mini-games and interactive Discord activities.',
          '▸ **Want to help?** Join our Discord Server by checking the information below...',
        ].join('\n'),
        inline: false,
      },
      {
        name: 'ℹ️ ​ Andanced info about the bot?',
        value: [
          '▸ **Name: Capybara Discord Bot**',
          `▸ **Tag:** [@${botTag}](https://discord.com/oauth2/authorize?client_id=${botId})`,
          '▸ **Server:** Created at [Weboardies™](https://discord.gg/d8pawxdSqG) - invitable anywhere!',
          '▸ **Developer:** Built for [Capybaras](https://en.wikipedia.org/wiki/Capybara) by [@mikroskato62](https://www.weboardies.com/mikroskato62).',
          '▸ **Architecture:** Modern [Node.js](https://nodejs.org) & [Discord.js](https://discord.js.org).',
          '▸ **APIs & Data:** Powered by [api.capy.lol](https://api.capy.lol/) & [unicode-emoji-json](https://www.npmjs.com/package/unicode-emoji-json).',
          '▸ **Hosting:** Online 24/7 with [Wispbyte](https://wispbyte.com/).',
          '▸ **License:** Open-source under the [ISC License](https://opensource.org/license/isc).',
          '▸ **Source Code:** View repository on [GitHub](https://github.com/mikroskato62/capy-discord-bot).',
          '▸ **Mission:** Spread smiles & wholesome energy to everyone worldwide ...'
        ].join('\n'),
        inline: false,
      },
      {
        name: `|| ${CAPY_EMOJI_STRING} ||`,
        value: '\u200B',
        inline: true,
      },
    ],
    image: imageUrl ? { url: imageUrl } : undefined,
    footer: {
      text: `* Command: /capyinfo • Capybara Bot v1.0.0 ...\n* Requested by @${user.tag} • Today at ${timeString} ...`
    },
    color: getRandomColor(),
  };

  return { embeds: [embed], files: filesToSend };
}

// [!] Helper Function: Select a Random Reaction Emoji (Configurable Unicode Emojis + Live Custom Emojis):
const emojiData = require("unicode-emoji-json");
const EXCLUDED_EMOJI_GROUPS = new Set(["Flags"]);

const allUnicodeEmojis = Object.entries(emojiData)
  .filter(([_, info]) => !EXCLUDED_EMOJI_GROUPS.has(info.group))
  .map(([emoji]) => emoji);

function getRandomReactionEmoji(client, excludedSet = new Set()) {
  const customEmojis = client?.emojis?.cache ? Array.from(client.emojis.cache.filter((e) => e.available).values()).map((e) => e.id) : [];
  const emojiPool = customEmojis.length > 0 ? [...allUnicodeEmojis, ...customEmojis] : allUnicodeEmojis;
  const availablePool = emojiPool.filter((e) => !excludedSet.has(e));
  const poolToUse = availablePool.length > 0 ? availablePool : emojiPool;
  const randomIndex = Math.floor(Math.random() * poolToUse.length);
  return poolToUse[randomIndex];
}

// [!] Helper Function: Automatically Add the Default Capybara Reaction on Command Trigger:
async function addInitialReaction(interaction, response) {
  try {
    const targetMessage = response?.resource?.message || (await interaction.fetchReply().catch(() => null));
    if (!targetMessage) return;

    if (CUSTOM_EMOJI_ID) {
      await targetMessage.react(CUSTOM_EMOJI_ID).catch(async () => {
        // Fallback to Unicode emoji if custom server emoji is not available
        await targetMessage.react(DEFAULT_CAPY_EMOJI).catch(() => null);
      });
    } else {
      await targetMessage.react(DEFAULT_CAPY_EMOJI).catch(() => null);
    }
  } catch (error) {
    console.warn("[!] Warning: Could not add default reaction:", error.message);
  }
}

// [!] COOLDOWN CONFIGURATION (Anti-Spam Protection):
const COOLDOWN_DURATION = 1000;
const cooldowns = new Map();

function getCooldownRemaining(userId) {
  if (!cooldowns.has(userId)) return 0;
  const lastUsed = cooldowns.get(userId);
  const remaining = COOLDOWN_DURATION - (Date.now() - lastUsed);
  if (remaining <= 0) {
    cooldowns.delete(userId);
    return 0;
  }
  return remaining;
}

function setCooldown(userId) {
  cooldowns.set(userId, Date.now());
}

setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamp] of cooldowns.entries()) {
    if (now - timestamp > COOLDOWN_DURATION * 5) {
      cooldowns.delete(userId);
    }
  }
}, 5 * 60 * 1000).unref?.();

// [!] MAIN EVENT LISTENER (Handles both Commands and Buttons):
const buttonReactEmoji = CUSTOM_EMOJI_ID || DEFAULT_CAPY_EMOJI;

function createCapybaraButtonRow(userId = "") {
  const suffix = userId ? `:${userId}` : "";
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`capybara_next${suffix}`)
      .setLabel("👍🏻")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`capybara_react${suffix}`)
      .setEmoji(buttonReactEmoji)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`capybara_leave${suffix}`)
      .setLabel("👎🏻")
      .setStyle(ButtonStyle.Danger)
  );
}

function createCapywebButtonRow(userId = "") {
  const suffix = userId ? `:${userId}` : "";
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`capyweb_next${suffix}`)
      .setLabel("👍🏻")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`capybara_react${suffix}`)
      .setEmoji(buttonReactEmoji)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`capybara_leave${suffix}`)
      .setLabel("👎🏻")
      .setStyle(ButtonStyle.Danger)
  );
}

function createCapyinfoButtonRow(userId = "") {
  const suffix = userId ? `:${userId}` : "";
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`capyinfo_links${suffix}`)
      .setLabel("👍🏻")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`capybara_react${suffix}`)
      .setEmoji(buttonReactEmoji)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`capybara_leave${suffix}`)
      .setLabel("👎🏻")
      .setStyle(ButtonStyle.Danger)
  );
}

function getActionOwnerId(interaction) {
  if (interaction.customId && interaction.customId.includes(":")) {
    const parts = interaction.customId.split(":");
    if (parts[1]) return parts[1];
  }
  if (interaction.message?.interactionMetadata?.user?.id) {
    return interaction.message.interactionMetadata.user.id;
  }
  if (interaction.message?.interaction?.user?.id) {
    return interaction.message.interaction.user.id;
  }
  return null;
}

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // [!] HANDLE SLASH COMMANDS:
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "capybaras") {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0) {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral
          });
        }
        setCooldown(interaction.user.id);

        const data = getCapybaraData(interaction.user);

        const response = await interaction.reply({
          embeds: data.embeds,
          files: data.files,
          components: [createCapybaraButtonRow(interaction.user.id)],
          withResponse: true,
        });

        await addInitialReaction(interaction, response);
      } else if (interaction.commandName === "capyweb") {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0) {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral
          });
        }
        setCooldown(interaction.user.id);

        await interaction.deferReply();

        const data = await getWebCapybaraData(interaction.user);

        const response = await interaction.editReply({
          embeds: data.embeds,
          files: data.files,
          components: [createCapywebButtonRow(interaction.user.id)],
        });

        await addInitialReaction(interaction, response);
      } else if (interaction.commandName === "capyinfo") {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0) {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral
          });
        }
        setCooldown(interaction.user.id);

        const data = getCapyInfoData(interaction.user);

        const response = await interaction.reply({
          embeds: data.embeds,
          files: data.files,
          components: [createCapyinfoButtonRow(interaction.user.id)],
          withResponse: true,
        });

        await addInitialReaction(interaction, response);
      }
    }

    // [!] HANDLE BUTTON CLICKS:
    else if (interaction.isButton()) {
      // Author-only button guard (Task 21):
      const ownerId = getActionOwnerId(interaction);
      if (ownerId && interaction.user.id !== ownerId) {
        return interaction.reply({
          content: `- **These capybaras are chillin' with <@${ownerId}> right now!** \n> || Run \`/capybaras\` or \`/capyweb\` to summon your own capybara companion :) ||`,
          flags: MessageFlags.Ephemeral
        });
      }

      const [actionType] = interaction.customId.split(":");

      // [!] ACTION: NEXT LOCAL CAPYBARA:
      if (actionType === "capybara_next") {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0) {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral
          });
        }
        setCooldown(interaction.user.id);

        const data = getCapybaraData(interaction.user);

        await interaction.update({
          embeds: data.embeds,
          files: data.files,
          components: [createCapybaraButtonRow(interaction.user.id)]
        });
      }

      // [!] ACTION: NEXT WEB CAPYBARA:
      else if (actionType === "capyweb_next") {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0) {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral
          });
        }
        setCooldown(interaction.user.id);

        await interaction.deferUpdate();

        const data = await getWebCapybaraData(interaction.user);

        await interaction.editReply({
          embeds: data.embeds,
          files: data.files,
          components: [createCapywebButtonRow(interaction.user.id)]
        });
      }

      // [!] ACTION: SHOW PROJECT & CREATOR LINKS:
      else if (actionType === "capyinfo_links") {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0) {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral
          });
        }
        setCooldown(interaction.user.id);

        return interaction.reply({
          content: `- **Capybara Discord Bot - Official Links:** \n> • **Discord Server:** [Weboardies™ (1052989877781803070)](https://discord.gg/d8pawxdSqG)\n> • **GitHub Repo:** [mikroskato62/capy-discord-bot](https://github.com/mikroskato62/capy-discord-bot)\n> • **Creator Website:** [weboardies.com/mikroskato62](https://www.weboardies.com/mikroskato62)`,
          flags: MessageFlags.Ephemeral
        });
      }

      // [!] ACTION: ADD RANDOM REACTION ON BUTTON CLICK (FIFO Rotation at 20 Reactions):
      else if (actionType === "capybara_react") {
        const remainingMs = getCooldownRemaining(interaction.user.id);
        if (remainingMs > 0) {
          return interaction.reply({
            content: `- **Capybaras need a break - do you want to scare them?** \n> || **Please __do not spam__ the command - __cooldown__ is 1 second!** ||`,
            flags: MessageFlags.Ephemeral
          });
        }
        setCooldown(interaction.user.id);

        await interaction.deferUpdate();

        try {
          const message = await interaction.message.fetch().catch(() => interaction.message);

          const existingEmojiKeys = new Set(
            message.reactions.cache.map((r) => r.emoji.id || r.emoji.name)
          );

          if (message.reactions.cache.size >= 20) {
            const oldestNonCustom = message.reactions.cache.find(
              (r) => (CUSTOM_EMOJI_ID ? r.emoji.id !== CUSTOM_EMOJI_ID : r.emoji.name !== DEFAULT_CAPY_EMOJI)
            );
            if (oldestNonCustom) {
              await oldestNonCustom.remove().catch(async () => {
                await oldestNonCustom.users.remove(client.user.id).catch(() => null);
              });
              existingEmojiKeys.delete(oldestNonCustom.emoji.id || oldestNonCustom.emoji.name);
            }
          }

          const emoji = getRandomReactionEmoji(client, existingEmojiKeys);
          await message.react(emoji);
        }
        catch (error) {
          if (error.code === 30010 || error.message?.includes("Maximum number of reactions")) {
            try {
              const message = await interaction.message.fetch().catch(() => interaction.message);
              const oldestNonCustom = message.reactions.cache.find(
                (r) => (CUSTOM_EMOJI_ID ? r.emoji.id !== CUSTOM_EMOJI_ID : r.emoji.name !== DEFAULT_CAPY_EMOJI)
              );
              if (oldestNonCustom) {
                await oldestNonCustom.remove().catch(async () => {
                  await oldestNonCustom.users.remove(client.user.id).catch(() => null);
                });
                const emoji = getRandomReactionEmoji(client);
                await message.react(emoji).catch(() => null);
              }
            } catch (retryErr) {
              console.warn("[!] Warning: Could not cycle reaction:", retryErr.message);
            }
          } else {
            console.warn("[!] Warning: Could not add reaction on click:", error.message);
          }
        }
      }

      // [!] ACTION: LEAVE (DELETE EMBED):
      else if (actionType === "capybara_leave") {
        if (interaction.message?.reactions) {
          await interaction.message.reactions.removeAll().catch(error => {
            console.warn("[!] Warning: Could not clear reactions on leave:", error.message);
          });
        }
        await interaction.update({
          content: `- **So, you did not like that capybara @${interaction.user.tag} ?** \n> || **You made __capybaras__ leave angry - but they still __love you__ :)** ||`,
          embeds: [],
          components: [],
          files: []
        }).catch((err) => {
          console.warn("[!] Warning: Could not update message on leave:", err.message);
        });
      }
    }
  } catch (error) {
    console.error("[!] Interaction Error:", error);
    try {
      const errorPayload = {
        content: "- **Oh no! Capybaras got confused... Please try again in a moment!** \n> || An unexpected error occurred while processing the requested action. ||",
        flags: MessageFlags.Ephemeral
      };
      if (interaction.isRepliable()) {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(errorPayload).catch(() => null);
        } else {
          await interaction.reply(errorPayload).catch(() => null);
        }
      }
    } catch (fallbackErr) {
      console.warn("[!] Warning: Could not send interaction error notification:", fallbackErr.message);
    }
  }
});

// [!] GRACEFUL SHUTDOWN (Clean Gateway disconnect on container restart / SIGTERM / SIGINT):
const handleShutdown = (signal) => {
  console.log(`[!] Received ${signal}. Shutting down gracefully and disconnecting from Discord Gateway...`);
  try {
    client.destroy();
  } catch (err) {
    console.warn("[!] Warning during client destroy:", err.message);
  }
  process.exit(0);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

// [!] LOGIN TO DISCORD (Only when running standalone, not when imported by tests):
if (require.main === module) {
  if (process.env.TOKEN) {
    client.login(process.env.TOKEN).catch((err) => {
      console.error("[!] Discord Login Error:", err.message);
    });
  } else {
    console.error("[!] Critical Error: Discord bot TOKEN is missing in environment variables (.env).");
  }
}

module.exports = {
  client,
  capybaraResponses,
  getRandomColor,
  getCapybaraData,
  getWebCapybaraData,
  getCapyInfoData,
  getRandomReactionEmoji,
  getCooldownRemaining,
  setCooldown,
  createCapybaraButtonRow,
  createCapywebButtonRow,
  createCapyinfoButtonRow,
  getActionOwnerId,
}; 