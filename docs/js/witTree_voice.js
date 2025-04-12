class WitTreeVoice {
    constructor(voiceOptions = {}) {
        this.isSpeaking = false;
        this.speechQueue = [];
        this.voiceOptions = {
            voice: null, 
            pitch: 1.1,  
            rate: 0.85,  
            volume: 0.8,
            ...voiceOptions
        };
        
        this.animator = null; 
        this.currentUtterance = null;
        this.pauseAfterSentence = 300; 
        this.wordCallbacks = new Map(); // For word timing callbacks
        
        this.visualizer = null;
        this.visualizerContainer = null;
        this.subtitlesContainer = null;
        
        this.expressions = {
            happy: { pitch: 1.2, rate: 0.9, animState: 'happy' },
            sad: { pitch: 0.9, rate: 0.75, animState: 'sad' },
            excited: { pitch: 1.3, rate: 1.1, animState: 'excited' },
            confused: { pitch: 1.05, rate: 0.7, animState: 'confused' },
            angry: { pitch: 1.15, rate: 1.05, animState: 'angry' },
            whispering: { pitch: 1.1, rate: 0.6, volume: 0.4, animState: 'whispering' }
        };
        
        // Speech recognition for interactive conversations
        this.recognition = null;
        this.isListening = false;
        this.conversationMode = false;
        this.conversationCallbacks = {};
        
        this.ambientSounds = {
            wind: null,
            birds: null,
            leaves: null
        };
        
        this.initVoice();
    }
    
    setAnimator(animator) {
        this.animator = animator;
    }
    
    async initVoice() {
        if (!window.speechSynthesis) {
            console.warn("Speech synthesis not supported in this browser");
            return;
        }
        
        if (speechSynthesis.getVoices().length === 0) {
            await new Promise(resolve => {
                speechSynthesis.onvoiceschanged = resolve;
            });
        }
        
        const voices = speechSynthesis.getVoices();
        
        this.voiceOptions.voice = voices.find(voice => 
            voice.lang === 'en-GB' || 
            voice.name.includes('British') ||
            voice.name.includes('UK')
        );
        
        if (!this.voiceOptions.voice) {
            this.voiceOptions.voice = voices.find(voice => 
                voice.lang.startsWith('en')
            );
        }
        
        if (!this.voiceOptions.voice && voices.length > 0) {
            this.voiceOptions.voice = voices[0];
        }
        
        console.log("Wit Tree voice initialized:", this.voiceOptions.voice?.name);
    }
    
    createSubtitlesContainer() {
        if (this.subtitlesContainer) return;
        
        this.subtitlesContainer = document.createElement('div');
        this.subtitlesContainer.className = 'wit-tree-subtitles';
        this.subtitlesContainer.style.position = 'absolute';
        this.subtitlesContainer.style.bottom = '-40px';
        this.subtitlesContainer.style.left = '0';
        this.subtitlesContainer.style.width = '100%';
        this.subtitlesContainer.style.textAlign = 'center';
        this.subtitlesContainer.style.color = '#3c280e';
        this.subtitlesContainer.style.fontSize = '14px';
        this.subtitlesContainer.style.fontWeight = 'bold';
        this.subtitlesContainer.style.textShadow = '0 0 3px #fff, 0 0 5px #fff';
        this.subtitlesContainer.style.opacity = '0';
        this.subtitlesContainer.style.transition = 'opacity 0.3s';
        this.subtitlesContainer.style.pointerEvents = 'none';
        
        // Add to tree element if animator is available
        if (this.animator && this.animator.treeElement) {
            this.animator.treeElement.appendChild(this.subtitlesContainer);
        } else {
            document.body.appendChild(this.subtitlesContainer);
        }
    }
    
    updateSubtitles(text) {
        if (!this.subtitlesContainer) {
            this.createSubtitlesContainer();
        }
        
        this.subtitlesContainer.textContent = text;
        this.subtitlesContainer.style.opacity = '1';
    }
    
    hideSubtitles() {
        if (this.subtitlesContainer) {
            this.subtitlesContainer.style.opacity = '0';
        }
    }
    
    speak(text, options = {}) {
        if (!window.speechSynthesis) {
            console.warn("Speech synthesis not supported");
            return;
        }
        
        const speakOptions = {
            showSubtitles: true,
            onSentenceStart: null,
            onSentenceEnd: null,
            emotion: null, // Can be: happy, sad, excited, confused, angry, whispering
            visualizer: false,
            emphasized: [], // Array of words to emphasize
            ...options
        };
        
        // Queue the text if already speaking
        if (this.isSpeaking) {
            this.speechQueue.push({text, options: speakOptions});
            return;
        }
        
        // Process the text for better speech - add pauses at punctuation
        const processedText = text
            .replace(/\.\s/g, '. [pause] ')
            .replace(/\!\s/g, '! [pause] ')
            .replace(/\?\s/g, '? [pause] ')
            .replace(/\n/g, ' [pause] ');
        
        
        const utterance = new SpeechSynthesisUtterance(processedText);
        this.currentUtterance = utterance;
        
        utterance.voice = this.voiceOptions.voice;
        utterance.pitch = this.voiceOptions.pitch;
        utterance.rate = this.voiceOptions.rate;
        utterance.volume = this.voiceOptions.volume;
        
        if (speakOptions.emotion && this.expressions[speakOptions.emotion]) {
            const expression = this.expressions[speakOptions.emotion];
            utterance.pitch = expression.pitch;
            utterance.rate = expression.rate;
            
            if (expression.volume !== undefined) {
                utterance.volume = expression.volume;
            }
            
            // Apply emotional animation state
            if (this.animator && expression.animState) {
                this.animator.setEmotionalState(expression.animState);
            }
        }
        
        // Start speaking animation if animator is available
        if (this.animator) {
            this.animator.startSpeakingAnimation();
        }
        
        // Set up visualizer for the speech
        if (speakOptions.visualizer) {
            this.setupVisualizer();
        }
        
        // Show subtitles if enabled
        if (speakOptions.showSubtitles) {
            // Split into sentences for better subtitles
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            let currentSentenceIndex = 0;
            
            // Show first sentence immediately
            this.updateSubtitles(sentences[0]);
            
            // Update subtitles for each sentence based on timing
            const estimatedWordsPerSecond = 2.5; // adjust based on speech rate
            let currentPosition = 0;
            
            sentences.forEach((sentence, index) => {
                if (index === 0) return; // Skip first sentence as it's already shown
                
                const previousSentenceWords = sentences.slice(0, index).join(' ').split(' ').length;
                const delayMs = (previousSentenceWords / estimatedWordsPerSecond) * 1000;
                
                setTimeout(() => {
                    if (this.isSpeaking) {
                        this.updateSubtitles(sentence);
                        
                        if (speakOptions.onSentenceStart) {
                            speakOptions.onSentenceStart(sentence, index);
                        }
                    }
                }, delayMs);
            });
        }
        
        this.isSpeaking = true;
        
        // Handle completion
        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            
            // Hide subtitles
            this.hideSubtitles();
            
            // Stop animation
            if (this.animator) {
                this.animator.stopSpeakingAnimation();
                this.animator.resetEmotionalState();
            }
            
            // Stop visualizer
            if (speakOptions.visualizer && this.visualizer) {
                this.stopVisualizer();
            }
            
            // Callback
            if (speakOptions.onSentenceEnd) {
                speakOptions.onSentenceEnd(text);
            }
            
            // Check if there's more in the queue
            if (this.speechQueue.length > 0) {
                const next = this.speechQueue.shift();
                setTimeout(() => {
                    this.speak(next.text, next.options);
                }, 300); // Small delay between speeches
            } else if (this.conversationMode) {
                // In conversation mode, start listening when done speaking
                setTimeout(() => {
                    this.startListening();
                }, 500);
            }
        };
        
        // Handle errors
        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event);
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.hideSubtitles();
            
            if (this.animator) {
                this.animator.stopSpeakingAnimation();
                this.animator.resetEmotionalState();
            }
            
            if (speakOptions.visualizer && this.visualizer) {
                this.stopVisualizer();
            }
        };
        
        // Start speaking
        window.speechSynthesis.speak(utterance);
    }
    
    pause() {
        if (window.speechSynthesis && this.isSpeaking) {
            window.speechSynthesis.pause();
            
            // Pause animation
            if (this.animator) {
                // Reduce animation intensity but don't stop completely
                this.animator.treeElement.style.animationPlayState = 'paused';
            }
            
            // Pause visualizer if active
            if (this.visualizer) {
                this.visualizer.suspend();
            }
        }
    }
    
    resume() {
        if (window.speechSynthesis) {
            window.speechSynthesis.resume();
            
            // Resume animation
            if (this.animator) {
                this.animator.treeElement.style.animationPlayState = 'running';
            }
            
            // Resume visualizer if active
            if (this.visualizer) {
                this.visualizer.resume();
            }
        }
    }
    
    cancel() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            
            // Clear queue
            this.speechQueue = [];
            
            // Hide subtitles
            this.hideSubtitles();
            
            // Stop animation
            if (this.animator) {
                this.animator.stopSpeakingAnimation();
                this.animator.resetEmotionalState();
            }
            
            // Stop visualizer
            if (this.visualizer) {
                this.stopVisualizer();
            }
        }
    }
    
    setupVisualizer() {
        // Only create if it doesn't exist
        if (this.visualizer) return;
        
        this.visualizerContainer = document.createElement('div');
        this.visualizerContainer.className = 'wit-tree-visualizer';
        this.visualizerContainer.style.position = 'absolute';
        this.visualizerContainer.style.top = '-50px';
        this.visualizerContainer.style.left = '50%';
        this.visualizerContainer.style.transform = 'translateX(-50%)';
        this.visualizerContainer.style.width = '100px';
        this.visualizerContainer.style.height = '40px';
        this.visualizerContainer.style.borderRadius = '20px';
        this.visualizerContainer.style.background = 'rgba(60, 40, 14, 0.3)';
        this.visualizerContainer.style.overflow = 'hidden';
        this.visualizerContainer.style.pointerEvents = 'none';
        
        // Create canvas for visualizer
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 40;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        this.visualizerContainer.appendChild(canvas);
        
        // Add to tree element if animator is available
        if (this.animator && this.animator.treeElement) {
            this.animator.treeElement.appendChild(this.visualizerContainer);
        } else {
            document.body.appendChild(this.visualizerContainer);
        }
        
        // Set up audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.warn("Audio Context not supported in this browser");
            return;
        }
        
        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32;
        
        // Create visualization
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const ctx = canvas.getContext('2d');
        
        // Start visualization
        const draw = () => {
            if (!this.visualizer) return;
            
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                
                ctx.fillStyle = `rgb(60, ${150 + dataArray[i] / 4}, 14)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                
                x += barWidth + 1;
            }
        };
        
        draw();
        
        this.visualizer = audioCtx;
    }
    
    stopVisualizer() {
        if (this.visualizer) {
            this.visualizer.close();
            this.visualizer = null;
            
            if (this.visualizerContainer && this.visualizerContainer.parentNode) {
                this.visualizerContainer.parentNode.removeChild(this.visualizerContainer);
            }
            this.visualizerContainer = null;
        }
    }
    
    speakWithEmotion(text, emotion, options = {}) {
        this.speak(text, { ...options, emotion });
    }
    
    initSpeechRecognition() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            // Set up event handlers
            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                
                // Fire result event for interim results
                if (event.results[0].isFinal) {
                    this.isListening = false;
                    
                    // End listening animation
                    if (this.animator) {
                        this.animator.stopListeningAnimation();
                    }
                    
                    if (this.conversationMode && this.conversationCallbacks.onResponse) {
                        this.conversationCallbacks.onResponse(transcript);
                    }
                } else {
                    // Update interim results
                    if (this.conversationCallbacks.onInterimResult) {
                        this.conversationCallbacks.onInterimResult(transcript);
                    }
                }
            };
            
            this.recognition.onstart = () => {
                this.isListening = true;
                
                // Start listening animation
                if (this.animator) {
                    this.animator.startListeningAnimation();
                }
                
                if (this.conversationCallbacks.onListeningStart) {
                    this.conversationCallbacks.onListeningStart();
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                
                // End listening animation
                if (this.animator) {
                    this.animator.stopListeningAnimation();
                }
                
                if (this.conversationCallbacks.onListeningEnd) {
                    this.conversationCallbacks.onListeningEnd();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                this.isListening = false;
                
                // End listening animation
                if (this.animator) {
                    this.animator.stopListeningAnimation();
                }
                
                if (this.conversationCallbacks.onError) {
                    this.conversationCallbacks.onError(event.error);
                }
            };
            
            return true;
        } else {
            console.warn("Speech recognition not supported in this browser");
            return false;
        }
    }
    
    startListening() {
        if (!this.recognition && !this.initSpeechRecognition()) {
            return false;
        }
        
        if (!this.isListening && !this.isSpeaking) {
            try {
                this.recognition.start();
                return true;
            } catch (error) {
                console.error("Failed to start speech recognition:", error);
                return false;
            }
        }
        return false;
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
                return true;
            } catch (error) {
                console.error("Failed to stop speech recognition:", error);
                return false;
            }
        }
        return false;
    }
    
    enableConversationMode(callbacks = {}) {
        this.conversationMode = true;
        this.conversationCallbacks = {
            onResponse: null,
            onInterimResult: null,
            onListeningStart: null,
            onListeningEnd: null,
            onError: null,
            ...callbacks
        };
        
        // Initialize speech recognition if needed
        if (!this.recognition) {
            this.initSpeechRecognition();
        }
        
        return true;
    }
    
    disableConversationMode() {
        this.conversationMode = false;
        if (this.isListening) {
            this.stopListening();
        }
    }
    
    setExpression(expressionName, settings) {
        if (!this.expressions[expressionName]) {
            this.expressions[expressionName] = { animState: expressionName };
        }
        
        Object.assign(this.expressions[expressionName], settings);
    }
    
    getAvailableVoices() {
        if (!window.speechSynthesis) {
            return [];
        }
        
        return speechSynthesis.getVoices();
    }
    
    changeVoice(voiceNameOrIndex) {
        const voices = this.getAvailableVoices();
        
        if (voices.length === 0) {
            console.warn("No voices available");
            return false;
        }
        
        if (typeof voiceNameOrIndex === 'string') {
            // Find by name or contains
            const voice = voices.find(v => 
                v.name === voiceNameOrIndex || 
                v.name.includes(voiceNameOrIndex)
            );
            
            if (voice) {
                this.voiceOptions.voice = voice;
                return true;
            }
        } else if (typeof voiceNameOrIndex === 'number') {
            // Find by index
            if (voiceNameOrIndex >= 0 && voiceNameOrIndex < voices.length) {
                this.voiceOptions.voice = voices[voiceNameOrIndex];
                return true;
            }
        }
        
        console.warn("Voice not found:", voiceNameOrIndex);
        return false;
    }
    
    // Update voice settings
    updateVoiceSettings(settings = {}) {
        Object.assign(this.voiceOptions, settings);
    }
    
    // Load and play ambient sounds
    loadAmbientSounds(sounds = {}) {
        Object.keys(sounds).forEach(key => {
            if (this.ambientSounds[key] === undefined) {
                this.ambientSounds[key] = new Audio(sounds[key]);
                this.ambientSounds[key].loop = true;
                this.ambientSounds[key].volume = 0.2;
            } else {
                this.ambientSounds[key].src = sounds[key];
            }
        });
    }
    
    playAmbientSound(soundKey, options = {}) {
        if (this.ambientSounds[soundKey]) {
            if (options.volume !== undefined) {
                this.ambientSounds[soundKey].volume = options.volume;
            }
            
            this.ambientSounds[soundKey].play();
            return true;
        }
        return false;
    }
    
    stopAmbientSound(soundKey) {
        if (this.ambientSounds[soundKey]) {
            this.ambientSounds[soundKey].pause();
            this.ambientSounds[soundKey].currentTime = 0;
            return true;
        }
        return false;
    }
    
    // Add special effects to make tree seem more alive
    addSpecialEffect(effectType, options = {}) {
        if (!this.animator) {
            console.warn("Animator not set, cannot add special effects");
            return false;
        }
        
        switch (effectType) {
            case 'leaves':
                this.animator.createLeafFallingEffect(options);
                break;
            case 'glow':
                this.animator.createGlowEffect(options);
                break;
            case 'sparkle':
                this.animator.createSparkleEffect(options);
                break;
            case 'shake':
                this.animator.shakeTree(options.intensity || 'medium', options.duration || 1000);
                break;
            default:
                console.warn("Unknown effect type:", effectType);
                return false;
        }
        
        return true;
    }
    
    // Create a thought bubble for the tree
    showThoughtBubble(text, duration = 3000) {
        if (!this.animator || !this.animator.treeElement) {
            console.warn("Animator not set, cannot show thought bubble");
            return;
        }
        
        // Create thought bubble container if it doesn't exist
        let thoughtBubble = document.querySelector('.wit-tree-thought-bubble');
        
        if (!thoughtBubble) {
            thoughtBubble = document.createElement('div');
            thoughtBubble.className = 'wit-tree-thought-bubble';
            thoughtBubble.style.position = 'absolute';
            thoughtBubble.style.top = '-80px';
            thoughtBubble.style.left = '50%';
            thoughtBubble.style.transform = 'translateX(-50%)';
            thoughtBubble.style.background = 'rgba(255, 255, 255, 0.9)';
            thoughtBubble.style.borderRadius = '15px';
            thoughtBubble.style.padding = '10px 15px';
            thoughtBubble.style.maxWidth = '200px';
            thoughtBubble.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            thoughtBubble.style.fontStyle = 'italic';
            thoughtBubble.style.opacity = '0';
            thoughtBubble.style.transition = 'all 0.3s ease';
            
            // Create the tail of the thought bubble
            const tail = document.createElement('div');
            tail.style.position = 'absolute';
            tail.style.bottom = '-10px';
            tail.style.left = '50%';
            tail.style.transform = 'translateX(-50%)';
            tail.style.width = '0';
            tail.style.height = '0';
            tail.style.borderLeft = '10px solid transparent';
            tail.style.borderRight = '10px solid transparent';
            tail.style.borderTop = '10px solid rgba(255, 255, 255, 0.9)';
            
            thoughtBubble.appendChild(tail);
            this.animator.treeElement.appendChild(thoughtBubble);
        }
        
        // Update and show the thought bubble
        thoughtBubble.textContent = text;
        thoughtBubble.style.opacity = '1';
        
        // Hide after duration
        setTimeout(() => {
            thoughtBubble.style.opacity = '0';
        }, duration);
    }
    
    // Settings for accessibility
    setAccessibilitySettings(settings = {}) {
        // Configure subtitles
        if (settings.subtitlesColor) {
            if (this.subtitlesContainer) {
                this.subtitlesContainer.style.color = settings.subtitlesColor;
            }
        }
        
        if (settings.subtitlesSize) {
            if (this.subtitlesContainer) {
                this.subtitlesContainer.style.fontSize = typeof settings.subtitlesSize === 'string' 
                    ? settings.subtitlesSize 
                    : `${settings.subtitlesSize}px`;
            }
        }
        
        // Other accessibility settings
        if (settings.alwaysShowSubtitles !== undefined) {
            this.voiceOptions.showSubtitles = settings.alwaysShowSubtitles;
        }
    }
}