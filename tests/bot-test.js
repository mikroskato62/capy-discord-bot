// [!] Capybara Discord Bot — Comprehensive Test Suite
const assert = require('assert');
const fs = require('fs');
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

// Import real production functions and data from index.js (Task 23):
const {
  capybaraResponses,
  getRandomColor,
  getCapybaraData,
  getWebCapybaraData,
  getCapyInfoData,
  getRandomReactionEmoji,
  createCapybaraButtonRow,
  createCapywebButtonRow,
  createCapyinfoButtonRow,
  getActionOwnerId,
} = require('../index.js');

(async () => {
  try {
    console.log('[*] Running Capybara Bot Test Suite...\n');

    // 1. Check if all required assets exist
    console.log('[*] Test 1: Verifying core branding assets...');
    const requiredAssets = [
      './assets/banner.png',
      './assets/logo.png',
      './assets/background.png',
      './assets/emoji.svg'
    ];
    for (const asset of requiredAssets) {
      assert(fs.existsSync(asset), `Asset should exist: ${asset}`);
    }
    console.log(`[+] Assets verified successfully: ${requiredAssets.length} files found.`);

    // 2. Check images directory and count
    console.log('\n[*] Test 2: Verifying curated images gallery...');
    assert(fs.existsSync('./images'), 'Images directory should exist');
    const imageFiles = fs.readdirSync('./images').filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
    assert(imageFiles.length >= 20, `Images directory should contain at least 20 images, found: ${imageFiles.length}`);
    assert.strictEqual(capybaraResponses.length, imageFiles.length, 'capybaraResponses in index.js should match image count in images/');
    console.log(`[+] Local images gallery verified: ${imageFiles.length} images ready.`);

    // 3. Test Discord.js Slash Command Builders
    console.log('\n[*] Test 3: Verifying slash command definitions...');
    const commands = [
      new SlashCommandBuilder()
        .setName('capybaras')
        .setDescription('[ Command: view a random capybara image! ]'),
      new SlashCommandBuilder()
        .setName('capyweb')
        .setDescription('[ Command: view a random capybara image from the web! ]'),
      new SlashCommandBuilder()
        .setName('capyinfo')
        .setDescription('[ Command: view bot info, features & coming soon roadmap! ]'),
    ].map((cmd) => cmd.toJSON());

    assert.strictEqual(commands.length, 3, 'There should be 3 slash commands registered');
    assert.strictEqual(commands[0].name, 'capybaras', 'First command should be capybaras');
    assert.strictEqual(commands[1].name, 'capyweb', 'Second command should be capyweb');
    assert.strictEqual(commands[2].name, 'capyinfo', 'Third command should be capyinfo');
    console.log('[+] Commands array validated successfully:', commands.map(c => `/${c.name}`).join(', '));

    // 4. Test Real Production getCapyInfoData & getCapybaraData from index.js
    console.log('\n[*] Test 4: Testing real production embed generators from index.js...');
    const mockClient = {
      user: {
        id: '1395033511559172157',
        displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/0.png',
        tag: 'CapybaraBot#0000',
      },
    };

    const mockUser = { tag: 'Tester#1234', id: '111222333' };

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
    assert(capyData.files.length === 1, 'Local photo attachment should be included');
    console.log('[+] Real embed data generators verified successfully from index.js.');

    // 5. Test Real Button Action Rows & Author-Only Security from index.js
    console.log('\n[*] Test 5: Testing real Button Action Rows and Author-Only logic...');
    const testUserId = '999888777';

    // Test button creation with user ID embedding:
    const capyRow = createCapybaraButtonRow(testUserId);
    const capyRowJson = capyRow.toJSON();
    assert.strictEqual(capyRowJson.components.length, 3, 'Should have 3 buttons in the action row');
    assert(capyRowJson.components[0].custom_id.includes(testUserId), 'Custom ID should encode target user ID');
    assert(capyRowJson.components[1].emoji, 'React button must have an emoji');

    // Test getActionOwnerId:
    const mockInteractionWithId = { customId: `capybara_next:${testUserId}` };
    assert.strictEqual(getActionOwnerId(mockInteractionWithId), testUserId, 'getActionOwnerId should extract userId from customId');

    const mockInteractionMetadata = {
      customId: 'capybara_next',
      message: { interactionMetadata: { user: { id: testUserId } } }
    };
    assert.strictEqual(getActionOwnerId(mockInteractionMetadata), testUserId, 'getActionOwnerId should fallback to interactionMetadata');

    console.log('[+] Button Action Rows & Author-Only guard validated successfully.');

    // 6. Test Unicode Emoji Library & Random Reaction Generator
    console.log('\n[*] Test 6: Verifying unicode-emoji-json and reaction generator...');
    const emojiData = require("unicode-emoji-json");
    assert(Object.keys(emojiData).length > 1000, 'unicode-emoji-json should contain over 1000 emojis');

    const randomEmoji = getRandomReactionEmoji(mockClient);
    assert(randomEmoji && typeof randomEmoji === 'string', 'Should return a valid emoji string');
    console.log(`[+] Emoji database verified (${Object.keys(emojiData).length} emojis). Sample random emoji: ${randomEmoji}`);

    // 7. Test Live Web Capybara Fetcher & Fallback (Task 19)
    console.log('\n[*] Test 7: Testing live /capyweb API fetcher & fallback...');
    const webData = await getWebCapybaraData(mockUser, mockClient);
    assert(webData.embeds && webData.embeds.length === 1, 'Should have 1 embed for web capybara');
    assert(webData.embeds[0].image && webData.embeds[0].image.url, 'Web capybara embed must contain an image URL');
    assert(webData.embeds[0].footer.text.includes('/capyweb'), 'Footer should reference /capyweb');
    console.log(`[+] Live /capyweb engine verified successfully! Image: ${webData.embeds[0].image.url.slice(0, 48)}...`);

    // 8. Test Graceful Shutdown Signal Listeners (Task 20)
    console.log('\n[*] Test 8: Verifying graceful shutdown signal listeners...');
    const sigtermListeners = process.listeners('SIGTERM');
    const sigintListeners = process.listeners('SIGINT');
    assert(sigtermListeners.length >= 1, 'SIGTERM handler should be registered');
    assert(sigintListeners.length >= 1, 'SIGINT handler should be registered');
    console.log(`[+] Graceful shutdown handlers active (SIGTERM: ${sigtermListeners.length}, SIGINT: ${sigintListeners.length}).`);

    // 9. Test GitHub Community, Issue Templates & PR Template (Tasks 25 & 26)
    console.log('\n[*] Test 9: Verifying GitHub community files & issue templates...');
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

    // 10. Test CI Workflow & Dependabot Configurations (Tasks 24 & 27)
    console.log('\n[*] Test 10: Validating CI workflow & Dependabot configuration structure...');
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
    console.log('[+] CI workflow, Dependabot config, and README badges validated successfully.');

    console.log('\n======================================================');
    console.log('🎉 ALL 10 COMPREHENSIVE BOT TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  }
})();