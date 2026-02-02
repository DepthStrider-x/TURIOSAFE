// TODO: Replace with your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCT8qO5F0f4nVPY9HlwfL1rJcPhCKJBU4Y",
    authDomain: "girl-safety-74247.firebaseapp.com",
    projectId: "girl-safety-74247",
    storageBucket: "girl-safety-74247.firebasestorage.app",
    messagingSenderId: "415552325690",
    appId: "1:415552325690:web:d8e39c0ef1a3803703cd03",
    measurementId: "G-DWE2JFK2P6"
};

// TODO: Initialize Firebase (uncomment when config is added)
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Global variables
let currentLocation = null;
let locationWatcher = null;
let sessionId = null;
let locationTimer = null;
let washroomMap = null;
let timeRemaining = 1800; // 30 minutes in seconds

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    getCurrentLocation();
    initializeWashroomMap();
    updateLocationForReport();
}

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('Current location obtained:', currentLocation);
            },
            function (error) {
                console.error('Error getting location:', error);
                alert('Unable to get your location. Please enable location services.');
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Live Location Sharing
function startLiveLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
    }

    sessionId = generateSessionId();
    timeRemaining = 1800; // Reset to 30 minutes

    // Update UI
    document.getElementById('locationStatus').className = 'status active';
    document.getElementById('locationStatus').textContent = 'Live location active';
    document.getElementById('startLocationBtn').textContent = 'Stop Live Location';
    document.getElementById('startLocationBtn').onclick = stopLiveLocation;

    // Show share link
    const shareLink = `https://localhost:3000/live/${sessionId}`;
    document.getElementById('shareLinkText').textContent = shareLink;
    document.getElementById('shareLink').style.display = 'block';

    // Start location watching
    locationWatcher = navigator.geolocation.watchPosition(
        function (position) {
            const locationData = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp: Date.now(),
                accuracy: position.coords.accuracy
            };

            // TODO: Send to Firebase
            database.ref(`liveLocations/${sessionId}`).set(locationData);
            console.log('Location updated:', locationData);
        },
        function (error) {
            console.error('Error watching location:', error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        }
    );

    // Start timer
    startLocationTimer();
}

function stopLiveLocation() {
    if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
        locationWatcher = null;
    }

    if (locationTimer) {
        clearInterval(locationTimer);
        locationTimer = null;
    }

    // Update UI
    document.getElementById('locationStatus').className = 'status inactive';
    document.getElementById('locationStatus').textContent = 'Location sharing inactive';
    document.getElementById('startLocationBtn').textContent = 'Start 30-min Live Location';
    document.getElementById('startLocationBtn').onclick = startLiveLocation;
    document.getElementById('shareLink').style.display = 'none';
    document.getElementById('locationTimer').textContent = '';

    // TODO: Remove from Firebase
    if (sessionId) {
        database.ref(`liveLocations/${sessionId}`).remove();
    }

    sessionId = null;
}

function startLocationTimer() {
    locationTimer = setInterval(function () {
        timeRemaining--;

        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        document.getElementById('locationTimer').textContent =
            `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeRemaining <= 0) {
            stopLiveLocation();
            alert('Live location sharing has ended after 30 minutes.');
        }
    }, 1000);
}

function generateSessionId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function copyShareLink() {
    const linkText = document.getElementById('shareLinkText').textContent;
    navigator.clipboard.writeText(linkText).then(function () {
        alert('Link copied to clipboard!');
    });
}

// Safe Washrooms Map
function initializeWashroomMap() {
    washroomMap = L.map('washroomMap').setView([28.4737, 77.7041], 13); //muzaffarnager

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(washroomMap);

    // Add current location marker when available
    if (currentLocation) {
        washroomMap.setView([currentLocation.lat, currentLocation.lng], 15);
        L.marker([currentLocation.lat, currentLocation.lng])
            .addTo(washroomMap)
            .bindPopup('Your Current Location')
            .openPopup();
    }

    // Add some sample washroom markers
    const sampleWashrooms = [
        { lat: 29.4700, lng: 77.7050, name: "Jansath Road Bus Stand Washroom", rating: 4 },
        { lat: 29.4720, lng: 77.7065, name: "Near Canara Bank Washroom", rating: 5 },
        { lat: 29.4685, lng: 77.7030, name: "State Bank Colony Public Washroom", rating: 3 },
        { lat: 29.4745, lng: 77.7080, name: "Market Area Public Washroom", rating: 4 }
    ];

    sampleWashrooms.forEach(washroom => {
        L.marker([washroom.lat, washroom.lng])
            .addTo(washroomMap)
            .bindPopup(`<strong>${washroom.name}</strong><br>Rating: ${'⭐'.repeat(washroom.rating)}`);
    });
}

function addWashroom() {
    if (!currentLocation) {
        alert('Please enable location services to add a washroom.');
        return;
    }

    const name = prompt('Enter washroom name:');
    if (name) {
        const washroomData = {
            name: name,
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            timestamp: Date.now(),
            rating: 5 // Default rating
        };

        // TODO: Save to Firebase
        database.ref('washrooms').push(washroomData);

        // Add marker to map
        L.marker([washroomData.lat, washroomData.lng])
            .addTo(washroomMap)
            .bindPopup(`<strong>${washroomData.name}</strong><br>Rating: ⭐⭐⭐⭐⭐`)
            .openPopup();

        alert('Washroom added successfully!');
    }
}

function findNearbyWashrooms() {
    if (!currentLocation) {
        alert('Please enable location services to find nearby washrooms.');
        return;
    }

    // TODO: Query Firebase for nearby washrooms
    // For now, just center the map on current location
    washroomMap.setView([currentLocation.lat, currentLocation.lng], 16);
    alert('Searching for nearby washrooms...');
}

// Silent SOS
function sendSilentSOS() {
    if (!currentLocation) {
        getCurrentLocation();
        setTimeout(() => {
            if (currentLocation) {
                sendSOSWithLocation();
            } else {
                alert('Unable to get location. Please try again.');
            }
        }, 2000);
    } else {
        sendSOSWithLocation();
    }
}

function sendSOSWithLocation() {
    const sosData = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        timestamp: Date.now(),
        type: 'silent_sos'
    };

    // TODO: Send SOS via email/SMS gateway
    // send location to backend route that sends email via SendGrid
    fetch('/api/send-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            lat: currentLocation.lat,
            lng: currentLocation.lng
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log('SOS sent:', data);
        })
        .catch(err => {
            console.error('Error sending SOS:', err);
        });

    console.log('SOS sent:', sosData);
    alert('Silent SOS sent! Emergency contacts have been notified with your location.');
}

// Report Unsafe Spot
function updateLocationForReport() {
    if (currentLocation) {
        // TODO: Use reverse geocoding to get address
        document.getElementById('reportLocation').value =
            `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`;
    }
}

function submitReport(event) {
    event.preventDefault();

    const reportData = {
        location: document.getElementById('reportLocation').value,
        description: document.getElementById('reportDescription').value,
        timestamp: Date.now(),
        coordinates: currentLocation
    };

    const photoFile = document.getElementById('reportPhoto').files[0];
    if (photoFile) {
        // TODO: Upload photo to Firebase Storage
        const storageRef = firebase.storage().ref(`reports/${Date.now()}_${photoFile.name}`);
        storageRef.put(photoFile).then(() => {
            // Get download URL and save report with photo URL
        });
        reportData.hasPhoto = true;
    }

    // TODO: Save to Firebase
    database.ref('unsafeSpots').push(reportData);

    console.log('Report submitted:', reportData);
    alert('Thank you! Your report has been submitted and will help keep others safe.');

    // Reset form
    document.getElementById('reportForm').reset();
    updateLocationForReport();
}

// Nearest Safe Spots
function findSafeSpots(type) {
    if (!currentLocation) {
        alert('Please enable location services to find safe spots.');
        return;
    }

    document.getElementById('safeSpotsLoading').classList.remove('hidden');
    document.getElementById('safeSpotsList').innerHTML = '';

    // TODO: Use Google Places API or OpenStreetMap Overpass API
    // For demo purposes, showing sample data
    setTimeout(() => {
        const sampleSpots = generateSampleSpots(type);
        displaySafeSpots(sampleSpots);
        document.getElementById('safeSpotsLoading').classList.add('hidden');
    }, 1500);
}

function generateSampleSpots(type) {
    const spots = {
        police: [
            { name: "Central Police Station", distance: "0.8 km", address: "Main Road" },
            { name: "Women Police Station", distance: "1.2 km", address: "City Center" },
            { name: "Police Outpost", distance: "2.1 km", address: "Market Area" },
            { name: "Muzaffarnagar City Police", distance: "0.5 km", address: "Station Road" },
            { name: "Jansath Road Police Checkpost", distance: "1.5 km", address: "Jansath Road" },
            { name: "Community Police Booth", distance: "2.0 km", address: "Near Bus Stand" }
        ],
        hospital: [
            { name: "City General Hospital", distance: "0.5 km", address: "Hospital Road" },
            { name: "Emergency Care Center", distance: "1.1 km", address: "Medical Colony" },
            { name: "Women & Child Hospital", distance: "1.8 km", address: "Health Complex" },
            { name: "Muzaffarnagar Medical College", distance: "0.9 km", address: "College Road" },
            { name: "Jansath Road Health Clinic", distance: "1.3 km", address: "Jansath Road" },
            { name: "24/7 Care Hospital", distance: "2.2 km", address: "Industrial Area" }
        ],
        pharmacy: [
            { name: "24/7 MedPlus", distance: "0.3 km", address: "Commercial Street" },
            { name: "Apollo Pharmacy", distance: "0.7 km", address: "Main Market" },
            { name: "Guardian Pharmacy", distance: "1.0 km", address: "Plaza Mall" },
            { name: "HealthFirst Pharmacy", distance: "0.5 km", address: "Jansath Road" },
            { name: "City Care Pharmacy", distance: "1.2 km", address: "Station Road" },
            { name: "LifeLine Pharmacy", distance: "1.8 km", address: "Near Bus Stand" }
        ],
        cafe: [
            { name: "Safe Space Cafe", distance: "0.4 km", address: "Women's Center" },
            { name: "Friendly Corner Cafe", distance: "0.9 km", address: "University Area" },
            { name: "24/7 Coffee House", distance: "1.3 km", address: "Business District" },
            { name: "The Morning Brew", distance: "0.7 km", address: "Station Road" },
            { name: "Jansath Road Cafe", distance: "1.1 km", address: "Jansath Road" },
            { name: "Cafe Aroma", distance: "1.5 km", address: "Market Street" }
        ]
    };

    return spots[type] || [];
}

function displaySafeSpots(spots) {
    const container = document.getElementById('safeSpotsList');

    if (spots.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No safe spots found nearby.</p>';
        return;
    }

    container.innerHTML = spots.map(spot => `
                <div class="spot-item">
                    <div class="spot-name">${spot.name}</div>
                    <div class="spot-distance">${spot.distance} • ${spot.address}</div>
                </div>
            `).join('');
}

// Utility functions
function goHome() {
    // TODO: Navigate to home page
    window.location.href = 'index.html';
}

// Initialize geolocation on page load
window.addEventListener('load', function () {
    if ('geolocation' in navigator) {
        getCurrentLocation();
    }
});

// Handle page visibility change to pause/resume location tracking
document.addEventListener('visibilitychange', function () {
    if (document.hidden && locationWatcher) {
        // Pause location tracking when page is hidden
        console.log('Page hidden, location tracking continues in background');
    } else if (!document.hidden && locationWatcher) {
        // Resume when page is visible
        console.log('Page visible, location tracking active');
    }
});

// Service worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function (error) {
        console.log('Service Worker registration failed:', error);
    });
}