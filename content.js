// Better Canvas Content Script
(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        darkModeClass: 'better-canvas-dark',
        bloatHiddenClass: 'better-canvas-bloat-hidden',
        fullscreenClass: 'better-canvas-fullscreen',
        fullscreenButtonId: 'better-canvas-fullscreen-btn'
    };

    // State
    let settings = {
        darkMode: false,
        hideBloat: false,
        fullscreenMode: true
    };

    // Initialize
    async function init() {
        console.log('Better Canvas: Initializing...');
        
        // Load settings from storage
        await loadSettings();
        
        // Apply initial settings
        applySettings();
        
        // Set up message listener
        chrome.runtime.onMessage.addListener(handleMessage);
        
        // Set up mutation observer for dynamic content
        setupMutationObserver();
        
        // Inject fullscreen buttons for presentations
        if (settings.fullscreenMode) {
            injectFullscreenButtons();
        }
        
        console.log('Better Canvas: Initialized successfully');
    }

    // Load settings from Chrome storage
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get({
                darkMode: false,
                hideBloat: false,
                fullscreenMode: true
            });
            settings = result;
        } catch (error) {
            console.error('Better Canvas: Error loading settings:', error);
        }
    }

    // Apply current settings
    function applySettings() {
        const body = document.body;
        
        // Apply dark mode
        if (settings.darkMode) {
            body.classList.add(CONFIG.darkModeClass);
        } else {
            body.classList.remove(CONFIG.darkModeClass);
        }
        
        // Apply bloat hiding
        if (settings.hideBloat) {
            body.classList.add(CONFIG.bloatHiddenClass);
            console.log('Better Canvas: Hide Bloat enabled - class applied');
        } else {
            body.classList.remove(CONFIG.bloatHiddenClass);
            console.log('Better Canvas: Hide Bloat disabled - class removed');
        }
    }

    // Handle messages from popup
    function handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'toggleDarkMode':
                settings.darkMode = message.enabled;
                chrome.storage.sync.set({ darkMode: message.enabled });
                applySettings();
                break;
                
            case 'toggleBloat':
                settings.hideBloat = message.enabled;
                chrome.storage.sync.set({ hideBloat: message.enabled });
                applySettings();
                break;
                
            case 'toggleFullscreen':
                settings.fullscreenMode = message.enabled;
                chrome.storage.sync.set({ fullscreenMode: message.enabled });
                if (message.enabled) {
                    injectFullscreenButtons();
                } else {
                    removeFullscreenButtons();
                }
                break;
        }
    }

    // Set up mutation observer for dynamic content
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Check for new presentation elements
                    if (settings.fullscreenMode) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                checkForPresentations(node);
                            }
                        });
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Check for presentation elements and inject fullscreen buttons
    function checkForPresentations(element) {
        // Look for PowerPoint/PDF viewers
        const presentations = element.querySelectorAll([
            'iframe[src*="office.com"]',
            'iframe[src*="view.officeapps.live.com"]',
            'iframe[src*="docs.google.com"]',
            'iframe[src*="drive.google.com"]',
            'iframe[src*="slides.google.com"]',
            'iframe[src*="docs.google.com/presentation"]',
            'iframe[src*="canvas.instructure.com"]',
            'iframe[src*="instructure.com"]',
            '.file-preview',
            '.file-viewer',
            '.document-viewer'
        ].join(', '));

        presentations.forEach(presentation => {
            if (!presentation.querySelector(`#${CONFIG.fullscreenButtonId}`)) {
                injectFullscreenButton(presentation);
            }
        });
    }

    // Inject fullscreen buttons for all presentations
    function injectFullscreenButtons() {
        const presentations = document.querySelectorAll([
            'iframe[src*="office.com"]',
            'iframe[src*="view.officeapps.live.com"]',
            'iframe[src*="docs.google.com"]',
            'iframe[src*="drive.google.com"]',
            'iframe[src*="slides.google.com"]',
            'iframe[src*="docs.google.com/presentation"]',
            'iframe[src*="canvas.instructure.com"]',
            'iframe[src*="instructure.com"]',
            '.file-preview',
            '.file-viewer',
            '.document-viewer'
        ].join(', '));

        presentations.forEach(presentation => {
            injectFullscreenButton(presentation);
        });
    }

    // Inject fullscreen button for a specific presentation
    function injectFullscreenButton(presentation) {
        const button = document.createElement('button');
        button.id = CONFIG.fullscreenButtonId;
        button.innerHTML = '⛶';
        button.title = 'Enter Fullscreen';
        button.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(0, 0, 0, 0.9)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(0, 0, 0, 0.7)';
        });

        button.addEventListener('click', () => {
            enterFullscreen(presentation);
        });

        // Make presentation container relative for absolute positioning
        const container = presentation.closest('.file-preview, .file-viewer, .document-viewer, .ic-app-main-content') || presentation.parentElement;
        if (container) {
            container.style.position = 'relative';
            container.appendChild(button);
        }
    }

    // Enter fullscreen mode
    function enterFullscreen(presentation) {
        const body = document.body;
        body.classList.add(CONFIG.fullscreenClass);
        
        // Hide Canvas UI elements
        const elementsToHide = [
            '#header',
            '.ic-app-header',
            '.ic-app-header__main-navigation',
            '.ic-app-header__secondary-navigation',
            '#left-side',
            '.ic-app-main-content__secondary',
            '#right-side-wrapper',
            '#footer',
            '.ic-app-footer',
            '.ic-sidebar-logo',
            '.ic-DashboardCard__box__header'
        ];

        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
                el.setAttribute('data-better-canvas-hidden', 'true');
            });
        });

        // Create exit button
        const exitButton = document.createElement('button');
        exitButton.innerHTML = '✕';
        exitButton.title = 'Exit Fullscreen';
        exitButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1001;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 18px;
            cursor: pointer;
            transition: background 0.3s;
        `;

        exitButton.addEventListener('click', exitFullscreen);
        exitButton.addEventListener('mouseenter', () => {
            exitButton.style.background = 'rgba(255, 0, 0, 0.8)';
        });
        exitButton.addEventListener('mouseleave', () => {
            exitButton.style.background = 'rgba(0, 0, 0, 0.8)';
        });

        document.body.appendChild(exitButton);

        // Store reference for cleanup
        presentation._betterCanvasExitButton = exitButton;
    }

    // Exit fullscreen mode
    function exitFullscreen() {
        const body = document.body;
        body.classList.remove(CONFIG.fullscreenClass);

        // Show hidden elements
        const hiddenElements = document.querySelectorAll('[data-better-canvas-hidden="true"]');
        hiddenElements.forEach(el => {
            el.style.display = '';
            el.removeAttribute('data-better-canvas-hidden');
        });

        // Remove exit button
        const exitButton = document.querySelector('button[title="Exit Fullscreen"]');
        if (exitButton) {
            exitButton.remove();
        }
    }

    // Remove all fullscreen buttons
    function removeFullscreenButtons() {
        const buttons = document.querySelectorAll(`#${CONFIG.fullscreenButtonId}`);
        buttons.forEach(button => button.remove());
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
