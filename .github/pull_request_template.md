## 📌 Summary of Changes
Provide a clear and concise description of the changes introduced by this Pull Request:
- What does this PR do?
- Why is this change needed?

Closes #(issue number)

---

## 🔍 Type of Change
Please check the relevant option(s):
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality or a command)
- [ ] 📸 Gallery update (adding new copyright-safe capybara photos)
- [ ] 📝 Documentation update (improving guides, README, or instructions)
- [ ] ⚙️ Code refactoring / performance improvement
- [ ] 🧪 Tests / CI workflow update
- [ ] ➕ Other / Not listed above

---

## 🧪 Testing & Quality Checklist
Please verify that you have performed the following checks:
- [ ] **(Required)** Ran `npm test` locally and all automated tests passed successfully:
- [ ] If adding or modifying slash commands, updated `src/deploy-commands.js` schema and re-deployed.
- [ ] Checked for console warnings, unhandled Promise rejections, or Discord API errors.
- [ ] Tested changes interactively in a private Discord test server (if applicable).

---

## 📸 Photo Submissions Only *(Skip if not applicable)*
If this PR adds new capybara photos to the local gallery:
- [ ] Photos are compressed `.jpg` files under 100 KB each.
- [ ] Photos are CC0, Public Domain, or personally taken by the contributor.
- [ ] Added matching caption and image entry to `capybaraResponses` in [`src/index.js`](../src/index.js).
- [ ] Documented the photo in [`images/README.md`](../images/README.md).

---

## 🖼️ Visual Preview & Screenshots *(If applicable)*
Attach screenshots, GIF recordings, or Discord embed previews demonstrating the changes in action.
*(Tip: You can paste images directly into this textbox.)*

---

## 🤝 Contributor Agreement
- [ ] **(Required)** I agree that my contributions will be licensed under the project's [ISC License](../LICENSE).

---