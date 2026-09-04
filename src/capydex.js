// @mikroskato62 - Capybara Discord Bot - Capydex Subsystem Bridge.
// Backward-compatibility bridge exposing the Capydex collection tracker and leaderboard.
// Import: const capydex = require("./capydex");

// [#1] Core dependencies & service bridge ...
const capydex = require("./services/capydex");

// [#2] Export unified capydex interface ...
module.exports = capydex;

// The end ...
// @mikroskato62 - Capybara Discord Bot - Capydex Subsystem Bridge.
//   
