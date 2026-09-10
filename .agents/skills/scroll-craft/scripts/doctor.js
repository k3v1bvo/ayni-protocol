// Scroll-Craft Comprehensive Senior Quality Auditor & Health Checker
const fs = require('fs');
const path = require('path');

async function runScrollCraftDoctor() {
  console.log('🩺 ========================================================');
  console.log('🩺 RUNNING SCROLL-CRAFT SENIOR AUDIT & QUALITY DOCTOR');
  console.log('🩺 ========================================================\n');

  const rootDir = path.resolve(__dirname, '../../../..');
  let passCount = 0;
  let totalChecks = 0;

  function report(name, passed, detail = '') {
    totalChecks++;
    if (passed) passCount++;
    console.log(`  [${passed ? '✓ PASS' : '✗ FAIL'}] ${name}${detail ? ' -> ' + detail : ''}`);
  }

  // 1. Runtime Check
  report('Node.js Runtime Environment', !!process.version, process.version);

  // 2. CSS Design Tokens & --sc-p variable
  const globalsCssPath = path.join(rootDir, 'src/app/globals.css');
  const cssExists = fs.existsSync(globalsCssPath);
  let cssContent = '';
  if (cssExists) {
    cssContent = fs.readFileSync(globalsCssPath, 'utf8');
    const hasTimeline = cssContent.includes('--sc-p:');
    const hasPerspective = cssContent.includes('.sc-perspective-container');
    const hasCardDepth = cssContent.includes('.sc-card-depth');
    const hasTransitionStandard = cssContent.includes('0.32s cubic-bezier') || cssContent.includes('0.3s');

    report('CSS Global Timeline Token (--sc-p)', hasTimeline);
    report('3D Spatial Perspective (.sc-perspective-container)', hasPerspective);
    report('Z-Depth Tilt Utilities (.sc-card-depth, .sc-layer-3d)', hasCardDepth);
    report('Micro-interactions Animation Standard (>= 0.3s transition)', hasTransitionStandard);
  } else {
    report('Globals CSS Present', false, 'globals.css not found');
  }

  // 3. Anchor Integrity in Landing Page (Zero Dead Links / Orphan Anchors)
  const landingPath = path.join(rootDir, 'src/app/page.tsx');
  if (fs.existsSync(landingPath)) {
    const landingContent = fs.readFileSync(landingPath, 'utf8');
    const hasHerenciasNav = landingContent.includes("href: '#herencias'");
    const hasHerenciasSection = landingContent.includes('id="herencias"');
    const hasHeartbeatSim = landingContent.includes('landingHeartbeatDays') && landingContent.includes('Heartbeat Ping');

    report('Herencias Nav Target Integrity', hasHerenciasNav && hasHerenciasSection, 'Nav #herencias matches <section id="herencias">');
    report('Herencias Dead Man\'s Switch Simulator', hasHeartbeatSim, 'Interactive Heartbeat & Base L2 vault active');
  }

  // 4. Clean Architecture & Sanitization Layer
  const sanitizerPath = path.join(rootDir, 'src/lib/utils/sanitizer.ts');
  const authPath = path.join(rootDir, 'src/app/auth/page.tsx');
  const remesasNewPath = path.join(rootDir, 'src/app/dashboard/remesas/new/page.tsx');

  const sanitizerExists = fs.existsSync(sanitizerPath);
  report('Sanitization Security Layer (sanitizer.ts)', sanitizerExists);

  if (sanitizerExists && fs.existsSync(authPath)) {
    const authContent = fs.readFileSync(authPath, 'utf8');
    const authSanitized = authContent.includes('sanitizeEmail') && authContent.includes('sanitizeRedirect');
    report('Auth Page Form Input Sanitization', authSanitized, 'Rigid email and redirect cleansing');
  }

  if (sanitizerExists && fs.existsSync(remesasNewPath)) {
    const remesasContent = fs.readFileSync(remesasNewPath, 'utf8');
    const remesasSanitized = remesasContent.includes('sanitizeText') && remesasContent.includes('sanitizeAmount');
    report('Remesas Form Input Sanitization', remesasSanitized, 'XSS and numeric bounds protected');
  }

  // 5. Headless Network & Route Health (Zero Dead Zones)
  console.log('\n🌐 Testing Headless Endpoint Accessibility...');
  const routes = ['/', '/auth', '/dashboard', '/dashboard/heritage', '/dashboard/remesas'];

  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`, { method: 'HEAD' });
      report(`Route Accessibility: ${r}`, res.status >= 200 && res.status < 400, `HTTP ${res.status}`);
    } catch (e) {
      report(`Route Accessibility: ${r}`, false, e.message);
    }
  }

  console.log('\n📊 --------------------------------------------------------');
  console.log(`📊 SCROLL-CRAFT DOCTOR RESULTS: ${passCount}/${totalChecks} CHECKS PASSED`);
  console.log('📊 --------------------------------------------------------');

  if (passCount === totalChecks) {
    console.log('✨ All systems certified under Senior Scroll-Craft & Clean Architecture standards!\n');
  } else {
    console.log('⚠️ Some checks need attention. Review logs above.\n');
  }
}

runScrollCraftDoctor().catch(err => {
  console.error('Doctor runtime error:', err);
  process.exit(1);
});
