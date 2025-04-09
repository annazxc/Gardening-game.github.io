function initializeGame() {
    let playerName = promptForPlayerName();
    if (playerName) {
        localStorage.setItem('playerName', playerName);
        welcomePlayer(playerName);
    } else {
        handleNoName();
    }
}

function promptForPlayerName() {
    let storedName = localStorage.getItem('playerName');
    
    if (storedName) {
        if (confirm(`Welcome back! Continue as ${storedName}?`)) {
            return storedName;
        }
    }
    
    let name = prompt("What is your name, brave explorer?"); 
    return name.trim();
}

function welcomePlayer(name) {
    let welcomeModal = document.createElement('div');
    welcomeModal.className = 'welcome-modal';
    welcomeModal.innerHTML = `
        <div class="welcome-content">
            <h2>Welcome, ${name} !</h2>
            <p>Down the rabbit hole you go !<br>Let the adventure begin !</p>    
            <div class="game-tips">
                <h3>Adventurer's Tips:</h3>
                <ul>
                    <li>A little rest in the cabin, and your strength shall bloom anew</li>
                    <li>Changing scenes costs 10 stamina — so dive deep into each place before moving on.</li>
                    <li>Mark your wonders on the map as you go</li>
                </ul>
            </div>
            <div class="character-stats">
                <h3>Initial Stats:</h3>
                <p>Health: 100/100</p>
                <p>Stamina: 50/50</p>
                <p>Backpack: Seeds, Map, Notebook</p>
            </div>
            <button id="begin-adventure">Begin Your Quest</button>
        </div>
    `;
    
    document.body.appendChild(welcomeModal);

    document.getElementById('begin-adventure').addEventListener('click', function() {
        welcomeModal.classList.add('fade-out');
        
        setTimeout(function() {
            document.body.removeChild(welcomeModal);
        }, 1000);
    });

    initializePlayerStats(name);
}

function handleNoName() {
    let defaultName = "Mysterious Explorer";
    localStorage.setItem('playerName', defaultName);
    welcomePlayer(defaultName);
}

function initializePlayerStats(name) {
    let playerStats = {
        name: name,
        health: 100,
        maxHealth: 100,
        stamina: 50,
        maxStamina: 50,
        backpack: ["Seed", "Map", "Notebook"],
        discoveries: [],
        gameTime: 0 // in-game time tracker
    };
    
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
    createPlayerHUD();
}

function createPlayerHUD() {
    let hud = document.createElement('div');
    hud.id = 'player-hud';
    hud.className = 'player-hud';
    let stats = JSON.parse(localStorage.getItem('playerStats'));
    
    hud.innerHTML = `
        <div class="hud-name">${stats.name}</div>
        <div class="hud-health">Health : ${stats.health}/${stats.maxHealth}</div>
        <div class="hud-stamina">Stamina : ${stats.stamina}/${stats.maxStamina}</div>
        <div class="hud-backpack">
            <button id="toggle-backpack">Backpack(${stats.backpack.length})</button>
        </div>
    `;
    
    document.body.appendChild(hud);
    
    document.getElementById('toggle-backpack').addEventListener('click', toggleBackpack);
}

function toggleBackpack() {
    let backpackPanel = document.getElementById('backpack-panel');
    
    if (backpackPanel) {
        // Toggle visibility if it exists
        if (backpackPanel.style.display === 'none') {
            backpackPanel.style.display = 'block';
        } else {
            backpackPanel.style.display = 'none';
        }
    } else {
        createBackpackPanel();
    }
}

function createBackpackPanel() {
    let stats = JSON.parse(localStorage.getItem('playerStats'));
    
    let panel = document.createElement('div');
    panel.id = 'backpack-panel';
    panel.className = 'backpack-panel';
    
    let backpackHTML = '<h3>Backpack</h3><ul>';
    stats.backpack.forEach(item => {
        backpackHTML += `<li>${item}</li>`;
    });
    backpackHTML += '</ul><button id="close-backpack">Close</button>';
    
    panel.innerHTML = backpackHTML;
    document.body.appendChild(panel);
    
    document.getElementById('close-backpack').addEventListener('click', function() {
        panel.style.display = 'none';
    });
}

function showMarkerAt(place) {
    let marker = document.getElementById("marker");
    let mapContainer = document.getElementById("map-container");
    let cameraContainer = document.getElementById("camera-container");
    let map = document.getElementById("map");
    let sleepBtn = document.getElementById("sleepBtn");
    
    // Update player stats based on movement (reduce stamina)
    updateStaminaOnMove();
        
    if (marker && place) {
        marker.style.top = `${place.top * 100}%`;
        marker.style.left = `${place.left * 100}%`;
                
        // Update markerPosition
        markerPosition.top = place.top;
        markerPosition.left = place.left;
        markerPosition.level = place.level;
                    
        map.src = `assets/images/level_${place.level}.png`;
                
        // Display location name to the player
        showLocationName(place.info || "Unknown Area");
        
        if (place.info === "Pavilion") {
            sleepBtn.style.display = "block";
            sleepBtn.onclick = function() {
                rest();
                showMarkerAt(places[6]);
            };
            document.getElementById("startExploringBtn").style.display = "none";
        } else {
            sleepBtn.style.display = "none";
            document.getElementById("startExploringBtn").style.display = "block";
        }
                
        cameraContainer.style.display = "none";
        mapContainer.style.display = "block";
        document.getElementsByClassName('scene-background')[0].style.display = "none";
        
        // Update audio for the new scene
        if (typeof updateAudioForScene === 'function') {
            updateAudioForScene(place.info ? place.info.toLowerCase() : "home");
        }
        
        // Re-initialize audio controls after scene change
        if (typeof initAudioControls === 'function') {
            setTimeout(initAudioControls, 100);
        }
                
        // Set up controls after map is visible
        setTimeout(function() {
            setupControls();
            mapContainer.focus();
        }, 100);
        
        // Check if this is a new discovery
        checkForDiscovery(place);
    } else {
        console.error("Marker element or place data is missing");
    }
}
function showLocationName(locationName) {
    // Create or update location display
    let locationDisplay = document.getElementById('location-display');
    
    if (!locationDisplay) {
        locationDisplay = document.createElement('div');
        locationDisplay.id = 'location-display';
        locationDisplay.className = 'location-display';
        document.body.appendChild(locationDisplay);
    }
    
    // Show location with fade-in effect
    locationDisplay.textContent = locationName;
    locationDisplay.classList.add('show');
    
    // Hide after a few seconds
    setTimeout(() => {
        locationDisplay.classList.remove('show');
    }, 3000);
}

function updateStaminaOnMove() {
    let stats = JSON.parse(localStorage.getItem('playerStats'));
    stats.stamina = Math.max(0, stats.stamina - 5);
    document.querySelector('.hud-stamina').textContent = `Stamina: ${stats.stamina}/${stats.maxStamina}`;
    localStorage.setItem('playerStats', JSON.stringify(stats));
    if (stats.stamina <= 10) {
        showWarning("Low stamina! Find a resting place soon.");
    }
}

function rest() {
    let stats = JSON.parse(localStorage.getItem('playerStats'));
    
    stats.health = stats.maxHealth;
    stats.stamina = stats.maxStamina;
    
    showMessage("You've rested and recovered your health and stamina!");
    
    document.querySelector('.hud-health').textContent = `Health: ${stats.health}/${stats.maxHealth}`;
    document.querySelector('.hud-stamina').textContent = `Stamina: ${stats.stamina}/${stats.maxStamina}`;
    
    localStorage.setItem('playerStats', JSON.stringify(stats));
}

function showMessage(message) {
    let messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.textContent = message;
    
    document.body.appendChild(messageBox);
    
    setTimeout(() => {
        messageBox.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(messageBox);
        }, 1000);
    }, 3000);
}

function showWarning(message) {
    let warningBox = document.createElement('div');
    warningBox.className = 'warning-box';
    warningBox.textContent = message;
    
    document.body.appendChild(warningBox);
    
    setTimeout(() => {
        warningBox.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(warningBox);
        }, 1000);
    }, 3000);
}

function checkForDiscovery(place) {
    if (!place.info) return;
    
    let stats = JSON.parse(localStorage.getItem('playerStats'));
    
    // Check if this location has been discovered before
    if (!stats.discoveries.includes(place.info)) {
        stats.discoveries.push(place.info);
        localStorage.setItem('playerStats', JSON.stringify(stats));
        
        // Show discovery notification
        showDiscovery(place.info);
    }
}

function showDiscovery(locationName) {
    let discoveryBox = document.createElement('div');
    discoveryBox.className = 'discovery-box';
    discoveryBox.innerHTML = `
        <h3>New Discovery!</h3>
        <p>You've discovered: ${locationName}</p>
    `;
    
    document.body.appendChild(discoveryBox);
    
    setTimeout(() => {
        discoveryBox.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(discoveryBox);
        }, 1000);
    }, 4000);
}

document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});


//for map
const images = [ new Image(), new Image()];
images[0].src = 'assets/images/level_0.png';
images[1].src = 'assets/images/level_1.png';
images[2].src = 'assets/images/level_2.png';