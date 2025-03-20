import config from './config.js';

export function setupAccessibility() {
    createAccessibilityToolbar();
    applyStoredAccessibilitySettings();
    setupKeyboardNavigation();
}


function createAccessibilityToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'accessibility-toolbar';
    toolbar.setAttribute('aria-label', 'Accessibility controls');
    toolbar.setAttribute('role', 'toolbar');
    
    const textSizeBtn = createAccessibilityButton('A', 'Toggle text size', toggleTextSize);
    
    const contrastBtn = createAccessibilityButton('C', 'Toggle high contrast', toggleHighContrast);
    
    toolbar.appendChild(textSizeBtn);
    toolbar.appendChild(contrastBtn);
    
    document.body.appendChild(toolbar);
}

function createAccessibilityButton(label, ariaLabel, onClick) {
    const button = document.createElement('button');
    button.textContent = label;
    button.className = 'accessibility-button';
    button.setAttribute('aria-label', ariaLabel);
    button.addEventListener('click', onClick);
    return button;
}

function toggleTextSize() {
    const htmlEl = document.documentElement;
    const currentSize = localStorage.getItem('textSizeEnabled') === 'true';
    const newSize = !currentSize;
    
    if (newSize) {
        htmlEl.classList.add('large-text');
    } else {
        htmlEl.classList.remove('large-text');
    }
    
    localStorage.setItem('textSizeEnabled', newSize);
}

function toggleHighContrast() {
    const htmlEl = document.documentElement;
    const currentContrast = localStorage.getItem('highContrastEnabled') === 'true';
    const newContrast = !currentContrast;
    
    if (newContrast) {
        htmlEl.classList.add('high-contrast');
    } else {
        htmlEl.classList.remove('high-contrast');
    }
    
    config.accessibility.highContrast = newContrast;
    localStorage.setItem('highContrastEnabled', newContrast);
}

/**
 * Applies stored accessibility settings on page load
 */
function applyStoredAccessibilitySettings() {
    const htmlEl = document.documentElement;
    
    // Apply text size setting
    if (localStorage.getItem('textSizeEnabled') === 'true') {
        htmlEl.classList.add('large-text');
    }
    
    // Apply contrast setting
    if (localStorage.getItem('highContrastEnabled') === 'true') {
        htmlEl.classList.add('high-contrast');
        config.accessibility.highContrast = true;
    }
}

/**
 * Sets up keyboard navigation for the game
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        // Get the game scene if available
        const gameScene = window.gameInstance?.scene.getScene('scene-game');
        if (!gameScene) return;
        
        switch (event.key) {
            case 'm': // Machine
                gameScene.requestSeed();
                break;
            case 'p': // Plant
                gameScene.plantSeed();
                break;
            case 'w': // Water
                gameScene.waterPlants();
                break;
            case 'h': // Harvest
                gameScene.harvestPlant();
                break;
            case 'a': // Toggle audio
                if (window.audioController) {
                    if (window.audioController.isPlaying) {
                        window.audioController.pauseAudio();
                    } else {
                        window.audioController.playAudio();
                    }
                }
                break;
        }
    });
}

/**
 * Updates theme colors based on high contrast mode
 */
export function updateThemeColors(isHighContrast) {
    const colors = isHighContrast
        ? {
            primary: "#000066",
            primaryLight: "#0000aa", 
            accent: "#ffff00",
            accentLight: "#ffffaa",
            textPrimary: "#000000",
            textLight: "#ffffff",
            textDark: "#ffffff",
            backgroundOverlay: "rgba(0, 0, 0, 0.9)"
        }
        : config.ui.colors;
    
    return colors;
}