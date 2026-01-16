const { ipcRenderer } = require('electron');

// DOM elements
const clickIntervalSlider = document.getElementById('clickInterval');
const intervalValue = document.getElementById('intervalValue');
const clicksPerSecond = document.getElementById('clicksPerSecond');
const keyStart = document.getElementById('keyStart');
const keyStop = document.getElementById('keyStop');
const keyExit = document.getElementById('keyExit');
const keyUpdate = document.getElementById('keyUpdate');
const saveBtn = document.getElementById('saveBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');

let clickerRunning = false;
let listenerActive = false;

// Load configuration on startup
function loadConfig() {
    const config = ipcRenderer.sendSync('get-config');
    
    clickIntervalSlider.value = config.clickInterval || 100;
    updateIntervalDisplay();
    
    keyStart.value = config.keys?.start || '1';
    keyStop.value = config.keys?.stop || '2';
    keyExit.value = config.keys?.exit || '3';
    keyUpdate.value = config.keys?.updatePosition || '4';
}

// Update interval display
function updateIntervalDisplay() {
    const value = parseInt(clickIntervalSlider.value);
    intervalValue.textContent = `${value} ms`;
    const cps = (1000 / value).toFixed(1);
    clicksPerSecond.textContent = `${cps} clicks/second`;
}

// Show status message
function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status ${type}`;
    setTimeout(() => {
        status.className = 'status';
        status.style.display = 'none';
    }, 3000);
}

// Save configuration
function saveConfig() {
    const config = {
        clickInterval: parseInt(clickIntervalSlider.value),
        keys: {
            start: keyStart.value.toUpperCase() || '1',
            stop: keyStop.value.toUpperCase() || '2',
            exit: keyExit.value.toUpperCase() || '3',
            updatePosition: keyUpdate.value.toUpperCase() || '4'
        }
    };
    
    const success = ipcRenderer.sendSync('save-config', config);
    
    if (success) {
        showStatus('Settings saved successfully!', 'success');
        if (clickerRunning) {
            showStatus('Clicker will restart with new settings...', 'info');
        }
    } else {
        showStatus('Error saving settings', 'error');
    }
}

// Start clicker (starts listening for key bindings)
function startClicker() {
  const config = {
    clickInterval: parseInt(clickIntervalSlider.value),
    keys: {
      start: keyStart.value.toUpperCase() || '1',
      stop: keyStop.value.toUpperCase() || '2',
      exit: keyExit.value.toUpperCase() || '3',
      updatePosition: keyUpdate.value.toUpperCase() || '4'
    }
  };
  
  ipcRenderer.send('start-clicker', config);
  listenerActive = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  showStatus('Listening for key bindings. Press your start key to begin clicking.', 'info');
}

// Stop clicker (stops listening for key bindings and stops clicking if active)
function stopClicker() {
  ipcRenderer.send('stop-clicker');
  clickerRunning = false;
  listenerActive = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  showStatus('Clicker stopped and key bindings disabled', 'info');
}

// Listen for clicker status updates
ipcRenderer.on('clicker-stopped', () => {
  clickerRunning = false;
  // Keep listener active, just clicking stopped
  // Don't change button states here
  showStatus('Clicking stopped. Key bindings still active.', 'info');
});

ipcRenderer.on('clicker-started', () => {
  clickerRunning = true;
  showStatus('Clicking started!', 'success');
});

ipcRenderer.on('clicker-listener-started', () => {
  listenerActive = true;
  clickerRunning = false;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  showStatus('Listening for key bindings. Press your start key to begin clicking.', 'info');
});

// Event listeners
clickIntervalSlider.addEventListener('input', updateIntervalDisplay);

saveBtn.addEventListener('click', () => {
    saveConfig();
});

startBtn.addEventListener('click', () => {
    startClicker();
});

stopBtn.addEventListener('click', () => {
    stopClicker();
});

// Prevent non-alphanumeric keys in key inputs
[keyStart, keyStop, keyExit, keyUpdate].forEach(input => {
    input.addEventListener('keydown', (e) => {
        // Allow backspace, delete, tab, escape, enter
        if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
            // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        // Ensure that it is a number or letter and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 65 || e.keyCode > 90)) {
            e.preventDefault();
        }
    });
    
    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    });
});

// Initialize
loadConfig();
stopBtn.disabled = true;
