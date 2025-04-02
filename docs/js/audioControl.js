document.addEventListener("DOMContentLoaded", function () {
    const audioElement = document.getElementById("backgroundAudio");
    const playButton = document.getElementById("playAudioButton");
    const musicSelector = document.createElement("select");
    
    const pageMusic = {
        "index.html": "assets/audio/intro.mp3",
        "planting.html": "assets/audio/seeding.mp3",
        "QR.html": "assets/audio/jazz.mp3",
        "home.html": "assets/audio/slowlife.mp3"
    };

    const playlist = [
        "assets/audio/garden.mp3",
        "assets/audio/seeding.mp3",
        "assets/audio/jazz.mp3",
        "assets/audio/slowlife.mp3",
        "assets/audio/dawnofchange.mp3",
        "assets/audio/TeaParty.mp3",
        "assets/audio/FlowerGarden.mp3"
    ];

    const songNames = {
        "assets/audio/garden.mp3": "Garden Melody",
        "assets/audio/seeding.mp3": "Seeding Time",
        "assets/audio/jazz.mp3": "Jazz Interlude",
        "assets/audio/slowlife.mp3": "Slow Life",
        "assets/audio/dawnofchange.mp3": "Dawn of Change",
        "assets/audio/intro.mp3": "Introduction"
    };

    let currentTrack = 0;
    let isPlaying = false;
    let userSelectedTrack = false;

    const currentPage = window.location.pathname.split("/").pop();

    if (pageMusic[currentPage]) {
        audioElement.src = pageMusic[currentPage];
        const pageTrackIndex = playlist.indexOf(pageMusic[currentPage]);
        if (pageTrackIndex !== -1) {
            currentTrack = pageTrackIndex;
        }
    } else {
        audioElement.src = playlist[0];
    }

    function updateButtonText() {
        playButton.textContent = audioElement.paused ? "Play Music" : "Pause Music";
    }

    function playNextTrack() {
        currentTrack = (currentTrack + 1) % playlist.length; 
        audioElement.src = playlist[currentTrack];
        audioElement.play();
        musicSelector.value = playlist[currentTrack];
    }

    audioElement.addEventListener("ended", () => {
        userSelectedTrack = false; 
        playNextTrack();
    });

    playButton.addEventListener("click", () => {
        if (audioElement.paused) {
            audioElement.play();
            isPlaying = true;
        } else {
            audioElement.pause();
            isPlaying = false;
        }
        updateButtonText();
    });

musicSelector.id = "musicSelector";
musicSelector.className = "audio-selector"; 

const defaultOption = document.createElement("option");
defaultOption.value = "";
defaultOption.textContent = "-- Select a Song --";
musicSelector.appendChild(defaultOption);

playlist.forEach(song => {
    const option = document.createElement("option");
    option.value = song;
    option.textContent = songNames[song] || song.split('/').pop().replace('.mp3', '');
    musicSelector.appendChild(option);
});

const audioControlContainer = document.createElement("div");
audioControlContainer.className = "audio-control-container";
audioControlContainer.style.position = "absolute";
audioControlContainer.style.top = "var(--space-sm)";
audioControlContainer.style.right = "var(--space-sm)";
audioControlContainer.style.zIndex = "var(--z-index-ui)";
audioControlContainer.style.display = "flex";
audioControlContainer.style.flexDirection = "column";
audioControlContainer.style.alignItems = "flex-end";

musicSelector.style.marginTop = "5px";
musicSelector.style.padding = "5px";
musicSelector.style.width = "100%";

const buttonParent = playButton.parentNode;

// Remove the button from its current position
buttonParent.removeChild(playButton);

// Add both elements to the container
audioControlContainer.appendChild(playButton);
audioControlContainer.appendChild(musicSelector);

// Add the container to the original parent
buttonParent.appendChild(audioControlContainer);

// Add responsive styling via a style tag
const styleTag = document.createElement("style");
styleTag.textContent = `
  @media (min-width: 768px) {
    .audio-control-container {
      top: var(--space-md) !important;
      right: var(--space-md) !important;
    }
  }
`;
document.head.appendChild(styleTag);

// Make sure the play button keeps its original styling
playButton.style.position = "static";  // Remove absolute positioning from button
    
    // Handle selection change
    musicSelector.addEventListener("change", function() {
        if (this.value) {
            audioElement.src = this.value;
            userSelectedTrack = true;
            
            // Find the index in the playlist for when this track ends
            const selectedIndex = playlist.indexOf(this.value);
            if (selectedIndex !== -1) {
                currentTrack = selectedIndex;
            }
            
            // Start playing automatically when a song is selected
            audioElement.play();
            isPlaying = true;
            updateButtonText();
        }
    });
    
    // Initial button text setup
    updateButtonText();
});