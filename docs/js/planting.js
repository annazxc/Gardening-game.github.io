const gameState = {
    water: 0,
    fertilizer: 0,
    selectedArea: null,
    isCollecting: false,
    isApplying: false
};

// Elements
const waterLevel = document.getElementById('water-level');
const fertilizerLevel = document.getElementById('fertilizer-level');
const waterButton = document.getElementById('water-button');
const fertilizerButton = document.getElementById('fertilizer-button');
const wateringCan = document.getElementById('watering-can');
const fertilizerBag = document.getElementById('fertilizer-bag');
const waterAnimation = document.getElementById('water-animation');
const fertilizerAnimation = document.getElementById('fertilizer-animation');

// Select planting area
function selectArea(area) {
    gameState.selectedArea = area;
    
    // Visual feedback
    document.querySelectorAll('.circle').forEach(circle => {
        circle.style.border = 'none';
    });
    
    const areaMap = {
        'seeds': '.seeds-circle',
        'sprouts': '.sprouts-circle',
        'trees': '.trees-circle'
    };
    
    document.querySelector(areaMap[area]).style.border = '3px solid yellow';
    
    // Enable buttons if resources are available
    updateButtonStates();
}

// Collect resource
function collectResource(type) {
    if (gameState.isCollecting) return;
    
    gameState.isCollecting = true;
    
    // Show collection animation
    const animElement = type === 'water' ? waterAnimation : fertilizerAnimation;
    animElement.style.display = 'block';
    
    // Increase resource over time
    const interval = setInterval(() => {
        if (gameState[type] < 100) {
            gameState[type] += 5;
            updateResourceLevels();
        } else {
            clearInterval(interval);
            animElement.style.display = 'none';
            gameState.isCollecting = false;
        }
    }, 200);
    
    // Stop collection after a few seconds
    setTimeout(() => {
        clearInterval(interval);
        animElement.style.display = 'none';
        gameState.isCollecting = false;
    }, 3000);
}

// Apply resource to selected area
function applyResource(type) {
    if (gameState.isApplying || !gameState.selectedArea || gameState[type] < 20) return;
    
    gameState.isApplying = true;
    
    // Move tool to selected area
    const tool = type === 'water' ? wateringCan : fertilizerBag;
    tool.style.display = 'block';
    
    // Get position of selected area
    const areaMap = {
        'seeds': '.seeds-circle',
        'sprouts': '.sprouts-circle',
        'trees': '.trees-circle'
    };
    
    const selectedElement = document.querySelector(areaMap[gameState.selectedArea]);
    const rect = selectedElement.getBoundingClientRect();
    const containerRect = document.querySelector('.garden-container').getBoundingClientRect();
    
    // Position tool over the area
    tool.style.left = (rect.left + rect.width/2 - containerRect.left - 15) + 'px';
    tool.style.top = (rect.top + rect.height/2 - containerRect.top - 15) + 'px';
    
    // Create and animate droplets/pellets
    setTimeout(() => {
        createParticles(type, 10, rect, containerRect);
        
        // Decrease resource
        setTimeout(() => {
            gameState[type] -= 20;
            if (gameState[type] < 0) gameState[type] = 0;
            updateResourceLevels();
            
            // Hide tool
            setTimeout(() => {
                tool.style.display = 'none';
                gameState.isApplying = false;
            }, 500);
        }, 1000);
    }, 500);
}

// Create water droplets or fertilizer pellets
function createParticles(type, count, targetRect, containerRect) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = type === 'water' ? 'droplet' : 'fertilizer-pellet';
        document.querySelector('.garden-container').appendChild(particle);
        
        // Random position within the tool
        const toolType = type === 'water' ? wateringCan : fertilizerBag;
        const toolRect = toolType.getBoundingClientRect();
        
        const startX = toolRect.left - containerRect.left + toolRect.width/2;
        const startY = toolRect.top - containerRect.top + toolRect.height/2;
        
        // Random position within the target area
        const targetX = targetRect.left - containerRect.left + Math.random() * targetRect.width;
        const targetY = targetRect.top - containerRect.top + Math.random() * targetRect.height;
        
        // Set initial position
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        particle.style.display = 'block';
        
        // Animate to target
        setTimeout(() => {
            particle.style.transition = 'all 1s ease-in';
            particle.style.left = targetX + 'px';
            particle.style.top = targetY + 'px';
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }, Math.random() * 200);
    }
}

// Update resource level displays
function updateResourceLevels() {
    waterLevel.style.width = `${gameState.water}%`;
    fertilizerLevel.style.width = `${gameState.fertilizer}%`;
    updateButtonStates();
}

// Update button states based on resources and selection
function updateButtonStates() {
    waterButton.disabled = !gameState.selectedArea || gameState.water < 20;
    fertilizerButton.disabled = !gameState.selectedArea || gameState.fertilizer < 20;
}

// Event listeners
waterButton.addEventListener('click', () => applyResource('water'));
fertilizerButton.addEventListener('click', () => applyResource('fertilizer'));

document.addEventListener('DOMContentLoaded', function() {
    // Load plant counts from localStorage
    const seeds = parseInt(localStorage.getItem('seeds') || 0);
    const sprouts = parseInt(localStorage.getItem('sprouts') || 0);
    const trees = parseInt(localStorage.getItem('trees') || 0);
    
    // Update display
    document.getElementById('seeds-count').textContent = seeds;
    document.getElementById('sprouts-count').textContent = sprouts;
    document.getElementById('trees-count').textContent = trees;
    
    // Load any previously planted items
    if(typeof loadPlantedItems === 'function') {
        loadPlantedItems();
    }
    
    // Initialize resource levels
    updateResourceLevels();
});

// Modified to work with the provided JS
function applyResource(type) {
    if (gameState.isApplying || !gameState.selectedArea || gameState[type] < 20) return;
    
    gameState.isApplying = true;
    
    // Move tool to selected area
    const tool = type === 'water' ? wateringCan : fertilizerBag;
    tool.style.display = 'block';
    
    // Get position of selected area
    const areaMap = {
        'seeds': '.seeds-circle',
        'sprouts': '.sprouts-circle',
        'trees': '.trees-circle'
    };
    
    const selectedElement = document.querySelector(areaMap[gameState.selectedArea]);
    const rect = selectedElement.getBoundingClientRect();
    const containerRect = document.querySelector('.garden-container').getBoundingClientRect();
    
    // Position tool over the area
    tool.style.left = (rect.left + rect.width/2 - containerRect.left - 15) + 'px';
    tool.style.top = (rect.top + rect.height/2 - containerRect.top - 15) + 'px';
    
    // Create and animate droplets/pellets
    setTimeout(() => {
        createParticles(type, 10, rect, containerRect);
        
        // Decrease resource
        setTimeout(() => {
            gameState[type] -= 20;
            if (gameState[type] < 0) gameState[type] = 0;
            updateResourceLevels();
            
            // Integration: Grow plants faster when watered/fertilized
            if (gameState.selectedArea === 'seeds') {
                // Add seed or increase growth rate const seeds = parseInt(localStorage.getItem('seeds') || 0);
                localStorage.setItem('seeds', seeds + 1);
                document.getElementById('seeds-count').textContent = seeds + 1;
            } else if (gameState.selectedArea === 'sprouts') {
                // Add sprout or increase growth rate
                const sprouts = parseInt(localStorage.getItem('sprouts') || 0);
                localStorage.setItem('sprouts', sprouts + 1);
                document.getElementById('sprouts-count').textContent = sprouts + 1;
            } else if (gameState.selectedArea === 'trees') {
                // Help trees produce more
                const trees = parseInt(localStorage.getItem('trees') || 0);
                if(trees > 0) {
                    const seeds = parseInt(localStorage.getItem('seeds') || 0);
                    localStorage.setItem('seeds', seeds + 1);
                    document.getElementById('seeds-count').textContent = seeds + 1;
                }
            }
            
            // Hide tool
            setTimeout(() => {
                tool.style.display = 'none';
                gameState.isApplying = false;
            }, 500);
        }, 1000);
    }, 500);
}