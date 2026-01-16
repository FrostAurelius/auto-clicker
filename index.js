const { mouse, Button } = require('@nut-tree-fork/nut-js');
const { GlobalKeyboardListener } = require('node-global-key-listener');

// Configuration
const config = {
  clickInterval: 100, // milliseconds between clicks
};

// State
let isClicking = false;
let clickInterval = null;
let clickPosition = null;

console.log('=== Auto Clicker v1.0 ===');
console.log('Global Hotkeys (work even when terminal is not focused):');
console.log('  1   - Start clicking');
console.log('  2   - Stop clicking');
console.log('  3   - Exit program');
console.log('  4   - Update click position to current mouse location');
console.log(`Click interval: ${config.clickInterval}ms`);
console.log('\n💡 Tip: Position your mouse where you want to click, then press 1');
console.log('   You can press 4 anytime to update the click position!\n');

// Start clicking
async function startClicking() {
  if (isClicking) {
    console.log('⚠️  Already clicking! Press 2 to stop first.');
    return;
  }
  
  // Get current mouse position if we don't have one
  if (!clickPosition) {
    clickPosition = await mouse.getPosition();
    console.log(`📍 Position set to: (${clickPosition.x}, ${clickPosition.y})`);
  }
  
  isClicking = true;
  console.log(`▶️  Auto clicking STARTED`);
  console.log(`   Clicking at position: (${clickPosition.x}, ${clickPosition.y})`);
  console.log(`   Press 2 to stop, or 4 to update position\n`);
  
  clickInterval = setInterval(async () => {
    try {
      // Move to the saved position and click
      await mouse.setPosition(clickPosition);
      await mouse.click(Button.LEFT);
    } catch (error) {
      console.error('Error clicking:', error.message);
    }
  }, config.clickInterval);
}

// Stop clicking
function stopClicking() {
  if (!isClicking) {
    console.log('⚠️  Not currently clicking! Press 1 to start.');
    return;
  }
  
  if (clickInterval) {
    clearInterval(clickInterval);
    clickInterval = null;
  }
  isClicking = false;
  console.log('⏸️  Auto clicking STOPPED');
}

// Update click position to current mouse location
async function updateClickPosition() {
  try {
    const newPosition = await mouse.getPosition();
    clickPosition = newPosition;
    console.log(`📍 Click position updated to: (${clickPosition.x}, ${clickPosition.y})`);
    
    // If we're currently clicking, the new position will be used on the next click
    if (isClicking) {
      console.log('   (New position will be used immediately)\n');
    }
  } catch (error) {
    console.error('Error updating position:', error.message);
  }
}

// Initialize global keyboard listener
const keyboard = new GlobalKeyboardListener();

// Keyboard event handlers
keyboard.addListener(function (e, down) {
  if (!down) return; // Only handle keydown events
  
  // 1 - Start clicking
  if (e.name === '1' || e.rawcode === 49) {
    startClicking();
  }
  
  // 2 - Stop clicking
  if (e.name === '2' || e.rawcode === 50) {
    stopClicking();
  }
  
  // 3 - Exit
  if (e.name === '3' || e.rawcode === 51) {
    console.log('\n👋 Exiting auto clicker...');
    if (clickInterval) {
      clearInterval(clickInterval);
    }
    keyboard.kill();
    process.exit(0);
  }
  
  // 4 - Update click position
  if (e.name === '4' || e.rawcode === 52) {
    updateClickPosition();
  }
});

console.log('🔊 Global keyboard listener started!\n');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Exiting auto clicker...');
  if (clickInterval) {
    clearInterval(clickInterval);
  }
  keyboard.kill();
  process.exit(0);
});

process.on('exit', () => {
  keyboard.kill();
});
