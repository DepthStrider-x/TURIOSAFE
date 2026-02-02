// ===== CHAT FUNCTIONALITY FOR SAFETY ASSISTANT =====

class SafetyChatBot {
    constructor() {
        this.apiUrl = '/ask'; // Change this if API is hosted separately
        this.currentLocation = null;
        this.selectedLanguage = 'English';
        this.messageHistory = [];
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeGeolocation();
        this.initializeOfflineDetection();
    }

    initializeElements() {
        // DOM elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.languageSelect = document.getElementById('languageSelect');
        this.locationBtn = document.getElementById('locationBtn');
        this.sosQuickBtn = document.getElementById('sosQuickBtn');
        this.quickReplies = document.getElementById('quickReplies');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.offlineNotice = document.getElementById('offlineNotice');
        this.locationStatus = document.getElementById('locationStatus');
        this.charCount = document.getElementById('charCount');
        this.sosModal = document.getElementById('sosModal');
    }

    initializeEventListeners() {
        // Send message events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Character counter
        this.messageInput.addEventListener('input', () => {
            const length = this.messageInput.value.length;
            this.charCount.textContent = `${length}/500`;
            this.charCount.style.color = length > 450 ? '#dc3545' : '#6c757d';
        });

        // Language selection
        this.languageSelect.addEventListener('change', (e) => {
            this.selectedLanguage = e.target.value;
            this.addBotMessage(this.getLanguageChangeMessage());
        });

        // Location sharing
        this.locationBtn.addEventListener('click', () => this.requestLocation());

        // Quick reply buttons
        this.quickReplies.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-reply-btn')) {
                const message = e.target.getAttribute('data-message');
                this.sendQuickReply(message);
            }
        });

        // SOS functionality
        this.sosQuickBtn.addEventListener('click', () => this.showSosModal());
    }

    initializeGeolocation() {
        // Check if geolocation is available
        if ('geolocation' in navigator) {
            this.locationBtn.style.display = 'block';
        } else {
            this.locationBtn.style.display = 'none';
            this.updateLocationStatus('📍 Location: Not available');
        }
    }

    initializeOfflineDetection() {
        window.addEventListener('online', () => {
            this.offlineNotice.classList.add('hidden');
        });

        window.addEventListener('offline', () => {
            this.offlineNotice.classList.remove('hidden');
        });
    }

    async sendMessage(message = null) {
        const messageText = message || this.messageInput.value.trim();
        
        if (!messageText) return;

        // Clear input and disable send button
        this.messageInput.value = '';
        this.updateCharCount();
        this.setSendButtonState(false);

        // Add user message to chat
        this.addUserMessage(messageText);

        // Show loading indicator
        this.showLoading();

        try {
            // Prepare request data
            const requestData = {
                message: messageText,
                language: this.selectedLanguage,
                ...(this.currentLocation && {
                    lat: this.currentLocation.lat,
                    lon: this.currentLocation.lon
                })
            };

            // Send to API
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.reply) {
                // Add bot response
                this.addBotMessage(data.reply, data.tips || [], this.isEmergencyMessage(messageText));
            
                // Store in history
                this.messageHistory.push({
                    user: messageText,
                    bot: data.reply,
                    timestamp: new Date().toISOString(),
                    language: this.selectedLanguage,
                    location: this.currentLocation
                });
            
                // Update quick replies for emergency situations
                if (this.isEmergencyMessage(messageText)) {
                    this.updateQuickRepliesForEmergency();
                }
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error("Ask endpoint error from chatbot.js:", error);
            this.addBotMessage("⚠️ This error came from chatbot.js");
            
        } finally {
            this.hideLoading();
            this.setSendButtonState(true);
            this.scrollToBottom();
        }
    }

    sendQuickReply(message) {
        this.sendMessage(message);
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(reply, tips = [], isEmergency = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message bot-message ${isEmergency ? 'emergency-message' : ''}`;
        
        // Convert line breaks and dashes to HTML list
        const formattedReply = this.formatBotReply(reply);
        
        let tipsHtml = '';
        if (tips && tips.length > 0) {
            tipsHtml = `
                <ul>
                    ${tips.map(tip => `<li>${this.escapeHtml(tip)}</li>`).join('')}
                </ul>
            `;
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${isEmergency ? '🚨' : '🤖'}</div>
            <div class="message-content">
                <p>${formattedReply}</p>
                ${tipsHtml}
            </div>
            <div class="message-time">${this.getCurrentTime()}</div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatBotReply(reply) {
        if (!reply) return '';
        
        // Split the reply into lines
        const lines = reply.split('\n');
        let result = '';
        let inList = false;
        
        for (let line of lines) {
            line = line.trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Check if line starts with a dash (list item)
            if (line.startsWith('- ')) {
                // Start a new list if not already in one
                if (!inList) {
                    result += '<ul>';
                    inList = true;
                }
                // Add list item
                result += `<li>${this.escapeHtml(line.substring(2))}</li>`;
            } else {
                // End list if we were in one
                if (inList) {
                    result += '</ul>';
                    inList = false;
                }
                // Add normal paragraph
                result += `<p>${this.escapeHtml(line)}</p>`;
            }
        }
        
        // Close any open list
        if (inList) {
            result += '</ul>';
        }
        
        return result;
    }

    requestLocation() {
        if (!navigator.geolocation) {
            this.updateLocationStatus('📍 Location: Not supported');
            return;
        }

        this.updateLocationStatus('📍 Getting location...');
        this.locationBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                this.updateLocationStatus('📍 Location: Shared ✓');
                this.locationBtn.disabled = false;
                this.locationBtn.style.background = 'rgba(40, 167, 69, 0.8)';
                
                // Automatically send location info to bot
                this.addBotMessage(
                    `Great! I now have your location (${this.currentLocation.lat.toFixed(4)}, ${this.currentLocation.lon.toFixed(4)}). I can provide better assistance with nearby facilities.`,
                    ['Ask about nearby police stations', 'Find hospitals near me', 'Safety tips for this area']
                );
            },
            (error) => {
                let errorMessage = 'Location access denied';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location timeout';
                        break;
                }
                
                this.updateLocationStatus(`📍 ${errorMessage}`);
                this.locationBtn.disabled = false;
                console.error('Geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }

    showSosModal() {
        this.sosModal.classList.remove('hidden');
    }

    isEmergencyMessage(message) {
        const emergencyKeywords = ['help', 'sos', 'emergency', 'urgent', 'danger', 'scared', 'injured', 'lost', 'harassed'];
        return emergencyKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    updateQuickRepliesForEmergency() {
        this.quickReplies.innerHTML = `
            <button class="quick-reply-btn" data-message="nearest hospital">🏥 Find Hospital</button>
            <button class="quick-reply-btn" data-message="call police">👮 Contact Police</button>
            <button class="quick-reply-btn" data-message="safe place">🏢 Find Safe Place</button>
            <button class="quick-reply-btn" data-message="emergency contacts">📞 Emergency Numbers</button>
        `;
    }

    getLanguageChangeMessage() {
        const messages = {
            'English': 'Language changed to English. How can I help you stay safe?',
            'Hindi': 'भाषा हिंदी में बदल दी गई है। मैं आपकी सुरक्षा में कैसे मदद कर सकता हूं?',
            'Japanese': '言語が日本語に変更されました。安全のためにどのようにお手伝いできますか？'
        };
        return messages[this.selectedLanguage] || messages['English'];
    }

    updateLocationStatus(status) {
        this.locationStatus.textContent = status;
    }

    updateCharCount() {
        const length = this.messageInput.value.length;
        this.charCount.textContent = `${length}/500`;
        this.charCount.style.color = length > 450 ? '#dc3545' : '#6c757d';
    }

    setSendButtonState(enabled) {
        this.sendBtn.disabled = !enabled;
    }

    showLoading() {
        this.loadingIndicator.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingIndicator.classList.add('hidden');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===== SOS FUNCTIONALITY =====
function sendSOS() {
    const loadingDiv = document.getElementById('loadingIndicator');
    loadingDiv.classList.remove('hidden');
    
    // Get current location for SOS
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const response = await fetch('/sos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('🚨 SOS Alert Sent Successfully!\n\nEmergency services have been notified of your location.\nHelp is on the way!');
                        
                        // Add emergency message to chat
                        if (window.chatBot) {
                            window.chatBot.addBotMessage(
                                '🚨 SOS ALERT SENT! Emergency services have been notified. Stay calm and move to a safe location if possible.',
                                [
                                    'Police are being contacted',
                                    'Your location has been shared',
                                    'Call 112 for immediate help',
                                    'Stay in a well-lit public area'
                                ],
                                true
                            );
                        }
                    } else {
                        throw new Error(data.error || 'Failed to send SOS');
                    }
                } catch (error) {
                    console.error('SOS Error:', error);
                    alert('⚠️ SOS Alert Error\n\nPlease call 112 directly for immediate assistance.');
                } finally {
                    loadingDiv.classList.add('hidden');
                    closeModal();
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('⚠️ Location Error\n\nPlease enable location services and call 112 directly for immediate assistance.');
                loadingDiv.classList.add('hidden');
                closeModal();
            }
        );
    } else {
        alert('⚠️ Geolocation Not Supported\n\nPlease call 112 directly for immediate assistance.');
        loadingDiv.classList.add('hidden');
        closeModal();
    }
}

function closeModal() {
    document.getElementById('sosModal').classList.add('hidden');
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the chatbot
    window.chatBot = new SafetyChatBot();
    
    // Initialize modal close functionality
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('sosModal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Initialize escape key to close modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    console.log('🛡️ Safety Assistant Chat Bot initialized successfully!');
    console.log('💡 API URL: ' + window.chatBot.apiUrl);
    console.log('💡 PDF knowledge base integration active');
});

// ===== EXPORT FOR MODULE USAGE =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SafetyChatBot, sendSOS, closeModal };
}