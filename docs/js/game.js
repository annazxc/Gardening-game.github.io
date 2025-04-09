class GameScene {
    constructor() {
        this.hasSeeds = config.game.initialSeeds;
        this.currentPhrase = null;
        this.plants = [];
        this.phrases = [];
        this.buttons = [];
        this.gameContainer = null;
        this.machine = null;
        this.dialogue = null;
        this.bg = null;
        this.seedCountText = null;
        this.pots = [];
    }

    init() {
        // Create game container
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'game-container';
        document.body.appendChild(this.gameContainer);
        
        this.create();
    }
    
    create() {
        this.setupStyles();
        this.setupBackground();
        this.setupMachine();
        this.setupPots();
        this.setupUI();
        this.setupInteractions();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
    }
    
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #game-container {
                position: relative;
                width: 100%;
                height: 100vh;
                overflow: hidden;
            }
            .game-element {
                position: absolute;
                user-select: none;
            }
            
            .dialogue-box {
                background-color:var(--color-background) ;
                color: var(--color-text);
                padding: 15px;
                border-radius: 5px;
                text-align: center;
                max-width: 60%;
                font-size: 20px;
                transform: translate(-50%, -50%);
            }
            .seed-counter {
                background-color: var(--color-background);
                color: var(--color-text);
                padding: 10px;
                border-radius: 5px;
                font-size: 24px;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupBackground() {
        // Add background
        this.bg = document.createElement('img');
        this.bg.src = "placeholder";
        this.bg.className = 'game-element';
        this.bg.style.width = '100%';
        this.bg.style.height = '100%';
        this.bg.style.objectFit = 'cover';
        this.bg.style.zIndex = '1';
        this.gameContainer.appendChild(this.bg);
    }
    
    setupMachine() {
        // Add machine and make it interactive
        this.machine = document.createElement('img');
        this.machine.src = config.assets.machine;
        this.machine.className = 'game-element';
        this.machine.style.zIndex = '2';
        this.gameContainer.appendChild(this.machine);

        // Set position
        const containerRect = this.gameContainer.getBoundingClientRect();
        this.machine.style.left = `${containerRect.width * 0.7 - this.machine.width * 0.4}px`;
        this.machine.style.top = `${containerRect.height * 0.5 - this.machine.height * 0.4}px`;
        this.machine.style.transform = 'scale(0.8)';
    }
    
    setupPots() {
        // Add empty pots for plants
        const containerRect = this.gameContainer.getBoundingClientRect();
        const potY = containerRect.height * 0.8;
        
        for (let i = 0; i < 3; i++) {
            const pot = document.createElement('img');
            pot.src = config.assets.pot;
            pot.className = 'game-element';
            pot.style.zIndex = '2';
            pot.style.transform = 'scale(0.6)';
            this.gameContainer.appendChild(pot);
            
            // Position based on index
            pot.style.left = `${containerRect.width * (0.2 + i * 0.2) - pot.width * 0.3}px`;
            pot.style.top = `${potY - pot.height * 0.3}px`;
            
            this.pots.push(pot);
        }
    }
    
    setupUI() {
        // Add seed counter
        this.seedCountText = document.createElement('div');
        this.seedCountText.className = 'game-element seed-counter';
        this.seedCountText.style.left = '20px';
        this.seedCountText.style.top = '20px';
        this.seedCountText.style.zIndex = '3';
        this.seedCountText.textContent = `Seeds: ${this.hasSeeds}`;
        this.gameContainer.appendChild(this.seedCountText);
        
        // Add dialogue box
        this.dialogue = document.createElement('div');
        this.dialogue.className = 'game-element dialogue-box';
        this.dialogue.style.zIndex = '3';
        this.dialogue.textContent = "Click the vending machine to get a phrase!";
        this.gameContainer.appendChild(this.dialogue);
        
        const containerRect = this.gameContainer.getBoundingClientRect();
        this.dialogue.style.left = `${containerRect.width * 0.5}px`;
        this.dialogue.style.top = `${containerRect.height * 0.2}px`;
        
        // Add game buttons
        this.createGardenButton(
            containerRect.width * 0.2, 
            containerRect.height * 0.9, 
            "Plant Seed", 
            () => this.plantSeed()
        );
        
        this.createGardenButton(
            containerRect.width * 0.5, 
            containerRect.height * 0.9, 
            "Water Plants", 
            () => this.waterPlants()
        );
        
        this.createGardenButton(
            containerRect.width * 0.8, 
            containerRect.height * 0.9, 
            "Harvest Words", 
            () => this.harvestPlant()
        );
    }
    
    setupInteractions() {
        // Add machine interaction
        this.machine.addEventListener('click', () => this.requestSeed());
    }

    resize() {
        const containerRect = this.gameContainer.getBoundingClientRect();
        const width = containerRect.width;
        const height = containerRect.height;
        
        // Ensure minimum size for playability
        const actualWidth = Math.max(width, config.canvas.minWidth);
        const actualHeight = Math.max(height, config.canvas.minHeight);
        
        // Resize and reposition all elements
        if (this.machine) {
            this.machine.style.left = `${actualWidth * 0.7 - this.machine.width * 0.4}px`;
            this.machine.style.top = `${actualHeight * 0.5 - this.machine.height * 0.4}px`;
        }
        
        if (this.dialogue) {
            this.dialogue.style.left = `${actualWidth * 0.5}px`;
            this.dialogue.style.top = `${actualHeight * 0.2}px`;
            this.dialogue.style.maxWidth = `${actualWidth * 0.6}px`;
        }
        
        // Reposition pots
        const potY = actualHeight * 0.8;
        for (let i = 0; i < this.pots.length; i++) {
            this.pots[i].style.left = `${actualWidth * (0.2 + i * 0.2) - this.pots[i].width * 0.3}px`;
            this.pots[i].style.top = `${potY - this.pots[i].height * 0.3}px`;
        }
        
        // Reposition plants if they exist
        for (let i = 0; i < this.plants.length; i++) {
            if (this.plants[i]) {
                const xPos = actualWidth * (0.2 + i * 0.2);
                this.plants[i].style.left = `${xPos - this.plants[i].width * 0.25}px`;
            }
        }
        
        // Adjust buttons
        this.recreateUI();
    }
    
    recreateUI() {
        // Clear existing buttons
        if (this.buttons.length > 0) {
            this.buttons.forEach(btn => {
                if (btn && btn.parentNode) {
                    btn.parentNode.removeChild(btn);
                }
            });
            this.buttons = [];
        }
        
        // Recreate UI elements for new size
        const containerRect = this.gameContainer.getBoundingClientRect();
        
        this.createGardenButton(
            containerRect.width * 0.2, 
            containerRect.height * 0.9, 
            "Plant Seed", 
            () => this.plantSeed()
        );
        
        this.createGardenButton(
            containerRect.width * 0.5, 
            containerRect.height * 0.9, 
            "Water Plants", 
            () => this.waterPlants()
        );
        
        this.createGardenButton(
            containerRect.width * 0.8, 
            containerRect.height * 0.9, 
            "Harvest Words", 
            () => this.harvestPlant()
        );
    }

    createGardenButton(x, y, text, callback) {
        const button = document.createElement('div');
        button.className = 'game-element button';
        button.textContent = text;
        button.style.left = `${x - config.ui.buttonDimensions.width / 2}px`;
        button.style.top = `${y - config.ui.buttonDimensions.height / 2}px`;
        button.style.zIndex = '3';
        
        button.addEventListener('click', callback);
        
        this.gameContainer.appendChild(button);
        this.buttons.push(button);
        
        return button;
    }

    requestSeed() {
        if (this.hasSeeds <= 0) {
            this.dialogue.textContent = "Oh dear! You're out of seeds. Harvest a plant to get more seeds.";
            return;
        }
        
        this.dialogue.textContent = "Please insert a seed...";
        
        // Visual seed insertion animation
        const seed = document.createElement('img');
        seed.src = config.assets.seed1;
        seed.className = 'game-element';
        seed.style.zIndex = '4';
        seed.style.transform = 'scale(0.4)';
        
        const machineRect = this.machine.getBoundingClientRect();
        seed.style.left = `${machineRect.left - 100}px`;
        seed.style.top = `${machineRect.top + machineRect.height / 2}px`;
        
        this.gameContainer.appendChild(seed);
        
        // Animate seed movement with CSS transitions
        setTimeout(() => {
            seed.style.transition = 'all 1s ease';
            seed.style.left = `${machineRect.left + machineRect.width / 2}px`;
            seed.style.top = `${machineRect.top + machineRect.height / 2 + 20}px`;
            
            setTimeout(() => {
                seed.remove();
                this.hasSeeds--;
                this.seedCountText.textContent = `Seeds: ${this.hasSeeds}`;
                
                // Machine processing animation
                this.machine.style.filter = 'brightness(1.5) hue-rotate(60deg)';
                setTimeout(() => {
                    this.machine.style.filter = '';
                    this.dispensePhrase();
                }, 500);
            }, 1000);
        }, 50);
    }
    
    
    
    plantSeed() {
        if (!this.currentPhrase) {
            this.dialogue.textContent = "You need to get a phrase from the machine first!";
            return;
        }
        
        // Find an empty pot
        const containerRect = this.gameContainer.getBoundingClientRect();
        const potY = containerRect.height * 0.8;
        let potPosition = null;
        let potIndex = -1;
        
        for (let i = 0; i < 3; i++) {
            if (!this.plants[i]) {
                potIndex = i;
                potPosition = {
                    x: containerRect.width * (0.2 + i * 0.2),
                    y: potY - 20
                };
                break;
            }
        }
        
        if (potIndex === -1) {
            this.dialogue.textContent = "All pots are full! Harvest a plant first.";
            return;
        }
        
        // Plant the seed with the phrase
        const plant = document.createElement('img');
        plant.src = config.assets.flower;
        plant.className = 'game-element';
        plant.style.zIndex = '3';
        plant.style.transform = 'scale(0)';
        plant.style.left = `${potPosition.x - plant.width * 0.25}px`;
        plant.style.top = `${potPosition.y}px`;
        plant.style.transition = 'all 1.5s ease-out';
        
        this.gameContainer.appendChild(plant);
        
        this.phrases[potIndex] = this.currentPhrase;
        this.plants[potIndex] = plant;
        
        // Growing animation
        setTimeout(() => {
            plant.style.transform = 'scale(0.5)';
            plant.style.top = `${potPosition.y - 50}px`;
        }, 50);
        
        this.dialogue.textContent = `You planted: "${this.currentPhrase.substring(0, 20)}..."\n\nWater it to help it grow!`;
        this.currentPhrase = null;
    }
    
    waterPlants() {
        let watered = false;
        
        for (let i = 0; i < this.plants.length; i++) {
            if (this.plants[i]) {
                // Get current scale
                const currentScale = parseFloat(this.plants[i].style.transform.replace('scale(', '').replace(')', '') || 0.5);
                const currentTop = parseFloat(this.plants[i].style.top.replace('px', ''));
                
                // Make the plant grow a bit more
                this.plants[i].style.transition = 'all 1s ease-out';
                this.plants[i].style.transform = `scale(${currentScale + config.game.growthIncrement})`;
                this.plants[i].style.top = `${currentTop - 10}px`;
                
                watered = true;
            }
        }
        
        if (watered) {
            this.dialogue.textContent = "You watered your phrase plants! They're growing wonderfully.";
        } else {
            this.dialogue.textContent = "There are no plants to water!";
        }
    }
    
    harvestPlant() {
        let harvested = false;
        
        for (let i = 0; i < this.plants.length; i++) {
            if (this.plants[i]) {
                // Get current scale
                const currentScale = parseFloat(this.plants[i].style.transform.replace('scale(', '').replace(')', '') || 0.5);
                
                if (currentScale >= config.game.minGrowthForHarvest) {
                    // Harvest animation
                    const plant = this.plants[i];
                    const currentTop = parseFloat(plant.style.top.replace('px', ''));
                    
                    plant.style.transition = 'all 0.8s ease-out';
                    plant.style.opacity = '0';
                    plant.style.top = `${currentTop - 50}px`;
                    
                    setTimeout(() => {
                        plant.remove();
                        this.plants[i] = null;
                    }, 800);
                    
                    // Reward with seeds
                    this.hasSeeds += config.game.seedsPerHarvest;
                    this.seedCountText.textContent = `Seeds: ${this.hasSeeds}`;
                    
                    this.dialogue.textContent = `Harvested: "${this.phrases[i]}"\n\nYou got ${config.game.seedsPerHarvest} seeds!`;
                    harvested = true;
                    break;
                }
            }
        }
        
        if (!harvested) {
            let hasPlants = this.plants.some(plant => plant);
            
            if (hasPlants) {
                this.dialogue.textContent = "Your plants need more time to grow before harvest!";
            } else {
                this.dialogue.textContent = "There are no plants to harvest!";
            }
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

function initGame() {
    const gameScene = new GameScene();
    gameScene.init();
    
    // Store game instance for global access
    window.gameInstance = gameScene;
}

// Add a beforeunload event listener to warn users before leaving
window.addEventListener('beforeunload', (event) => {
    // Check if game is in progress (defined by having plants)
    const gameScene = window.gameInstance;
        
    if (gameScene && gameScene.plants && gameScene.plants.some(plant => plant)) {
        // Warn user before leaving if they have plants growing
        event.preventDefault();
        event.returnValue = 'You have plants growing! Are you sure you want to leave?';
        return event.returnValue;
    }
});