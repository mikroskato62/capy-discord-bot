---
name: "Bug Report"
about: "Report a bug, error, or unexpected behavior in Capybara Discord Bot"
title: "[BUG]: "
labels: ["bug"]
assignees: ["mikroskato62"]
---

### 📋 Pre-Submission Checklist
Please check the following before submitting:
- [ ] **(Required)** I have searched the [existing issues](https://github.com/mikroskato62/capy-discord-bot/issues) to ensure this is not a duplicate.
- [ ] **(Required)** I have verified that the bot has the required channel permissions (`Send Messages`, `Embed Links`, `Attach Files`, `Use External Emojis`).
- [ ] **(Required)** I confirm that this is a genuine bug report and not a joke, spam, or frivolous submission.
- [ ] **(Required if self-hosting)** I am running on Node.js >= 18.0.0 and have up-to-date dependencies (`npm install`).
- [ ] *(Optional)* I love capybaras!

---

### 🐛 Describe the Bug
A clear and concise description of what the bug is. What happened that was incorrect or unexpected?

### 🔄 Steps to Reproduce
Detailed steps to reproduce the behavior:
1. Run slash command `/...` (e.g., `/capybaras`, `/capyinfo`)
2. Click button / interaction `...` (if applicable)
3. See error or unexpected result: `...`

### 💡 Expected Behavior
A clear and concise description of what you expected to happen instead.

### 🖼️ Screenshots or Recordings
If applicable, paste or drag-and-drop screenshots or GIFs showing the issue (embed preview, button states, Discord error banners).
*(Tip: You can paste images directly into this textbox.)*

### 📝 Terminal Logs & Error Messages
If applicable, paste full terminal output, unhandled promise rejections, or Discord API error traces below:
```text
(paste terminal / console logs here)
```

### 💻 Environment Information

#### Discord Client (Where the bug was observed)
- **Client Type:** (e.g., Desktop App, Web Browser / Chrome, Mobile App)
- **Client OS:** (e.g., Windows 11, macOS Sonoma, iOS 17, Android 14)

#### Host Environment *(Only if self-hosting the bot)*
- **Bot Version / Branch:** (e.g., `v1.0.0`, `main` branch, or commit hash)
- **Host OS:** (e.g., Windows 11, Ubuntu 22.04 LTS, macOS, Docker)
- **Node.js Version:** (e.g., v18.20.0 — check with `node -v`)
- **Discord.js Version:** (e.g., 14.25.1 — check with `npm list discord.js`)

### ➕ Additional Context
Add any other relevant details or settings here (e.g., channel permission overrides, custom images added, network proxies, or rate limit occurrences).

---