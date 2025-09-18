/* ========================================================================
   BETTER CANVAS - BACKGROUND SCRIPT
   Extension service worker and background functionality
   ======================================================================== */

(function() {
    'use strict';

    /* ====================================================================
       CONFIGURATION
       ==================================================================== */
    const CONFIG = {
        storage: {
            defaults: {
                darkMode: false,
                hideBloat: false,
                fullscreenMode: true
            }
        },
        notifications: {
            install: {
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Better Canvas Installed',
                message: 'Click the extension icon to enhance your Canvas experience!'
            }
        },
        canvas: {
            urlPatterns: [
                'instructure.com',
                'canvas.',
                '.edu'
            ]
        }
    };

    /* ====================================================================
       UTILITY FUNCTIONS
       ==================================================================== */
    const Utils = {
        /**
         * Check if URL is a Canvas page
         */
        isCanvasPage(url) {
            if (!url) return false;
            return CONFIG.canvas.urlPatterns.some(pattern => url.includes(pattern));
        },

        /**
         * Log with timestamp
         */
        log(message, ...args) {
            console.log(`[${new Date().toISOString()}] Better Canvas:`, message, ...args);
        },

        /**
         * Log error with timestamp
         */
        logError(message, ...args) {
            console.error(`[${new Date().toISOString()}] Better Canvas Error:`, message, ...args);
        },

        /**
         * Safe notification creation
         */
        async createNotification(options) {
            try {
                if (chrome.notifications) {
                    await chrome.notifications.create(options);
                    this.log('Notification created successfully');
                } else {
                    this.log('Notifications API not available');
                }
            } catch (error) {
                this.logError('Failed to create notification:', error);
            }
        }
    };

    /* ====================================================================
       STORAGE MANAGEMENT
       ==================================================================== */
    const Storage = {
        /**
         * Initialize default settings
         */
        async initDefaults() {
            try {
                await chrome.storage.sync.set(CONFIG.storage.defaults);
                Utils.log('Default settings initialized:', CONFIG.storage.defaults);
            } catch (error) {
                Utils.logError('Failed to initialize default settings:', error);
            }
        },

        /**
         * Get settings from storage
         */
        async get(keys = CONFIG.storage.defaults) {
            try {
                const result = await chrome.storage.sync.get(keys);
                Utils.log('Settings retrieved:', result);
                return result;
            } catch (error) {
                Utils.logError('Failed to get settings:', error);
                return CONFIG.storage.defaults;
            }
        },

        /**
         * Set settings in storage
         */
        async set(settings) {
            try {
                await chrome.storage.sync.set(settings);
                Utils.log('Settings saved:', settings);
                return true;
            } catch (error) {
                Utils.logError('Failed to save settings:', error);
                return false;
            }
        }
    };

    /* ====================================================================
       INSTALLATION HANDLER
       ==================================================================== */
    const InstallationHandler = {
        /**
         * Handle extension installation
         */
        async handleInstall(details) {
            Utils.log('Extension installed/updated, reason:', details.reason);
            
            try {
                // Initialize default settings
                await Storage.initDefaults();
                
                // Show welcome notification for new installations
                if (details.reason === 'install') {
                    await Utils.createNotification(CONFIG.notifications.install);
                }
                
            } catch (error) {
                Utils.logError('Installation handler failed:', error);
            }
        }
    };

    /* ====================================================================
       TAB MANAGEMENT
       ==================================================================== */
    const TabManager = {
        /**
         * Handle tab updates
         */
        handleUpdate(tabId, changeInfo, tab) {
            // Only process completed page loads
            if (changeInfo.status !== 'complete' || !tab.url) {
                return;
            }

            const isCanvasPage = Utils.isCanvasPage(tab.url);
            
            if (isCanvasPage) {
                Utils.log('Canvas page detected:', tab.url);
                // Could inject content script here if needed
            }
        }
    };

    /* ====================================================================
       MESSAGE HANDLING
       ==================================================================== */
    const MessageHandler = {
        /**
         * Handle messages from content scripts and popup
         */
        async handle(message, sender, sendResponse) {
            try {
                Utils.log('Received message:', message.action, 'from:', sender.tab?.url || 'popup');

                switch (message.action) {
                    case 'getSettings':
                        return await this.handleGetSettings(sendResponse);
                    
                    case 'updateSettings':
                        return await this.handleUpdateSettings(message.settings, sendResponse);
                    
                    case 'logError':
                        return this.handleLogError(message.error, sendResponse);
                    
                    case 'ping':
                        return this.handlePing(sendResponse);
                    
                    default:
                        Utils.log('Unknown message action:', message.action);
                        sendResponse({ success: false, error: 'Unknown action' });
                        return true;
                }
            } catch (error) {
                Utils.logError('Message handler failed:', error);
                sendResponse({ success: false, error: error.message });
                return true;
            }
        },

        /**
         * Handle get settings request
         */
        async handleGetSettings(sendResponse) {
            const settings = await Storage.get();
            sendResponse({ success: true, settings });
            return true;
        },

        /**
         * Handle update settings request
         */
        async handleUpdateSettings(settings, sendResponse) {
            const success = await Storage.set(settings);
            sendResponse({ success });
            return true;
        },

        /**
         * Handle error logging request
         */
        handleLogError(error, sendResponse) {
            Utils.logError('From content script:', error);
            sendResponse({ success: true });
            return true;
        },

        /**
         * Handle ping request
         */
        handlePing(sendResponse) {
            sendResponse({ success: true, timestamp: Date.now() });
            return true;
        }
    };

    /* ====================================================================
       ACTION HANDLER
       ==================================================================== */
    const ActionHandler = {
        /**
         * Handle extension icon click
         */
        handle(tab) {
            Utils.log('Extension icon clicked on:', tab.url);
            // Popup will open automatically due to manifest configuration
        }
    };

    /* ====================================================================
       LIFECYCLE HANDLERS
       ==================================================================== */
    const LifecycleHandler = {
        /**
         * Handle extension startup
         */
        handleStartup() {
            Utils.log('Extension started');
        },

        /**
         * Handle extension suspend
         */
        handleSuspend() {
            Utils.log('Extension suspended');
        },

        /**
         * Handle extension suspend canceled
         */
        handleSuspendCanceled() {
            Utils.log('Extension suspend canceled');
        }
    };

    /* ====================================================================
       EVENT LISTENERS SETUP
       ==================================================================== */
    const EventListeners = {
        /**
         * Setup all event listeners
         */
        setup() {
            try {
                // Installation events
                if (chrome.runtime.onInstalled) {
                    chrome.runtime.onInstalled.addListener(InstallationHandler.handleInstall.bind(InstallationHandler));
                }

                // Tab events
                if (chrome.tabs && chrome.tabs.onUpdated) {
                    chrome.tabs.onUpdated.addListener(TabManager.handleUpdate.bind(TabManager));
                }

                // Message events
                if (chrome.runtime.onMessage) {
                    chrome.runtime.onMessage.addListener(MessageHandler.handle.bind(MessageHandler));
                }

                // Action events
                if (chrome.action && chrome.action.onClicked) {
                    chrome.action.onClicked.addListener(ActionHandler.handle.bind(ActionHandler));
                }

                // Lifecycle events
                if (chrome.runtime.onStartup) {
                    chrome.runtime.onStartup.addListener(LifecycleHandler.handleStartup.bind(LifecycleHandler));
                }

                if (chrome.runtime.onSuspend) {
                    chrome.runtime.onSuspend.addListener(LifecycleHandler.handleSuspend.bind(LifecycleHandler));
                }

                if (chrome.runtime.onSuspendCanceled) {
                    chrome.runtime.onSuspendCanceled.addListener(LifecycleHandler.handleSuspendCanceled.bind(LifecycleHandler));
                }

                Utils.log('Event listeners setup complete');

            } catch (error) {
                Utils.logError('Failed to setup event listeners:', error);
            }
        }
    };

    /* ====================================================================
       INITIALIZATION
       ==================================================================== */
    const App = {
        /**
         * Initialize the background script
         */
        init() {
            try {
                Utils.log('Background script initializing...');
                
                // Setup event listeners
                EventListeners.setup();
                
                Utils.log('Background script initialization complete');
                
            } catch (error) {
                Utils.logError('Background script initialization failed:', error);
            }
        }
    };

    /* ====================================================================
       STARTUP
       ==================================================================== */
    
    // Initialize immediately
    App.init();

})();