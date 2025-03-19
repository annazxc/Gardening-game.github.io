
const playAudioButton = document.getElementById('playAudioButton');
const backgroundAudio = document.getElementById('backgroundAudio');


if (backgroundAudio.autoplay && !backgroundAudio.paused) {
    playAudioButton.textContent = 'Pause Background Music';
} else {
    playAudioButton.textContent = 'Play Background Music';
}


playAudioButton.addEventListener('click', () => {
    if (backgroundAudio.paused) {
        backgroundAudio.play();
        playAudioButton.textContent = 'Pause Background Music';
    } else {
        backgroundAudio.pause();
        playAudioButton.textContent = 'Play Background Music';
    }
});