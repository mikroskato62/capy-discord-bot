# 📋 Capybara Bot — Roadmap & Future Ideas (TODO)

This document contains exciting ideas and feature additions for the **Capybara Discord Bot**, ordered progressively from the **easiest (1/10)** to the **most advanced (10/10)**.

Each idea includes a description of what it does, why it's cool, and step-by-step guidance on how to implement it.

---

## 🧭 Difficulty Matrix (1 to 10)

| Difficulty | Feature | Category | Description |
| :---: | :--- | :--- | :--- |
| **1/10** | **Rotating Bot Status / Presence** ✅ | Aesthetics | Rotating activities like *"Watching capybaras bathe"* |
| **2/10** | **`/capyinfo` Command & Roadmap** ✅ | Information / UI | Styled embed covering About, Features, and Roadmap |
| **2/10** | **`/capyfacts` Slash Command** | Content | Random fun facts about capybaras |
| **3/10** | **Image Index / Counter in Embed** ✅ | UI / Polish | Displays `Capybara #5 of 23` in the embed footer |
| **4/10** | **Command Cooldowns (Anti-Spam)** ✅ | Safety / Stability | 1 second cooldown per user to prevent rate limits |
| **5/10** | **`/capyrate` (Capybara Rating)** | Fun / Social | Rates how much of a capybara a user is (0–100%) |
| **6/10** | **Global Slash Commands & Multi-Server** ✅ | Architecture | Deploy commands globally across all Discord servers |
| **7/10** | **Capybara Daily Streaks (`/daily`)** | Retention / Gamification | Daily capybara roll with streak counters saved to file |
| **8/10** | **Online API Integration (Infinite Capys)** ✅ | Dynamic Content | Fetch random photos from live Capybara APIs (`/capyweb`) |
| **9/10** | **Modular Command & Event Handler** | Architecture | Split `index.js` into clean `commands/` and `events/` files |
| **10/10** | **Dynamic Meme Generator (Canvas Text)** | Graphics / Advanced | Overlay custom user text onto capybara images on-the-fly |

---

## 🌟 Detailed Breakdown & Implementation Guides

---

### 🟢 1/10 — Rotating Bot Status / Activity Presence ✅ (Completed)

#### 📖 What is it?
Allows the bot to cycle through funny custom status messages in Discord (e.g., *"Watching capybaras bathe 🛁"*, *"Listening to /capybaras"*, *"Eating watermelon 🍉"*).

#### 🛠️ How to implement:
1. In [`index.js`](./index.js), inside the `Events.ClientReady` event handler, define an array of activities.
2. Use `setInterval` to cycle through the activities every few minutes using `client.user.setActivity()`.

```javascript
const { ActivityType } = require("discord.js");

client.once(Events.ClientReady, () => {
  console.log(`[!] Logged in as ${client.user.tag}`);

  const statuses = [
    { name: "capybaras chillin' <:capybara:1396104539538460683>", type: ActivityType.Watching },
    { name: "/capybaras for cuteness", type: ActivityType.Listening },
    { name: "with watermelons 🍉", type: ActivityType.Playing },
  ];

  let index = 0;
  setInterval(() => {
    client.user.setActivity(statuses[index].name, { type: statuses[index].type });
    index = (index + 1) % statuses.length;
  }, 60000); // changes every 60 seconds
});
```

---

### 🟢 2/10 — `/capyfacts` Slash Command

#### 📖 What is it?
A brand new slash command that teaches server members fascinating real-world facts about capybaras (e.g., *"Capybaras can sleep underwater with only their noses poking out!"*).

#### 🛠️ How to implement:
1. Add an array of facts in [`index.js`](./index.js).
2. Register the `/capyfacts` command in the `commands` array.
3. Handle `interaction.commandName === "capyfacts"` in `InteractionCreate`.

```javascript
// 1. Add to commands list:
new SlashCommandBuilder()
  .setName("capyfacts")
  .setDescription("Get a random capybara fact! 📚")

// 2. Add facts data:
const capyFacts = [
  "Capybaras are the largest living rodents in the world!",
  "Capybaras are semi-aquatic and can hold their breath underwater for up to 5 minutes.",
  "Other animals frequently use capybaras as living chairs and lounges.",
  "Their teeth grow continuously throughout their entire life!",
  "They are native to South America and live in groups of 10 to 40."
];

// 3. Handle command:
if (interaction.commandName === "capyfacts") {
  const randomFact = capyFacts[Math.floor(Math.random() * capyFacts.length)];
  await interaction.reply({
    embeds: [{
      title: "<:capybara:1396104539538460683> Did you know?",
      description: randomFact,
      color: 0x8D5524,
      footer: { text: `Requested by @${interaction.user.tag}` }
    }]
  });
}
```

---

### 🟢 3/10 — Image Index / Counter in Embed ✅ (Completed)

#### 📖 What is it?
Shows which exact photo number was drawn out of the total pool (e.g. `[Capybara #7/23]`), making it fun for users to "collect" and recognize all the variations.

#### 🛠️ How to implement:
1. Update `getCapybaraData(user)` in [`index.js`](./index.js) to pick an index `randomIndex` rather than just a direct random element.
2. Include the index in the embed footer: `footer: { text: `[ #${randomIndex + 1}/${capybaraResponses.length} ] Requested by @${user.tag}` }`.

---

### 🟢 4/10 — Command Cooldowns (Anti-Spam Protection) ✅ (Completed)

#### 📖 What is it?
Prevents users from spamming `/capybaras` or clicking the buttons 50 times in a second, avoiding Discord API rate limits (`429 Too Many Requests`).

#### 🛠️ How to implement:
1. Create a `cooldowns` map (`const cooldowns = new Map();`).
2. When a command or button is received, check `cooldowns.get(interaction.user.id)`.
3. If `< 1 second`, respond with an ephemeral message: *"Please wait a moment before asking for more capybaras!"*.
4. Otherwise, set `cooldowns.set(interaction.user.id, Date.now())`.

---

### 🟡 5/10 — `/capyrate` (Capybara Personality Meter)

#### 📖 What is it?
A fun social command where users can rate themselves or a friend: `/capyrate user:@Friend`. The bot returns a percentage from 0% to 100% with a humorous analysis of how chill/capybara-like they are today.

#### 🛠️ How to implement:
1. Define `/capyrate` using `.addUserOption()` on `SlashCommandBuilder`.
2. Generate a percentage `const score = Math.floor(Math.random() * 101);`.
3. Select an evaluation based on the score tier (e.g., `<30%`: *"Too stressed, needs a hot bath ♨️"*, `>90%`: *"Maximum chill achieved. Truly a master capybara 🧘‍♂️"*).
4. Send as a colorful embed.

---

### 🟠 6/10 — Global Slash Commands (Multi-Server Support) ✅ (Completed)

#### 📖 What is it?
Currently, commands are registered to a single server via `Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)`. Switching to global commands allows the bot to work across any server it gets invited to.

#### 🛠️ How to implement:
1. Change the REST deployment endpoint in [`index.js`](./index.js) from `Routes.applicationGuildCommands(...)` to `Routes.applicationCommands(process.env.CLIENT_ID)`.
2. Remove `GUILD_ID` dependency from [`.env`](./.env).
3. *(Note: Global commands can take up to a few minutes to replicate across Discord's CDN).*

---

### 🟠 7/10 — Daily Capybara Streaks (`/daily`)

#### 📖 What is it?
Users can run `/daily` once every 24 hours to claim their daily capybara photo and build an uninterrupted streak counter (e.g. *"🔥 5 Day Streak!"*).

#### 🛠️ How to implement:
1. Use a lightweight local JSON file (`data/users.json`) or a fast embedded database like `better-sqlite3` or `quickdb`.
2. Record `userId`, `lastClaimDate`, and `streakCount`.
3. When `/daily` is called:
   - Check if 24 hours have passed since `lastClaimDate`.
   - If consecutive day: increment `streakCount`.
   - If missed day: reset `streakCount = 1`.
   - If already claimed today: show hours remaining.

---

### 🔴 8/10 — Live Capybara API Integration (Infinite Photos) ✅ (Completed)

#### 📖 What is it?
Instead of relying solely on local image files, the bot can fetch infinite high-res capybara images and GIFs from open APIs (e.g., `https://api.capy.lol/v1/capybara` or custom web endpoints) with local assets as an offline fallback. Implemented via the `/capyweb` slash command with automatic fallback and interactive buttons!

#### 🛠️ How to implement:
1. Use Node.js native `fetch()` to call the external API endpoint.
2. Extract the image URL and format the embed `image: { url: apiImageUrl }`.
3. Wrap with a `try / catch` fallback to load from local [`images/`](./images/) if the network request fails or times out.

---

### 🔴 9/10 — Modular Command & Event Handler Architecture

#### 📖 What is it?
Refactoring the bot so that each slash command and event listener is in its own separate file rather than having all logic bundled inside a single [`index.js`](./index.js).

#### 🛠️ Proposed Folder Structure:
```text
discord-bot/
├── src/
│   ├── commands/
│   │   ├── capybaras.js
│   │   ├── capyfacts.js
│   │   └── capyrate.js
│   ├── events/
│   │   ├── ready.js
│   │   └── interactionCreate.js
│   ├── utils/
│   │   └── capybaraHelper.js
│   └── index.js
├── images/
├── .env
└── package.json
```

#### 🛠️ How to implement:
1. Create a `Collection` on `client.commands = new Collection()`.
2. Read all files from `src/commands/` dynamically using Node `fs.readdirSync`.
3. In `interactionCreate`, dynamically fetch and execute `client.commands.get(interaction.commandName).execute(interaction)`.

---

### 🟣 10/10 — Dynamic Meme Generator (Custom Image Canvas)

#### 📖 What is it?
A `/capymeme text:"When the code works on the first try"` command that dynamically draws user-provided text directly on top of capybara pictures using canvas graphics and returns the freshly generated image!

#### 🛠️ How to implement:
1. Install `@napi-rs/canvas` or `canvas` via `npm install @napi-rs/canvas`.
2. Load a base capybara image onto a canvas buffer.
3. Draw custom Impact/Arial font with black borders (`strokeText`) and white fill (`fillText`).
4. Convert canvas to a Buffer: `canvas.toBuffer('image/png')`.
5. Attach the resulting buffer via `new AttachmentBuilder(buffer, { name: 'meme.png' })` and send in response!

---

## 💡 Quick Tips for Development
- Always test new commands in a test Discord channel.
- Keep [`.env`](./.env) tokens private and never commit them to public repositories.
- Use `npm install` when adding new packages (e.g. `@napi-rs/canvas` or `better-sqlite3`).
