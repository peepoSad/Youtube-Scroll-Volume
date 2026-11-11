
const DEFAULT_SETTINGS = {
    volumeStep: 0.05,
    indicatorDuration: 1000,
    showIndicator: true
};

let settings = { ...DEFAULT_SETTINGS };

const indicatorTimers = new WeakMap();

// Load saved settings.
chrome.storage.sync.get(DEFAULT_SETTINGS, (savedSettings) => {
    settings = { ...DEFAULT_SETTINGS, ...savedSettings };
});

// Listen for changes made in the popup.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;

    for (const [key, change] of Object.entries(changes)) {
        if (key in DEFAULT_SETTINGS) {
            settings[key] = change.newValue;
        }
    }
});

function updateVolumeIndicator(player, video) {
    let indicator = player.querySelector(
        ".yt-scroll-volume-indicator"
    );

    // Hide the indicator if disabled.
    if (!settings.showIndicator) {
        if (indicator) {
            indicator.classList.remove("visible");
            clearTimeout(indicatorTimers.get(player));
        }

        return;
    }

    if (!indicator) {
        indicator = document.createElement("div");
        indicator.className = "yt-scroll-volume-indicator";

        player.appendChild(indicator);
    }

    const volume = Math.round(video.volume * 100);

    let icon = "🔊";

    if (video.muted || volume === 0) {
        icon = "🔇";
    } else if (volume < 50) {
        icon = "🔉";
    }

    indicator.innerHTML = `
        <span class="yt-scroll-volume-icon">${icon}</span>
        <span class="yt-scroll-volume-value">${volume}%</span>
    `;

    indicator.classList.add("visible");

    clearTimeout(indicatorTimers.get(player));

    const timer = setTimeout(() => {
        indicator.classList.remove("visible");
    }, settings.indicatorDuration);

    indicatorTimers.set(player, timer);
}

document.addEventListener("wheel", (event) => {
    if (event.ctrlKey) return;
    if (!(event.target instanceof Element)) return;

    const player = event.target.closest(".html5-video-player");

    if (!player || event.deltaY === 0) return;

    const video = player.querySelector("video");

    if (!video) return;

    event.preventDefault();
    event.stopPropagation();

    const direction = event.deltaY < 0 ? 1 : -1;

    const newVolume = Math.max(
        0,
        Math.min(1, video.volume + direction * settings.volumeStep)
    );

    video.volume = newVolume;

    if (direction > 0) {
        video.muted = false;
    }

    updateVolumeIndicator(player, video);

}, { capture: true, passive: false });
