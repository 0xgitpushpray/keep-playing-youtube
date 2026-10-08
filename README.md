# Keep Playing for YouTube

A tiny Chrome extension that stops **YouTube Music** and **YouTube** from pausing your music with the
*"Are you still there?"* / *"Video paused. Continue watching?"* prompt.

No tracking, no network requests, no remote code. One permission (`storage`) to remember your on/off setting.

## How it works

The extension uses two layers:

1. **Prevention** (`src/keepalive.js`): YouTube decides you're idle by checking `window._lact`, the timestamp
   of your last mouse or keyboard input. This script runs in the page context and refreshes that timestamp
   once a minute, so the idle prompt shouldn't be triggered at all.
2. **Fallback** (`src/content.js`): if a prompt shows up anyway, the script clicks **Yes** and resumes playback.
   - YouTube Music: detects `ytmusic-you-there-renderer`.
   - YouTube: detects the confirm dialog in `ytd-popup-container`, but only when the video is paused **and**
     you haven't clicked or typed in the last 30 seconds. That way it never confirms dialogs you opened
     yourself, such as "Remove from playlist?".

The toolbar popup has an on/off switch and a count of how many prompts have been dismissed.

## Install (from source)

1. Download this repository (**Code → Download ZIP**, then unzip it, or `git clone` it).
2. Open `chrome://extensions` in Chrome (also works in Edge, Brave, Opera, and other Chromium browsers).
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked** and select the project folder (the one containing `manifest.json`).
5. Reload any YouTube / YouTube Music tabs that were already open.

## Project structure

```
manifest.json        Extension manifest (Manifest V3)
src/keepalive.js     Page-context script that keeps the activity timestamp fresh
src/content.js       Detects and dismisses the idle prompt, resumes playback
popup/               Toolbar popup (toggle + counter)
icons/               Extension icons
```

## Troubleshooting

- **The prompt still appears.** YouTube changes its markup from time to time. Please
  [open an issue](../../issues) and include the site (YouTube or YouTube Music) and, if you can, the prompt's HTML.
  To get it, right-click the dialog, choose **Inspect**, then right-click the highlighted element and choose
  **Copy → Copy outerHTML**.
- **Nothing happens after installing.** Reload the YouTube tab. Content scripts are only injected into pages
  loaded after the extension was installed.

## Contributing

Issues and pull requests are welcome. There is no build step: edit the files, then click the reload icon
on the extension card in `chrome://extensions`.

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by YouTube or Google.

## License

[MIT](LICENSE)
