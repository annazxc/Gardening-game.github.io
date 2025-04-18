function showSlotMachine() {
    const slotMachineOverlay = document.createElement('div');
    slotMachineOverlay.id = 'slot-machine-overlay';
    slotMachineOverlay.className = 'slot-machine-overlay';
    
    const slotMachineContent = document.createElement('div');
    slotMachineContent.className = 'slot-machine-content';
    
    const title = document.createElement('h2');
    title.textContent = 'Slot Machine!';
    slotMachineContent.appendChild(title);
    
    const slotDisplay = document.createElement('div');
    slotDisplay.className = 'slot-display';
    
    for (let i = 0; i < 3; i++) {
        const reel = document.createElement('div');
        reel.className = 'slot-reel';
        reel.id = `reel-${i}`;
        reel.innerHTML = '?';
        slotDisplay.appendChild(reel);
    }
    
    slotMachineContent.appendChild(slotDisplay);
    
    const spinButton = document.createElement('button');
    spinButton.className = 'btn btn-warning spin-button';
    spinButton.textContent = 'SPIN!';
    spinButton.onclick = function() {
        spinSlotMachine();
        spinButton.disabled = true;
        
        setTimeout(() => {
            spinButton.disabled = false;
        }, 3000);
    };

    slotMachineContent.appendChild(spinButton);
    
    const resultDisplay = document.createElement('div');
    resultDisplay.className = 'result-display';
    resultDisplay.id = 'result-display';
    resultDisplay.textContent = 'Spin to win prizes!';
    slotMachineContent.appendChild(resultDisplay);
    
    const closeButton = document.createElement('button');
    closeButton.className = 'btn btn-secondary';
    closeButton.textContent = 'Close';
    closeButton.onclick = function() {
        slotMachineOverlay.classList.add('closing');
        setTimeout(() => {
            slotMachineOverlay.remove();
        }, 500);
    };
    
    slotMachineContent.appendChild(closeButton);
    slotMachineOverlay.appendChild(slotMachineContent);
    document.body.appendChild(slotMachineOverlay);
    
    setTimeout(() => {
        slotMachineOverlay.classList.add('open');
    }, 10);
}

function spinSlotMachine() {
    const items = ['🌱', '🌿', '🌳', '🌸', '🍎', '💎'];
    const reels = document.querySelectorAll('.slot-reel');
    const resultDisplay = document.getElementById('result-display');
    
    reels.forEach((reel, index) => {
        const duration = 2000 + Math.random() * 1000;
        let spins = 0;
        const spinInterval = setInterval(() => {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            reel.textContent = randomItem;
            spins++;
            
            // End spinning
            if (spins > duration / 100) {
                clearInterval(spinInterval);
            }
        }, 100);
    });
    
    // After all reels stop, check for win
    setTimeout(() => {
        const results = [];
        reels.forEach(reel => {
            results.push(reel.textContent);
        });
        
        let reward = '';
        if (results[0] === results[1] && results[1] === results[2]) {
            // All three match - jackpot!
            const bonus = 50;
            localStorage.setItem('bonus', bonus);
            reward = `JACKPOT! All three match! You won ${bonus} bonus sprouts!`;
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            // Two match
            const bonus = 20;
            localStorage.setItem('bonus', bonus);
            reward = `You got a pair! You won ${bonus} bonus sprouts!`;
        } else {
            // No match
            const bonus = 5;
            localStorage.setItem('bonus', bonus);
            reward = `No matches, but you still win ${bonus} bonus sprouts!`;
        }
        
        resultDisplay.textContent = reward;
    }, 3000);
}