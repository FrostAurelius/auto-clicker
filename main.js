const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Import clicker functionality
const { mouse, Button } = require('@nut-tree-fork/nut-js');
const { GlobalKeyboardListener } = require('node-global-key-listener');

// Keep a global reference of the window object
let mainWindow;
let clickerActive = false;
let clickInterval = null;
let clickPosition = null;
let keyboard = null;
let currentConfig = null;

// Configuration file path
const configPath = path.join(app.getPath('userData'), 'config.json');

// Default configuration
const defaultConfig = {
  clickInterval: 100,
  keys: {
    start: '1',
    stop: '2',
    exit: '3',
    updatePosition: '4'
  }
};

// Load configuration from file
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
  return defaultConfig;
}

// Save configuration to file
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
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

// Start clicking
async function startClicking() {
  if (clickerActive) {
    console.log(`⚠️  Already clicking! Press ${currentConfig.keys.stop || '2'} to stop first.`);
    return;
  }
  
  // Get current mouse position if we don't have one
  if (!clickPosition) {
    clickPosition = await mouse.getPosition();
    console.log(`📍 Position set to: (${clickPosition.x}, ${clickPosition.y})`);
  }
  
  clickerActive = true;
  console.log(`▶️  Auto clicking STARTED`);
  console.log(`   Clicking at position: (${clickPosition.x}, ${clickPosition.y})`);
  console.log(`   Press ${currentConfig.keys.stop || '2'} to stop, or ${currentConfig.keys.updatePosition || '4'} to update position\n`);
  
  // Notify UI that clicking has started
  if (mainWindow) {
    mainWindow.webContents.send('clicker-started');
  }
  
  const interval = currentConfig.clickInterval || 100;
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
  if (!clickerActive) {
    console.log(`⚠️  Not currently clicking! Press ${currentConfig.keys.start || '1'} to start.`);
    return;
  }
  
  if (clickInterval) {
    clearInterval(clickInterval);
    clickInterval = null;
  }
  clickerActive = false;
  console.log('⏸️  Auto clicking STOPPED');
  
  // Notify UI that clicking has stopped
  if (mainWindow) {
    mainWindow.webContents.send('clicker-stopped');
  }
}

// Update click position to current mouse location
async function updateClickPosition() {
  try {
    const newPosition = await mouse.getPosition();
    clickPosition = newPosition;
    console.log(`📍 Click position updated to: (${newPosition.x}, ${newPosition.y})`);
    
    // If we're currently clicking, the new position will be used on the next click
    if (clickerActive) {
      console.log('   (New position will be used immediately)\n');
    }
  } catch (error) {
    console.error('Error updating position:', error.message);
  }
}

// Force quit function - emergency shutdown
function forceQuit() {
  // Stop clicking immediately
  if (clickInterval) {
    clearInterval(clickInterval);
    clickInterval = null;
  }
  clickerActive = false;
  
  // Kill keyboard listener
  if (keyboard) {
    try {
      keyboard.kill();
    } catch (e) {
      // Ignore errors
    }
  }
  
  // Force exit immediately
  process.exit(1);
}

// Initialize keyboard listener
function initKeyboardListener(config) {
  // Stop existing listener if any
  if (keyboard) {
    try {
      keyboard.kill();
    } catch (e) {
      // Ignore errors
    }
  }
  
  keyboard = new GlobalKeyboardListener();
  
  // Keyboard event handlers
  keyboard.addListener(function (e, down) {
    if (!down) return; // Only handle keydown events
    
    // EMERGENCY ESCAPE: Escape key - Force quit immediately (works even if clicker is stuck)
    if (e.name === 'ESCAPE' || e.rawcode === 27) {
      console.log('\n🚨 EMERGENCY SHUTDOWN TRIGGERED!');
      forceQuit();
      return;
    }
    
    // Start clicking
    if (keyMatches(e, config.keys.start)) {
      startClicking();
    }
    
    // Stop clicking
    if (keyMatches(e, config.keys.stop)) {
      stopClicking();
    }
    
    // Exit - don't handle this in the clicker, let the app handle it
    // if (keyMatches(e, config.keys.exit)) {
    //   // Exit handled by app
    // }
    
    // Update click position
    if (keyMatches(e, config.keys.updatePosition)) {
      updateClickPosition();
    }
  });
  
  console.log('🔊 Global keyboard listener started!\n');
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 650,
    height: 750,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    resizable: false,
    title: 'Auto Clicker v1.0'
  });

  // Load the index.html
  mainWindow.loadFile('ui/index.html');

  // Open DevTools (optional, remove in production)
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers
ipcMain.on('get-config', (event) => {
  event.returnValue = loadConfig();
});

ipcMain.on('save-config', (event, config) => {
  const success = saveConfig(config);
  event.returnValue = success;
  
  // Update config and restart clicker with new config if it's running
  if (clickerActive) {
    stopClicking();
    currentConfig = config;
    initKeyboardListener(config);
    startClicking();
  } else {
    // Just update the config, don't start keyboard listener
    currentConfig = config;
  }
});

ipcMain.on('start-clicker', (event, config) => {
  currentConfig = config;
  // Initialize keyboard listener when starting clicker (but don't start clicking yet)
  initKeyboardListener(config);
  
  // Notify UI that listener is active (but clicking hasn't started)
  if (mainWindow) {
    mainWindow.webContents.send('clicker-listener-started');
  }
});

ipcMain.on('stop-clicker', () => {
  // Stop clicking if it's active
  if (clickerActive) {
    stopClicking();
  }
  
  // Stop keyboard listener when stopping clicker
  if (keyboard) {
    try {
      keyboard.kill();
      keyboard = null;
      console.log('🔇 Keyboard listener stopped');
    } catch (e) {
      // Ignore errors
    }
  }
  
  // Notify UI
  if (mainWindow) {
    mainWindow.webContents.send('clicker-stopped');
  }
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Load config (but don't initialize keyboard listener yet)
  currentConfig = loadConfig();
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  stopClicking();
  if (keyboard) {
    try {
      keyboard.kill();
    } catch (e) {
      // Ignore errors
    }
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopClicking();
  if (keyboard) {
    try {
      keyboard.kill();
    } catch (e) {
      // Ignore errors
    }
  }
});

process.on('exit', () => {
  if (keyboard) {
    try {
      keyboard.kill();
    } catch (e) {
      // Ignore errors
    }
  }
});
