# 🤝 Contributing to Capybara Discord Bot

First off, thank you for considering contributing to the **Capybara Discord Bot**! Just like capybaras naturally chill with all creatures in the wild, we welcome everyone with open arms. Whether you are an experienced JavaScript developer, a beginner opening your very first pull request, a photographer with wholesome capybara pictures, or a Discord user with a creative feature suggestion - your contributions make this project better for everyone!

---

## 📌 Table of Contents

&nbsp;1. [Community & Getting Help](#community--getting-help) \
&nbsp;2. [Code of Conduct & Values](#code-of-conduct--values) \
&nbsp;3. [Ways You Can Contribute](#ways-you-can-contribute) \
&nbsp;4. [Local Development Setup](#local-development-setup) \
&nbsp;5. [Code Style & Architecture Guidelines](#code-style--architecture-guidelines) \
&nbsp;6. [Contributing Capybara Photos](#contributing-capybara-photos) \
&nbsp;7. [Submitting a Pull Request](#submitting-a-pull-request) \
&nbsp;8. [Reporting Security Issues](#reporting-security-issues)

---

## 💬 Community & Getting Help

Have questions, want feedback on an idea, or just want to chat with fellow capybara enthusiasts? \
&nbsp;• &nbsp; Join our friendly community on the **[Weboardies™ Discord Server](https://discord.gg/d8pawxdSqG)**. \
&nbsp;• &nbsp; Check out existing discussions or open an issue on the [GitHub Issues](https://github.com/mikroskato62/capy-discord-bot/issues) page.

---

## 🌿 Code of Conduct & Values

We strive to maintain a warm, welcoming, and inclusive environment. Please read our full **[Code of Conduct](CODE_OF_CONDUCT.md)** for our complete community guidelines. \
&nbsp;• &nbsp; **Be Kind & Respectful:** Treat everyone with patience and empathy. Constructive, friendly communication is key. \
&nbsp;• &nbsp; **Embrace the Capybara Way:** Stay relaxed, collaborate openly, and help each other learn and grow. \
&nbsp;• &nbsp; **Constructive Feedback:** When reviewing code or suggestions, focus on the work, provide helpful reasoning, and celebrate successes.

---

## 💡 Ways You Can Contribute

### 1. 🐛 Reporting Bugs
Found something broken or unexpected? \
&nbsp;• &nbsp; Check the [Issues tab](https://github.com/mikroskato62/capy-discord-bot/issues) to ensure it hasn't already been reported. \
&nbsp;• &nbsp; If not, create a new issue using our **[Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)**. \
&nbsp;• &nbsp; Please include steps to reproduce, console errors, and your operating system / Node.js version.

### 2. 🌟 Suggesting Features
Have an idea that would make the bot even more delightful? \
&nbsp;• &nbsp; Check [GitHub Issues](https://github.com/mikroskato62/capy-discord-bot/issues) to see planned features and ongoing discussions. \
&nbsp;• &nbsp; Open an issue using our **[Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)** to share your idea with the community.

### 3. 📸 Submitting Capybara Photos
Have a great capybara picture? \
&nbsp;• &nbsp; You don't need to write code to contribute photos! \
&nbsp;• &nbsp; Submit an issue using our **[Photo Submission Template](.github/ISSUE_TEMPLATE/photo_submission.md)** or follow the [Contributing Capybara Photos](#contributing-capybara-photos) guide below.

### 4. 💻 Writing Code & Improving Documentation
Are you familiar with JavaScript or know good English? \
&nbsp;• &nbsp; Pick up any unassigned open issues or propose an enhancement. \
&nbsp;• &nbsp; Polish documentation, fix typos, or enhance test coverage.

---

## 🛠️ Local Development Setup

Follow these steps to get a complete local development environment running on your computer.

### Prerequisites
&nbsp;• &nbsp; **Node.js:** `>= 18.0.0` (LTS recommended) \
&nbsp;• &nbsp; **npm:** `>= 9.0.0` \
&nbsp;• &nbsp; **Git** (& GitHub Account) \
&nbsp;• &nbsp; **Discord** (Account & Server)

### Step 1: Fork & Clone
```bash
git clone https://github.com/your-username/capy-discord-bot.git
cd capy-discord-bot
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env     # Linux / macOS / PowerShell
copy .env.example .env   # Windows (cmd.exe)
```
Fill in your bot credentials from the [Discord Developer Portal](https://discord.com/developers/applications):
```env
TOKEN=your_development_bot_token_here
CLIENT_ID=your_development_client_id_here
GUILD_ID=your_test_server_id_here
CUSTOM_EMOJI_ID=your_custom_bot_emoji_id_here
```

> [!TIP]
> **Important Development Tip:** Always use a dedicated **Development Bot** for local testing, never the production bot token. For complete step-by-step guidance on setting up test servers and dev bots, check out [`TESTING.md`](./TESTING.md).

### Step 4: Deploy Slash Commands
Before running new or modified commands, register them with Discord:
```bash
npm run deploy
```

### Step 5: Run the Automated Test Suite
Ensure all existing automated smoke tests pass:
```bash
npm test
```

### Step 6: Start the Bot
```bash
npm start
```

### Step 7: Check Discord
Try using your bot on Discord to see if it works as expected.

---

## 📐 Code Style & Architecture Guidelines

To keep the codebase maintainable, fast, and stable, please adhere to the following best practices:

* **Modern JavaScript:** Use ES2022+ features (`async`/`await`, optional chaining `?.`, nullish coalescing `??`, arrow functions).
* **Discord.js v14 Standards:**
  * **Defer Long Operations:** If a command or button handler interacts with external APIs (like `fetch()`), always call `interaction.deferReply()` or `interaction.deferUpdate()` to prevent Discord's 3-second timeout error (`10062`).
  * **Author-Only Button Security:** Ensure interactive action buttons verify ownership (`userId` match) and reply with ephemeral guidance if clicked by another user.
  * **Graceful Degradation:** Use fallbacks (e.g. standard Unicode emojis like `🦫` if custom emoji IDs are unavailable; local images if external APIs go down).
* **Test First:** Whenever adding new commands or core utility functions, add corresponding unit and smoke test assertions to [`tests/capytest.js`](./tests/capytest.js).

---

## 📸 Contributing Capybara Photos

We love expanding our curated local photo gallery in `images/`!

### Photo Requirements:
1. **Subject Matter:** The photo must prominently and respectfully feature capybaras in a wholesome, relaxing, or funny context.
2. **File Specs:**
   * Format: `.jpg` (preferably).
   * Size: Under **100 KB** (compress using tools like TinyJPG or Squoosh so Discord mobile loads it instantly).
   * Clear focus and good lighting.
3. **Licensing & Copyright:**
   * Only submit photos that you took yourself or that are licensed under **CC0 / Public Domain / Royalty-Free Creative Commons**.
   * **No copyrighted watermarks, stock photos, or uncredited copyrighted work.**

### Steps to Add Locally:
1. Save your compressed photo in the `images/` directory with a clean filename (e.g. `images/watermelon.jpg`).
2. Add an entry to `capybaraResponses` inside [`src/index.js`](./src/index.js) with a caption and image filename:
   ```javascript
   { text: "( 💩 )  A capybara ...", image: "poop.jpg" },
   ```
3. Document the photo and its license in [`images/README.md`](./images/README.md).
4. Run `npm test` to verify gallery integrity.

---

## 🚀 Submitting a Pull Request

Ready to share your work? Follow these steps:

1. **Create a descriptive feature branch:**
   ```bash
   git checkout -b feat/add-capyrate-command
   ```
   *(Use prefixes like `feat/`, `fix/`, `docs/`, `test/`, or `refactor/`)*.

2. **Format and clean your code:** Keep code concise, readable, and well-commented.

3. **Run tests before pushing:**
   ```bash
   npm test
   ```
   Ensure all 12 stages in [`tests/capytest.js`](./tests/capytest.js) pass with zero errors.

4. **Commit your changes:**
   Use clear, conventional commit messages:
   ```bash
   git commit -m "feat: implement /capyrate command with personality ratings"
   ```

5. **Push to your fork and submit a PR:**
   * Open a Pull Request targeting the `main` branch.
   * Fill out the checklist in [`.github/pull_request_template.md`](.github/pull_request_template.md).
   * Link any related issues (e.g. `Closes #12`).

We will review your PR as quickly as possible, provide encouraging and constructive feedback, and merge once ready!

---

## 🔒 Reporting Security Issues

Please **do not** open public GitHub issues for security vulnerabilities. \
Review our [Security Policy](SECURITY.md) for instructions on how to privately and responsibly disclose vulnerabilities.

---

<div align="center">
  <sub>Built with ❤️ for 🦫 by @mikroskato62</sub>
</div>
