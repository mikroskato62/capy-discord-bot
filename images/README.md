# 📸 Curated Capybara Image Gallery (`images/`)

Welcome to the local image repository for the Capybara Discord Bot. This directory contains the curated local photo collection that powers the `/capybaras` slash command, the capydex discovery engine, and offline fallback mechanisms.

---

## 🗂️ Gallery Catalog & Rarity

The collection consists of **25 curated images**, partitioned into standard images and rare bonus drops via weighted random selection.

| File | Caption / Bot Response | Type / Rarity | Drop Rate |
| :--- | :--- | :--- | :--- |
| [`main.jpg`](./main.jpg) | `( 🦫 ) This is a capybara ...` | Standard | ~4.27% |
| [`hello.jpg`](./hello.jpg) | `( 👋🏻 ) This capybara says hi :D` | Standard | ~4.27% |
| [`sleep.jpg`](./sleep.jpg) | `( 💤 ) This capybara is sleeping ...` | Standard | ~4.27% |
| [`game.jpg`](./game.jpg) | `( 🎮 ) This capybara is gaming !` | Standard | ~4.27% |
| [`bath.jpg`](./bath.jpg) | `( 💧 ) This capybara is bathing ...` | Standard | ~4.27% |
| [`cool.jpg`](./cool.jpg) | `( 😎 ) This capybara is cool !` | Standard | ~4.27% |
| [`home.jpg`](./home.jpg) | `( 🏠 ) These capybaras are home :(` | Standard | ~4.27% |
| [`eat.jpg`](./eat.jpg) | `( 🍪 ) This capybara is eating ...` | Standard | ~4.27% |
| [`gang.jpg`](./gang.jpg) | `( 👥 ) These capybaras are a gang !` | Standard | ~4.27% |
| [`family.jpg`](./family.jpg) | `( 👨‍👩‍👧‍👦 ) These capybaras are family :)` | Standard | ~4.27% |
| [`baby.jpg`](./baby.jpg) | `( 👶🏻 ) These capybaras are babies :)` | Standard | ~4.27% |
| [`read.jpg`](./read.jpg) | `( 📚 ) This capybara is reading ...` | Standard | ~4.27% |
| [`ai.jpg`](./ai.jpg) | `( 🤖 ) This capybara is AI :(` | Standard | ~4.27% |
| [`happy.jpg`](./happy.jpg) | `( 😀 ) This capybara is happy !` | Standard | ~4.27% |
| [`edited.jpg`](./edited.jpg) | `( 🔪 ) This capybara is edited :(` | Standard | ~4.27% |
| [`swim.jpg`](./swim.jpg) | `( 🥽 ) These capybaras are swimming ...` | Standard | ~4.27% |
| [`chill.jpg`](./chill.jpg) | `( 😎 ) These capybaras are chilling ...` | Standard | ~4.27% |
| [`toilet.jpg`](./toilet.jpg) | `( 🚽 ) This capybara is on the toilet ?` | Standard | ~4.27% |
| [`egg.jpg`](./egg.jpg) | `( 🥚 ) This capybara is an egg ?` | Standard | ~4.27% |
| [`black.jpg`](./black.jpg) | `( 🖤 ) This capybara is black ?` | Standard | ~4.27% |
| [`white.jpg`](./white.jpg) | `( 🤍 ) This capybara is white ?` | Standard | ~4.27% |
| [`red.jpg`](./red.jpg) | `( ❤️ ) This capybara is red ?` | Standard | ~4.27% |
| [`bonus1.jpg`](./bonus1.jpg) | `( 1️⃣ ) Bonus 1: photo by @mikroskato62 !!!` | **Bonus** | ~2.00% |
| [`bonus2.jpg`](./bonus2.jpg) | `( 2️⃣ ) Bonus 2: photo by @mikroskato62 !!!` | **Bonus** | ~2.00% |
| [`bonus3.jpg`](./bonus3.jpg) | `( 3️⃣ ) Bonus 3: photo by @mikroskato62 !!!` | **Bonus** | ~2.00% |

> **Weighted RNG Note:** When rolling `/capybaras`, standard images share a **94%** total probability pool, while the three rare bonus images share a **6%** total probability pool (~2% each). \
> **(API Fallback)**: If the remote `api.capy.lol` service encounters downtime during a `/capyweb` request, the bot catches the network error and automatically attaches `hello.jpg` to keep responses fluid.

---

## 📷 Sources & Attributions

### 1. Original Photography
* **`bonus1.jpg`**, **`bonus2.jpg`**, and **`bonus3.jpg`**:
  * **Photographer:** [@mikroskato62](https://github.com/mikroskato62)
  * **Location:** Attica Zoological Park, Greece
  * **Device:** Samsung Galaxy A50
  * **Year:** 2022
  * **License:** Contributed directly to this project for community use.

### 2. Public Archives & Community Curation
* **Standard Images (`main.jpg`, `hello.jpg`, etc.)**:
  * Curated from public web image archives, community meme repositories, and wallpaper platforms.
  * Selected for humor, distinct expressions, and personality traits to complement the Capydex collection mechanics.

---

## ⚙️ Technical Integration

* **Attachment Handling:** `src/index.js` resolves image files dynamically via `path.join(__dirname, "..", "images", filename)` and embeds them safely into Discord message payloads via `AttachmentBuilder`.
* **API Resiliency & Fallback:** `images/hello.jpg` is the designated offline fallback image. If the remote `api.capy.lol` service encounters downtime during a `/capyweb` request, the bot catches the network error and automatically attaches `hello.jpg` to keep responses fluid.
* **Storage Footprint:** All images are kept compressed in lightweight standard formats (ranging ~8 KB to ~250 KB) to ensure rapid uploads within Discord's CDN limitations.

---

## ➕ Adding New Images

To expand the local capybara roster:

1. Place your `.jpg` image into this `images/` directory using lowercase alphanumeric naming (e.g. `poopy.jpg`).
2. Register the image in [`src/index.js`](../src/index.js) within the `capybaraResponses` array:
   ```javascript
   { text: "( 💩 )  A capybara ...", image: "poopy.jpg" },
   ```
3. Run test verification to ensure integrity:
   ```bash
   npm test
   ```

---

## ⚖️ Legal & Copyright Notice

All media in this directory is utilized strictly for non-commercial community, entertainment, and educational purposes under fair use. If you are a copyright owner of any curated image and would like it credited differently or removed, please open an issue on the [GitHub repository](https://github.com/mikroskato62/capy-discord-bot) or contact the project maintainers via DM on [Discord](https://discord.gg/d8pawxdSqG).
