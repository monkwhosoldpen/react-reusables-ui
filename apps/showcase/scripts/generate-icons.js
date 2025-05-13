const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// WhatsApp-inspired brand configuration for nchat
const BRAND_CONFIG = {
  // Main brand colors (WhatsApp colors)
  primaryColor: '#25D366', // WhatsApp green
  backgroundColor: '#FFFFFF', // White background
  textColor: '#111B21', // WhatsApp dark text
  accentColor: '#F0F2F5', // WhatsApp light gray
  secondaryColor: '#128C7E', // WhatsApp darker green
  
  // Badge-specific colors (WhatsApp notification style)
  badgeColors: {
    primary: '#25D366', // WhatsApp green
    accent: '#128C7E', // Darker green
    text: '#FFFFFF', // White text
    outline: '#FFFFFF' // White outline
  },
  
  // Dark mode colors
  darkMode: {
    backgroundColor: '#111B21',
    textColor: '#FFFFFF',
    accentColor: '#202C33'
  }
};

// Screenshot configurations with WhatsApp-style layouts
const SCREENSHOTS = [
  {
    name: 'desktop',
    width: 1920,
    height: 1080,
    form_factor: 'wide',
    background: BRAND_CONFIG.backgroundColor
  },
  {
    name: 'mobile',
    width: 1080,
    height: 1920,
    form_factor: 'narrow',
    background: BRAND_CONFIG.backgroundColor
  },
  {
    name: 'tablet',
    width: 1200,
    height: 800,
    form_factor: 'wide',
    background: BRAND_CONFIG.backgroundColor
  }
];

// Quick action icons with WhatsApp-style design
const QUICK_ACTIONS = [
  {
    name: 'new-chat',
    icon: `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="48" r="44" fill="${BRAND_CONFIG.primaryColor}"/>
        <path d="M32 48h32M48 32v32" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
      </svg>
    `
  },
  {
    name: 'camera',
    icon: `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="48" r="44" fill="${BRAND_CONFIG.primaryColor}"/>
        <path d="M30 36l6-6h24l6 6h6v30H24V36h6z M48 60a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" stroke="#FFFFFF" stroke-width="4" fill="none"/>
      </svg>
    `
  },
  {
    name: 'status',
    icon: `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="48" r="44" fill="${BRAND_CONFIG.primaryColor}"/>
        <circle cx="48" cy="48" r="20" stroke="#FFFFFF" stroke-width="4" fill="none"/>
        <path d="M48 28v4M68 48h-4M48 68v-4M28 48h4" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `
  },
  {
    name: 'calls',
    icon: `
      <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
        <circle cx="48" cy="48" r="44" fill="${BRAND_CONFIG.primaryColor}"/>
        <path d="M36 28s-8 4-8 16 8 16 8 16M60 28s8 4 8 16-8 16-8 16M36 48h24" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `
  }
];

// Function to create main app icon SVG with nchat design - simple green ball
async function createAppIconSVG() {
  return `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <!-- Background - Full Green Circle -->
      <circle cx="256" cy="256" r="256" fill="${BRAND_CONFIG.primaryColor}"/>
    </svg>
  `;
}

// Function to create SVG for numbered badge with WhatsApp style
function createBadgeSVG(number) {
  const text = number > 99 ? '99+' : number.toString();
  const radius = text.length > 2 ? 48 : 44;
  
  return `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <!-- WhatsApp-style notification badge -->
      <circle cx="48" cy="48" r="${radius}" fill="${BRAND_CONFIG.primaryColor}"/>
      
      <!-- Clean, white text -->
      <text
        x="48"
        y="48"
        font-family="Helvetica, Arial, sans-serif"
        font-size="${text.length > 2 ? '28' : text.length > 1 ? '32' : '36'}"
        font-weight="bold"
        fill="#FFFFFF"
        text-anchor="middle"
        dominant-baseline="central"
      >${text}</text>
    </svg>
  `;
}

// Function to create default badge SVG with WhatsApp style
function createDefaultBadgeSVG() {
  return `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      <circle cx="48" cy="48" r="44" fill="${BRAND_CONFIG.primaryColor}"/>
      <circle cx="48" cy="48" r="12" fill="#FFFFFF"/>
    </svg>
  `;
}

// Function to create screenshot placeholders with WhatsApp-style interface
async function generateScreenshots() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  
  for (const screen of SCREENSHOTS) {
    const svg = `
      <svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${BRAND_CONFIG.backgroundColor}"/>
        
        <!-- Header -->
        <rect width="100%" height="${screen.height * 0.08}" fill="${BRAND_CONFIG.primaryColor}"/>
        
        <!-- Content Container -->
        <g transform="translate(${screen.width * 0.05}, ${screen.height * 0.15})">
          <!-- App Logo - Simple Green Ball -->
          <circle cx="${screen.width * 0.1}" cy="${screen.height * 0.05}" r="${screen.width * 0.05}" fill="${BRAND_CONFIG.primaryColor}"/>
          
          <!-- App Name -->
          <text
            x="${screen.width * 0.25}"
            y="${screen.height * 0.07}"
            font-family="Helvetica, Arial, sans-serif"
            font-size="${screen.width * 0.03}px"
            fill="${BRAND_CONFIG.textColor}"
            font-weight="bold"
          >nchat</text>
          
          <!-- Tagline -->
          <text
            x="${screen.width * 0.25}"
            y="${screen.height * 0.12}"
            font-family="Helvetica, Arial, sans-serif"
            font-size="${screen.width * 0.015}px"
            fill="${BRAND_CONFIG.textColor}"
          >Connect and chat securely</text>
          
          <!-- Chat List (WhatsApp style) -->
          ${screen.form_factor === 'wide' ? 
            `<rect x="0" y="${screen.height * 0.2}" width="${screen.width * 0.3}" height="${screen.height * 0.6}" fill="${BRAND_CONFIG.accentColor}" rx="4" ry="4"/>
             <rect x="${screen.width * 0.32}" y="${screen.height * 0.2}" width="${screen.width * 0.58}" height="${screen.height * 0.6}" fill="${BRAND_CONFIG.accentColor}" rx="4" ry="4"/>` 
            : 
            `<rect x="0" y="${screen.height * 0.2}" width="${screen.width * 0.9}" height="${screen.height * 0.6}" fill="${BRAND_CONFIG.accentColor}" rx="4" ry="4"/>`
          }
        </g>
      </svg>
    `;
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(iconsDir, `screenshot-${screen.name}.png`));
    console.log(`Generated ${screen.name} screenshot`);
  }
}

// Existing functions remain the same
async function generateBadgeIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  
  await sharp(Buffer.from(createDefaultBadgeSVG()))
    .png()
    .toFile(path.join(iconsDir, 'badge-default.png'));
  console.log('Generated default badge');

  for (let i = 1; i <= 9; i++) {
    await sharp(Buffer.from(createBadgeSVG(i)))
      .png()
      .toFile(path.join(iconsDir, `badge-${i}.png`));
    console.log(`Generated badge for number ${i}`);
  }

  await sharp(Buffer.from(createBadgeSVG(100)))
    .png()
    .toFile(path.join(iconsDir, 'badge-99plus.png'));
  console.log('Generated 99+ badge');
}

async function generateAppIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  const appIconSvg = await createAppIconSVG();
  const sizes = [16, 32, 96, 192, 512];

  for (const size of sizes) {
    await sharp(Buffer.from(appIconSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Generated ${size}x${size} app icon`);
  }

  // Generate favicon with WhatsApp-style green
  await sharp(Buffer.from(appIconSvg))
    .resize(32, 32)
    .toFile(path.join(process.cwd(), 'public', 'favicon.ico'));
  console.log('Generated favicon');
  
  // Also save the SVG version
  await fs.writeFile(path.join(process.cwd(), 'public', 'app-icon.svg'), appIconSvg);
  console.log('Generated app-icon.svg');
}

async function generateQuickActionIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  
  for (const action of QUICK_ACTIONS) {
    await sharp(Buffer.from(action.icon))
      .resize(96, 96)
      .png()
      .toFile(path.join(iconsDir, `quick-action-${action.name}.png`));
    console.log(`Generated quick action icon: ${action.name}`);
  }
}

async function generateIcons() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  try {
    await fs.mkdir(iconsDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  console.log('🎨 Starting icon generation for nchat...');
  
  try {
    console.log('\n📱 Generating app icons...');
    await generateAppIcons();
    
    console.log('\n🔵 Generating badge icons...');
    await generateBadgeIcons();
    
    console.log('\n📸 Generating screenshots...');
    await generateScreenshots();
    
    console.log('\n⚡ Generating quick action icons...');
    await generateQuickActionIcons();
    
    console.log('\n✅ Icon generation complete!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run the icon generation
generateIcons().catch(console.error); 