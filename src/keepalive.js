// Runs in the page's own JavaScript world (MAIN), so it can touch YouTube's globals.
//
// YouTube decides whether you are "still there" by comparing the current time with
// `window._lact` (last activity timestamp), which it updates on real mouse/keyboard
// input. Refreshing it periodically keeps the idle prompt from being triggered at all.
// content.js is the fallback that dismisses the prompt if it shows up anyway.
(() => {
  // Background tabs throttle timers to roughly once per minute, so don't rely on
  // anything faster than that.
  const INTERVAL_MS = 60 * 1000;

  // content.js (isolated world) mirrors the on/off setting into this attribute,
  // since chrome.storage is not available in the MAIN world.
  const isEnabled = () => document.documentElement.dataset.ytkpEnabled !== 'false';

  const refreshActivity = () => {
    if (!isEnabled()) return;
    window._lact = Date.now();
  };

  refreshActivity();
  setInterval(refreshActivity, INTERVAL_MS);
})();
