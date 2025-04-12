function createWitTree(x, y) {
    let existingTree = document.getElementById('wit-tree');
    if (existingTree) {
        return existingTree;
    }
    
    const witTree = document.createElement('div');
    witTree.id = 'wit-tree';
    witTree.className = 'wit-tree';
    witTree.style.position = 'absolute';
    witTree.style.left = `${x}px`;
    witTree.style.top = `${y}px`;
    witTree.style.width = '300px';
    witTree.style.height = '150px';
    witTree.style.backgroundImage = "url('assets/images/wit-tree.png')";
    witTree.style.backgroundSize = 'contain';
    witTree.style.backgroundRepeat = 'no-repeat';
    witTree.style.cursor = 'pointer';
    witTree.style.zIndex = '50';
    
    witTree.addEventListener('click', () => {
        showStorytellerDialog();
    });
    
    const treeController = initializeWitTree('wit-tree');
    
    const mapContainer = document.getElementById('map-container') || document.body;
    mapContainer.appendChild(witTree);

    setInterval(() => {
        if (Math.random() > 0.7) {
            createFallingLeaf(witTree);
        }
    }, 3000);
    
    return witTree;
}

function createFallingLeaf(treeElement) {
    const leaf = document.createElement('div');
    leaf.className = 'falling-leaf';
    
    const treeRect = treeElement.getBoundingClientRect();
    const startX = Math.random() * 80 + 20;
    
    leaf.style.position = 'absolute';
    leaf.style.left = `${startX}px`;
    leaf.style.top = '50px';
    leaf.style.width = '10px';
    leaf.style.height = '10px';
    leaf.style.backgroundColor = Math.random() > 0.5 ? '#8BC34A' : '#CDDC39';
    leaf.style.borderRadius = '50% 0 50% 50%';
    leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
    leaf.style.opacity = '0.8';
    leaf.style.zIndex = '49';
    
    treeElement.appendChild(leaf);
    
    let posY = 50;
    let posX = startX;
    let rotation = Math.random() * 360;
    let opacity = 0.8;
    
    function fall() {
        posY += 1;
        posX += Math.sin(posY / 10) * 0.5;
        rotation += 2;
        opacity -= 0.005;
        
        leaf.style.top = `${posY}px`;
        leaf.style.left = `${posX}px`;
        leaf.style.transform = `rotate(${rotation}deg)`;
        leaf.style.opacity = opacity;
        
        if (posY < 200 && opacity > 0) {
            requestAnimationFrame(fall);
        } else {
            leaf.remove();
        }
    }
    
    requestAnimationFrame(fall);
}

function showStorytellerDialog() {
    let existingDialog = document.getElementById('storyteller-dialog');
    if (existingDialog) {
        existingDialog.classList.add('open');
        return;
    }
    
    const dialog = document.createElement('div');
    dialog.id = 'storyteller-dialog';
    dialog.className = 'storyteller-dialog';
    
    const dialogContent = document.createElement('div');
    dialogContent.className = 'storyteller-content';
    
    const title = document.createElement('h2');
    title.textContent = "The Wit Tree";
    title.className = 'storyteller-title';
    dialogContent.appendChild(title);
    
    const intro = document.createElement('p');
    intro.textContent = `Hello, curious wanderer! 
    I am the Wit Tree, keeper of stories from Wonderland. 
    What would you like to know about Alice's adventures?`;
    intro.className = 'storyteller-intro';
    dialogContent.appendChild(intro);
    
    const chatHistory = document.createElement('div');
    chatHistory.className = 'storyteller-history';
    chatHistory.id = 'storyteller-history';
    dialogContent.appendChild(chatHistory);
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'storyteller-input-container';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'storyteller-input';
    input.placeholder = 'Anything curious about Alice in Wonderland ? ლ(╹◡╹ლ) :';
    inputContainer.appendChild(input);
    
    const askButton = document.createElement('button');
    askButton.className = 'storyteller-ask-btn';
    askButton.textContent = 'Ask';
    askButton.onclick = function() {
        askStorytellerQuestion(input.value);
        input.value = '';
    };
    inputContainer.appendChild(askButton);
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            askStorytellerQuestion(input.value);
            input.value = '';
        }
    });
    
    dialogContent.appendChild(inputContainer);
    
    const closeButton = document.createElement('button');
    closeButton.className = 'storyteller-close-btn';
    closeButton.textContent = 'X';
    closeButton.onclick = function() {
        // Stop any ongoing speech when dialog closes
        const treeController = getWitTreeController();
        if (treeController) {
            treeController.voice.cancel();
            treeController.animator.stopSpeakingAnimation();
        }
        
        dialog.classList.remove('open');
        setTimeout(() => {
            dialog.style.display = 'none';
        }, 500);
    };
    dialogContent.appendChild(closeButton);
    
    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);
    
    setTimeout(() => {
        dialog.classList.add('open');
    }, 10);
    
    // Add focus to the input
    setTimeout(() => {
        input.focus();
    }, 500);
}

async function askStorytellerQuestion(question) {
    if (!question.trim()) return;
    
    const chatHistory = document.getElementById('storyteller-history');
    
    // Add user question
    const userQ = document.createElement('div');
    userQ.className = 'storyteller-user-message';
    userQ.textContent = question;
    chatHistory.appendChild(userQ);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    // Add loading indicator
    const loading = document.createElement('div');
    loading.className = 'storyteller-loading';
    loading.innerHTML = '<div class="dot-typing"></div>';
    chatHistory.appendChild(loading);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    const treeController = getWitTreeController();
    
    // Trigger animations and get cached or fresh answer
    treeController.animator.activateGlowEffect();
    let answer;
    
    // Check cache first
    const cachedResponse = getCachedResponse(question);
    if (cachedResponse) {
        answer = cachedResponse;
    } else {
        // If not in cache, fetch from API
        answer = await queryAliceStorybase(question);
        // Cache the new response
        cacheResponse(question, answer);
    }
    // Update conversation history for context window management
    addToConversationHistory("user", question);
    addToConversationHistory("assistant", answer);
    
    // Remove loading indicator
    loading.remove();
    
    // Display the answer with typing animation
    const responseEl = document.createElement('div');
    responseEl.className = 'storyteller-tree-message';
    chatHistory.appendChild(responseEl);
    
    treeController.animator.startSpeakingAnimation();
    treeController.voice.speak(answer);
    
    // Animate the text appearing
    typeWriterEffect(responseEl, answer, 0, 30);
    // Scroll to show the new message
    chatHistory.scrollTop = chatHistory.scrollHeight;

}

// Create a typewriter effect for the tree's responses
function typeWriterEffect(element, text, i, speed) {
    if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(() => typeWriterEffect(element, text, i, speed), speed);
    }
    // Scroll as the text appears
    const chatHistory = document.getElementById('storyteller-history');
    chatHistory.scrollTop = chatHistory.scrollHeight;
}
function getWitTreeController() {
    // Check if controller already exists
    if (window.witTreeController) {
        return window.witTreeController;
    }
    
    // If not, create it
    const treeElement = document.getElementById('wit-tree');
    if (!treeElement) {
        console.error("Tree element not found");
        return null;
    }
    
    // Initialize controller
    window.witTreeController = initializeWitTree('wit-tree');
    return window.witTreeController;
}

function addStorytellerStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Wit Tree Styles */
        .wit-tree {
            transition: transform 0.5s ease;
        }
        
        /* Dialog Styles */
        .storyteller-dialog {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.5s ease;
            pointer-events: none;
        }
        
        .storyteller-dialog.open {
            opacity: 1;
            pointer-events: auto;
        }
        
        .storyteller-content {
            background-color: #f8f0e5;
            width: 80%;
            max-width: 600px;
            height: 70%;
            max-height: 600px;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
            position: relative;
            display: flex;
            flex-direction: column;
            background-image: linear-gradient(to bottom, #f8f0e5, #e8d8c3);
            border: 8px solid #7e4c21;
        }
        
        .storyteller-title {
            color: #5d3a18;
            text-align: center;
            font-family: 'Georgia', serif;
            margin-top: 0;
            margin-bottom: 10px;
        }
        
        .storyteller-intro {
            color: #7e4c21;
            font-style: italic;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .storyteller-history {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 15px;
            padding: 10px;
            background-color: rgba(255, 255, 255, 0.6);
            border-radius: 10px;
        }
        
        .storyteller-user-message {
            background-color: #e1f5fe;
            border-radius: 15px 15px 3px 15px;
            padding: 10px 15px;
            margin: 5px 0 5px auto;
            max-width: 80%;
            color: #01579b;
            text-align: right;
        }
        
        .storyteller-tree-message {
            background-color: #e8f5e9;
            border-radius: 15px 15px 15px 3px;
            padding: 10px 15px;
            margin: 5px auto 5px 0;
            max-width: 80%;
            color: #1b5e20;
            position: relative;
        }
        
        .storyteller-tree-message:before {
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            background-image: url('assets/images/leaf-icon.png');
            background-size: contain;
            background-repeat: no-repeat;
            left: -20px;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .storyteller-input-container {
            display: flex;
            margin-top: 10px;
        }
        
        .storyteller-input {
            flex: 1;
            padding: 10px 15px;
            border: 2px solid #7e4c21;
            border-radius: 20px;
            font-size: 16px;
            outline: none;
        }
        
        .storyteller-ask-btn {
            background-color: #7e4c21;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 10px 20px;
            margin-left: 10px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s ease;
        }
        
        .storyteller-ask-btn:hover {
            background-color: #5d3a18;
        }
        
        .storyteller-close-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #7e4c21;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            font-weight: bold;
        }
        
        /* Loading animation */
        .storyteller-loading {
            text-align: center;
            padding: 10px;
        }
        
        .dot-typing {
            position: relative;
            left: -9999px;
            width: 10px;
            height: 10px;
            border-radius: 5px;
            background-color: #7e4c21;
            color: #7e4c21;
            box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
            animation: dot-typing 1.5s infinite linear;
        }
        
        @keyframes dot-typing {
            0% {
                box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
            }
            16.667% {
                box-shadow: 9984px -10px 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
            }
            33.333% {
                box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
            }
            50% {
                box-shadow: 9984px 0 0 0 #7e4c21, 9999px -10px 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
            }
            66.667% {
                box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
            }
            83.333% {
                box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px -10px 0 0 #7e4c21;
            }
            100% {
                box-shadow: 9984px 0 0 0 #7e4c21, 9999px 0 0 0 #7e4c21, 10014px 0 0 0 #7e4c21;
            }
        }
    `;
    document.head.appendChild(styleElement);
}

function initStorytellerSystem() {
    addStorytellerStyles();
    
    const treeX = 500;  
    const treeY = 300;  
    createWitTree(treeX, treeY);
    
    // Initialize our enhanced features
    const treeController = getWitTreeController();
    
    // Add player proximity detection for the glow effect
    document.addEventListener('mousemove', (event) => {
        const treeElement = document.getElementById('wit-tree');
        if (!treeElement) return;
        
        const treeRect = treeElement.getBoundingClientRect();
        const treeCenterX = treeRect.left + treeRect.width / 2;
        const treeCenterY = treeRect.top + treeRect.height / 2;
        
        // Calculate distance from mouse to tree center
        const distance = Math.sqrt(
            Math.pow(event.clientX - treeCenterX, 2) + 
            Math.pow(event.clientY - treeCenterY, 2)
        );
        
        // If mouse is close to tree, trigger the glow effect
        if (distance < 200) {
            treeController.animator.triggerReactionToPlayerApproach();
        }
    });
    
    console.log("Enhanced storyteller system initialized!");
}


document.addEventListener('DOMContentLoaded', function() {

    setTimeout(initStorytellerSystem, 1000);
});

// Export functions that might be needed by other parts of the game
window.showStorytellerDialog = showStorytellerDialog;
window.createWitTree = createWitTree;