function showCollectionNotebook() {
    const existingOverlay = document.querySelector('.notebook-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    const notebookOverlay = document.createElement('div');
    notebookOverlay.id = 'notebook-overlay';
    notebookOverlay.className = 'notebook-overlay';
    
    // Create notebook content
    const notebookContent = document.createElement('div');
    notebookContent.className = 'notebook-content';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = "Your Collected \n Words & Phrases";
    notebookContent.appendChild(title);
    
    // Add collected words section
    const wordsSection = document.createElement('div');
    wordsSection.className = 'notebook-section';
    
    const wordsTitle = document.createElement('h3');
    wordsTitle.textContent = 'Words Collected:';
    wordsSection.appendChild(wordsTitle);
    
    const wordsList = document.createElement('p');
    wordsList.textContent = collectedWords.join(' ');
    wordsSection.appendChild(wordsList);

    const seedsCount = document.createElement('p');
    seedsCount.className = 'seeds-count';
    seedsCount.textContent = `Total Seeds: ${collectedWords.length}`;
    wordsSection.appendChild(seedsCount);
    
    notebookContent.appendChild(wordsSection);
    
    // Add completed phrases section
    const phrasesSection = document.createElement('div');
    phrasesSection.className = 'notebook-section';
    
    const phrasesTitle = document.createElement('h3');
    phrasesTitle.textContent = 'Completed Phrases:';
    phrasesSection.appendChild(phrasesTitle);
    
    if (collectedPhrases.length > 0) {
        collectedPhrases.forEach(phrase => {
            const phraseItem = document.createElement('p');
            phraseItem.className = 'completed-phrase';
            phraseItem.textContent = phrase;
            phrasesSection.appendChild(phraseItem);
        });
    } else {
        const noPhrases = document.createElement('p');
        noPhrases.textContent = "No complete phrases collected yet.\n Keep exploring!";
        phrasesSection.appendChild(noPhrases);
    }
    
    notebookContent.appendChild(phrasesSection);

    // Add button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'notebook-buttons';
    
    // Add exchange seeds button
    const exchangeButton = document.createElement('button');
    exchangeButton.className = 'btn btn-success';
    exchangeButton.textContent = 'Exchange Seeds for Sprouts';
    exchangeButton.onclick = function() {
        if (collectedWords.length > 0) {
            // Exchange seeds for sprouts (1:1 ratio)
            const sproutsGained = collectedWords.length;
            localStorage.setItem('sprouts', sproutsGained);
            
            // Show slot machine if phrases collected
            if (collectedPhrases.length > 0) {
                showSlotMachine();
            } else {
                alert(`You've exchanged ${sproutsGained} seeds for ${sproutsGained} sprouts!`);
            }
        } else {
            alert("You don't have any seeds to exchange yet!");
        }
    };
    buttonContainer.appendChild(exchangeButton);

    // Add start planting button
    const plantButton = document.createElement('button');
    plantButton.className = 'btn btn-primary';
    plantButton.textContent = 'Start Planting';
    plantButton.onclick = function() {
        // Redirect to planting page
        window.location.href = 'planting.html';
    };
    buttonContainer.appendChild(plantButton);
    
    
    // Add continue button
    const continueButton = document.createElement('button');
    continueButton.className = 'btn btn-primary';
    continueButton.textContent = 'Keep going!';
    continueButton.onclick = function () {
        if (notebookOverlay.classList.contains('closing')) return;
        notebookOverlay.classList.add('closing');
    
        setTimeout(() => {
            notebookOverlay.remove();
        }, 500); 
    };
    buttonContainer.appendChild(continueButton);
    
    
    notebookContent.appendChild(buttonContainer);
    notebookOverlay.appendChild(notebookContent);
    
    // Add to body
    document.body.appendChild(notebookOverlay);
    
    // Trigger animation
    setTimeout(() => {
        notebookOverlay.classList.add('open');
    }, 10);
}