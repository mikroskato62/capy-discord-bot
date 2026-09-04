// @mikroskato62 - Capybara Discord Bot - Global Configuration & Environment Settings.
// Centralizes environment variables, directory paths, default constants, and emoji configs.
// Import: const config = require("./config");

// [#1] Core dependencies & environment setups ...
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env"), quiet: true });

// [#2] Configurable custom emoji & display strings ...
const CUSTOM_EMOJI_ID = process.env.CUSTOM_EMOJI_ID ? process.env.CUSTOM_EMOJI_ID.trim() : null;
const DEFAULT_CAPY_EMOJI = "🦫";
const CAPY_EMOJI_STRING = CUSTOM_EMOJI_ID ? `<:capybara:${CUSTOM_EMOJI_ID}>` : DEFAULT_CAPY_EMOJI;

// [#3] Persistent filesystem directories & data paths ...
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const CAPYDATA_FILE = path.join(DATA_DIR, "capydata.json");
const LEGACY_CAPYDEX_FILE = path.join(DATA_DIR, "capydex.json");
const IMAGES_DIR = path.join(__dirname, "..", "..", "images");
const ASSETS_DIR = path.join(__dirname, "..", "..", "assets");
const LOGO_PATH = path.join(ASSETS_DIR, "logo.png");

// [#4] Subsystem default constants & timers ...
const DEFAULT_WEB_TOTAL = 747;
const COOLDOWN_DURATION = 1000;

module.exports = {
  CUSTOM_EMOJI_ID,
  DEFAULT_CAPY_EMOJI,
  CAPY_EMOJI_STRING,
  DATA_DIR,
  CAPYDATA_FILE,
  LEGACY_CAPYDEX_FILE,
  IMAGES_DIR,
  ASSETS_DIR,
  LOGO_PATH,
  DEFAULT_WEB_TOTAL,
  COOLDOWN_DURATION,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Global Configuration & Environment Settings.
//   
