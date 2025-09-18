// Better Canvas Background Script
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Better Canvas: Extension installed/updated');
    
    // Set default settings
    chrome.storage.sync.set({
        darkMode: false,
        hideBloat: false,
        fullscreenMode: true
    });
    
    // Show welcome notification for new installations
    if (details.reason === 'install') {
        // Check if notifications permission is available
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Better Canvas Installed',
                message: 'Click the extension icon to enhance your Canvas experience!'
            });
        } else {
            console.log('Better Canvas: Notifications permission not available');
        }
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically due to manifest configuration
    console.log('Better Canvas: Popup opened');
});

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const isCanvasPage = tab.url.includes('instructure.com') || 
                           tab.url.includes('canvas.') || 
                           tab.url.includes('.edu');
        
        if (isCanvasPage) {
            console.log('Better Canvas: Canvas page detected, content script should be active');
        }
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        if (message.action === 'getSettings') {
            chrome.storage.sync.get({
                darkMode: false,
                hideBloat: false,
                fullscreenMode: true
            }, (settings) => {
                sendResponse(settings);
            });
            return true; // Keep message channel open for async response
        }
        
        if (message.action === 'updateSettings') {
            chrome.storage.sync.set(message.settings, () => {
                sendResponse({ success: true });
            });
            return true;
        }
        
        if (message.action === 'logError') {
            console.error('Better Canvas Error:', message.error);
            sendResponse({ success: true });
            return true;
        }
    } catch (error) {
        console.error('Better Canvas: Error handling message:', error);
        sendResponse({ success: false, error: error.message });
        return true;
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Better Canvas: Extension started');
});

// Handle extension suspend/resume
chrome.runtime.onSuspend.addListener(() => {
    console.log('Better Canvas: Extension suspended');
});

// Clean up on uninstall
chrome.runtime.onSuspendCanceled.addListener(() => {
    console.log('Better Canvas: Extension suspend canceled');
});
