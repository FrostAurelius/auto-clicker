const { mouse, Button } = require('@nut-tree-fork/nut-js');
const { GlobalKeyboardListener } = require('node-global-key-listener');

// Load configuration from environment variable
let config;
try {
  config = JSON.parse(process.env.CLICKER_CONFIG || '{}');
} catch (e) {
  config = {
    clickInterval: 100,
    keys: {
      start: '1',
      stop: '2',
      exit: '3',
      updatePosition: '4'
    }
  };
}

// Helper function to check if key matches
function keyMatches(event, key) {
  if (!key) return false;
  const keyLower = key.toLowerCase();
  
  // Check by name
  if (event.name && event.name.toLowerCase() === keyLower) return true;
  
  // Check by rawcode for number keys
  const numberCodes = {
    '1': 49, '2': 50, '3': 51, '4': 52, '5': 53,
    '6': 54, '7': 55, '8': 56, '9': 57, '0': 48
  };
  if (numberCodes[keyLower] && event.rawcode === numberCodes[keyLower]) return true;
  
  return false;
}

// State
let isClicking = false;
let clickInterval = null;
let clickPosition = null;

console.log('=== Auto Clicker v1.0 ===');
console.log('Global Hotkeys (work even when terminal is not focused):');
console.log(`  ${config.keys.start || '1'}   - Start clicking`);
console.log(`  ${config.keys.stop || '2'}   - Stop clicking`);
console.log(`  ${config.keys.exit || '3'}   - Exit program`);
console.log(`  ${config.keys.updatePosition || '4'}   - Update click position to current mouse location`);
console.log(`Click interval: ${config.clickInterval || 100}ms`);
console.log('\n💡 Tip: Position your mouse where you want to click, then press the start key');
console.log('   You can press the update key anytime to update the click position!\n');

// Start clicking
async function startClicking() {
  if (isClicking) {
    console.log(`⚠️  Already clicking! Press ${config.keys.stop || '2'} to stop first.`);
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
  console.log(`   Press ${config.keys.stop || '2'} to stop, or ${config.keys.updatePosition || '4'} to update position\n`);
  
  const interval = config.clickInterval || 100;
  clickInterval = setInterval(async () => {
    try {
      // Move to the saved position and click
      await mouse.setPosition(clickPosition);
      await mouse.click(Button.LEFT);
    } catch (error) {
      console.error('Error clicking:', error.message);
    }
  }, interval);
}

// Stop clicking
function stopClicking() {
  if (!isClicking) {
    console.log(`⚠️  Not currently clicking! Press ${config.keys.start || '1'} to start.`);
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
  
  // Start clicking
  if (keyMatches(e, config.keys.start)) {
    startClicking();
  }
  
  // Stop clicking
  if (keyMatches(e, config.keys.stop)) {
    stopClicking();
  }
  
  // Exit
  if (keyMatches(e, config.keys.exit)) {
    console.log('\n👋 Exiting auto clicker...');
    if (clickInterval) {
      clearInterval(clickInterval);
    }
    keyboard.kill();
    process.exit(0);
  }
  
  // Update click position
  if (keyMatches(e, config.keys.updatePosition)) {
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
