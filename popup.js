/* ========================================================================
   BETTER CANVAS - POPUP SCRIPT
   Extension popup interface and settings management
   ======================================================================== */

(function() {
    'use strict';

    /* ====================================================================
       CONFIGURATION
       ==================================================================== */
    const CONFIG = {
        selectors: {
            status: '#status',
            statusText: '#statusText',
            darkModeToggle: '#darkModeToggle',
            bloatToggle: '#bloatToggle',
            fullscreenToggle: '#fullscreenToggle'
        },
        classes: {
            status: 'status',
            statusError: 'status error',
            toggleActive: 'active'
        },
        storage: {
            defaults: {
                darkMode: false,
                hideBloat: false,
                fullscreenMode: true
            }
        },
        messages: {
            checking: 'Checking Canvas connection...',
            connected: 'Connected to Canvas ✓',
            notCanvas: 'Not on a Canvas page',
            error: 'Error checking page',
            canvasNotDetected: 'Canvas not detected'
        }
    };

    /* ====================================================================
       STATE MANAGEMENT
       ==================================================================== */
    let state = {
        elements: {},
        currentTab: null,
        isCanvasPage: false
    };

    /* ====================================================================
       UTILITY FUNCTIONS
       ==================================================================== */
    const Utils = {
        /**
         * Get element by selector with error handling
         */
        getElement(selector) {
            try {
                const element = document.querySelector(selector);
                if (!element) {
                    console.warn('Better Canvas Popup: Element not found:', selector);
                }
                return element;
            } catch (error) {
                console.error('Better Canvas Popup: Error getting element:', selector, error);
                return null;
            }
        },

        /**
         * Check if current tab is a Canvas page
         */
        isCanvasPage(url) {
            if (!url) return false;
            return url.includes('instructure.com') || 
                   url.includes('canvas.') || 
                   url.includes('.edu');
        },

        /**
         * Update status display
         */
        updateStatus(message, isError = false) {
            if (state.elements.status && state.elements.statusText) {
                state.elements.status.className = isError ? CONFIG.classes.statusError : CONFIG.classes.status;
                state.elements.statusText.textContent = message;
            }
        },

        /**
         * Show loading state
         */
        showLoading() {
            this.updateStatus(CONFIG.messages.checking, false);
        },

        /**
         * Show success state
         */
        showSuccess() {
            this.updateStatus(CONFIG.messages.connected, false);
        },

        /**
         * Show error state
         */
        showError(message = CONFIG.messages.error) {
            this.updateStatus(message, true);
        }
    };

    /* ====================================================================
       TAB MANAGEMENT
       ==================================================================== */
    const TabManager = {
        /**
         * Get current active tab
         */
        async getCurrentTab() {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                return tab;
            } catch (error) {
                console.error('Better Canvas Popup: Error getting current tab:', error);
                return null;
            }
        },

        /**
         * Send message to content script
         */
        async sendMessage(message) {
            if (!state.currentTab || !state.currentTab.id) {
                console.warn('Better Canvas Popup: No valid tab for message sending');
                return { success: false, error: 'No valid tab' };
            }

            try {
                const response = await chrome.tabs.sendMessage(state.currentTab.id, message);
                return response || { success: true };
            } catch (error) {
                console.error('Better Canvas Popup: Error sending message:', error);
                return { success: false, error: error.message };
            }
        }
    };

    /* ====================================================================
       SETTINGS MANAGEMENT
       ==================================================================== */
    const Settings = {
        /**
         * Load settings from Chrome storage
         */
        async load() {
            try {
                const settings = await chrome.storage.sync.get(CONFIG.storage.defaults);
                console.log('Better Canvas Popup: Settings loaded:', settings);
                return settings;
            } catch (error) {
                console.error('Better Canvas Popup: Error loading settings:', error);
                return CONFIG.storage.defaults;
            }
        },

        /**
         * Save setting to Chrome storage
         */
        async save(key, value) {
            try {
                await chrome.storage.sync.set({ [key]: value });
                console.log('Better Canvas Popup: Setting saved:', key, value);
                return true;
            } catch (error) {
                console.error('Better Canvas Popup: Error saving setting:', error);
                return false;
            }
        },

        /**
         * Apply settings to UI toggles
         */
        applyToUI(settings) {
            try {
                if (state.elements.darkModeToggle) {
                    state.elements.darkModeToggle.classList.toggle(CONFIG.classes.toggleActive, settings.darkMode);
                }
                if (state.elements.bloatToggle) {
                    state.elements.bloatToggle.classList.toggle(CONFIG.classes.toggleActive, settings.hideBloat);
                }
                if (state.elements.fullscreenToggle) {
                    state.elements.fullscreenToggle.classList.toggle(CONFIG.classes.toggleActive, settings.fullscreenMode);
                }
            } catch (error) {
                console.error('Better Canvas Popup: Error applying settings to UI:', error);
            }
        }
    };

    /* ====================================================================
       TOGGLE HANDLERS
       ==================================================================== */
    const ToggleHandlers = {
        /**
         * Create toggle handler
         */
        createHandler(settingKey, messageAction) {
            return async (element) => {
                try {
                    const isActive = element.classList.contains(CONFIG.classes.toggleActive);
                    const newValue = !isActive;
                    
                    // Update UI immediately for better UX
                    element.classList.toggle(CONFIG.classes.toggleActive, newValue);
                    
                    // Save setting
                    await Settings.save(settingKey, newValue);
                    
                    // Send message to content script
                    const response = await TabManager.sendMessage({
                        action: messageAction,
                        enabled: newValue
                    });
                    
                    if (!response.success) {
                        console.warn('Better Canvas Popup: Content script message failed:', response.error);
                        // Don't revert UI - extension might still work
                    }
                    
                } catch (error) {
                    console.error('Better Canvas Popup: Error in toggle handler:', error);
                    // Revert UI on error
                    element.classList.toggle(CONFIG.classes.toggleActive);
                }
            };
        },

        /**
         * Setup all toggle handlers
         */
        setup() {
            const toggles = [
                {
                    element: state.elements.darkModeToggle,
                    handler: this.createHandler('darkMode', 'toggleDarkMode')
                },
                {
                    element: state.elements.bloatToggle,
                    handler: this.createHandler('hideBloat', 'toggleBloat')
                },
                {
                    element: state.elements.fullscreenToggle,
                    handler: this.createHandler('fullscreenMode', 'toggleFullscreen')
                }
            ];

            toggles.forEach(({ element, handler }) => {
                if (element) {
                    element.addEventListener('click', () => handler(element));
                } else {
                    console.warn('Better Canvas Popup: Toggle element not found');
                }
            });
        }
    };

    /* ====================================================================
       PAGE STATUS CHECKING
       ==================================================================== */
    const StatusChecker = {
        /**
         * Check if current page is Canvas and update status
         */
        async check() {
            Utils.showLoading();
            
            try {
                state.currentTab = await TabManager.getCurrentTab();
                
                if (!state.currentTab || !state.currentTab.url) {
                    Utils.showError(CONFIG.messages.error);
                    return;
                }
                
                state.isCanvasPage = Utils.isCanvasPage(state.currentTab.url);
                
                if (state.isCanvasPage) {
                    Utils.showSuccess();
                } else {
                    Utils.showError(CONFIG.messages.notCanvas);
                }
                
            } catch (error) {
                console.error('Better Canvas Popup: Error checking page status:', error);
                Utils.showError(CONFIG.messages.error);
            }
        }
    };

    /* ====================================================================
       MESSAGE LISTENERS
       ==================================================================== */
    const MessageListener = {
        /**
         * Handle messages from content script
         */
        handle(message, sender, sendResponse) {
            try {
                console.log('Better Canvas Popup: Received message:', message);
                
                switch (message.action) {
                    case 'updateStatus':
                        if (message.connected) {
                            Utils.showSuccess();
                        } else {
                            Utils.showError(CONFIG.messages.canvasNotDetected);
                        }
                        break;
                    
                    default:
                        console.warn('Better Canvas Popup: Unknown message action:', message.action);
                        break;
                }
            } catch (error) {
                console.error('Better Canvas Popup: Error handling message:', error);
            }
        },

        /**
         * Setup message listener
         */
        setup() {
            if (chrome.runtime && chrome.runtime.onMessage) {
                chrome.runtime.onMessage.addListener(this.handle.bind(this));
            }
        }
    };

    /* ====================================================================
       INITIALIZATION
       ==================================================================== */
    const App = {
        /**
         * Get all DOM elements
         */
        getElements() {
            state.elements = {
                status: Utils.getElement(CONFIG.selectors.status),
                statusText: Utils.getElement(CONFIG.selectors.statusText),
                darkModeToggle: Utils.getElement(CONFIG.selectors.darkModeToggle),
                bloatToggle: Utils.getElement(CONFIG.selectors.bloatToggle),
                fullscreenToggle: Utils.getElement(CONFIG.selectors.fullscreenToggle)
            };

            // Validate critical elements
            const criticalElements = ['status', 'statusText'];
            const missingElements = criticalElements.filter(key => !state.elements[key]);
            
            if (missingElements.length > 0) {
                console.error('Better Canvas Popup: Critical elements missing:', missingElements);
                return false;
            }
            
            return true;
        },

        /**
         * Initialize the popup
         */
        async init() {
            try {
                console.log('Better Canvas Popup: Initializing...');
                
                // Get DOM elements
                if (!this.getElements()) {
                    console.error('Better Canvas Popup: Failed to get required elements');
                    return;
                }
                
                // Check page status
                await StatusChecker.check();
                
                // Load and apply settings
                const settings = await Settings.load();
                Settings.applyToUI(settings);
                
                // Setup toggle handlers
                ToggleHandlers.setup();
                
                // Setup message listener
                MessageListener.setup();
                
                console.log('Better Canvas Popup: Initialization complete');
                
            } catch (error) {
                console.error('Better Canvas Popup: Initialization failed:', error);
                Utils.showError(CONFIG.messages.error);
            }
        }
    };

    /* ====================================================================
       EVENT LISTENERS & STARTUP
       ==================================================================== */
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', App.init.bind(App));
    } else {
        App.init();
    }

})();