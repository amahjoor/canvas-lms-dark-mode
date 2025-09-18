# Better Canvas - Chrome Extension

A Chrome extension that enhances the Canvas Learning Management System with dark mode, bloat removal, and fullscreen presentations.

## Features

### 🌙 Dark Mode
- Complete dark theme for all Canvas pages
- Covers main content, sidebar, headers, and navigation
- Easy toggle in extension popup
- Persistent settings across browser sessions

### 🧹 Bloat Removal
- Hide unnecessary sidebar elements
- Remove logo, history, commons, and other bloat
- Clean, focused interface
- Toggle control in extension popup

### 🖥️ Fullscreen Presentations
- Add fullscreen button (⛶) to PowerPoint/PDF viewers
- Fullscreen within browser tab (not entire device)
- Hide all Canvas UI when in fullscreen
- Easy exit with X button
- Works with Canvas file viewers

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download the Extension**
   - Download or clone this repository
   - Extract to a folder on your computer

2. **Open Chrome Extensions Page**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Better Canvas" and click the pin icon
   - The extension icon will now appear in your toolbar

### Method 2: Pack and Install (Production)

1. **Pack the Extension**
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select the extension folder
   - Chrome will create a `.crx` file

2. **Install the Packed Extension**
   - Drag the `.crx` file to the extensions page
   - Click "Add extension" when prompted

## Usage

### Basic Usage

1. **Navigate to Canvas**
   - Go to any Canvas page (e.g., `canvas.gmu.edu`)
   - The extension automatically detects Canvas pages

2. **Open Extension Popup**
   - Click the Better Canvas icon in your toolbar
   - You'll see the status and toggle controls

3. **Toggle Features**
   - **Dark Mode**: Click the toggle to enable/disable dark theme
   - **Hide Bloat**: Click to remove sidebar elements
   - **Fullscreen Mode**: Enable fullscreen presentation buttons

### Fullscreen Presentations

1. **Find Presentations**
   - Navigate to any PowerPoint or PDF file in Canvas
   - Look for the ⛶ button in the top-right corner

2. **Enter Fullscreen**
   - Click the ⛶ button
   - The presentation will go fullscreen within the tab
   - All Canvas UI will be hidden

3. **Exit Fullscreen**
   - Click the ✕ button in the top-right corner
   - Return to normal Canvas view

## Supported Canvas Instances

- **Standard Canvas**: `*.instructure.com`
- **Custom Domains**: `*.gmu.edu`, `*.edu`
- **Canvas Cloud**: `*.canvas.instructure.com`

## Technical Details

### Architecture
- **Manifest V3**: Latest Chrome extension standard
- **Content Scripts**: Inject CSS and handle dynamic content
- **Chrome Storage**: Persistent settings across sessions
- **Mutation Observer**: Handle dynamically loaded content

### CSS Targeting Strategy
- High specificity selectors for Canvas elements
- Data attributes on body element for immediate application
- Comprehensive coverage of all Canvas UI components
- Fallback methods for different Canvas instances

### Browser Compatibility
- **Primary**: Chrome (Manifest V3)
- **Minimum**: Chrome 88+
- **Tested**: Chrome 120+

## File Structure

```
BetterCanvas2/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── content.js             # Content script for Canvas pages
├── content.css            # Dark mode and styling
├── background.js          # Background service worker
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## Development

### Prerequisites
- Chrome browser (version 88+)
- Basic knowledge of Chrome extensions
- Text editor or IDE

### Setup Development Environment

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd BetterCanvas2
   ```

2. **Load in Chrome**
   - Follow installation Method 1 above
   - Enable developer mode
   - Load unpacked extension

3. **Make Changes**
   - Edit files as needed
   - Reload extension in Chrome
   - Test on Canvas pages

### Testing

1. **Test on Canvas Pages**
   - Navigate to various Canvas pages
   - Test all three features
   - Verify settings persistence

2. **Test Different Canvas Instances**
   - Try different school Canvas sites
   - Verify compatibility

3. **Debug Issues**
   - Open Chrome DevTools
   - Check console for errors
   - Use extension popup for status

## Troubleshooting

### Common Issues

**Extension Not Working**
- Check if you're on a Canvas page
- Verify extension is enabled
- Try reloading the page

**Dark Mode Not Applied**
- Check if dark mode toggle is enabled
- Try refreshing the page
- Check browser console for errors

**Fullscreen Button Not Appearing**
- Ensure fullscreen mode is enabled
- Check if you're viewing a presentation
- Try refreshing the page

**Settings Not Saving**
- Check Chrome storage permissions
- Try disabling and re-enabling extension
- Clear browser cache

### Debug Mode

1. **Open Chrome DevTools**
   - Right-click on Canvas page
   - Select "Inspect"
   - Go to Console tab

2. **Check Extension Logs**
   - Look for "Better Canvas" messages
   - Check for any error messages

3. **Verify Content Script**
   - Go to Sources tab
   - Look for content.js in the file tree
   - Set breakpoints if needed

## Contributing

### How to Contribute

1. **Fork the Repository**
   - Create your own fork
   - Make your changes
   - Test thoroughly

2. **Submit Pull Request**
   - Describe your changes
   - Include test results
   - Follow coding standards

### Code Style

- Use consistent indentation (2 spaces)
- Comment complex functionality
- Follow JavaScript best practices
- Test on multiple Canvas instances

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

### Getting Help

1. **Check Documentation**
   - Read this README thoroughly
   - Check troubleshooting section

2. **Report Issues**
   - Create GitHub issue
   - Include browser version
   - Describe steps to reproduce

3. **Feature Requests**
   - Submit via GitHub issues
   - Explain use case
   - Consider contributing

## Changelog

### Version 1.0.0
- Initial release
- Dark mode support
- Bloat removal functionality
- Fullscreen presentation feature
- Chrome Manifest V3 compatibility

## Acknowledgments

- Canvas Learning Management System by Instructure
- Chrome Extension API documentation
- Canvas community for feedback and testing

---

**Better Canvas** - Enhancing your Canvas experience, one feature at a time! 🎓✨
