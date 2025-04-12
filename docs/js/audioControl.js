document.addEventListener("DOMContentLoaded", function () {
    // Create audio element
    const audioElement = document.createElement("audio");
    audioElement.id = "backgroundAudio";
    document.body.appendChild(audioElement);

    // Create container for audio controls
    const audioControlContainer = document.createElement("div");
    audioControlContainer.className = "audio-control-container";
    audioControlContainer.style.position = "absolute";
    audioControlContainer.style.top = "var(--space-sm)";
    audioControlContainer.style.right = "var(--space-sm)";
    audioControlContainer.style.zIndex = "var(--z-index-ui)";
    audioControlContainer.style.display = "flex";
    audioControlContainer.style.flexDirection = "column";
    audioControlContainer.style.alignItems = "flex-end";
    audioControlContainer.style.gap = "10px"; // Add gap between elements

    // Create audio button
    const playButton = document.createElement("button");
    playButton.id = "playAudioButton";
    playButton.className = "btn btn-primary audio-btn";
    playButton.textContent = "Play Music";
    playButton.style.position = "relative"; // Change to relative positioning
    playButton.style.zIndex = "2"; // Ensure button is above selector

    // Create music selector
    const musicSelector = document.createElement("select");
    musicSelector.id = "musicSelector";
    musicSelector.className = "audio-selector";
    musicSelector.style.marginTop = "5px";
    musicSelector.style.padding = "5px";
    musicSelector.style.width = "200px"; // Fixed width
    musicSelector.style.zIndex = "1"; // Put selector behind button
    
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

    // Setup music selector options
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

    // Remove existing elements if they exist
    const existingButton = document.getElementById("playAudioButton");
    if (existingButton) {
        existingButton.remove();
    }
    const existingSelector = document.getElementById("musicSelector");
    if (existingSelector) {
        existingSelector.remove();
    }

    // Add elements to container
    audioControlContainer.appendChild(playButton);
    audioControlContainer.appendChild(musicSelector);

    // Add container to body
    document.body.appendChild(audioControlContainer);

    // Add responsive styling
    const styleTag = document.createElement("style");
    styleTag.textContent = `
        .audio-control-container {
            transition: all 0.3s ease;
        }
        @media (min-width: 768px) {
            .audio-control-container {
                top: var(--space-md) !important;
                right: var(--space-md) !important;
            }
        }
        .audio-selector {
            background-color: var(--color-background);
            color: var(--color-text);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-sm);
            transition: all 0.3s ease;
        }
        .audio-selector:hover {
            border-color: var(--color-accent);
        }
    `;
    document.head.appendChild(styleTag);

    // Set initial audio source based on current page
    const currentPage = window.location.pathname.split("/").pop();
    if (pageMusic[currentPage]) {
        audioElement.src = pageMusic[currentPage];
        const pageTrackIndex = playlist.indexOf(pageMusic[currentPage]);
        if (pageTrackIndex !== -1) {
            currentTrack = pageTrackIndex;
            musicSelector.value = playlist[currentTrack];
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

    // Event Listeners
    audioElement.addEventListener("ended", () => {
        userSelectedTrack = false; 
        playNextTrack();
    });

    playButton.addEventListener("click", () => {
        if (audioElement.paused) {
            audioElement.play().catch(error => {
                console.error("Error playing audio:", error);
            });
            isPlaying = true;
        } else {
            audioElement.pause();
            isPlaying = false;
        }
        updateButtonText();
    });

    musicSelector.addEventListener("change", function() {
        if (this.value) {
            audioElement.src = this.value;
            userSelectedTrack = true;
            
            const selectedIndex = playlist.indexOf(this.value);
            if (selectedIndex !== -1) {
                currentTrack = selectedIndex;
            }
            
            audioElement.play().catch(error => {
                console.error("Error playing audio:", error);
            });
            isPlaying = true;
            updateButtonText();
        }
    });

    // Initial button text setup
    updateButtonText();
});