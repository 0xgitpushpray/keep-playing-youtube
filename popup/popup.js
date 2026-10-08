const toggle = document.getElementById('enabled');
const counter = document.getElementById('dismissed');

chrome.storage.sync.get({ enabled: true }, (res) => {
  toggle.checked = res.enabled;
});

chrome.storage.local.get({ dismissed: 0 }, (res) => {
  counter.textContent = res.dismissed;
});

toggle.addEventListener('change', () => {
  chrome.storage.sync.set({ enabled: toggle.checked });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.dismissed) {
    counter.textContent = changes.dismissed.newValue;
  }
});
