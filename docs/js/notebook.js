function showCollectionNotebook() {
    const existingOverlay = document.querySelector('.notebook-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    const notebookOverlay = document.createElement('div');
    notebookOverlay.id = 'notebook-overlay';
    notebookOverlay.className = 'notebook-overlay';
    
    const notebookContent = document.createElement('div');
    notebookContent.className = 'notebook-content';
    
    const title = document.createElement('h2');
    title.textContent = `Your Collected
    Words & Phrases`;
    notebookContent.appendChild(title);
    
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
    
    const phrasesSection = document.createElement('div');
    phrasesSection.className = 'notebook-section';
    
    const phrasesTitle = document.createElement('h3');
    phrasesTitle.textContent = 'Completed Phrases:';
    phrasesSection.appendChild(phrasesTitle);
    initPoemGenerator();
    if (collectedPhrases.length > 0) {
        collectedPhrases.forEach(phrase => {
            const phraseItem = document.createElement('p');
            phraseItem.className = 'completed-phrase';
            phraseItem.textContent = phrase;
            phrasesSection.appendChild(phraseItem);
        });
    } else {
        const noPhrases = document.createElement('p');
        noPhrases.textContent = `No complete phrases collected yet.
        Keep exploring!`;
        phrasesSection.appendChild(noPhrases);
    }
    
    notebookContent.appendChild(phrasesSection);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'notebook-buttons';
    
    const exchangeButton = document.createElement('button');
    exchangeButton.className = 'btn btn-primary btn-success';
    exchangeButton.textContent = 'Exchange Seeds for Sprouts';
    exchangeButton.onclick = function() {
        if (collectedWords.length > 0) {
            const sproutsGained = collectedWords.length;
            localStorage.setItem('sprouts', sproutsGained);
            
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

    const plantButton = document.createElement('button');
    plantButton.className = 'btn btn-primary';
    plantButton.textContent = 'Start Planting';
    plantButton.onclick = function() {
        window.location.href = 'planting.html';
    };
    buttonContainer.appendChild(plantButton);
    

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
    document.body.appendChild(notebookOverlay);
    
    setTimeout(() => {
        notebookOverlay.classList.add('open');
    }, 10);
}