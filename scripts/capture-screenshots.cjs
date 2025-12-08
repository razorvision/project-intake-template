#!/usr/bin/env node
/**
 * Screenshot Capture Script
 *
 * Captures screenshots for documentation using Playwright.
 * Run: node scripts/capture-screenshots.js
 *
 * Prerequisites: npx playwright install chromium
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '../docs/assets/screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('📸 Starting screenshot capture...\n');

  // Screenshot 1: GitHub Labels Page
  console.log('1. Capturing GitHub labels page...');
  try {
    await page.goto('https://github.com/razorvision/project-intake-template/labels', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'github-labels.png'),
      fullPage: false
    });
    console.log('   ✅ Saved: github-labels.png');
  } catch (e) {
    console.log('   ⚠️ Could not capture labels (may require auth):', e.message);
  }

  // Screenshot 2: GitHub Repository Main Page
  console.log('2. Capturing repository main page...');
  try {
    await page.goto('https://github.com/razorvision/project-intake-template', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'github-repo-main.png'),
      fullPage: false
    });
    console.log('   ✅ Saved: github-repo-main.png');
  } catch (e) {
    console.log('   ⚠️ Could not capture repo:', e.message);
  }

  // Screenshot 3: Issues Page (to show templates)
  console.log('3. Capturing issues page...');
  try {
    await page.goto('https://github.com/razorvision/project-intake-template/issues/new/choose', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'github-issue-templates.png'),
      fullPage: false
    });
    console.log('   ✅ Saved: github-issue-templates.png');
  } catch (e) {
    console.log('   ⚠️ Could not capture issues:', e.message);
  }

  // Screenshot 4: PR Template Preview
  console.log('4. Capturing PR creation page...');
  try {
    await page.goto('https://github.com/razorvision/project-intake-template/compare', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'github-pr-template.png'),
      fullPage: false
    });
    console.log('   ✅ Saved: github-pr-template.png');
  } catch (e) {
    console.log('   ⚠️ Could not capture PR page:', e.message);
  }

  await browser.close();

  console.log('\n✨ Screenshot capture complete!');
  console.log(`   Location: ${SCREENSHOTS_DIR}`);

  // List captured files
  const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png'));
  if (files.length > 0) {
    console.log('\n📁 Captured screenshots:');
    files.forEach(f => console.log(`   - ${f}`));
  }
}

captureScreenshots().catch(console.error);
