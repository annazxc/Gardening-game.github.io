const responseCache = new Map();
const CACHE_EXPIRY = 1000 * 60 * 60 * 24; //1 day

function getCachedResponse(question) {
    if (responseCache.has(question)) {
        const cacheEntry = responseCache.get(question);
        if (Date.now() - cacheEntry.timestamp < CACHE_EXPIRY) {
            console.log("Cache hit for question:", question);
            return cacheEntry.response;
        } else {
            responseCache.delete(question);
        }
    }
    return null;
}

function cacheResponse(question, response) {
    responseCache.set(question, {
        response: response,
        timestamp: Date.now()
    });
    
    if (responseCache.size > 100) {
        const oldestKey = responseCache.keys().next().value;
        responseCache.delete(oldestKey);
    }
}

async function queryAliceStorybase(userQuestion) {
    try {
        const cachedResponse = getCachedResponse(userQuestion);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const relevantContext = await fetchRelevantContext(userQuestion);
        const response = await generateStorytellerResponse(userQuestion, relevantContext);
        
        cacheResponse(userQuestion, response);
        
        return response;
    } catch (error) {
        console.error("Error querying Alice storybase:", error);
        return `Oh dear! The Wit Tree seems to be napping. 
        Try again in a moment, or ask something else about Wonderland!`;
    }
}

// Maintain conversation history
const maxHistoryItems = 5;
const conversationHistory = [];

function addToConversationHistory(role, content) {
    conversationHistory.push({ role, content });
    
    // Keep history limited to the most recent exchanges
    while (conversationHistory.length > maxHistoryItems * 2) {
        conversationHistory.shift();
    }
}

function getConversationHistoryPrompt() {
    if (conversationHistory.length === 0) {
        return "";
    }
    
    return "Previous conversation:\n" + 
        conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join("\n");
}


