// Better Canvas Popup Script
document.addEventListener('DOMContentLoaded', async function() {
    const statusElement = document.getElementById('status');
    const statusText = document.getElementById('statusText');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const bloatToggle = document.getElementById('bloatToggle');
    const fullscreenToggle = document.getElementById('fullscreenToggle');

    // Check if we're on a Canvas page
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const isCanvasPage = tab.url.includes('instructure.com') || 
                           tab.url.includes('canvas.') || 
                           tab.url.includes('.edu');
        
        if (isCanvasPage) {
            statusElement.className = 'status';
            statusText.textContent = 'Connected to Canvas ✓';
        } else {
            statusElement.className = 'status error';
            statusText.textContent = 'Not on a Canvas page';
        }
    } catch (error) {
        statusElement.className = 'status error';
        statusText.textContent = 'Error checking page';
    }

    // Load saved settings
    const settings = await chrome.storage.sync.get({
        darkMode: false,
        hideBloat: false,
        fullscreenMode: true
    });

    // Apply saved settings to UI
    darkModeToggle.classList.toggle('active', settings.darkMode);
    bloatToggle.classList.toggle('active', settings.hideBloat);
    fullscreenToggle.classList.toggle('active', settings.fullscreenMode);

    // Toggle event handlers
    darkModeToggle.addEventListener('click', async () => {
        const isActive = darkModeToggle.classList.contains('active');
        darkModeToggle.classList.toggle('active');
        
        await chrome.storage.sync.set({ darkMode: !isActive });
        
        // Send message to content script
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleDarkMode',
                    enabled: !isActive
                });
            }
        } catch (error) {
            console.error('Error sending message to content script:', error);
            // Don't show error to user, just log it
        }
    });

    bloatToggle.addEventListener('click', async () => {
        const isActive = bloatToggle.classList.contains('active');
        bloatToggle.classList.toggle('active');
        
        await chrome.storage.sync.set({ hideBloat: !isActive });
        
        // Send message to content script
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleBloat',
                    enabled: !isActive
                });
            }
        } catch (error) {
            console.error('Error sending message to content script:', error);
            // Don't show error to user, just log it
        }
    });

    fullscreenToggle.addEventListener('click', async () => {
        const isActive = fullscreenToggle.classList.contains('active');
        fullscreenToggle.classList.toggle('active');
        
        await chrome.storage.sync.set({ fullscreenMode: !isActive });
        
        // Send message to content script
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleFullscreen',
                    enabled: !isActive
                });
            }
        } catch (error) {
            console.error('Error sending message to content script:', error);
            // Don't show error to user, just log it
        }
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'updateStatus') {
            if (message.connected) {
                statusElement.className = 'status';
                statusText.textContent = 'Connected to Canvas ✓';
            } else {
                statusElement.className = 'status error';
                statusText.textContent = 'Canvas not detected';
            }
        }
    });
});
