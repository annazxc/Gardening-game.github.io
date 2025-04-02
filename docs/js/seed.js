const collectedWords = [];
const collectedPhrases = [];

function createSeedButton() {
    const seedButton = document.createElement('button');
    seedButton.className = 'btn btn-primary';
    seedButton.id = 'seedButton';
    seedButton.textContent = 'Click for Seeds';
    seedButton.style.display = 'inline-block';
    const mapContainer = document.getElementById('map-container');
    mapContainer.appendChild(seedButton);

    seedButton.style.position = 'absolute';
    seedButton.style.bottom = '10px';
    seedButton.style.left = '50%';
    seedButton.style.transform = 'translateX(-50%)';
    
    seedButton.onclick = function() {
        createBouncingWord();
    };
    setTimeout(function() {
        if (mapContainer.contains(seedButton)) {
            mapContainer.removeChild(seedButton);
        }
    }, 3000);
    
}


function initSeedCollectionSystem() {
    const originalMoveMarker = window.moveMarker;
    window.moveMarker = function(deltaX, deltaY) {
        if (originalMoveMarker) {
            originalMoveMarker(deltaX, deltaY);
        }
        checkForSeedCollection();
    };
}

function checkForSeedCollection() {
    const playerPosition = getPlayerPosition();
    const activeSeeds = document.querySelectorAll('.bouncing-seed');
    
    activeSeeds.forEach(seed => {
        const seedRect = seed.getBoundingClientRect();
        const playerRect = document.getElementById('marker').getBoundingClientRect();
        
        if (rectsIntersect(seedRect, playerRect)) {
            collectSeed(seed);
        }
    });
}

function rectsIntersect(rect1, rect2) {
    return !(rect1.right < rect2.left || 
            rect1.left > rect2.right || 
            rect1.bottom < rect2.top || 
            rect1.top > rect2.bottom);
}

function collectSeed(seedElement) {
    const word = seedElement.textContent;
    collectedWords.push(word);
    updateNotebook(word);
    playSeedCollectSound();
    seedElement.remove();
    checkForCompletedPhrases();
}

function playSeedCollectSound() {
    const audio = new Audio('assets/audio/seed_collect.mp3');
    audio.play().catch(error => {
        console.log("Error playing sound:", error);
    });
}

function createBouncingWord() {
    const randomPhrase = getRandomPhrase();
    const words = randomPhrase.split(' ');
    
    words.forEach(word => {
        const seedElement = document.createElement('div');
        seedElement.className = 'bouncing-seed';
        seedElement.textContent = word;
        seedElement.dataset.originalPhrase = randomPhrase;
        //I.C.
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 50);
        
        const vx = (Math.random() - 0.5) * 5;
        const vy = (Math.random() - 0.5) * 5;
        
        seedElement.style.position = 'absolute';
        seedElement.style.left = x + 'px';
        seedElement.style.top = y + 'px';
        seedElement.dataset.vx = vx;
        seedElement.dataset.vy = vy;
        
        document.body.appendChild(seedElement);
        
        animateBouncing(seedElement);
    });
    setTimeout(function() {
        const remainingSeeds = document.querySelectorAll('.bouncing-seed');
        if (remainingSeeds.length > 0) {
            remainingSeeds.forEach(seed => seed.remove());
            alert(`
                Time's up! 
                Feeling Good?`);
        }
        showCollectionNotebook();

    }, 15000);
}

function animateBouncing(element) {
    let x = parseFloat(element.style.left);
    let y = parseFloat(element.style.top);
    let vx = parseFloat(element.dataset.vx);
    let vy = parseFloat(element.dataset.vy);
    
    function update() {
        x += vx;
        y += vy;
        
        if (x <= 0 || x >= window.innerWidth - element.offsetWidth) {
            vx = -vx;
            element.dataset.vx = vx;
        }
        
        if (y <= 0 || y >= window.innerHeight - element.offsetHeight) {
            vy = -vy;
            element.dataset.vy = vy;
        }
        //apply new position
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}

function getRandomPhrase() {
    const phrases = [
        "We're all mad.",
        "Curiouser still!",
        "No use going back; I'm different now.",
        "Off with their heads!",
        "I've believed six impossible things before breakfast.",
        "Who am I? That's the puzzle.",
        "Start at the beginning, stop at the end.",
        "I'm not crazy; my reality is different.",
        "Every journey begins with a step.",
        "Imagination wins against reality.",
        "If all minded their business, the world would turn faster.",
        "She gave great advice but rarely followed it."
    ];
    
    return phrases[Math.floor(Math.random() * phrases.length)];
}

function updateNotebook(word) {
    let notebook = document.getElementById('word-notebook');
    if (!notebook) {
        notebook = document.createElement('div');
        notebook.id = 'word-notebook';
        notebook.className = 'notebook';
        document.body.appendChild(notebook);
    }
    
    // Add the word to the notebook
    const wordElement = document.createElement('span');
    wordElement.textContent = word + ' ';
    wordElement.className = 'collected-word';
    notebook.appendChild(wordElement);
}

function checkForCompletedPhrases() {
    const phrases = [
        "We're all mad.",
        "Curiouser still!",
        "No use going back; I'm different now.",
        "Off with their heads!",
        "I've believed six impossible things before breakfast.",
        "Who am I? That's the puzzle.",
        "Start at the beginning, stop at the end.",
        "I'm not crazy; my reality is different.",
        "Every journey begins with a step.",
        "Imagination wins against reality.",
        "If all minded their business, the world would turn faster.",
        "She gave great advice but rarely followed it."
    ];
    
    
        const collectedWordsSet = new Set(collectedWords);
    
        phrases.forEach(phrase => {
            // Skip if we've already collected this phrase
            if (collectedPhrases.includes(phrase)) {
                return;
            }
            
            // Split the phrase into words and clean them
            const phraseWords = phrase.toLowerCase().replace(/[.,!?]/g, '').split(' ');
            
            // Check if all words in the phrase have been collected
            const allWordsCollected = phraseWords.every(word => 
                collectedWordsSet.has(word) || 
                collectedWordsSet.has(word + '.') ||
                collectedWordsSet.has(word + ',') ||
                collectedWordsSet.has(word + '!') ||
                collectedWordsSet.has(word + '?')
            );
            if (allWordsCollected) {
                collectedPhrases.push(phrase);
                
                alert(`Congratulations!
                    You've collected all words for the phrase: 
                    ${phrase}`);
                    
                // Highlight the collected phrase in the notebook
                highlightPhrase(phrase);
            }
        });
    }

function highlightPhrase(phrase) {
    const notebook = document.getElementById('word-notebook');
    if (notebook) {
        const html = notebook.innerHTML;
        const highlightedHtml = html.replace(phrase, `<span class="completed-phrase">${phrase}</span>`);
        notebook.innerHTML = highlightedHtml;
    }
}

function getPlayerPosition() {
    const playerMarker = document.getElementById('marker');
    if (marker) {
        const rect = marker.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }
    return { x: 0, y: 0 };
}