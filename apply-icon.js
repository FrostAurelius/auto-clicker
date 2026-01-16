// Script to apply icon to portable executable after build
// This uses Resource Hacker or similar tools
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const distPath = path.join(__dirname, 'dist');
const exeName = 'Auto Clicker-1.0.0-portable.exe';
const exePath = path.join(distPath, exeName);
const iconPath = path.join(__dirname, 'mouse.ico');

if (!fs.existsSync(exePath)) {
  console.log('Executable not found. Please build first.');
  process.exit(1);
}

if (!fs.existsSync(iconPath)) {
  console.log('Icon file not found.');
  process.exit(1);
}

console.log('Note: Portable executables may not always show custom icons.');
console.log('The icon is configured, but Windows may not display it for self-extracting archives.');
console.log('\nTo manually apply the icon, you can use:');
console.log('1. Resource Hacker (free tool)');
console.log('2. Or use the unpacked version in dist/win-unpacked/ which should have the icon');
console.log('\nThe icon should work correctly in the unpacked executable.');
