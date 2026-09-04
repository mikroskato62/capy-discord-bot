// @mikroskato62 - Capybara Discord Bot - Client Ready Lifecycle Event.
// Executes on successful Discord gateway authentication: pool sync and rotating presence.
// Import: const readyEvent = require("./events/ready");

// [#1] Core dependencies & setups ...
const { Events, ActivityType } = require("discord.js");
const capydex = require("../services/capydex");

// [#2] Client ready event handler ...
function handleReady(client)
{
  console.log("[!] Capybara: Logged in on Discord as: ", client?.user?.tag, " ...");

  // Synchronize live web pool size:
  capydex.syncWebCapybarasTotal().catch((err) =>
  { console.warn("[!] Warning: Web capybara pool sync failed: ", err.message, " ..."); });

  // Rotating status presence list:
  const statuses = 
  [
    { name: "/capybaras /capyweb /capyinfo", type: ActivityType.Watching },
    { name: "/capybaras /capyweb /capyinfo", type: ActivityType.Listening },
    { name: "/capybaras /capyweb /capyinfo", type: ActivityType.Playing },
  ];
  let index = 0;
  if (client?.user) { client.user.setActivity(statuses[index].name, { type: statuses[index].type }); }

  // Rotate activity presence every hour:
  setInterval(() =>
  {
    if (!client?.user) { return; }
    index = (index + 1) % statuses.length;
    client.user.setActivity(statuses[index].name, { type: statuses[index].type });
  }, 1000 * 60 * 60);
}

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute: handleReady,
};

// The end ...
// @mikroskato62 - Capybara Discord Bot - Client Ready Lifecycle Event.
//   
