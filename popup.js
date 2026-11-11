
const volumeStep = document.getElementById("volumeStep");
const indicatorDuration = document.getElementById("indicatorDuration");
const showIndicator = document.getElementById("showIndicator");

const volumeValue = document.getElementById("volumeValue");
const durationValue = document.getElementById("durationValue");

const defaults = {
    volumeStep: 0.05,
    indicatorDuration: 1000,
    showIndicator: true
};

function updateLabels() {
    volumeValue.textContent =
        `${Math.round(Number(volumeStep.value) * 100)}%`;

    const duration = Number(indicatorDuration.value) / 1000;

    durationValue.textContent =
        `${duration} ${duration === 1 ? "second" : "seconds"}`;
}

function saveSettings() {
    const settings = {
        volumeStep: Number(volumeStep.value),
        indicatorDuration: Number(indicatorDuration.value),
        showIndicator: showIndicator.checked
    };

    chrome.storage.sync.set(settings);
    updateLabels();
}

chrome.storage.sync.get(defaults, (settings) => {
    // Match volume options numerically to avoid formatting issues.
    const matchingVolumeOption = [...volumeStep.options].find(
        option => Number(option.value) === Number(settings.volumeStep)
    );

    volumeStep.value = matchingVolumeOption
        ? matchingVolumeOption.value
        : "0.05";

    indicatorDuration.value = String(settings.indicatorDuration);
    showIndicator.checked = settings.showIndicator;

    updateLabels();
});

volumeStep.addEventListener("change", saveSettings);
indicatorDuration.addEventListener("change", saveSettings);
showIndicator.addEventListener("change", saveSettings);
