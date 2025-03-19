import 'style.css'
import Phaser from 'phaser'

const sizes = {
    width: window.innerWidth * 0.8,
    height: window.innerHeight * 0.6
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("scene-game")
        this.hasSeeds = 3; // Starting seeds
        this.currentPhrase = null;
    }

    preload() {
        this.load.image("background", "assets/bg.png");
        this.load.image("machine", "assets/machine.png"); 
        this.load.image("seed1", "assets/seed1.png");
        this.load.image("pot", "assets/pot.png");
        this.load.image("duck", "assets/duck.png");
        this.load.image("flower", "assets/flower.png");
        this.load.image("creature1", "assets/creature1.png");
    }
    
    create() {
        // Add background - make sure it fills the entire canvas
        this.bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        this.bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Add machine and make it interactive
        this.machine = this.add.image(this.cameras.main.width * 0.7, this.cameras.main.height * 0.5, "machine").setInteractive();
        this.machine.setScale(0.8);
        
        // Add empty pots for plants
        const potY = this.cameras.main.height * 0.8;
        this.pot1 = this.add.image(this.cameras.main.width * 0.2, potY, "pot").setScale(0.6);
        this.pot2 = this.add.image(this.cameras.main.width * 0.4, potY, "pot").setScale(0.6);
        this.pot3 = this.add.image(this.cameras.main.width * 0.6, potY, "pot").setScale(0.6);
        
        // Add seed counter
        this.seedCountText = this.add.text(20, 20, `Seeds: ${this.hasSeeds}`, {
            fontSize: "24px",
            fill: "#4a2c40",
            backgroundColor: "rgba(248, 218, 197, 0.7)",
            padding: 10,
            borderRadius: 5
        });
        
        // Add dialogue box (styled like a Wonderland scroll)
        this.dialogue = this.add.text(
            this.cameras.main.width * 0.5,
            this.cameras.main.height * 0.2, 
            "Click the vending machine to get a phrase!", 
            {
                fontSize: "20px",
                fill: "#4a2c40",
                backgroundColor: "rgba(248, 218, 197, 0.8)",
                padding: 15,
                wordWrap: { width: this.cameras.main.width * 0.6 }
            }
        ).setOrigin(0.5, 0.5);
        
        // Add machine interaction
        this.machine.on("pointerdown", () => this.requestSeed());
        
        // Create stylized buttons that look like garden elements
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
        
        // Create plant containers (initially empty)
        this.plants = [];
        this.phrases = [];
        
        // Handle window resize
        this.scale.on('resize', this.resize, this);
    }

    resize(gameSize) {
        // Resize the game when the window changes size
        const width = gameSize.width;
        const height = gameSize.height;
        
        this.cameras.main.setSize(width, height);
        
        if (this.bg) {
            this.bg.setDisplaySize(width, height);
            this.bg.setPosition(width/2, height/2);
        }
        
        // Reposition other elements as needed
        // This is a simplified approach - you may need to adjust for your specific layout
        if (this.machine) {
            this.machine.setPosition(width * 0.7, height * 0.5);
        }
        
        if (this.dialogue) {
            this.dialogue.setPosition(width * 0.5, height * 0.2);
            this.dialogue.setWordWrapWidth(width * 0.6);
        }
        
        // You would need to reposition other elements similarly
    }

    createGardenButton(x, y, text, callback) {
        // Create a more integrated button using Wonderland theme
        const buttonWidth = 180;
        const buttonHeight = 60;
        
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x8a4f7d, 0.8);
        buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 16);
        buttonBg.lineStyle(3, 0xc9a0dc, 1);
        buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 16);
        
        const button = this.add.text(x, y, text, {
            fontSize: "22px",
            fontFamily: "Alice, serif",
            fill: "#ffffff",
            padding: 5,
        })
        .setOrigin(0.5, 0.5)
        .setInteractive()
        .on("pointerdown", callback.bind(this))
        .on("pointerover", () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x9a5f8d, 0.9);
            buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 16);
            buttonBg.lineStyle(3, 0xd9b0ec, 1);
            buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 16);
            button.setStyle({ fill: "#f8dac5" });
        })
        .on("pointerout", () => {
            buttonBg.clear();
            buttonBg.fillStyle(0x8a4f7d, 0.8);
            buttonBg.fillRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 16);
            buttonBg.lineStyle(3, 0xc9a0dc, 1);
            buttonBg.strokeRoundedRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, 16);
            button.setStyle({ fill: "#ffffff" });
        });
        
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
    
    dispensePhrase() {
        const phrases = [
            "We're all mad here.",
            "Curiouser and curiouser!",
            "It's no use going back to yesterday, because I was a different person then.",
            "Off with their heads!",
            "Why, sometimes I've believed as many as six impossible things before breakfast.",
            "Who in the world am I? Ah, that's the great puzzle.",
            "Begin at the beginning and go on till you come to the end: then stop.",
            "I'm not strange, weird, off, nor crazy, my reality is just different from yours.",
            "Every adventure requires a first step.",
            "Imagination is the only weapon in the war against reality.",
            "If everybody minded their own business, the world would go around a great deal faster.",
            "She generally gave herself very good advice, though she very seldom followed it."
        ];
        
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.dialogue.setText(`Your phrase: "${randomPhrase}"\n\nClick 'Plant Seed' to grow this phrase!`);
        this.currentPhrase = randomPhrase;
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
        const plant = this.add.image(potPosition.x, potPosition.y, "plant1").setScale(0);
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
                    scaleX: this.plants[i].scaleX + 0.1,
                    scaleY: this.plants[i].scaleY + 0.1,
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
            if (this.plants[i] && this.plants[i].scaleX >= 0.6) {
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
                this.hasSeeds += 2;
                this.seedCountText.setText(`Seeds: ${this.hasSeeds}`);
                
                this.dialogue.setText(`Harvested: "${this.phrases[i]}"\n\nYou got 2 seeds!`);
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
        // Update logic can be added here
    }
}

const config = {
    type: Phaser.AUTO,
    width: sizes.width,
    height: sizes.height,
    parent: 'gameCanvas',
    /*canvas: document.getElementById('gameCanvas'),*/
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [GameScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        /*parent: 'gameCanvas',
        width: '80%',
        height: '60%',*/
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
}

const game = new Phaser.Game(config);

// Handle window resizing
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth * 0.8, window.innerHeight * 0.6);
});

