// Runs in the extension's isolated world. Watches for YouTube's idle prompts
// ("Are you still there?" on YouTube Music, "Video paused. Continue watching?" on
// YouTube), confirms them, and resumes playback.
(() => {
  const CHECK_INTERVAL_MS = 1500;
  // After a dismissal, ignore further matches briefly so we never double-click.
  const COOLDOWN_MS = 3000;
  // YouTube's generic confirm dialog is reused for other things (e.g. "remove from
  // playlist?"). Only auto-confirm it if the user hasn't touched the page recently,
  // since the idle prompt by definition appears after a long period without input.
  const USER_IDLE_MS = 30 * 1000;

  let enabled = true;
  let lastUserInput = 0;
  let lastDismissed = 0;

  const root = document.documentElement;
  const syncFlag = () => { root.dataset.ytkpEnabled = String(enabled); };

  chrome.storage.sync.get({ enabled: true }, (res) => {
    enabled = res.enabled;
    syncFlag();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.enabled) {
      enabled = changes.enabled.newValue;
      syncFlag();
    }
  });

  for (const type of ['mousedown', 'keydown', 'touchstart', 'wheel']) {
    window.addEventListener(type, (e) => {
      if (e.isTrusted) lastUserInput = Date.now();
    }, { capture: true, passive: true });
  }

  const isVisible = (el) => {
    if (!el) return false;
    if (typeof el.checkVisibility === 'function') {
      return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    }
    return el.getClientRects().length > 0;
  };

  const getVideo = () =>
    document.querySelector('video.html5-main-video') || document.querySelector('video');

  const firstVisible = (scope, selector) =>
    [...scope.querySelectorAll(selector)].find(isVisible) || null;

  // YouTube Music: a dedicated renderer whose only button is "Yes".
  const findMusicPrompt = () => {
    const renderer = firstVisible(document, 'ytmusic-you-there-renderer');
    if (!renderer) return null;
    return firstVisible(renderer, 'button, tp-yt-paper-button, yt-button-renderer');
  };

  // YouTube: a generic confirm dialog shown while the video is paused.
  const findYouTubePrompt = () => {
    const dialog = firstVisible(document, 'ytd-popup-container yt-confirm-dialog-renderer');
    if (!dialog) return null;
    const video = getVideo();
    if (!video || !video.paused) return null;
    if (Date.now() - lastUserInput < USER_IDLE_MS) return null;
    return firstVisible(dialog, '#confirm-button button, #confirm-button');
  };

  const resumePlayback = () => {
    const video = getVideo();
    if (enabled && video && video.paused && !video.ended) {
      video.play().catch(() => {});
    }
  };

  const recordDismissal = () => {
    chrome.storage.local.get({ dismissed: 0 }, (res) => {
      chrome.storage.local.set({ dismissed: res.dismissed + 1 });
    });
  };

  const check = () => {
    if (!enabled || Date.now() - lastDismissed < COOLDOWN_MS) return;
    const button = findMusicPrompt() || findYouTubePrompt();
    if (!button) return;

    lastDismissed = Date.now();
    button.click();
    // Clicking the button normally resumes playback; nudge it if it didn't.
    setTimeout(resumePlayback, 800);
    recordDismissal();
  };

  setInterval(check, CHECK_INTERVAL_MS);

  // The prompt pauses the video, so also check right after any pause.
  // Media events don't bubble, but a capturing listener still receives them.
  document.addEventListener('pause', () => {
    setTimeout(check, 300);
    setTimeout(check, 1000);
  }, true);
})();
