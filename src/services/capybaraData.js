// @mikroskato62 - Capybara Discord Bot - Capybara Embed Data & Media Generators.
// Manages local photo collections, weighted randomness, web photo fetcher, and info guides.
// Import: const { getCapybaraData, ... } = require("./services/capybaraData");

// [#1] Core dependencies & setups ...
const fs = require("fs");
const path = require("path");
const { AttachmentBuilder } = require("discord.js");
const {
  CAPY_EMOJI_STRING,
  IMAGES_DIR,
  LOGO_PATH,
} = require("../config");
const capydex = require("./capydex");

// [#2] Bot configuration & local responses data ...
// Random Discord embed color generator:
function getRandomColor() { return Math.floor(Math.random() * 0xffffff); }

// Curated list of 25 local capybara pictures and captions:
const capybaraResponses = 
[
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
  { text: "( 🤖 )  This capybara is AI :(", image: "ai.jpg" },
  { text: "( 😀 )  This capybara is happy !", image: "happy.jpg" },
  { text: "( 🔪 )  This capybara is edited :(", image: "edited.jpg" },
  { text: "( 🥽 )  These capybaras are swimming ...", image: "swim.jpg" },
  { text: "( 😎 )  These capybaras are chilling ...", image: "chill.jpg" },
  { text: "( 🚽 )  This capybara is on the toilet ?", image: "toilet.jpg" },
  { text: "( 🥚 )  This capybara is an egg ?", image: "egg.jpg" },
  { text: "( 🖤 )  This capybara is black ?", image: "black.jpg" },
  { text: "( 🤍 )  This capybara is white ?", image: "white.jpg" },
  { text: "( ❤️ )  This capybara is red ?", image: "red.jpg" },
  { text: "( 1️⃣ )  Bonus 1: photo by @mikroskato62 !!!", image: "bonus1.jpg" },
  { text: "( 2️⃣ )  Bonus 2: photo by @mikroskato62 !!!", image: "bonus2.jpg" },
  { text: "( 3️⃣ )  Bonus 3: photo by @mikroskato62 !!!", image: "bonus3.jpg" },
];

// [#3] Weighted random selection & index calculations ...
// Weighted random selection: 94% standard images (0-21) and 6% rare bonus photos (22-24):
function getRandomCapybaraIndex(totalCount = capybaraResponses.length)
{
  if (totalCount <= 3) { return Math.floor(Math.random() * totalCount); }
  const bonusCount = 3;
  const standardCount = totalCount - bonusCount;
  const roll = Math.random();

  if (roll < 0.06) { return standardCount + Math.floor(Math.random() * bonusCount); }
  return Math.floor(Math.random() * standardCount);
}

// [#4] Embed data generators & API fetchers ...
// Generate embed and file attachment for random local capybara photo:
function getCapybaraData(user, clientInstance = null)
{
  const randomIndex = getRandomCapybaraIndex(capybaraResponses.length);
  const randomResponse = capybaraResponses[randomIndex];
  const isUrl = randomResponse.image.startsWith("http");

  let finalImage = randomResponse.image;
  let filesToSend = [];

  if (!isUrl)
  {
    const localImagePath = path.join(IMAGES_DIR, randomResponse.image);
    const attachment = new AttachmentBuilder(localImagePath, { name: "capy.jpg" });
    filesToSend = [attachment];
    finalImage = "attachment://capy.jpg";
  }

  const timeString = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const avatarUrl = clientInstance?.user?.displayAvatarURL ? (typeof clientInstance.user.displayAvatarURL === "function" ? clientInstance.user.displayAvatarURL() : clientInstance.user.displayAvatarURL) : undefined;
  const userTag = user?.tag || user?.username || "User";

  if (user?.id)
  {
    capydex.recordLocalUnlock(user.id, randomIndex + 1, userTag, capybaraResponses.length, capydex.getWebTotal());
  }
  const userStats = capydex.getUserStats(user?.id, capybaraResponses.length, capydex.getWebTotal());
  const collectionText = `* Collection: Capys: ${String(userStats.localCount).padStart(2, "0")}/${capybaraResponses.length} • Web: ${userStats.webCount}/${userStats.webTotal}`;

  const embed = {
    author: { name: "Capybara Bot", icon_url: avatarUrl },
    description: randomResponse.text,
    image: { url: finalImage },
    footer: {
      text: `* Command: /capybaras • Image ${String(randomIndex + 1).padStart(2, "0")}/${capybaraResponses.length} ...\n${collectionText}\n* Requested by @${userTag} • Today at ${timeString} ...`,
    },
    color: getRandomColor(),
  };

  return { embeds: [embed], files: filesToSend };
}

// Fetch random live capybara photo from api.capy.lol with offline fallback:
async function getWebCapybaraData(user, clientInstance = null)
{
  const timeString = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, });

  let imageUrl = null;
  let photoIdentifier = "Web";
  let altText = null;
  let isFallback = false;
  let photoIndex = null;

  try
  {
    const response = await fetch("https://api.capy.lol/v1/capybara?json=true", { signal: AbortSignal.timeout(4000), });
    if (!response.ok) { throw new Error(`HTTP ${response.status}`); }
    const json = await response.json();
    if (json.success && json.data && json.data.url)
    {
      imageUrl = json.data.url.replace(/^http:\/\//i, "https://");
      photoIdentifier = json.data.index ? `#${json.data.index}` : "Online";
      if (typeof json.data.index === "number") { photoIndex = json.data.index; }
      if (json.data.alt && typeof json.data.alt === "string" && json.data.alt.trim())
      {
        const trimmedAlt = json.data.alt.trim();
        const normalized = trimmedAlt.replace(/\.+$/, "").toLowerCase();
        if (normalized !== "a capybara" && normalized !== "capybara")
        {
          let formattedAlt = trimmedAlt.charAt(0).toUpperCase() + trimmedAlt.slice(1);
          if (!formattedAlt.endsWith(".")) { formattedAlt += "..."; }
          altText = formattedAlt;
        }
      }
    }
    else
    {
      throw new Error("Invalid API response format.");
    }
  }
  catch (error)
  {
    console.warn("[!] Warning: Live capybara API request failed, falling back to local images: ", error.message, " ...");
    isFallback = true;
  }

  let finalImage = imageUrl;
  let filesToSend = [];
  let descriptionText = altText ? `( 🌐 )  ${altText}` : "( 🌐 )  This image was found on the web ...";

  if (!isFallback && photoIndex && user?.id)
  {
    capydex.recordWebUnlock(user.id, photoIndex, user?.tag || user?.username, capybaraResponses.length);
  }

  const userStats = capydex.getUserStats(user?.id, capybaraResponses.length, capydex.getWebTotal());
  const collectionText = `* Collection: Capys: ${String(userStats.localCount).padStart(2, "0")}/${capybaraResponses.length} • Web: ${userStats.webCount}/${userStats.webTotal}`;
  const userTag = user?.tag || user?.username || "User";
  let footerText = `* CMD: /capyweb • API: api.capy.lol • Web Photo ${photoIdentifier} ...\n${collectionText}\n* Requested by @${userTag} • Today at ${timeString} ...`;

  // Fallback to local image when API is offline:
  if (isFallback || !imageUrl)
  {
    const fallbackImage = fs.existsSync(path.join(IMAGES_DIR, "hello.png")) ? "hello.png" : "hello.jpg";
    const attachment = new AttachmentBuilder(path.join(IMAGES_DIR, fallbackImage), { name: "fallback.jpg" });
    filesToSend = [attachment];
    finalImage = "attachment://fallback.jpg";
    descriptionText = "( 👋🏻 )  This capybara says hi :D (Offline Fallback)";
    footerText = `* CMD: /capyweb • Offline Fallback Image ...\n${collectionText}\n* Requested by @${userTag} • Today at ${timeString} ...`;
  }

  const avatarUrl = clientInstance?.user?.displayAvatarURL ? (typeof clientInstance.user.displayAvatarURL === "function" ? clientInstance.user.displayAvatarURL() : clientInstance.user.displayAvatarURL) : undefined;

  const embed = 
  {
    author: { name: "Capybara Bot", icon_url: avatarUrl },
    description: descriptionText,
    image: { url: finalImage },
    footer: { text: footerText },
    color: getRandomColor(),
  };

  return { embeds: [embed], files: filesToSend };
}

// Generate bot guide and documentation embed (/capyinfo):
function getCapyInfoData(user, clientInstance = null)
{
  if (user?.id) { capydex.updateUserInfo(user.id, user?.tag || user?.username); }

  const timeString = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, });

  const bannerPath = LOGO_PATH;
  let filesToSend = [];
  let imageUrl = undefined;

  if (fs.existsSync(bannerPath))
  {
    const attachment = new AttachmentBuilder(bannerPath, { name: "logo.png" });
    filesToSend = [attachment];
    imageUrl = "attachment://logo.png";
  }

  const avatarUrl = clientInstance?.user?.displayAvatarURL ? (typeof clientInstance.user.displayAvatarURL === "function" ? clientInstance.user.displayAvatarURL() : clientInstance.user.displayAvatarURL) : undefined;
  const botTag = clientInstance?.user?.tag || "CapybaraBot#0000";
  const botId = clientInstance?.user?.id || process.env.CLIENT_ID || "";

  const embed = 
  {
    author: 
    {
      name: "Capybara Bot",
      icon_url: avatarUrl,
    },
    description: `${CAPY_EMOJI_STRING} ​ **Information & Guide About Capybara Discord Bot ...**\n> *Thank you for using this app - created by capybara lovers for capybara lovers!*`,
    fields: 
    [
      {
        name: "⁉️ ​ What is this bot?",
        value: 
        [
          "▸ **Capybara Discord Bot** is your server’s dedicated chill companion, bringing wholesome vibes, delightful capybara photos, and relaxing energy to your server!",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: "✨ ​ What can this bot do?",
        value: 
        [
          "▸ **Capybara Discord Bot** currently has the following commands available:",
          "▸ **`/capybaras`** - Delivers hand-curated capybara photos with descriptions.",
          "▸ **`/capyweb`** - Fetches infinite web photos in real-time from across the internet.",
          "▸ **`/capyinfo`** - Displays this styled guide you are currently reading!",
          "▸ You can learn how to use each one below...",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: "⚙️ ​ How to use this bot?",
        value: 
        [
          "▸ Here are the steps on how to use **Capybara Discord Bot**:",
          "▸ Choose a command to run from the above list.",
          "▸ Type that command in any server channel where the bot has access.",
          "▸ The bot will send a delightful embed message instantly.",
          "▸ Check and enjoy the attached photo with its unique description!",
          "▸ Interact with that photo by clicking any of the buttons below:",
          "▸ Click the blue (left) button to get a new random capybara photo.",
          "▸ Click the green (middle-left) button to view your personal capydex collection.",
          "▸ Click the grey (middle) button to add a random reaction emoji.",
          "▸ Click the green (middle-right) button to view the server leaderboard.",
          "▸ Click the red (right) button to exit and dismiss the message.",
          "▸ Note: please avoid spamming as a built-in 1-second cooldown exists!",
          "▸ That's all - relax, have fun, and enjoy the capybaras :)",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: "✅ ​ Is the bot completed?",
        value: 
        [
          "▸ **Capybara Discord Bot** is ready for use, but more things coming soon:",
          "▸ **`/capyfacts`** - On-demand educational trivia and fascinating capybara facts.",
          "▸ **`/capyquiz`** - Interactive trivia questions to test your capybara knowledge.",
          "▸ **`/capyrate`** - Fun chill-o-meter personality scanner (0–100%).",
          "▸ **`/capyother`** - Exciting new features suggested by you and our community!",
          "▸ **`/capygame`** - Engaging mini-games and interactive Discord activities.",
          "▸ **Want to help?** Join our Discord Server by checking the information below...",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: "ℹ️ ​ Advanced info about the bot?",
        value: 
        [
          "▸ **Name: Capybara Discord Bot**",
          `▸ **Tag:** [@${botTag}](https://discord.com/oauth2/authorize?client_id=${botId})`,
          "▸ **Server:** Created at [Weboardies™](https://discord.gg/d8pawxdSqG) - invitable anywhere!",
          "▸ **Developer:** Built for [Capybaras](https://en.wikipedia.org/wiki/Capybara) by [@mikroskato62](https://www.weboardies.com/mikroskato62).",
          "▸ **Architecture:** Modern [Node.js](https://nodejs.org) & [Discord.js](https://discord.js.org).",
          "▸ **APIs & Data:** Powered by [api.capy.lol](https://api.capy.lol/) & [unicode-emoji-json](https://www.npmjs.com/package/unicode-emoji-json).",
          "▸ **Hosting:** Online 24/7 with [Wispbyte](https://wispbyte.com/).",
          "▸ **License:** Open-source under the [ISC License](https://opensource.org/license/isc).",
          "▸ **Source Code:** View repository on [GitHub](https://github.com/mikroskato62/capy-discord-bot).",
          "▸ **Mission:** Spread smiles & wholesome energy to everyone worldwide ...",
        ]
        .join("\n"),
        inline: false,
      },
      {
        name: `|| ${CAPY_EMOJI_STRING} ||`,
        value: "\u200B",
        inline: true,
      },
    ],
    image: imageUrl ? { url: imageUrl } : undefined,
    footer: 
    {
      text: `* Command: /capyinfo • Capybara Bot v1.0.0 ...\n* Requested by @${user?.tag || user?.username || "User"} • Today at ${timeString} ...`,
    },
    color: getRandomColor(),
  };

  return { embeds: [embed], files: filesToSend };
}

module.exports = {
  capybaraResponses,
  getRandomColor,
  getRandomCapybaraIndex,
  getCapybaraData,
  getWebCapybaraData,
  getCapyInfoData,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Capybara Embed Data & Media Generators.
//   
