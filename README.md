# Canvas LMS dark mode

A Chrome extension for Canvas. It applies a dark theme, hides global-nav and sidebar clutter, and adds a fullscreen button on file viewers. Settings are stored with `chrome.storage.sync`.

Dark mode and Hide Bloat start off. Fullscreen Mode starts on.

## Quick start

Chrome 88 or newer. The extension is loaded unpacked. It is not in the Chrome Web Store.

```bash
git clone https://github.com/amahjoor/canvas-lms-dark-mode.git
cd canvas-lms-dark-mode
```

1. Open `chrome://extensions/`.
2. Turn on Developer mode.
3. Click Load unpacked and select this folder. The manifest is at the repo root.
4. Pin Canvas LMS Dark Mode, then open a Canvas page such as `canvas.gmu.edu`.
5. Use the toolbar popup to toggle Dark Mode, Hide Bloat, and Fullscreen Mode.

The popup says "Connected to Canvas" only on a page the extension matches.

## What the toggles change

Dark Mode adds a dark theme to the Canvas page through `content.css`.

Hide Bloat hides the global-nav inbox, history, commons, Kaltura, and help links, the footer, and the right sidebar. A few dashboard-card rules were written for one school's Canvas and will not match every institution.

Fullscreen Mode injects a button on a Canvas file viewer. The viewer fills the browser tab, and the Canvas chrome is hidden. The exit control is the X button the extension adds. This is not the operating system's fullscreen.

## Where it runs

The manifest matches:

- `*.instructure.com`
- `*.canvas.instructure.com`
- `*.gmu.edu`
- `*.edu`

Permissions are `activeTab`, `storage`, and `scripting`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The useful change is a selector that works on more Canvas layouts, with a note about which page you tested.

## License

[MIT](LICENSE)
