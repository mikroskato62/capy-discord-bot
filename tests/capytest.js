// [!] Capybara Discord Bot — Comprehensive Test Suite ...
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  ButtonStyle,
  Collection,
} = require('discord.js');


// Import real production slash command definitions directly from deploy-commands.js:
const { commands: deployedCommands } = require('../src/deploy-commands.js');

// Import real production functions and data from index.js:
const {
  capybaraResponses,
  getRandomColor,
  getRandomCapybaraIndex,
  getCapybaraData,
  getWebCapybaraData,
  getCapyInfoData,
  getRandomReactionEmoji,
  getCooldownRemaining,
  setCooldown,
  createCapybaraButtonRow,
  createCapywebButtonRow,
  createCapyinfoButtonRow,
  getActionOwnerId,
  capydex,
} = require('../src/index.js');

const TEST_STORAGE_FILE = path.join(__dirname, 'test-capydex.json');

(async () => {
  try {
    console.log('[*] Running Capybara Bot Test Suite...\n');

    // Isolate collection storage to temporary test file:
    capydex.initStorage(TEST_STORAGE_FILE);

    // 1. Check if all required core branding assets exist and are non-empty
    console.log('[*] Test 1: Verifying core branding assets...');
    const requiredAssets = [
      './assets/banner.png',
      './assets/logo.png',
      './assets/background.png',
      './assets/emoji.svg',
      './assets/capybara.png',
    ];
    for (const asset of requiredAssets) {
      assert(fs.existsSync(asset), `Asset should exist: ${asset}`);
      const stats = fs.statSync(asset);
      assert(stats.size > 1000, `Asset must be valid and non-empty (>1KB): ${asset} (got ${stats.size} bytes)`);
    }
    console.log(`[+] Assets verified successfully: ${requiredAssets.length} branding files validated.`);

    // 2. Check images directory, file integrity, captions & offline fallback image
    console.log('\n[*] Test 2: Verifying curated images gallery & file integrity...');
    assert(fs.existsSync('./images'), 'Images directory should exist');
    const imageFiles = fs.readdirSync('./images').filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
    assert(imageFiles.length >= 20, `Images directory should contain at least 20 images, found: ${imageFiles.length}`);
    assert.strictEqual(capybaraResponses.length, imageFiles.length, 'capybaraResponses in index.js should match image count in images/');

    // Verify every single image referenced in capybaraResponses exists on disk and is non-empty:
    for (let i = 0; i < capybaraResponses.length; i++) {
      const resp = capybaraResponses[i];
      assert(resp.text && typeof resp.text === 'string' && resp.text.length > 5, `Item #${i + 1} must have a valid caption`);
      assert(resp.image && typeof resp.image === 'string', `Item #${i + 1} must specify an image file`);
      const imgPath = path.join('./images', resp.image);
      assert(fs.existsSync(imgPath), `Referenced image must exist on disk: ${resp.image}`);
      const stat = fs.statSync(imgPath);
      assert(stat.size > 1000, `Image ${resp.image} must be a valid image (>1KB, got ${stat.size} bytes)`);
    }

    // Verify offline fallback image exists:
    const fallbackImage = fs.existsSync(path.join('./images', 'hello.png')) ? 'hello.png' : 'hello.jpg';
    assert(fs.existsSync(path.join('./images', fallbackImage)), 'Offline fallback image must exist in images/');

    console.log(`[+] Local images gallery verified: all ${imageFiles.length} curated images verified with valid byte sizes and captions.`);

    // 3. Test Discord.js Slash Command Definitions (Directly from deploy-commands.js)
    console.log('\n[*] Test 3: Verifying slash command definitions & deployment schema...');
    assert(Array.isArray(deployedCommands), 'deployedCommands should be an array exported from deploy-commands.js');
    assert.strictEqual(deployedCommands.length, 3, 'There should be exactly 3 global slash commands registered');

    const expectedCommandNames = ['capybaras', 'capyweb', 'capyinfo'];
    const actualCommandNames = deployedCommands.map(c => c.name);
    assert.deepStrictEqual(actualCommandNames, expectedCommandNames, 'Command names should match expected schema');

    for (const cmd of deployedCommands) {
      assert(cmd.name && cmd.name.length > 0, 'Command must have a valid name');
      assert(cmd.description && cmd.description.length > 5, `Command /${cmd.name} must have a descriptive description`);
      assert(!cmd.options || Array.isArray(cmd.options), `Command /${cmd.name} options must be an array if present`);
      assert(Array.isArray(cmd.integration_types) && cmd.integration_types.includes(1), `Command /${cmd.name} must support UserInstall (integration_type 1)`);
      assert(Array.isArray(cmd.contexts) && cmd.contexts.includes(2), `Command /${cmd.name} must support PrivateChannel (context 2)`);
    }
    console.log('[+] Commands array validated directly from deploy-commands.js:', deployedCommands.map(c => `/${c.name}`).join(', '));
    console.log('[+] UserInstall & PrivateChannel DM contexts validated for all commands');

    // 4. Test Real Production getCapyInfoData, getCapybaraData & Anti-Spam Cooldowns
    console.log('\n[*] Test 4: Testing real production embed generators & anti-spam cooldowns...');
    const mockClient = {
      user: {
        id: '123456789012345678',
        displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/0.png',
        tag: 'CapybaraBot#0000',
      },
    };

    const mockUser = { tag: 'Tester#1234', id: '111222333' };

    // Test getRandomColor:
    const sampleColor = getRandomColor();
    assert(typeof sampleColor === 'number' && sampleColor >= 0 && sampleColor <= 0xFFFFFF, 'getRandomColor must return valid hex int');

    // Test real getCapyInfoData:
    const infoData = getCapyInfoData(mockUser, mockClient);
    assert(infoData.embeds && infoData.embeds.length === 1, 'Should have 1 embed');
    const infoEmbed = infoData.embeds[0];
    assert(infoEmbed.fields.length >= 3, 'Should have at least 3 sections in fields');
    assert(infoEmbed.fields.some(f => f.value.includes(mockClient.user.id)), 'Dynamic client.user.id should be present in OAuth link');
    assert(infoEmbed.footer.text.includes('/capyinfo'), 'Footer should mention /capyinfo');
    assert(infoData.files.length === 1, 'Logo attachment should be included');

    // Test real getCapybaraData:
    const capyData = getCapybaraData(mockUser, mockClient);
    assert(capyData.embeds && capyData.embeds.length === 1, 'Should have 1 embed');
    const capyEmbed = capyData.embeds[0];
    assert(capyEmbed.footer.text.includes('/capybaras'), 'Footer should mention /capybaras');
    assert(capyEmbed.footer.text.includes('Collection:'), 'Footer should include collection tracker progress');
    assert(capyData.files.length === 1, 'Local photo attachment should be included');

    // Test Anti-Spam Cooldown Logic:
    const cooldownTestUser = 'user_cooldown_test_999';
    assert.strictEqual(getCooldownRemaining(cooldownTestUser), 0, 'New user should have 0ms cooldown');
    setCooldown(cooldownTestUser);
    const remainingMs = getCooldownRemaining(cooldownTestUser);
    assert(remainingMs > 0 && remainingMs <= 1000, `Active cooldown must be between 1ms and 1000ms, got: ${remainingMs}`);

    console.log('[+] Real embed data generators & anti-spam cooldown mechanics verified.');

    // 5. Test Real Button Action Rows & Author-Only Security across all branches
    console.log('\n[*] Test 5: Testing real Button Action Rows and Author-Only logic...');
    const testUserId = '999888777';

    // Test button creation with user ID embedding:
    const capyRow = createCapybaraButtonRow(testUserId);
    const capyRowJson = capyRow.toJSON();
    assert.strictEqual(capyRowJson.components.length, 5, 'Should have 5 buttons in the capybaras action row');
    assert(capyRowJson.components[0].custom_id.includes(testUserId), 'Custom ID should encode target user ID');
    assert(capyRowJson.components[1].custom_id.startsWith('capydex_view'), 'Button 2 must be Capydex');
    assert.strictEqual(capyRowJson.components[1].style, ButtonStyle.Success, 'Capydex button should be Success (green)');
    assert(capyRowJson.components[2].custom_id.startsWith('capybara_react'), 'Button 3 must be Reaction');
    assert.strictEqual(capyRowJson.components[2].style, ButtonStyle.Secondary, 'Reaction button should be Secondary (grey)');
    assert(capyRowJson.components[3].custom_id.startsWith('capyleaderboard_view'), 'Button 4 must be Leaderboard');
    assert.strictEqual(capyRowJson.components[3].style, ButtonStyle.Success, 'Leaderboard button should be Success (green)');
    assert(capyRowJson.components[4].custom_id.startsWith('capybara_leave'), 'Button 5 must be Leave');
    assert.strictEqual(capyRowJson.components[4].style, ButtonStyle.Danger, 'Leave button should be Danger (red)');

    const webRowJson = createCapywebButtonRow(testUserId).toJSON();
    assert.strictEqual(webRowJson.components.length, 5, 'Capyweb row should have 5 buttons');
    assert(webRowJson.components[1].custom_id.startsWith('capydex_view'), 'Capyweb button 2 must be Capydex');
    assert(webRowJson.components[3].custom_id.startsWith('capyleaderboard_view'), 'Capyweb button 4 must be Leaderboard');

    const infoRowJson = createCapyinfoButtonRow(testUserId).toJSON();
    assert.strictEqual(infoRowJson.components.length, 5, 'Capyinfo row should have 5 buttons');
    assert(infoRowJson.components[1].custom_id.startsWith('capydex_view'), 'Capyinfo button 2 must be Capydex');
    assert(infoRowJson.components[3].custom_id.startsWith('capyleaderboard_view'), 'Capyinfo button 4 must be Leaderboard');

    // Test getActionOwnerId across all fallback branches:
    // Branch 1: customId suffix (:userId)
    assert.strictEqual(getActionOwnerId({ customId: `capybara_next:${testUserId}` }), testUserId);
    // Branch 2: modern interactionMetadata
    assert.strictEqual(getActionOwnerId({
      customId: 'capybara_next',
      message: { interactionMetadata: { user: { id: testUserId } } }
    }), testUserId);
    // Branch 3: legacy interaction.user.id
    assert.strictEqual(getActionOwnerId({
      customId: 'capybara_next',
      message: { interaction: { user: { id: testUserId } } }
    }), testUserId);
    // Branch 4: no owner
    assert.strictEqual(getActionOwnerId({}), null);

    console.log('[+] Button Action Rows & Author-Only guard validated successfully across all fallback branches.');

    // 6. Test Unicode Emoji Library & Random Reaction Generator with Exclusion
    console.log('\n[*] Test 6: Verifying unicode-emoji-json and reaction generator with exclusion...');
    const emojiData = require("unicode-emoji-json");
    assert(Object.keys(emojiData).length > 1000, 'unicode-emoji-json should contain over 1000 emojis');

    const randomEmoji = getRandomReactionEmoji(mockClient);
    assert(randomEmoji && typeof randomEmoji === 'string', 'Should return a valid emoji string');

    // Test exclusion set:
    const excluded = new Set(['😀', '😃', '😄', '😁']);
    const nonExcludedEmoji = getRandomReactionEmoji(mockClient, excluded);
    assert(nonExcludedEmoji && typeof nonExcludedEmoji === 'string', 'Should return emoji when excludedSet is provided');
    assert(!excluded.has(nonExcludedEmoji), 'Selected emoji must not be in the excluded set');

    // Test with mock guild emojis in cache:
    const mockClientWithGuild = {
      emojis: {
        cache: new Collection([
          ['1234567890', { id: '1234567890', available: true }],
        ]),
      },
    };
    const emojiWithGuild = getRandomReactionEmoji(mockClientWithGuild);
    assert(emojiWithGuild && typeof emojiWithGuild === 'string', 'Reaction generator handles guild emojis safely');

    console.log(`[+] Emoji database verified (${Object.keys(emojiData).length} emojis) with exclusion & guild emoji support.`);

    // 7. Test Live /capyweb API fetcher & Offline Fallback Resilience
    console.log('\n[*] Test 7: Testing live /capyweb API fetcher & offline fallback resilience...');
    
    // A. Live API test:
    const webData = await getWebCapybaraData(mockUser, mockClient);
    assert(webData.embeds && webData.embeds.length === 1, 'Should have 1 embed for web capybara');
    assert(webData.embeds[0].image && webData.embeds[0].image.url, 'Web capybara embed must contain an image URL');
    assert(webData.embeds[0].footer.text.includes('/capyweb'), 'Footer should reference /capyweb');
    assert(webData.embeds[0].footer.text.includes('Collection:'), 'Web footer should include collection tracker progress');
    console.log(`[+] Live /capyweb engine verified successfully! Image: ${webData.embeds[0].image.url.slice(0, 48)}...`);

    // B. Offline Fallback test (Simulate network outage to verify fallback path):
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = () => Promise.reject(new Error('Simulated network offline'));
      const fallbackData = await getWebCapybaraData(mockUser, mockClient);
      assert(fallbackData.embeds && fallbackData.embeds.length === 1, 'Offline fallback must produce 1 embed');
      assert(fallbackData.embeds[0].description.includes('(Offline Fallback)'), 'Offline fallback embed must state offline fallback');
      assert(fallbackData.embeds[0].footer.text.includes('Offline Fallback Image'), 'Footer must state offline fallback');
      assert(fallbackData.files.length === 1, 'Offline fallback must attach local fallback image');
      console.log('[+] Offline fallback resilience verified successfully (hello.jpg attached, friendly error handling).');
    } finally {
      globalThis.fetch = originalFetch;
    }

    // 8. Test Capydex Tracker, Option B Progress Bars, Disk Persistence & Dynamic Total Probe
    console.log('\n[*] Test 8: Testing Capydex tracker, Option B progress bars, disk persistence & pool probing...');
    const testTrackerUser = { id: 'capy_collector_777', username: 'CapyMaster', tag: 'CapyMaster#1111' };

    // Test unlocking:
    capydex.recordLocalUnlock(testTrackerUser.id, 1);
    capydex.recordLocalUnlock(testTrackerUser.id, 3);
    capydex.recordLocalUnlock(testTrackerUser.id, 5);
    capydex.recordWebUnlock(testTrackerUser.id, 42);
    capydex.recordWebUnlock(testTrackerUser.id, 180);
    capydex.recordWebUnlock(testTrackerUser.id, 747);

    const trackerStats = capydex.getUserStats(testTrackerUser.id, 25, 747);
    assert.strictEqual(trackerStats.localCount, 3, 'Should have 3 unlocked local capys');
    assert.strictEqual(trackerStats.webCount, 3, 'Should have 3 unlocked web capys');
    assert.deepStrictEqual(trackerStats.recentWeb, [747, 180, 42], 'Recent web should be unique LIFO');

    // Test Option B Capydex Embed Builder:
    const capydexEmbedData = capydex.buildCapydexEmbed(testTrackerUser, mockClient, 25, 747);
    assert(capydexEmbedData.embeds && capydexEmbedData.embeds.length === 1, 'Should produce 1 embed');
    const cEmbed = capydexEmbedData.embeds[0];

    assert(cEmbed.fields.length === 2, 'Capydex embed must have 2 fields');
    assert(cEmbed.fields[0].name.includes('Hand-Curated'), 'Field 1 should cover local curated capybaras');
    assert(cEmbed.fields[0].value.includes('`#01` ✅'), 'Local checklist should mark unlocked #01 with ✅');
    assert(cEmbed.fields[0].value.includes('`#02` 🔒'), 'Local checklist should mark locked #02 with 🔒');

    // Verify Option B 100-Block Progress Bars & Next Missing in Field 2:
    assert(cEmbed.fields[1].name.includes('Web Gallery Chapters'), 'Field 2 should cover Web Gallery Chapters');
    assert(cEmbed.fields[1].value.includes('`#001–#100`'), 'Field 2 must contain #001–#100 chapter');
    assert(cEmbed.fields[1].value.includes('`#101–#200`'), 'Field 2 must contain #101–#200 chapter');
    assert(cEmbed.fields[1].value.includes('`#701–#747`'), 'Field 2 must contain final chapter up to 747');
    assert(cEmbed.fields[1].value.includes('█') || cEmbed.fields[1].value.includes('░'), 'Must contain visual progress bars');
    assert(cEmbed.fields[1].value.includes('Next Missing'), 'Field 2 should include next missing milestones');

    // Verify Discord Character Limit (< 2000 total length):
    const totalEmbedLength = (cEmbed.description?.length || 0) +
      cEmbed.fields.reduce((acc, f) => acc + f.name.length + f.value.length, 0) +
      (cEmbed.footer?.text?.length || 0);
    assert(totalEmbedLength < 2000, `Capydex embed total characters (${totalEmbedLength}) must be under Discord 2000 limit`);

    // Test createProgressBar boundary conditions:
    assert.strictEqual(capydex.createProgressBar(0, 25, 5), '[░░░░░]', '0% progress bar should be all empty blocks');
    assert.strictEqual(capydex.createProgressBar(25, 25, 5), '[█████]', '100% progress bar should be all filled blocks');
    assert.strictEqual(capydex.createProgressBar(0, 0, 5), '[░░░░░]', 'Division by zero safe progress bar');

    // Test Disk Persistence & Reload Round-Trip:
    capydex.saveStorage(TEST_STORAGE_FILE, true);
    assert(fs.existsSync(TEST_STORAGE_FILE), 'Storage file must be written to disk');
    const diskRaw = JSON.parse(fs.readFileSync(TEST_STORAGE_FILE, 'utf8'));
    assert(diskRaw[testTrackerUser.id], 'User record must exist in persisted JSON on disk');

    // Clear memory and reload from disk:
    capydex.collections.clear();
    assert.strictEqual(capydex.collections.size, 0, 'Collections cleared in memory');
    capydex.initStorage(TEST_STORAGE_FILE);
    const reloadedStats = capydex.getUserStats(testTrackerUser.id, 25, 747);
    assert.strictEqual(reloadedStats.localCount, 3, 'Reloaded local count must match');
    assert.strictEqual(reloadedStats.webCount, 3, 'Reloaded web count must match');
    assert.deepStrictEqual(reloadedStats.recentWeb, [747, 180, 42], 'Reloaded recentWeb must match');

    // Test dynamic web total getters, setters and bump:
    const originalWebTotal = capydex.getWebTotal();
    capydex.setWebTotal(800);
    assert.strictEqual(capydex.getWebTotal(), 800, 'setWebTotal should update total');
    capydex.bumpWebTotalIfHigher(850);
    assert.strictEqual(capydex.getWebTotal(), 850, 'bumpWebTotalIfHigher should increase total');
    capydex.bumpWebTotalIfHigher(820);
    assert.strictEqual(capydex.getWebTotal(), 850, 'bumpWebTotalIfHigher should not decrease total');

    // Test syncWebCapybarasTotal binary search with mockFetch:
    const mockBinaryFetch = async (url) => {
      const match = url.match(/from=(\d+)/);
      const from = match ? parseInt(match[1], 10) : 1;
      const TARGET_COUNT = 820;
      if (from <= TARGET_COUNT) {
        return {
          json: async () => ({
            success: true,
            data: [{ index: from }]
          })
        };
      }
      return {
        json: async () => ({
          success: true,
          data: []
        })
      };
    };
    const probedTotal = await capydex.syncWebCapybarasTotal(mockBinaryFetch);
    assert(probedTotal >= 800 && probedTotal <= 850, `Binary search should discover target pool size, got: ${probedTotal}`);

    // Restore web total:
    capydex.setWebTotal(originalWebTotal);

    console.log(`[+] Capydex tracker, Option B progress bars, disk persistence & binary search verified.`);

    // 9. Test Graceful Shutdown Signal Listeners (Task 20)
    console.log('\n[*] Test 9: Verifying graceful shutdown signal listeners...');
    const sigtermListeners = process.listeners('SIGTERM');
    const sigintListeners = process.listeners('SIGINT');
    assert(sigtermListeners.length >= 1, 'SIGTERM handler should be registered');
    assert(sigintListeners.length >= 1, 'SIGINT handler should be registered');
    console.log(`[+] Graceful shutdown handlers active (SIGTERM: ${sigtermListeners.length}, SIGINT: ${sigintListeners.length}).`);

    // 10. Test GitHub Community, Issue Templates & PR Template (Tasks 25 & 26)
    console.log('\n[*] Test 10: Verifying GitHub community files & issue templates...');
    const communityFiles = [
      '.github/workflows/test.yml',
      '.github/dependabot.yml',
      '.github/pull_request_template.md',
      '.github/ISSUE_TEMPLATE/bug_report.md',
      '.github/ISSUE_TEMPLATE/feature_request.md',
      '.github/ISSUE_TEMPLATE/photo_submission.md',
      '.github/ISSUE_TEMPLATE/config.yml',
    ];
    for (const file of communityFiles) {
      assert(fs.existsSync(file), `Community file should exist: ${file}`);
      assert(fs.statSync(file).size > 50, `File should not be empty: ${file}`);
    }
    console.log(`[+] All ${communityFiles.length} GitHub community templates verified.`);

    // 11. Test CI Workflow & Dependabot Configurations (Tasks 24 & 27)
    console.log('\n[*] Test 11: Validating CI workflow & Dependabot configuration structure...');
    const ciContent = fs.readFileSync('.github/workflows/test.yml', 'utf8');
    assert(ciContent.includes('actions/checkout@v4'), 'CI should use checkout v4');
    assert(ciContent.includes('actions/setup-node@v4'), 'CI should use setup-node v4');
    assert(ciContent.includes('npm test'), 'CI should execute npm test');
    assert(ciContent.includes('18.x') && ciContent.includes('20.x') && ciContent.includes('22.x'), 'CI should matrix test across Node 18, 20, 22');

    const dependabotContent = fs.readFileSync('.github/dependabot.yml', 'utf8');
    assert(dependabotContent.includes('package-ecosystem: "npm"'), 'Dependabot should monitor npm');
    assert(dependabotContent.includes('package-ecosystem: "github-actions"'), 'Dependabot should monitor github-actions');

    const readmeContent = fs.readFileSync('./README.md', 'utf8');
    assert(readmeContent.includes('actions/workflows/test.yml'), 'README should contain CI status badge');
    assert(readmeContent.includes('Weboardies'), 'README should contain Discord community badge');

    // 12. Test Capydex Leaderboard, Gaming Tiebreakers, Server Filtering & Empty States
    console.log('\n[*] Test 12: Testing Capydex Leaderboard, gaming tiebreakers, server filtering & empty states...');

    // A. Test weighted probability distribution:
    let bonusHits = 0;
    const totalSimulations = 10000;
    for (let i = 0; i < totalSimulations; i++) {
      const idx = getRandomCapybaraIndex(25);
      assert(idx >= 0 && idx < 25, `Index must be between 0 and 24, got: ${idx}`);
      if (idx >= 22) { // 22, 23, 24 are bonus images
        bonusHits++;
      }
    }
    const bonusRate = bonusHits / totalSimulations;
    assert(bonusRate >= 0.03 && bonusRate <= 0.09, `Bonus rate (${(bonusRate * 100).toFixed(2)}%) should be around 6%`);
    console.log(`[+] Weighted random selection verified: ${(bonusRate * 100).toFixed(2)}% bonus appearance across ${totalSimulations} trials.`);

    // B. Test Leaderboard ranking and gaming tiebreakers:
    const backupCollections = new Map(capydex.collections);
    capydex.collections.clear();

    // User 1: 100% completion earliest (25 local, 747 web, completedAt: 1000)
    capydex.collections.set('user_1', {
      local: new Set(Array.from({ length: 25 }, (_, i) => i + 1)),
      web: new Set(Array.from({ length: 747 }, (_, i) => i + 1)),
      recentWeb: [],
      username: 'FirstToMax',
      updatedAt: 1500,
      completedAt: 1000,
    });

    // User 2: 100% completion later (25 local, 747 web, completedAt: 2000) -> User 1 must beat User 2
    capydex.collections.set('user_2', {
      local: new Set(Array.from({ length: 25 }, (_, i) => i + 1)),
      web: new Set(Array.from({ length: 747 }, (_, i) => i + 1)),
      recentWeb: [],
      username: 'SecondToMax',
      updatedAt: 2500,
      completedAt: 2000,
    });

    // User 3: Total 200 (25 local, 175 web)
    capydex.collections.set('user_3', {
      local: new Set(Array.from({ length: 25 }, (_, i) => i + 1)),
      web: new Set(Array.from({ length: 175 }, (_, i) => i + 1)),
      recentWeb: [],
      username: 'RareHunter',
      updatedAt: 3000,
      completedAt: null,
    });

    // User 4: Total 200 (20 local, 180 web) -> User 3 must beat User 4 due to more local unlocks (25 vs 20)
    capydex.collections.set('user_4', {
      local: new Set(Array.from({ length: 20 }, (_, i) => i + 1)),
      web: new Set(Array.from({ length: 180 }, (_, i) => i + 1)),
      recentWeb: [],
      username: 'WebFarmer',
      updatedAt: 3000,
      completedAt: null,
    });

    // User 5: Total 100 (15 local, 85 web)
    capydex.collections.set('user_5', {
      local: new Set(Array.from({ length: 15 }, (_, i) => i + 1)),
      web: new Set(Array.from({ length: 85 }, (_, i) => i + 1)),
      recentWeb: [],
      username: 'FifthCollector',
      updatedAt: 4000,
      completedAt: null,
    });

    // User 6: Total 50 (10 local, 40 web) -> Rank 6 (Outside top 5)
    capydex.collections.set('user_6', {
      local: new Set(Array.from({ length: 10 }, (_, i) => i + 1)),
      web: new Set(Array.from({ length: 40 }, (_, i) => i + 1)),
      recentWeb: [],
      username: 'RankSixPlayer',
      updatedAt: 5000,
      completedAt: null,
    });

    // User 7: Total 0 (0 local, 0 web) -> Should be filtered out as unranked
    capydex.collections.set('user_7', {
      local: new Set(),
      web: new Set(),
      recentWeb: [],
      username: 'ZeroUnlocks',
      updatedAt: 6000,
      completedAt: null,
    });

    const globalBoard = capydex.getLeaderboard(null, 5, 'user_6');
    assert.strictEqual(globalBoard.totalParticipants, 6, 'Should have 6 participating players (0-unlock user excluded)');
    assert.strictEqual(globalBoard.topPlayers.length, 5, 'Should return top 5 players');
    assert.strictEqual(globalBoard.topPlayers[0].userId, 'user_1', 'User 1 should be rank #1 due to earlier completion timestamp');
    assert.strictEqual(globalBoard.topPlayers[1].userId, 'user_2', 'User 2 should be rank #2');
    assert.strictEqual(globalBoard.topPlayers[2].userId, 'user_3', 'User 3 should beat User 4 due to higher local unlocks');
    assert.strictEqual(globalBoard.topPlayers[3].userId, 'user_4', 'User 4 should be rank #4');
    assert.strictEqual(globalBoard.topPlayers[4].userId, 'user_5', 'User 5 should be rank #5');
    assert.strictEqual(globalBoard.isUserInTop, false, 'User 6 is rank 6 and should not be in top 5');
    assert.strictEqual(globalBoard.userStanding.rank, 6, 'User 6 rank should be 6');

    // C. Test Embed Visual Rendering & Divider logic:
    const mockGuild = {
      name: 'CapyServer',
      iconURL: () => 'https://cdn.discordapp.com/icons/123/icon.png'
    };

    // Case 1: Requesting user is in top 5 (User 1):
    const topUserEmbedData = capydex.buildLeaderboardEmbed({
      user: { id: 'user_1', username: 'FirstToMax' },
      guild: mockGuild,
      clientInstance: mockClient,
      limit: 5,
      totalLocal: 25,
      totalWeb: 747,
    });
    assert.strictEqual(topUserEmbedData.embeds[0].author.name, 'CapyServer • Capydex Leaderboard', 'Author should be Server • Capydex Leaderboard');
    const topDesc = topUserEmbedData.embeds[0].description;
    assert(topDesc.startsWith('\u200B\n'), 'Description should start with empty spacing line');
    assert(topDesc.endsWith('\n\u200B'), 'Description should end with empty spacing line');
    assert(topDesc.includes('🌟 **Top Capybara Lovers in this Server:**'), 'Must have Server section');
    assert(topDesc.includes('🌍 **Top Capybara Lovers Worldwide (Global):**'), 'Must have Global section');
    assert(topDesc.includes('🥇 @FirstToMax (772 Capys • 100%) 👈🏼'), 'Rank 1 should format as medal @user (capys • percent%) 👈🏼');

    // Case 2: Requesting user is rank 6 (User 6) -> Must have divider and standing row:
    const rankSixEmbedData = capydex.buildLeaderboardEmbed({
      user: { id: 'user_6', username: 'RankSixPlayer' },
      guild: mockGuild,
      clientInstance: mockClient,
      limit: 5,
      totalLocal: 25,
      totalWeb: 747,
    });
    const sixDesc = rankSixEmbedData.embeds[0].description;
    assert(sixDesc.includes('• • •'), 'Rank 6 player MUST have divider dots');
    assert(sixDesc.includes('#6 @RankSixPlayer (50 Capys • 6%) 👈🏼'), 'Rank 6 player must have highlighted standing row with 👈🏼');

    // Case 3: Requesting user is unranked (User 7):
    const unrankedEmbedData = capydex.buildLeaderboardEmbed({
      user: { id: 'user_7', username: 'ZeroUnlocks' },
      guild: mockGuild,
      clientInstance: mockClient,
      limit: 5,
      totalLocal: 25,
      totalWeb: 747,
    });
    const unrankedDesc = unrankedEmbedData.embeds[0].description;
    assert(unrankedDesc.includes('• • •'), 'Unranked user should have divider dots');
    assert(unrankedDesc.includes('👉 **Unranked**'), 'Unranked user should see unranked notice');

    // Check footer format:
    const footerText = rankSixEmbedData.embeds[0].footer.text;
    assert(footerText.includes('Capydex Leaderboard • CapyServer & Global ...'), 'Footer line 1 should identify server & global');
    assert(footerText.includes('Requested by @RankSixPlayer'), 'Footer line 3 should show Requested by @username');
    assert(footerText.endsWith('...'), 'Footer lines must end in trailing ellipsis ...');

    // Check Discord character limits:
    const embedLength = rankSixEmbedData.embeds[0].description.length + footerText.length;
    assert(embedLength < 2000, `Embed character count (${embedLength}) must be under 2000`);

    // D. Test Server Member Filtering (guildMemberIds):
    const guildMembersSubset = new Set(['user_3', 'user_4']);
    const serverFilteredBoard = capydex.getLeaderboard(guildMembersSubset, 5, 'user_6');
    assert.strictEqual(serverFilteredBoard.topPlayers.length, 3, 'Server board should contain server members plus requesting user');
    assert.strictEqual(serverFilteredBoard.topPlayers[0].userId, 'user_3', 'User 3 should be #1 on server board');
    assert.strictEqual(serverFilteredBoard.topPlayers[1].userId, 'user_4', 'User 4 should be #2 on server board');
    assert.strictEqual(serverFilteredBoard.topPlayers[2].userId, 'user_6', 'User 6 should be #3 on server board');
    
    // Verify global leaders user_1, user_2, and user_5 were excluded from server board:
    const topIds = serverFilteredBoard.topPlayers.map(p => p.userId);
    assert(!topIds.includes('user_1'), 'Global leader user_1 must be excluded from server board');
    assert(!topIds.includes('user_2'), 'Global leader user_2 must be excluded from server board');
    assert(!topIds.includes('user_5'), 'Global leader user_5 must be excluded from server board');
    assert.strictEqual(serverFilteredBoard.isUserInTop, true, 'User 6 is in top 3 on server board');


    // E. Test Empty Leaderboard State (Day 1 / fresh server with 0 unlocks):
    capydex.collections.clear();
    const emptyEmbedData = capydex.buildLeaderboardEmbed({
      user: { id: 'brand_new_user', username: 'Newbie' },
      guild: mockGuild,
      clientInstance: mockClient,
      guildMemberIds: new Set(),
      limit: 5,
      totalLocal: 25,
      totalWeb: 747,
    });
    assert(emptyEmbedData.embeds && emptyEmbedData.embeds.length === 1, 'Empty leaderboard produces 1 embed');
    const emptyDesc = emptyEmbedData.embeds[0].description;
    assert(emptyDesc.includes('No capybara lovers in this server yet!'), 'Empty server section message verified');
    assert(emptyDesc.includes('No capybara lovers worldwide yet!'), 'Empty global section message verified');
    assert(emptyDesc.includes('Unranked'), 'New user is unranked');

    // Restore real collections:
    capydex.collections.clear();
    for (const [k, v] of backupCollections) {
      capydex.collections.set(k, v);
    }
    console.log('[+] Capydex Leaderboard, tiebreakers, server filtering & empty states verified successfully.');

    console.log('\n========================================');
    console.log('🎉 ALL 12 BOT TESTS PASSED SUCCESSFULLY! ');
    console.log('========================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Failed: ', err, " ...");
    process.exit(1);
  } finally {
    // Clean up temporary test storage and restore production capydex storage:
    if (fs.existsSync(TEST_STORAGE_FILE)) {
      try {
        fs.unlinkSync(TEST_STORAGE_FILE);
      } catch (e) {}
    }
    capydex.initStorage();
  }
})();

// [!] Capybara Discord Bot — The End ... 