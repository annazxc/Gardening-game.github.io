// Define plant types with their growth stages, properties and care requirements
const PLANT_TYPES = {
    "talking_rose": {
        name: "Talking Rose",
        stages: ["seed", "sprout", "bud", "bloom", "full_bloom"],
        growthTime: [24, 48, 72, 96], // Hours between stages
        waterNeeds: "moderate", // Water every 24 hours
        sunNeeds: "full", // Prefers full sun
        dialogues: {
            "seed": ["I'm just getting comfortable in the soil.", "Hello? Is anyone there?"],
            "sprout": ["Oh! I can see the light!", "My stems are stretching!"],
            "bud": ["I feel like I'm about to reveal something beautiful.", "Oh, the anticipation!"],
            "bloom": ["Aren't my petals simply marvelous?", "The Queen would be jealous of my shade of red!"],
            "full_bloom": ["I'm in full glory today!", "Would you like to hear a poem about myself?"]
        },
        description: "A beautiful rose that loves to chat. The Queen's favorite."
    },
    "cheshire_lily": {
        name: "Cheshire Lily",
        stages: ["seed", "sprout", "small", "medium", "large"],
        growthTime: [18, 36, 72, 108], // Hours between stages
        waterNeeds: "low", // Water every 48 hours
        sunNeeds: "partial", // Prefers partial shade
        dialogues: {
            "seed": ["Hehe... you can't see me yet!", "I'm hiding!"],
            "sprout": ["Surprise! I'm here!", "Now you see me..."],
            "small": ["I might disappear when you're not looking...", "Growing is such a curious thing."],
            "medium": ["My colors are starting to swirl!", "Sometimes I even confuse myself!"],
            "large": ["Riddles and rhymes, curious times!", "Why is a raven like a writing desk?"]
        },
        special: "disappearing", // Plant occasionally becomes partially transparent
        description: "A mischievous lily with swirling patterns that sometimes fades from view."
    },
    "time_tulip": {
        name: "Time Tulip",
        stages: ["seed", "sprout", "growing", "budding", "blooming"],
        growthTime: [12, 24, 48, 72], // Hours between stages
        waterNeeds: "high", // Water every 12 hours
        sunNeeds: "full", // Prefers full sun
        dialogues: {
            "seed": ["Tick tock, tick tock...", "No time to waste!"],
            "sprout": ["I'm late, I'm late!", "So much to do, so little time!"],
            "growing": ["Time flies when you're growing!", "Watch me closely, I grow by the minute!"],
            "budding": ["Almost time for the grand reveal!", "Patience is a virtue, but hurry up!"],
            "blooming": ["Right on schedule!", "Time for tea!"]
        },
        special: "rapid_growth", // Growth speed increases when watched
        description: "A punctual flower that grows in sync with clock chimes. Always in a hurry."
    },
    "wondershroom": {
        name: "Wondershroom",
        stages: ["spore", "tiny", "small", "medium", "large"],
        growthTime: [8, 16, 24, 36], // Hours between stages
        waterNeeds: "high", // Water every 12 hours
        sunNeeds: "shade", // Prefers shade
        dialogues: {
            "spore": ["Such a small beginning for such a grand adventure!", "Dream big, grow bigger!"],
            "tiny": ["One side makes you larger...", "Everything looks so big from down here!"],
            "small": ["I'm growing up, but not too much yet!", "The view is changing!"],
            "medium": ["Not too big, not too small... just right!", "I wonder how tall I'll get?"],
            "large": ["I can see all of Wonderland from up here!", "Don't eat me unless you want a surprise!"]
        },
        special: "size_changing", // Player can nibble to grow bigger or smaller temporarily
        description: "Colorful mushrooms that may change your perspective... literally."
    },
    "tea_blossom": {
        name: "Tea Blossom",
        stages: ["seed", "sprout", "leafy", "budding", "flowering"],
        growthTime: [36, 72, 108, 144], // Hours between stages
        waterNeeds: "moderate", // Water every 24 hours
        sunNeeds: "partial", // Prefers partial shade
        dialogues: {
            "seed": ["A very merry unbirthday to me!", "It's always tea time somewhere!"],
            "sprout": ["Would you like some tea?", "I'm steeping in possibilities!"],
            "leafy": ["My leaves will make the finest tea!", "The Hatter would approve!"],
            "budding": ["Almost ready for a tea party!", "Sugar or honey with your tea?"],
            "flowering": ["Tea time! Tea time!", "My blooms make mad tea taste marvelous!"]
        },
        special: "tea_brewing", // Can be harvested to make special teas with magical effects
        description: "A whimsical flower that produces leaves perfect for brewing curious teas."
    }
};

// Garden plot system
class GardenPlot {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.plant = null;
        this.plantType = null;
        this.growthStage = 0;
        this.lastWatered = null;
        this.health = 100;
        this.element = this.createPlotElement();
        this.specialEffectActive = false;
        this.words = [];
    }
    
    createPlotElement() {
        const plot = document.createElement('div');
        plot.className = 'garden-plot';
        plot.style.position = 'absolute';
        plot.style.left = `${this.x}px`;
        plot.style.top = `${this.y}px`;
        plot.style.width = `${this.size}px`;
        plot.style.height = `${this.size}px`;
        plot.style.backgroundImage = "url('assets/images/empty-plot.png')";
        plot.style.backgroundSize = 'cover';
        plot.style.cursor = 'pointer';
        plot.style.zIndex = '10';
        
        plot.addEventListener('click', () => {
            this.interact();
        });
        
        const mapContainer = document.getElementById('map-container') || document.body;
        mapContainer.appendChild(plot);
        
        return plot;
    }
    
    // Plant a seed
    plantSeed(plantType) {
        if (this.plant) {
            // Already has a plant
            showMessage("This plot already has a plant growing!");
            return false;
        }
        
        if (!PLANT_TYPES[plantType]) {
            showMessage("Unknown plant type!");
            return false;
        }
        
        this.plantType = plantType;
        this.growthStage = 0;
        this.lastWatered = new Date();
        this.health = 100;
        this.element.style.backgroundImage = `url('assets/images/plants/${plantType}_seed.png')`;
        
        // Add a word to the plant
        this.addRandomWord();
        
        showMessage(`You planted a ${PLANT_TYPES[plantType].name} seed!`);
        
        // Schedule growth process
        this.scheduleGrowth();
        
        // Random chance of plant saying something when planted
        if (Math.random() > 0.7) {
            this.speak();
        }
        
        return true;
    }
    
    // Water the plant
    water() {
        if (!this.plantType) {
            showMessage("There's nothing to water here!");
            return;
        }
        
        const now = new Date();
        const plantInfo = PLANT_TYPES[this.plantType];
        
        // Check if the plant needs water
        if (this.lastWatered) {
            const hoursSinceWatered = (now - this.lastWatered) / (1000 * 60 * 60);
            
            if (hoursSinceWatered < getWaterInterval(plantInfo.waterNeeds) * 0.5) {
                showMessage("This plant doesn't need water yet!");
                return;
            }
        }
        
        // Update last watered time
        this.lastWatered = now;
        
        // Improve health if it was suffering from lack of water
        if (this.health < 90) {
            this.health += 10;
            if (this.health > 100) this.health = 100;
        }
        
        // Visual effect
        this.createWaterEffect();
        
        showMessage(`You watered the ${PLANT_TYPES[this.plantType].name}!`);
        
        // 30% chance of plant speaking when watered
        if (Math.random() > 0.7) {
            this.speak();
        }
    }
    
    // Create water animation
    createWaterEffect() {
        const water = document.createElement('div');
        water.className = 'water-effect';
        water.style.position = 'absolute';
        water.style.left = '0';
        water.style.top = '0';
        water.style.width = '100%';
        water.style.height = '100%';
        water.style.background = 'radial-gradient(circle, rgba(173,216,230,0.8) 0%, rgba(173,216,230,0) 70%)';
        water.style.opacity = '0.7';
        water.style.pointerEvents = 'none';
        water.style.zIndex = '15';
        
        this.element.appendChild(water);
        
        // Animation to fade out
        let opacity = 0.7;
        const fadeOut = setInterval(() => {
            opacity -= 0.05;
            water.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(fadeOut);
                water.remove();
            }
        }, 50);
        
        // Add water droplet particles
        for (let i = 0; i < 15; i++) {
            this.createWaterDroplet();
        }
    }
    
    // Create water droplet animation
    createWaterDroplet() {
        const droplet = document.createElement('div');
        droplet.className = 'water-droplet';
        
        const size = Math.random() * 6 + 4;
        const xPos = Math.random() * (this.size - size);
        
        droplet.style.position = 'absolute';
        droplet.style.left = `${xPos}px`;
        droplet.style.top = '0';
        droplet.style.width = `${size}px`;
        droplet.style.height = `${size}px`;
        droplet.style.backgroundColor = '#A2D5F2';
        droplet.style.borderRadius = '50%';
        droplet.style.opacity = '0.8';
        droplet.style.zIndex = '16';
        droplet.style.pointerEvents = 'none';
        
        this.element.appendChild(droplet);
        
        // Animate the droplet falling
        let posY = 0;
        const gravity = 0.5 + Math.random() * 0.5;
        const horizontalMovement = (Math.random() - 0.5) * 2;
        let posX = xPos;
        
        function fall() {
            posY += gravity;
            posX += horizontalMovement;
            
            droplet.style.top = `${posY}px`;
            droplet.style.left = `${posX}px`;
            
            if (posY < this.size) {
                requestAnimationFrame(fall.bind(this));
            } else {
                // Create a splash effect when the droplet hits the ground
                this.createSplash(posX, this.size);
                droplet.remove();
            }
        }
        
        requestAnimationFrame(fall.bind(this));
    }
    
    // Create splash effect when droplet hits the ground
    createSplash(x, y) {
        const splash = document.createElement('div');
        splash.className = 'water-splash';
        
        splash.style.position = 'absolute';
        splash.style.left = `${x - 5}px`;
        splash.style.top = `${y - 5}px`;
        splash.style.width = '10px';
        splash.style.height = '10px';
        splash.style.borderRadius = '50%';
        splash.style.backgroundColor = 'transparent';
        splash.style.border = '1px solid #A2D5F2';
        splash.style.opacity = '0.7';
        splash.style.pointerEvents = 'none';
        splash.style.zIndex = '15';
        
        this.element.appendChild(splash);
        
        // Animate the splash expanding and fading
        let size = 10;
        let opacity = 0.7;
        
        function expand() {
            size += 3;
            opacity -= 0.05;
            
            splash.style.width = `${size}px`;
            splash.style.height = `${size}px`;
            splash.style.left = `${x - size/2}px`;
            splash.style.top = `${y - size/2}px`;
            splash.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(expand);
            } else {
                splash.remove();
            }
        }
        
        requestAnimationFrame(expand);
    }
    
    // Schedule the plant's growth
    scheduleGrowth() {
        if (!this.plantType) return;
        
        const plantInfo = PLANT_TYPES[this.plantType];
        const stages = plantInfo.stages;
        
        if (this.growthStage >= stages.length - 1) {
            // Plant is fully grown
            return;
        }
        
        // Convert real-time growth to accelerated game time
        // In real game, these would be hours or days, but for testing we use seconds
        const growthTimeMs = plantInfo.growthTime[this.growthStage] * 1000; // Convert hours to ms for real game
        // For testing: const growthTimeMs = plantInfo.growthTime[this.growthStage] * 1000 / 60; // Much faster for testing
        
        setTimeout(() => {
            this.grow();
        }, growthTimeMs);
    }
    
    // Grow the plant to the next stage
    grow() {
        if (!this.plantType) return;
        
        const plantInfo = PLANT_TYPES[this.plantType];

        const stages = plantInfo.stages;
        
        // Check if the plant is healthy enough to grow
        if (this.health < 50) {
            // Plant is too unhealthy to grow
            showMessage(`Your ${plantInfo.name} is looking unhealthy. Try watering it!`);
            
            // Schedule a health check instead
            setTimeout(() => {
                this.checkHealth();
            }, 3600 * 1000); // Check again in an hour
            
            return;
        }
        
        // Advance to the next growth stage
        this.growthStage++;
        
        if (this.growthStage >= stages.length) {
            this.growthStage = stages.length - 1; // Cap at max stage
        }
        
        const currentStage = stages[this.growthStage];
        
        // Update visuals
        this.element.style.backgroundImage = `url('assets/images/plants/${this.plantType}_${currentStage}.png')`;
        
        // Create a growing effect
        this.createGrowthEffect();
        
        // Add a new word/phrase when growing to a new stage
        this.addRandomWord();
        
        showMessage(`Your ${plantInfo.name} has grown to the ${currentStage.replace('_', ' ')} stage!`);
        
        // 80% chance of plant speaking when growing
        if (Math.random() > 0.2) {
            this.speak();
        }
        
        // Schedule next growth stage if not fully grown
        if (this.growthStage < stages.length - 1) {
            this.scheduleGrowth();
        } else {
            // Plant is fully grown - may produce seeds or special items
            this.scheduleSpecialEvent();
        }
    }
    
    // Create a visual growth effect
    createGrowthEffect() {
        // Gentle pulse animation
        const originalSize = this.size;
        const growthDuration = 1000; // 1 second
        const startTime = Date.now();
        
        const growthAnimation = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / growthDuration;
            
            if (progress >= 1) {
                this.element.style.transform = 'scale(1)';
                return;
            }
            
            // Pulse the plant size
            const scale = 1 + 0.1 * Math.sin(progress * Math.PI);
            this.element.style.transform = `scale(${scale})`;
            
            requestAnimationFrame(growthAnimation);
        };
        
        requestAnimationFrame(growthAnimation);
        
        // Add sparkle effects
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createSparkle();
            }, i * 50);
        }
    }
    
    // Create sparkle effect for growth or special events
    createSparkle() {
        const sparkle = document.createElement('div');
        sparkle.className = 'plant-sparkle';
        
        // Random position around the plant
        const xPos = Math.random() * this.size;
        const yPos = Math.random() * this.size;
        const size = Math.random() * 6 + 3;
        
        sparkle.style.position = 'absolute';
        sparkle.style.left = `${xPos}px`;
        sparkle.style.top = `${yPos}px`;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.backgroundColor = this.getRandomSparkleColor();
        sparkle.style.borderRadius = '50%';
        sparkle.style.opacity = '0.8';
        sparkle.style.zIndex = '20';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.boxShadow = '0 0 5px white';
        
        this.element.appendChild(sparkle);
        
        // Animate the sparkle
        let opacity = 0.8;
        let scale = 1;
        
        function animate() {
            opacity -= 0.02;
            scale += 0.05;
            
            sparkle.style.opacity = opacity;
            sparkle.style.transform = `scale(${scale})`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                sparkle.remove();
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Get a random color for sparkles
    getRandomSparkleColor() {
        const colors = [
            '#FFD700', // Gold
            '#E6E6FA', // Lavender
            '#7FFFD4', // Aquamarine
            '#FF69B4', // Hot Pink
            '#00FFFF', // Cyan
            '#FFFACD'  // Lemon Chiffon
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Check plant health periodically
    checkHealth() {
        if (!this.plantType) return;
        
        const now = new Date();
        const plantInfo = PLANT_TYPES[this.plantType];
        
        // Check if the plant needs water
        if (this.lastWatered) {
            const hoursSinceWatered = (now - this.lastWatered) / (1000 * 60 * 60);
            const waterInterval = getWaterInterval(plantInfo.waterNeeds);
            
            // Reduce health if not watered enough
            if (hoursSinceWatered > waterInterval) {
                const healthReduction = Math.floor((hoursSinceWatered - waterInterval) / waterInterval * 10);
                this.health -= healthReduction;
                
                if (this.health < 0) this.health = 0;
                
                this.updateAppearance();
                
                if (this.health < 30) {
                    showMessage(`Your ${plantInfo.name} is looking very thirsty!`);
                }
            }
        }
        
        // Schedule next health check
        setTimeout(() => {
            this.checkHealth();
        }, 3600 * 1000); // Check every hour
    }
    
    // Update the plant's appearance based on health
    updateAppearance() {
        if (!this.plantType) return;
        
        // No visual changes needed if health is good
        if (this.health >= 70) return;
        
        if (this.health < 30) {
            // Very unhealthy
            this.element.style.filter = 'grayscale(70%) brightness(0.7)';
        } else if (this.health < 70) {
            // Somewhat unhealthy
            this.element.style.filter = 'grayscale(30%) brightness(0.9)';
        }
    }
    
    // Schedule special events for fully grown plants
    scheduleSpecialEvent() {
        if (!this.plantType) return;
        
        const plantInfo = PLANT_TYPES[this.plantType];
        
        // Only schedule special events for fully grown, healthy plants
        if (this.growthStage < plantInfo.stages.length - 1 || this.health < 70) return;
        
        // Different plants have different special events
        setTimeout(() => {
            if (plantInfo.special === "disappearing") {
                this.triggerDisappearingEffect();
            } else if (plantInfo.special === "rapid_growth") {
                this.triggerRapidGrowthEffect();
            } else if (plantInfo.special === "size_changing") {
                this.triggerSizeChangeEffect();
            } else if (plantInfo.special === "tea_brewing") {
                this.triggerTeaEffect();
            } else {
                // Default special effect - produce a seed
                this.produceSeeds();
            }
        }, 24 * 3600 * 1000); // Special event every day for fully grown plants
    }
    
    // Special effect: Disappearing (for Cheshire Lily)
    triggerDisappearingEffect() {
        if (this.specialEffectActive) return;
        this.specialEffectActive = true;
        
        // Make the plant partially transparent
        this.element.style.opacity = '0.3';
        
        // Show a message
        showMessage("The Cheshire Lily is fading from view! How curious!");
        
        // Add a special word when this happens
        collectedWords.push("vanishing");
        showFloatingText(this.x, this.y, "vanishing", "#FFD700");
        
        // Return to normal after a while
        setTimeout(() => {
            this.element.style.opacity = '1';
            this.specialEffectActive = false;
            
            // Schedule next special event
            this.scheduleSpecialEvent();
        }, 30000); // 30 seconds of disappearing
    }
    
    // Special effect: Rapid Growth (for Time Tulip)
    triggerRapidGrowthEffect() {
        if (this.specialEffectActive) return;
        this.specialEffectActive = true;
        
        showMessage("The Time Tulip seems to be growing faster than time itself!");
        
        // Visual effect - rapid growth
        const originalHeight = parseInt(this.element.style.height);
        const growthAnimation = setInterval(() => {
            const currentHeight = parseInt(this.element.style.height);
            if (currentHeight < originalHeight * 1.3) {
                this.element.style.height = (currentHeight + 1) + 'px';
                this.createSparkle();
            } else {
                clearInterval(growthAnimation);
                
                // Go back to normal after a while
                setTimeout(() => {
                    this.element.style.height = originalHeight + 'px';
                    this.specialEffectActive = false;
                    
                    // Schedule next special event
                    this.scheduleSpecialEvent();
                }, 10000);
            }
        }, 100);
        
        // Add a special word
        collectedWords.push("accelerating");
        showFloatingText(this.x, this.y, "accelerating", "#FFD700");
    }
    
    // Special effect: Size Change (for Wondershroom)
    triggerSizeChangeEffect() {
        if (this.specialEffectActive) return;
        this.specialEffectActive = true;
        
        showMessage("The Wondershroom is pulsing with curious energy! Click it to change your size!");
        
        // Add special interaction to the plant
        const originalOnClick = this.element.onclick;
        
        this.element.onclick = () => {
            // Change the player's size
            const player = document.getElementById('player');
            if (player) {
                const currentScale = player.style.transform ? 
                    parseFloat(player.style.transform.replace('scale(', '').replace(')', '')) : 1;
                
                // Toggle between sizes
                if (currentScale === 1) {
                    player.style.transform = 'scale(0.5)';
                    showMessage("You've shrunk! The world looks so much bigger now!");
                } else if (currentScale < 1) {
                    player.style.transform = 'scale(1.5)';
                    showMessage("You've grown bigger! Be careful not to step on any flowers!");
                } else {
                    player.style.transform = 'scale(1)';
                    showMessage("You've returned to your normal size.");
                }
                
                // Create magical effect
                for (let i = 0; i < 30; i++) {
                    setTimeout(() => this.createSparkle(), i * 30);
                }
                
                // Add a special phrase
                collectedPhrases.push("curiouser and curiouser");
                showFloatingText(this.x, this.y, "curiouser and curiouser", "#FFD700");
            }
        };
        
        // Make the plant pulse to indicate special effect
        this.pulseAnimation = setInterval(() => {
            const randomScale = 0.9 + Math.random() * 0.2;
            this.element.style.transform = `scale(${randomScale})`;
        }, 500);
        
        // Return to normal after a while
        setTimeout(() => {
            clearInterval(this.pulseAnimation);
            this.element.style.transform = 'scale(1)';
            this.element.onclick = originalOnClick;
            this.specialEffectActive = false;
            
            // Schedule next special event
            this.scheduleSpecialEvent();
        }, 60000); // 1 minute of size-changing ability
    }
    
    // Special effect: Tea Brewing (for Tea Blossom)
    triggerTeaEffect() {
        if (this.specialEffectActive) return;
        this.specialEffectActive = true;
        
        showMessage("The Tea Blossom is ready to be harvested for a magical tea party!");
        
        // Create a teacup icon on the plant
        const teacup = document.createElement('div');
        teacup.className = 'teacup-icon';
        teacup.style.position = 'absolute';
        teacup.style.top = '-20px';
        teacup.style.right = '-10px';
        teacup.style.width = '30px';
        teacup.style.height = '30px';
        teacup.style.backgroundImage = "url('assets/images/teacup.png')";
        teacup.style.backgroundSize = 'contain';
        teacup.style.backgroundRepeat = 'no-repeat';
        teacup.style.cursor = 'pointer';
        teacup.style.zIndex = '25';
        
        // Add click handler to harvest tea
        teacup.onclick = (e) => {
            e.stopPropagation();
            this.harvestTea();
            teacup.remove();
        };
        
        this.element.appendChild(teacup);
        
        // Make the teacup bounce to attract attention
        let bouncePos = 0;
        const bounceAnimation = setInterval(() => {
            bouncePos += Math.PI / 10;
            const yOffset = Math.sin(bouncePos) * 5;
            teacup.style.transform = `translateY(${yOffset}px)`;
        }, 100);
        
        // Remove the teacup after a while if not clicked
        setTimeout(() => {
            clearInterval(bounceAnimation);
            teacup.remove();
            this.specialEffectActive = false;
            
            // Schedule next special event
            this.scheduleSpecialEvent();
        }, 60000); // 1 minute to harvest tea
    }
    
    // Harvest tea from the Tea Blossom
    harvestTea() {
        // Add tea to inventory
        const teaTypes = ["Riddle Tea", "Memory Tea", "Dream Tea", "Growth Tea", "Unbirthday Tea"];
        const teaType = teaTypes[Math.floor(Math.random() * teaTypes.length)];
        
        // Add tea to player inventory
        addItemToInventory({
            name: teaType,
            type: "tea",
            description: `A curious tea from Wonderland that produces magical effects.`,
            useFunction: () => {
                this.drinkTea(teaType);
            }
        });
        
        showMessage(`You harvested ${teaType} from the Tea Blossom!`);
        
        // Add a special phrase
        collectedPhrases.push("it's always tea time");
        showFloatingText(this.x, this.y, "it's always tea time", "#FFD700");
        
        // Activate special effect
        this.specialEffectActive = false;
    }
    
    // Drink tea effect
    drinkTea(teaType) {
        switch(teaType) {
            case "Riddle Tea":
                showMessage("The Riddle Tea makes your thoughts sharper. You now understand the Wit Tree's wisdom better!");
                // Make storyteller answers clearer temporarily
                break;
            case "Memory Tea":
                showMessage("The Memory Tea helps you recall forgotten words. A new word appears in your collection!");
                // Add a random collectable word
                const memoryWords = ["dreaming", "wonder", "impossible", "believe", "curious"];
                const newWord = memoryWords[Math.floor(Math.random() * memoryWords.length)];
                collectedWords.push(newWord);
                break;
            case "Dream Tea":
                showMessage("The Dream Tea makes the world around you shimmer with possibilities!");
                // Visual effect on the screen
                createDreamEffect();
                break;
            case "Growth Tea":
                showMessage("The Growth Tea accelerates your garden's growth!");
                // Speed up all plants' growth temporarily
                accelerateAllPlantGrowth();
                break;
            case "Unbirthday Tea":
                showMessage("The Unbirthday Tea fills you with celebration! Very merry unbirthday to you!");
                // Add confetti effect
                createConfettiEffect();
                break;
        }
    }
    
    // Produce seeds from a fully grown plant
    produceSeeds() {
        if (this.seedsProduced) return;
        
        // Create a seed icon on the plant
        const seedIcon = document.createElement('div');
        seedIcon.className = 'seed-icon';
        seedIcon.style.position = 'absolute';
        seedIcon.style.bottom = '-10px';
        seedIcon.style.right = '-10px';
        seedIcon.style.width = '25px';
        seedIcon.style.height = '25px';
        seedIcon.style.backgroundImage = "url('assets/images/seed.png')";
        seedIcon.style.backgroundSize = 'contain';
        seedIcon.style.backgroundRepeat = 'no-repeat';
        seedIcon.style.cursor = 'pointer';
        seedIcon.style.zIndex = '25';
        
        // Add click handler to collect seed
        seedIcon.onclick = (e) => {
            e.stopPropagation();
            this.collectSeed();
            seedIcon.remove();
        };
        
        this.element.appendChild(seedIcon);
        
        // Make the seed icon pulse to attract attention
        let scale = 1;
        let growing = true;
        
        const pulseAnimation = setInterval(() => {
            if (growing) {
                scale += 0.03;
                if (scale >= 1.2) growing = false;
            } else {
                scale -= 0.03;
                if (scale <= 1) growing = true;
            }
            
            seedIcon.style.transform = `scale(${scale})`;
        }, 50);
        
        // Remove the seed icon after a while if not clicked
        setTimeout(() => {
            clearInterval(pulseAnimation);
            seedIcon.remove();
        }, 60000); // 1 minute to collect seed
        
        this.seedsProduced = true;
    }
    
    // Collect seed from a plant
    collectSeed() {
        if (!this.plantType) return;
        
        // Add seed to inventory
        addItemToInventory({
            name: `${PLANT_TYPES[this.plantType].name} Seed`,
            type: "seed",
            plantType: this.plantType,
            description: `A seed that will grow into a ${PLANT_TYPES[this.plantType].name}.`,
            useFunction: () => {
                // Using a seed opens plot selection UI
                showPlotSelectionForPlanting(this.plantType);
            }
        });
        
        showMessage(`You collected a ${PLANT_TYPES[this.plantType].name} Seed!`);
        
        // Add a special word when collecting seeds
        collectedWords.push("sprouting");
        showFloatingText(this.x, this.y, "sprouting", "#FFD700");
    }
    
    // Make the plant speak
    speak() {
        if (!this.plantType) return;
        
        const plantInfo = PLANT_TYPES[this.plantType];
        const currentStage = plantInfo.stages[this.growthStage];
        
        if (!plantInfo.dialogues || !plantInfo.dialogues[currentStage]) return;
        
        // Select a random dialogue from the current growth stage
        const dialogues = plantInfo.dialogues[currentStage];
        const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        
        // Create speech bubble
        this.showSpeechBubble(dialogue);
    }
    
    // Show speech bubble for the plant
    showSpeechBubble(text) {
        // Remove any existing speech bubble
        const existingBubble = this.element.querySelector('.speech-bubble');
        if (existingBubble) existingBubble.remove();
        
        const bubble = document.createElement('div');
        bubble.className = 'speech-bubble';
        bubble.style.position = 'absolute';
        bubble.style.top = '-60px';
        bubble.style.left = '50%';
        bubble.style.transform = 'translateX(-50%)';
        bubble.style.backgroundColor = 'white';
        bubble.style.color = '#333';
        bubble.style.padding = '8px 12px';
        bubble.style.borderRadius = '15px';
        bubble.style.maxWidth = '200px';
        bubble.style.textAlign = 'center';
        bubble.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        bubble.style.zIndex = '100';
        bubble.style.fontSize = '14px';
        bubble.style.opacity = '0';
        bubble.style.transition = 'opacity 0.5s';
        
        // Add tail to speech bubble
        const tail = document.createElement('div');
        tail.style.position = 'absolute';
        tail.style.bottom = '-10px';
        tail.style.left = '50%';
        tail.style.transform = 'translateX(-50%)';
        tail.style.width = '0';
        tail.style.height = '0';
        tail.style.borderLeft = '10px solid transparent';
        tail.style.borderRight = '10px solid transparent';
        tail.style.borderTop = '10px solid white';
        
        bubble.appendChild(tail);
        bubble.innerText = text;
        this.element.appendChild(bubble);
        
        // Fade in the bubble
        setTimeout(() => {
            bubble.style.opacity = '1';
        }, 10);
        
        // Remove the bubble after a delay
        setTimeout(() => {
            bubble.style.opacity = '0';
            setTimeout(() => {
                bubble.remove();
            }, 500);
        }, 5000); // Show for 5 seconds
    }
    
    // Add a random word to the plant's collection
    addRandomWord() {
        if (!this.plantType) return;
        
        const plantInfo = PLANT_TYPES[this.plantType];
        
        // Different plants produce different kinds of words
        let possibleWords = [];
        
        switch(this.plantType) {
            case "talking_rose":
                possibleWords = ["elegant", "royal", "crimson", "thorny", "proud", "regal", "majesty"];
                break;
            case "cheshire_lily":
                possibleWords = ["vanishing", "grinning", "riddle", "mystery", "curious", "puzzling"];
                break;
            case "time_tulip":
                possibleWords = ["ticking", "punctual", "hurry", "late", "clockwork", "racing"];
                break;
            case "wondershroom":
                possibleWords = ["growing", "shrinking", "peculiar", "bizarre", "transformation"];
                break;
            case "tea_blossom":
                possibleWords = ["steeping", "brewing", "teacup", "unbirthday", "merry", "mad"];
                break;
            default:
                possibleWords = ["magical", "whimsical", "wonder", "curious", "peculiar"];
        }
        
        // Select a random word based on growth stage
        // More advanced stages have more unique words
        const word = possibleWords[Math.floor(Math.random() * possibleWords.length)];
        
        // Add to the plant's words
        this.words.push(word);
        
        // If this word is not already collected, add it
        if (!collectedWords.includes(word)) {
            collectedWords.push(word);
            showFloatingText(this.x, this.y, word, "#FFFFFF");
        }
    }
    
    // Main interaction function for the plot
    interact() {
        if (!this.plantType) {
            // Empty plot, show planting menu
            showPlantingMenu(this);
            return;
        }
        
        // Show plant information and care options
        showPlantInfoMenu(this);
    }
}

// Helper function to get watering interval based on plant needs
function getWaterInterval(waterNeeds) {
    switch(waterNeeds) {
        case "low": return 48; // 48 hours
        case "moderate": return 24; // 24 hours
        case "high": return 12; // 12 hours
        default: return 24;
    }
}

// Show floating text effect (for collecting words)
function showFloatingText(x, y, text, color = "#FFFFFF") {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-text';
    floatingText.textContent = text;
    floatingText.style.position = 'absolute';
    floatingText.style.left = `${x}px`;
    floatingText.style.top = `${y}px`;
    floatingText.style.color = color;
    floatingText.style.fontFamily = 'Georgia, serif';
    floatingText.style.fontSize = '18px';
    floatingText.style.fontWeight = 'bold';
    floatingText.style.textShadow = '0 0 5px rgba(0,0,0,0.5)';
    floatingText.style.zIndex = '200';
    floatingText.style.pointerEvents = 'none';
    
    document.body.appendChild(floatingText);
    
    // Animate the text floating up and fading
    let posY = y;
    let opacity = 1;
    
    function float() {
        posY -= 1;
        opacity -= 0.01;
        
        floatingText.style.top = `${posY}px`;
        floatingText.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(float);
        } else {
            floatingText.remove();
            
            // Play a sound effect
            playCollectionSound();
            
            // Show a notification about collecting a word
            showMessage(`You collected the word "${text}"!`);
        }
    }
    
    requestAnimationFrame(float);
}

// Play sound effect for collecting words
function playCollectionSound() {
    const sound = new Audio('assets/sounds/collect.mp3');
    sound.volume = 0.5;
    sound.play();
}

// Show message to the player(not finished)
function showMessage(text) {
    // Check if message container exists
    let messageContainer = document.getElementById('message-container');
    
    if (!messageContainer) {
        // Create message container
        messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.style.position = 'fixed';
        messageContainer.style.bottom = '20px';
    }
}