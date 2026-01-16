# Auto Clicker v1.0

A simple and powerful auto clicker application built with Node.js for Windows. Perfect for automating repetitive clicking tasks in games like Roblox or browser applications like Chrome.

## Features

- ✅ **Global Hotkeys** - Works even when the terminal window is not focused
- ✅ **Simple Controls** - Easy-to-use number key controls (1, 2, 3, 4)
- ✅ **Dynamic Position Updates** - Update click position while clicking is active
- ✅ **Configurable Click Speed** - Adjustable click interval
- ✅ **Mouse Movement** - Automatically moves mouse to saved position before clicking
- ✅ **Cross-Application** - Works with any application (Roblox, Chrome, etc.)

## Requirements

- **Node.js** v20.x (LTS recommended)
- **Windows** 10/11
- **Administrator privileges** (may be required for global keyboard hooks)

## Installation

1. **Install Node.js** (if not already installed):
   - Download from [nodejs.org](https://nodejs.org/) (v20.x LTS recommended)
   - Or use winget: `winget install OpenJS.NodeJS.20`

2. **Clone or download this repository**

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Usage

1. **Start the auto clicker**:
   ```bash
   npm start
   ```
   Or:
   ```bash
   node index.js
   ```

2. **Position your mouse** where you want it to click (e.g., in Roblox or Chrome)

3. **Use the hotkeys** (work globally, even when terminal is not focused):
   - Press **1** to start clicking
   - Press **2** to stop clicking
   - Press **3** to exit the program
   - Press **4** to update click position to current mouse location

## Hotkeys

| Key | Action |
|-----|--------|
| **1** | Start clicking |
| **2** | Stop clicking |
| **3** | Exit program |
| **4** | Update click position |

> **Note**: All hotkeys work globally, meaning they will work even when you're focused on another application (Roblox, Chrome, etc.)

## Configuration

You can modify the settings in `index.js`:

```javascript
const config = {
  clickInterval: 100, // milliseconds between clicks (default: 100ms = 10 clicks/second)
};
```

### Adjusting Click Speed

- **Lower values** = Faster clicking (e.g., `50` = 20 clicks/second)
- **Higher values** = Slower clicking (e.g., `200` = 5 clicks/second)
- **Default**: `100` milliseconds (10 clicks/second)

## How It Works

1. When you press **1**, the auto clicker:
   - Saves your current mouse position
   - Starts clicking at that position repeatedly

2. While clicking:
   - The mouse moves to the saved position before each click
   - Clicking continues even if you switch to another window
   - You can press **4** anytime to update the click position

3. Press **2** to stop clicking at any time

## Tips

- Position your mouse cursor before pressing **1** to start
- Use **4** to quickly update the click position if the target moves
- The clicker works best when the target window (Roblox/Chrome) is in focus
- You can switch between applications while clicking is active

## Troubleshooting

### Hotkeys Not Working

- Make sure the program is running
- Try running as Administrator (right-click PowerShell/Terminal → Run as Administrator)
- Ensure no other application is blocking global keyboard hooks

### Clicking Not Working

- Make sure the target window is visible and not minimized
- Verify the click position is correct (use **4** to update it)
- Check that the target application accepts mouse clicks

## Future Enhancements

- GUI interface
- Multiple click patterns
- Click position recording/macros
- Randomization features (random delays, positions)
- Application-specific profiles
- Click count limits
- Scheduled clicking

## License

MIT

## Disclaimer

This tool is for educational and personal use only. Use responsibly and in accordance with the terms of service of any applications you use it with.
