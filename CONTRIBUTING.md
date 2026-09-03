# 🤝 Contributing to Capybara Discord Bot

Thank you for your interest in making the **Capybara Discord Bot** even more wholesome and delightful! We welcome contributions of all kinds—from code improvements and bug reports to new capybara photos and feature ideas.

---

## 📌 Community & Questions

Join the **[Weboardies™ Discord Server](https://discord.gg/d8pawxdSqG)** to discuss ideas, test new features, or hang out with fellow capybara fans!

---

## 🛠️ Local Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/capy-discord-bot.git
   cd capy-discord-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Discord bot `TOKEN` and `CLIENT_ID` from the [Discord Developer Portal](https://discord.com/developers/applications).

4. **Deploy slash commands to Discord:**
   ```bash
   npm run deploy
   ```

5. **Run the test suite:**
   ```bash
   npm test
   ```

6. **Start the bot locally:**
   ```bash
   npm start
   ```

---

## 📸 Contributing New Capybara Photos

We love adding new photos to the curated local gallery (`images/`):
* **Format:** Compressed `.jpg` or `.jpeg` (keep file size under 100 KB to ensure fast Discord delivery).
* **Copyright:** Only submit photos that you personally took, or that are licensed under **CC0 / Public Domain / Royalty-Free Creative Commons**.
* **Adding to Code:**
  1. Place your image in the `images/` directory.
  2. Add an entry into `capybaraResponses` inside [`index.js`](./index.js) with a short, fun caption and matching emoji.
  3. Run `npm test` to ensure tests pass.

---

## 🚀 Proposing Features & Commands

Check out [`TODO.md`](./TODO.md) to see existing roadmap items (such as `/capyfacts`, `/capyrate`, or `/daily`).
* Feel free to pick up an open task from `TODO.md` and submit a Pull Request!
* For major changes, please open an Issue first to discuss the implementation details.

---

## 📝 Pull Request Guidelines

1. Create a descriptive feature branch (`git checkout -b feature/my-cool-feature`).
2. Keep code formatted and clean.
3. Ensure all automated tests pass before opening a PR:
   ```bash
   npm test
   ```
4. Commit your changes with clear, meaningful commit messages.
5. Push to your fork and submit a Pull Request to the `main` branch.
