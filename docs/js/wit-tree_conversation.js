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
    
    const userQ = document.createElement('div');
    userQ.className = 'storyteller-user-message';
    userQ.textContent = question;
    chatHistory.appendChild(userQ);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    const loading = document.createElement('div');
    loading.className = 'storyteller-loading';
    loading.innerHTML = '<div class="dot-typing"></div>';
    chatHistory.appendChild(loading);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    
    const answer = await queryAliceStorybase(question);
    
    loading.remove();
    
    const responseEl = document.createElement('div');
    responseEl.className = 'storyteller-tree-message';
    chatHistory.appendChild(responseEl);
    
    typeWriterEffect(responseEl, answer, 0, 30);
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function typeWriterEffect(element, text, i, speed) {
    if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(() => typeWriterEffect(element, text, i, speed), speed);
    }
    const chatHistory = document.getElementById('storyteller-history');
    chatHistory.scrollTop = chatHistory.scrollHeight;
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
