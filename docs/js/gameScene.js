import config from './config.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game");
        this.hasSeeds = config.game.initialSeeds;
        this.currentPhrase = null;
        this.plants = [];
        this.phrases = [];
    }

    preload() {
        this.load.image("background", config.assets.background);
        this.load.image("machine", config.assets.machine);
        this.load.image("seed1", config.assets.seed);
        this.load.image("pot", config.assets.pot);
        this.load.image("duck", config.assets.duck);
        this.load.image("flower", config.assets.flower);
        this.load.image("creature1", config.assets.creature);
    }
    
    create() {
        this.setupBackground();
        this.setupMachine();
        this.setupPots();
        this.setupUI();
        this.setupInteractions();
        
        // Handle window resize
        this.scale.on('resize', this.resize, this);
    }
    
    setupBackground() {
        // Add background - make sure it fills the entire canvas
        this.bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    }
    
    setupMachine() {
        // Add machine and make it interactive
        this.machine = this.add.image(this.cameras.main.width * 0.7, this.cameras.main.height * 0.5, "machine").setInteractive();
        this.machine.setScale(0.8);
    }
    
    setupPots() {
        // Add empty pots for plants
        const potY = this.cameras.main.height * 0.8;
        this.pot1 = this.add.image(this.cameras.main.width * 0.2, potY, "pot").setScale(0.6);
        this.pot2 = this.add.image(this.cameras.main.width * 0.4, potY, "pot").setScale(0.6);
        this.pot3 = this.add.image(this.cameras.main.width * 0.6, potY, "pot").setScale(0.6);
    }
    
    setupUI() {
        // Add seed counter
        this.seedCountText = this.add.text(20, 20, `Seeds: ${this.hasSeeds}`, {
            fontSize: "24px",
            fill: config.ui.colors.textPrimary,
            backgroundColor: config.ui.colors.backgroundOverlay,
            padding: 10,
            borderRadius: 5
        });
        
        // Add dialogue box
        this.dialogue = this.add.text(
            this.cameras.main.width * 0.5,
            this.cameras.main.height * 0.2, 
            "Click the vending machine to get a phrase!", 
            {
                fontSize: "20px",
                fill: config.ui.colors.textPrimary,
                backgroundColor: config.ui.colors.backgroundOverlay,
                padding: 15,
                wordWrap: { width: this.cameras.main.width * 0.6 }
            }
        ).setOrigin(0.5, 0.5);
        
        // Add game buttons
        this.createGardenButton(
            this.cameras.main.width * 0.2, 
            this.cameras.main.height * 0.9, 
            "Plant Seed", 
            this.plantSeed
        );
        
        this.createGardenButton(
            this.cameras.main.width * 0.5, 
            this.cameras.main.height * 0.9, 
            "Water Plants", 
            this.waterPlants
        );
        
        this.createGardenButton(
            this.cameras.main.width * 0.8, 
            this.cameras.main.height * 0.9, 
            "Harvest Words", 
            this.harvestPlant
        );
    }
    
    setupInteractions() {
        // Add machine interaction
        this.machine.on("pointerdown", () => this.requestSeed());
    }

    resize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        
        // Ensure minimum size for playability
        const actualWidth = Math.max(width, config.canvas.minWidth);
        const actualHeight = Math.max(height, config.canvas.minHeight);
        
        this.cameras.main.setSize(actualWidth, actualHeight);
        
        // Resize and reposition all elements
        if (this.bg) {
            this.bg.setDisplaySize(actualWidth, actualHeight);
            this.bg.setPosition(actualWidth/2, actualHeight/2);
        }
        
        if (this.machine) {
            this.machine.setPosition(actualWidth * 0.7, actualHeight * 0.5);
        }
        
        if (this.dialogue) {
            this.dialogue.setPosition(actualWidth * 0.5, actualHeight * 0.2);
            this.dialogue.setWordWrapWidth(actualWidth * 0.6);
        }
        
        // Reposition pots
        const potY = actualHeight * 0.8;
        if (this.pot1) this.pot1.setPosition(actualWidth * 0.2, potY);
        if (this.pot2) this.pot2.setPosition(actualWidth * 0.4, potY);
        if (this.pot3) this.pot3.setPosition(actualWidth * 0.6, potY);
        
        // Reposition plants if they exist
        for (let i = 0; i < this.plants.length; i++) {
            if (this.plants[i]) {
                const xPos = actualWidth * (0.2 + (i * 0.2));
                this.plants[i].setPosition(xPos, this.plants[i].y);
            }
        }
        
        // Adjust buttons and UI
        this.recreateUI();
    }
    
    recreateUI() {
        // Clear existing buttons
        if (this.buttons) {
            this.buttons.forEach(btn => {
                if (btn.button) btn.button.destroy();
                if (btn.bg) btn.bg.destroy();
            });
        }
        
        // Recreate UI elements for new size
        this.setupUI();
    }

    createGardenButton(x, y, text, callback) {
        const buttonWidth = config.ui.buttonDimensions.width;
        const buttonHeight = config.ui.buttonDimensions.height;
        const borderRadius = config.ui.buttonDimensions.borderRadius;
        
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(parseInt(config.ui.colors.primary.replace('#', '0x')), 0.8);
        buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
        buttonBg.lineStyle(3, parseInt(config.ui.colors.accent.replace('#', '0x')), 1);
        buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
        
        const button = this.add.text(x, y, text, {
            fontSize: "22px",
            fontFamily: config.ui.fontFamily,
            fill: config.ui.colors.textDark,
            padding: 5,
        })
        .setOrigin(0.5, 0.5)
        .setInteractive()
        .on("pointerdown", callback.bind(this))
        .on("pointerover", () => {
            buttonBg.clear();
            buttonBg.fillStyle(parseInt(config.ui.colors.primaryLight.replace('#', '0x')), 0.9);
            buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
            buttonBg.lineStyle(3, parseInt(config.ui.colors.accentLight.replace('#', '0x')), 1);
            buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
            button.setStyle({ fill: config.ui.colors.textLight });
        })
        .on("pointerout", () => {
            buttonBg.clear();
            buttonBg.fillStyle(parseInt(config.ui.colors.primary.replace('#', '0x')), 0.8);
            buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
            buttonBg.lineStyle(3, parseInt(config.ui.colors.accent.replace('#', '0x')), 1);
            buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, borderRadius);
            button.setStyle({ fill: config.ui.colors.textDark });
        });
        
        // Track buttons for cleanup during resize
        if (!this.buttons) this.buttons = [];
        this.buttons.push({ button, bg: buttonBg });
        
        return { button, bg: buttonBg };
    }

    requestSeed() {
        if (this.hasSeeds <= 0) {
            this.dialogue.setText("Oh dear! You're out of seeds. Harvest a plant to get more seeds.");
            return;
        }
        
        this.dialogue.setText("Please insert a seed...");
        
        // Visual seed insertion animation
        const seed = this.add.image(this.machine.x - 100, this.machine.y, "seed1").setScale(0.4);
        
        this.tweens.add({
            targets: seed,
            x: this.machine.x,
            y: this.machine.y + 20,
            duration: 1000,
            onComplete: () => {
                seed.destroy();
                this.hasSeeds--;
                this.seedCountText.setText(`Seeds: ${this.hasSeeds}`);
                
                // Machine processing animation
                this.machine.setTint(0xffff00);
                this.time.delayedCall(500, () => {
                    this.machine.clearTint();
                    this.dispensePhrase();
                });
            }
        });
    }
    
    
    
    plantSeed() {
        if (!this.currentPhrase) {
            this.dialogue.setText("You need to get a phrase from the machine first!");
            return;
        }
        
        // Find an empty pot
        const potY = this.cameras.main.height * 0.8;
        let potPosition = null;
        if (!this.plants[0]) potPosition = { x: this.cameras.main.width * 0.2, y: potY - 20, pot: 0 };
        else if (!this.plants[1]) potPosition = { x: this.cameras.main.width * 0.4, y: potY - 20, pot: 1 };
        else if (!this.plants[2]) potPosition = { x: this.cameras.main.width * 0.6, y: potY - 20, pot: 2 };
        
        if (!potPosition) {
            this.dialogue.setText("All pots are full! Harvest a plant first.");
            return;
        }
        
        // Plant the seed with the phrase
        const plant = this.add.image(potPosition.x, potPosition.y, "flower").setScale(0);
        this.phrases[potPosition.pot] = this.currentPhrase;
        this.plants[potPosition.pot] = plant;
        
        // Growing animation
        this.tweens.add({
            targets: plant,
            scaleX: 0.5,
            scaleY: 0.5,
            y: potPosition.y - 50,
            duration: 1500,
            ease: 'Sine.easeOut'
        });
        
        this.dialogue.setText(`You planted: "${this.currentPhrase.substring(0, 20)}..."\n\nWater it to help it grow!`);
        this.currentPhrase = null;
    }
    
    waterPlants() {
        let watered = false;
        
        for (let i = 0; i < this.plants.length; i++) {
            if (this.plants[i]) {
                // Make the plant grow a bit more
                this.tweens.add({
                    targets: this.plants[i],
                    scaleX: this.plants[i].scaleX + config.game.growthIncrement,
                    scaleY: this.plants[i].scaleY + config.game.growthIncrement,
                    y: this.plants[i].y - 10,
                    duration: 1000,
                    ease: 'Sine.easeOut'
                });
                
                watered = true;
            }
        }
        
        if (watered) {
            this.dialogue.setText("You watered your phrase plants! They're growing wonderfully.");
        } else {
            this.dialogue.setText("There are no plants to water!");
        }
    }
    
    harvestPlant() {
        let harvested = false;
        
        for (let i = 0; i < this.plants.length; i++) {
            if (this.plants[i] && this.plants[i].scaleX >= config.game.minGrowthForHarvest) {
                // Harvest animation
                this.tweens.add({
                    targets: this.plants[i],
                    alpha: 0,
                    y: this.plants[i].y - 50,
                    duration: 800,
                    onComplete: () => {
                        this.plants[i].destroy();
                        this.plants[i] = null;
                    }
                });
                
                // Reward with seeds
                this.hasSeeds += config.game.seedsPerHarvest;
                this.seedCountText.setText(`Seeds: ${this.hasSeeds}`);
                
                this.dialogue.setText(`Harvested: "${this.phrases[i]}"\n\nYou got ${config.game.seedsPerHarvest} seeds!`);
                harvested = true;
                break;
            }
        }
        
        if (!harvested) {
            let hasPlants = false;
            for (let plant of this.plants) {
                if (plant) {
                    hasPlants = true;
                    break;
                }
            }
            
            if (hasPlants) {
                this.dialogue.setText("Your plants need more time to grow before harvest!");
            } else {
                this.dialogue.setText("There are no plants to harvest!");
            }
        }
    }

    update() {
        // Game update logic goes here
    }
}

export default GameScene;