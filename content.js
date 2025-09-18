/* ========================================================================
   BETTER CANVAS - CONTENT SCRIPT
   Enhanced Canvas Learning Management System functionality
   ======================================================================== */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        classes: {
            darkMode: 'better-canvas-dark',
            bloatHidden: 'better-canvas-bloat-hidden',
            fullscreen: 'better-canvas-fullscreen'
        },
        selectors: {
            fullscreenButton: 'better-canvas-fullscreen-btn',
            courseMenu: '.ic-app-course-menu',
            leftSide: '#left-side',
            courseName: '#better-canvas-course-name',
            termSubtitle: '#section-tabs-header-subtitle',
            presentations: [
                'iframe[src*="office.com"]',
                'iframe[src*="view.officeapps.live.com"]',
                'iframe[src*="docs.google.com"]',
                'iframe[src*="drive.google.com"]',
                'iframe[src*="slides.google.com"]',
                '.file-preview',
                '.file-viewer',
                '.document-viewer'
            ]
        }
    };

    // State
    let state = {
        settings: {
            darkMode: false,
            hideBloat: false,
            fullscreenMode: true
        },
        isInitialized: false
    };

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function safeQuerySelector(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.warn('Better Canvas: Invalid selector:', selector);
            return null;
        }
    }

    function safeQuerySelectorAll(selector, context = document) {
        try {
            return context.querySelectorAll(selector);
        } catch (error) {
            console.warn('Better Canvas: Invalid selector:', selector);
            return [];
        }
    }

    // Settings management
    async function loadSettings() {
        try {
            const result = await chrome.storage.sync.get({
                darkMode: false,
                hideBloat: false,
                fullscreenMode: true
            });
            state.settings = result;
            console.log('Better Canvas: Settings loaded:', state.settings);
        } catch (error) {
            console.error('Better Canvas: Error loading settings:', error);
        }
    }

    async function saveSettings(newSettings) {
        try {
            const updatedSettings = { ...state.settings, ...newSettings };
            await chrome.storage.sync.set(updatedSettings);
            state.settings = updatedSettings;
            console.log('Better Canvas: Settings saved:', updatedSettings);
        } catch (error) {
            console.error('Better Canvas: Error saving settings:', error);
        }
    }

    function applySettings() {
        const body = document.body;
        if (!body) return;

        try {
            body.classList.toggle(CONFIG.classes.darkMode, state.settings.darkMode);
            body.classList.toggle(CONFIG.classes.bloatHidden, state.settings.hideBloat);
            
            console.log('Better Canvas: Settings applied -', 
                `Dark Mode: ${state.settings.darkMode ? 'ON' : 'OFF'}, `,
                `Hide Bloat: ${state.settings.hideBloat ? 'ON' : 'OFF'}`);
        } catch (error) {
            console.error('Better Canvas: Error applying settings:', error);
        }
    }

    // Course name insertion
    const insertCourseName = debounce(() => {
        try {
            const sidebar = safeQuerySelector(`${CONFIG.selectors.leftSide}${CONFIG.selectors.courseMenu}`);
            if (!sidebar) return;

            if (safeQuerySelector(CONFIG.selectors.courseName)) return;

            const courseName = extractCourseName();
            if (!courseName) return;

            const nameElement = document.createElement('div');
            nameElement.id = CONFIG.selectors.courseName.substring(1);
            nameElement.textContent = courseName;

            const subtitle = safeQuerySelector(CONFIG.selectors.termSubtitle);
            if (subtitle && subtitle.parentElement) {
                subtitle.parentElement.insertBefore(nameElement, subtitle);
            } else {
                sidebar.prepend(nameElement);
            }

            console.log('Better Canvas: Course name inserted:', courseName);
        } catch (error) {
            console.warn('Better Canvas: Error inserting course name:', error);
        }
    }, 250);

    function extractCourseName() {
        const sources = [
            () => safeQuerySelector('.course-title')?.textContent?.trim(),
            () => safeQuerySelector('#content h1, .ic-app-main-content h1')?.textContent?.trim(),
            () => {
                const title = document.title || '';
                const match = title.match(/^.*?:\s*(.+)$/);
                return match ? match[1].trim() : title.trim();
            }
        ];

        for (const source of sources) {
            try {
                const name = source();
                if (name && name.length > 0) {
                    return name;
                }
            } catch (error) {
                console.warn('Better Canvas: Error extracting course name:', error);
            }
        }
        return null;
    }

    // Fullscreen functionality
    function checkForPresentations(context = document) {
        if (!state.settings.fullscreenMode) return;

        try {
            const presentations = safeQuerySelectorAll(
                CONFIG.selectors.presentations.join(', '), 
                context
            );

            presentations.forEach(presentation => {
                if (!safeQuerySelector(`#${CONFIG.selectors.fullscreenButton}`, presentation.parentElement)) {
                    injectFullscreenButton(presentation);
                }
            });
        } catch (error) {
            console.warn('Better Canvas: Error checking for presentations:', error);
        }
    }

    function injectFullscreenButton(presentation) {
        try {
            const button = document.createElement('button');
            button.id = CONFIG.selectors.fullscreenButton;
            button.innerHTML = '⛶';
            button.title = 'Enter Fullscreen';
            
            Object.assign(button.style, {
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: '1000',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'background 0.3s'
            });

            button.addEventListener('mouseenter', () => {
                button.style.background = 'rgba(0, 0, 0, 0.9)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.background = 'rgba(0, 0, 0, 0.7)';
            });

            button.addEventListener('click', (e) => {
                e.preventDefault();
                enterFullscreen(presentation);
            });

            const container = presentation.closest('.file-preview, .file-viewer, .document-viewer, .ic-app-main-content') 
                            || presentation.parentElement;
            
            if (container) {
                container.style.position = 'relative';
                container.appendChild(button);
            }
        } catch (error) {
            console.error('Better Canvas: Error injecting fullscreen button:', error);
        }
    }

    function enterFullscreen(presentation) {
        try {
            const body = document.body;
            body.classList.add(CONFIG.classes.fullscreen);

            const exitButton = document.createElement('button');
            exitButton.innerHTML = '✕';
            exitButton.title = 'Exit Fullscreen';
            
            Object.assign(exitButton.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: '1001',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'background 0.3s'
            });

            exitButton.addEventListener('click', exitFullscreen);
            exitButton.addEventListener('mouseenter', () => {
                exitButton.style.background = 'rgba(255, 0, 0, 0.8)';
            });
            exitButton.addEventListener('mouseleave', () => {
                exitButton.style.background = 'rgba(0, 0, 0, 0.8)';
            });

            body.appendChild(exitButton);
        } catch (error) {
            console.error('Better Canvas: Error entering fullscreen:', error);
        }
    }

    function exitFullscreen() {
        try {
            const body = document.body;
            body.classList.remove(CONFIG.classes.fullscreen);

            const exitButton = safeQuerySelector('button[title="Exit Fullscreen"]');
            if (exitButton) {
                exitButton.remove();
            }
        } catch (error) {
            console.error('Better Canvas: Error exiting fullscreen:', error);
        }
    }

    function removeFullscreenButtons() {
        try {
            const buttons = safeQuerySelectorAll(`#${CONFIG.selectors.fullscreenButton}`);
            buttons.forEach(button => button.remove());
        } catch (error) {
            console.warn('Better Canvas: Error removing fullscreen buttons:', error);
        }
    }

    // Mutation observer
    function setupMutationObserver() {
        const debouncedCallback = debounce((mutations) => {
            let shouldCheckPresentations = false;
            let shouldInsertCourseName = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (state.settings.fullscreenMode) {
                                const hasPresentations = CONFIG.selectors.presentations.some(selector => 
                                    safeQuerySelector(selector, node)
                                );
                                if (hasPresentations) {
                                    shouldCheckPresentations = true;
                                }
                            }

                            if (safeQuerySelector(CONFIG.selectors.courseMenu, node) || 
                                safeQuerySelector(CONFIG.selectors.leftSide, node)) {
                                shouldInsertCourseName = true;
                            }
                        }
                    });
                }
            });

            if (shouldCheckPresentations) {
                checkForPresentations();
            }

            if (shouldInsertCourseName) {
                insertCourseName();
            }
        }, 100);

        const observer = new MutationObserver(debouncedCallback);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Message handling
    function handleMessage(message, sender, sendResponse) {
        console.log('Better Canvas: Received message:', message);

        switch (message.action) {
            case 'toggleDarkMode':
                handleToggleDarkMode(message.enabled, sendResponse);
                return true;
            
            case 'toggleBloat':
                handleToggleBloat(message.enabled, sendResponse);
                return true;
            
            case 'toggleFullscreen':
                handleToggleFullscreen(message.enabled, sendResponse);
                return true;
            
            default:
                console.warn('Better Canvas: Unknown message action:', message.action);
                sendResponse({ success: false, error: 'Unknown action' });
                return false;
        }
    }

    async function handleToggleDarkMode(enabled, sendResponse) {
        try {
            console.log('Better Canvas: Toggling dark mode to:', enabled);
            await saveSettings({ darkMode: enabled });
            applySettings();
            sendResponse({ success: true });
        } catch (error) {
            console.error('Better Canvas: Error toggling dark mode:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async function handleToggleBloat(enabled, sendResponse) {
        try {
            console.log('Better Canvas: Toggling hide bloat to:', enabled);
            await saveSettings({ hideBloat: enabled });
            applySettings();
            if (enabled) {
                setTimeout(insertCourseName, 100); // Small delay to ensure DOM is ready
            }
            sendResponse({ success: true });
        } catch (error) {
            console.error('Better Canvas: Error toggling bloat:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async function handleToggleFullscreen(enabled, sendResponse) {
        try {
            console.log('Better Canvas: Toggling fullscreen to:', enabled);
            await saveSettings({ fullscreenMode: enabled });
            if (enabled) {
                checkForPresentations();
            } else {
                removeFullscreenButtons();
            }
            sendResponse({ success: true });
        } catch (error) {
            console.error('Better Canvas: Error toggling fullscreen:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    // Initialize
    async function init() {
        if (state.isInitialized) return;

        try {
            console.log('Better Canvas: Initializing...');

            // Load settings first
            await loadSettings();
            console.log('Better Canvas: Settings loaded:', state.settings);
            
            // Apply settings immediately
            applySettings();
            
            // Setup message listener
            chrome.runtime.onMessage.addListener(handleMessage);
            
            // Setup mutation observer
            setupMutationObserver();
            
            // Initialize features based on settings
            if (state.settings.fullscreenMode) {
                checkForPresentations();
            }
            
            // Insert course name if we're on a course page and bloat is hidden
            if (state.settings.hideBloat) {
                setTimeout(insertCourseName, 500); // Give page time to load
            }
            
            state.isInitialized = true;
            console.log('Better Canvas: Initialization complete');
        } catch (error) {
            console.error('Better Canvas: Initialization failed:', error);
        }
    }

    // Reinitialize when page changes (for SPA navigation)
    function reinitialize() {
        if (!state.isInitialized) return;
        
        console.log('Better Canvas: Reinitializing for page change...');
        
        // Reapply settings
        applySettings();
        
        // Recheck features
        if (state.settings.fullscreenMode) {
            checkForPresentations();
        }
        
        if (state.settings.hideBloat) {
            setTimeout(insertCourseName, 300);
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle page navigation (for SPA behavior)
    window.addEventListener('popstate', reinitialize);
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && state.isInitialized) {
            reinitialize();
        }
    });

    // Handle URL changes (for Canvas SPA navigation)
    let currentUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            console.log('Better Canvas: URL changed, reinitializing...');
            setTimeout(reinitialize, 100); // Small delay for page to load
        }
    });

    if (document.body) {
        urlObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

})();
