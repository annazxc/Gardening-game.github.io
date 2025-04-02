document.addEventListener('DOMContentLoaded', function() {
    // Load plant counts from localStorage
    const seeds = parseInt(localStorage.getItem('seeds') || 0);
    const sprouts = parseInt(localStorage.getItem('sprouts') || 0);
    const trees = parseInt(localStorage.getItem('trees') || 0);
    
    // Update display
    document.getElementById('seeds-count').textContent = seeds;
    document.getElementById('sprouts-count').textContent = sprouts;
    document.getElementById('trees-count').textContent = trees;
    
    // Create garden plots
    const gardenGrid = document.getElementById('garden-grid');
    for (let i = 0; i < 12; i++) {
        const plot = document.createElement('div');
        plot.className = 'garden-plot';
        plot.id = `plot-${i}`;
        plot.innerHTML = '<span class="plot-empty">Empty</span>';
        
        // Add click handler
        plot.addEventListener('click', function() {
            showPlantingOptions(i);
        });
        
        gardenGrid.appendChild(plot);
    }
    
    // Load any previously planted items
    loadPlantedItems();
});

function showPlantingOptions(plotIndex) {
    const seeds = parseInt(localStorage.getItem('seeds') || 0);
    const sprouts = parseInt(localStorage.getItem('sprouts') || 0);
    
    // If nothing to plant, alert user
    if (seeds === 0 && sprouts === 0) {
        alert("You don't have any seeds or sprouts to plant! Go explore and collect more.");
        return;
    }
    
    // Show planting menu
    const options = [];
    if (seeds > 0) options.push('seed');
    if (sprouts > 0) options.push('sprout');
    
    const choice = prompt(`What would you like to plant in plot ${plotIndex + 1}?\n${options.join(', ')}`);
    
    if (choice === 'seed' && seeds > 0) {
        plantItem(plotIndex, 'seed');
    } else if (choice === 'sprout' && sprouts > 0) {
        plantItem(plotIndex, 'sprout');
    }
}

function plantItem(plotIndex, itemType) {
    const plot = document.getElementById(`plot-${plotIndex}`);
    const now = new Date().getTime();
    let growthTime = 0;
    let emoji = '';
    
    if (itemType === 'seed') {
        growthTime = 6 * 60 * 1000; // 6 minutes
        emoji = '🌱';
        // Decrease seed count
        const seeds = parseInt(localStorage.getItem('seeds') || 0);
        localStorage.setItem('seeds', seeds - 1);
        document.getElementById('seeds-count').textContent = seeds - 1;
    } else if (itemType === 'sprout') {
        growthTime = 10 * 60 * 1000; // 10 minutes
        emoji = '🌿';
        // Decrease sprout count
        const sprouts = parseInt(localStorage.getItem('sprouts') || 0);
        localStorage.setItem('sprouts', sprouts - 1);
        document.getElementById('sprouts-count').textContent = sprouts - 1;
    }
    
    // Store planting information
    const plantedItems = JSON.parse(localStorage.getItem('plantedItems') || '{}');
    plantedItems[plotIndex] = {
        type: itemType,
        plantedTime: now,
        growthTime: growthTime
    };
    localStorage.setItem('plantedItems', JSON.stringify(plantedItems));
    
    // Update plot display
    plot.innerHTML = `<div>${emoji}<br><small>Growing...</small></div>`;
    
    // Set growth timer
    setTimeout(() => {
        updateGrowth(plotIndex);
    }, growthTime);
}

function updateGrowth(plotIndex) {
    const plantedItems = JSON.parse(localStorage.getItem('plantedItems') || '{}');
    const item = plantedItems[plotIndex];
    
    if (!item) return;
    
    const plot = document.getElementById(`plot-${plotIndex}`);
    
    if (item.type === 'seed') {
        // Seed grows to sprout
        plot.innerHTML = `<div>🌿<br><small>Grown!</small></div>`;
        item.type = 'sprout';
        item.plantedTime = new Date().getTime();
        item.growthTime = 10 * 60 * 1000; // 10 minutes
        
        // Set next growth timer
        setTimeout(() => {
            updateGrowth(plotIndex);
        }, item.growthTime);
    } else if (item.type === 'sprout') {
        // Sprout grows to tree
        plot.innerHTML = `<div>🌳<br><small>Fully Grown!</small></div>`;
        item.type = 'tree';
        
        // Increase tree count
        const trees = parseInt(localStorage.getItem('trees') || 0);
        localStorage.setItem('trees', trees + 1);
        document.getElementById('trees-count').textContent = trees + 1;
    }
      // Update storage
      plantedItems[plotIndex] = item;
      localStorage.setItem('plantedItems', JSON.stringify(plantedItems));
  }
  
  function loadPlantedItems() {
      const plantedItems = JSON.parse(localStorage.getItem('plantedItems') || '{}');
      const now = new Date().getTime();
      
      Object.keys(plantedItems).forEach(plotIndex => {
          const item = plantedItems[plotIndex];
          const plot = document.getElementById(`plot-${plotIndex}`);
          
          if (!plot) return;
          
          const timeElapsed = now - item.plantedTime;
          
          if (item.type === 'seed' && timeElapsed < item.growthTime) {
              // Still growing as seed
              plot.innerHTML = `<div>🌱<br><small>Growing...</small></div>`;
              
              // Set growth timer for remaining time
              setTimeout(() => {
                  updateGrowth(plotIndex);
              }, item.growthTime - timeElapsed);
          } else if (item.type === 'seed' && timeElapsed >= item.growthTime) {
              // Should be a sprout now
              updateGrowth(plotIndex);
          } else if (item.type === 'sprout' && timeElapsed < item.growthTime) {
              // Still growing as sprout
              plot.innerHTML = `<div>🌿<br><small>Growing...</small></div>`;
              
              // Set growth timer for remaining time
              setTimeout(() => {
                  updateGrowth(plotIndex);
              }, item.growthTime - timeElapsed);
          } else if (item.type === 'sprout' && timeElapsed >= item.growthTime) {
              // Should be a tree now
              updateGrowth(plotIndex);
          } else if (item.type === 'tree') {
              // Fully grown tree
              plot.innerHTML = `<div>🌳<br><small>Fully Grown!</small></div>`;
          }
      });
  }