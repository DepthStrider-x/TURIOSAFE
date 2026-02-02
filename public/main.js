// --- Elements ---
const sosBtn = document.getElementById("sosBtn");
const sosModal = document.getElementById("sosModal");
const dynamicContent = document.getElementById("dynamic-content");
const travelNavBtns = document.querySelectorAll('.travel-nav-btn');

// Travel booking state
let currentSection = 'flights';

// --- Travel Navigation Logic ---
function initializeTravelBooking() {
  // Add event listeners to navigation buttons
  travelNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      switchTravelSection(section);
      
      // Update active button
      travelNavBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Load default section (flights)
  switchTravelSection('flights');
}

function switchTravelSection(section) {
  currentSection = section;
  
  // Add loading animation
  showLoading();
  
  // Simulate loading delay for smooth transition
  setTimeout(() => {
    renderSectionContent(section);
  }, 300);
}

function showLoading() {
  dynamicContent.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  `;
}

function renderSectionContent(section) {
  switch(section) {
    case 'flights':
      renderFlightsForm();
      break;
    case 'trains':
      renderTrainsForm();
      break;
    case 'buses':
      renderBusesForm();
      break;
    case 'cabs':
      renderCabsForm();
      break;
    case 'accommodations':
      renderAccommodationsForm();
      break;
    case 'travel-partners':
      renderTravelPartnersContent();
      break;
    case 'green-travel':
      renderGreenTravelContent();
      break;
    default:
      renderFlightsForm();
  }
}

// Form rendering functions
function renderFlightsForm() {
  dynamicContent.innerHTML = `
    <div class="booking-form has-autocomplete">
      <h2>✈️ Book Flights</h2>
      <form id="flights-form">
        <div class="form-row">
          <div class="form-group has-autocomplete">
            <label for="flight-from">From Airport</label>
            <input type="text" id="flight-from" placeholder="Search departure city or airport" required>
          </div>
          <div class="form-group has-autocomplete">
            <label for="flight-to">To Airport</label>
            <input type="text" id="flight-to" placeholder="Search destination city or airport" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="flight-departure">Departure Date</label>
            <input type="date" id="flight-departure" required>
          </div>
          <div class="form-group">
            <label for="flight-return">Return Date</label>
            <input type="date" id="flight-return">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="flight-travelers">Travelers</label>
            <select id="flight-travelers">
              <option value="1">1 Passenger</option>
              <option value="2">2 Passengers</option>
              <option value="3">3 Passengers</option>
              <option value="4">4 Passengers</option>
              <option value="5">5+ Passengers</option>
            </select>
          </div>
          <div class="form-group">
            <label for="flight-fare-type">Fare Type</label>
            <select id="flight-fare-type">
              <option value="regular">Regular</option>
              <option value="armed-forces">Armed Forces</option>
              <option value="student">Student</option>
              <option value="senior-citizen">Senior Citizen</option>
            </select>
          </div>
        </div>
        <button type="submit" class="search-btn">🔍 Search Flights</button>
      </form>
    </div>
  `;
  
  // Add form submit handler
  document.getElementById('flights-form').addEventListener('submit', handleFlightsSearch);
  
  // Initialize autocomplete for airports
  setTimeout(() => {
    if (window.travelAutocomplete) {
      window.travelAutocomplete.attachAirports('#flight-from');
      window.travelAutocomplete.attachAirports('#flight-to');
      console.log('✅ Autocomplete attached to flight form');
    }
  }, 100);
}

function renderTrainsForm() {
  dynamicContent.innerHTML = `
    <div class="booking-form has-autocomplete">
      <h2>🚆 Book Trains</h2>
      <form id="trains-form">
        <div class="form-row">
          <div class="form-group has-autocomplete">
            <label for="train-from">From Station</label>
            <input type="text" id="train-from" placeholder="Search departure station" required>
          </div>
          <div class="form-group has-autocomplete">
            <label for="train-to">To Station</label>
            <input type="text" id="train-to" placeholder="Search destination station" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="train-date">Journey Date</label>
            <input type="date" id="train-date" required>
          </div>
          <div class="form-group">
            <label for="train-class">Class</label>
            <select id="train-class">
              <option value="SL">Sleeper (SL)</option>
              <option value="3A">AC 3 Tier (3A)</option>
              <option value="2A">AC 2 Tier (2A)</option>
              <option value="1A">AC First Class (1A)</option>
              <option value="CC">Chair Car (CC)</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="train-travelers">Travelers</label>
            <select id="train-travelers">
              <option value="1">1 Passenger</option>
              <option value="2">2 Passengers</option>
              <option value="3">3 Passengers</option>
              <option value="4">4 Passengers</option>
            </select>
          </div>
        </div>
        <button type="submit" class="search-btn">🔍 Search Trains</button>
      </form>
    </div>
  `;
  
  document.getElementById('trains-form').addEventListener('submit', handleTrainsSearch);
  
  // Initialize autocomplete for railway stations
  setTimeout(() => {
    if (window.travelAutocomplete) {
      window.travelAutocomplete.attachRailwayStations('#train-from');
      window.travelAutocomplete.attachRailwayStations('#train-to');
      console.log('✅ Autocomplete attached to trains form');
    }
  }, 100);
}

function renderBusesForm() {
  dynamicContent.innerHTML = `
    <div class="booking-form has-autocomplete">
      <h2>🚌 Book Buses</h2>
      <form id="buses-form">
        <div class="form-row">
          <div class="form-group has-autocomplete">
            <label for="bus-from">From City</label>
            <input type="text" id="bus-from" placeholder="Search departure city" required>
          </div>
          <div class="form-group has-autocomplete">
            <label for="bus-to">To City</label>
            <input type="text" id="bus-to" placeholder="Search destination city" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="bus-date">Travel Date</label>
            <input type="date" id="bus-date" required>
          </div>
          <div class="form-group">
            <label for="bus-type">Bus Type</label>
            <select id="bus-type">
              <option value="ac">AC</option>
              <option value="non-ac">Non-AC</option>
              <option value="sleeper">Sleeper</option>
              <option value="semi-sleeper">Semi-Sleeper</option>
            </select>
          </div>
        </div>
        <button type="submit" class="search-btn">🔍 Search Buses</button>
      </form>
    </div>
  `;
  
  document.getElementById('buses-form').addEventListener('submit', handleBusesSearch);
  
  // Initialize autocomplete for bus stops
  setTimeout(() => {
    if (window.travelAutocomplete) {
      window.travelAutocomplete.attachBusStops('#bus-from');
      window.travelAutocomplete.attachBusStops('#bus-to');
      console.log('✅ Autocomplete attached to buses form');
    }
  }, 100);
}

function renderCabsForm() {
  dynamicContent.innerHTML = `
    <div class="booking-form has-autocomplete">
      <h2>🚗 Book Cabs</h2>
      <form id="cabs-form">
        <div class="form-row">
          <div class="form-group has-autocomplete">
            <label for="cab-pickup">Pickup Location</label>
            <input type="text" id="cab-pickup" placeholder="Search pickup location" required>
          </div>
          <div class="form-group has-autocomplete">
            <label for="cab-drop">Drop Location</label>
            <input type="text" id="cab-drop" placeholder="Search drop location" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cab-datetime">Date & Time</label>
            <input type="datetime-local" id="cab-datetime" required>
          </div>
          <div class="form-group">
            <label for="cab-type">Vehicle Type</label>
            <select id="cab-type">
              <option value="mini">Mini</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>
        <button type="submit" class="search-btn">🔍 Book Cab</button>
      </form>
    </div>
  `;
  
  document.getElementById('cabs-form').addEventListener('submit', handleCabsSearch);
  
  // Initialize autocomplete for locations (using bus stops for city locations)
  setTimeout(() => {
    if (window.travelAutocomplete) {
      window.travelAutocomplete.attachBusStops('#cab-pickup');
      window.travelAutocomplete.attachBusStops('#cab-drop');
      console.log('✅ Autocomplete attached to cabs form');
    }
  }, 100);
}

function renderAccommodationsForm() {
  dynamicContent.innerHTML = `
    <div class="booking-form has-autocomplete">
      <h2>🏨 Book Hotels</h2>
      <form id="accommodations-form">
        <div class="form-row">
          <div class="form-group has-autocomplete">
            <label for="hotel-location">Location</label>
            <input type="text" id="hotel-location" placeholder="Search city or hotel location" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="hotel-checkin">Check-in Date</label>
            <input type="date" id="hotel-checkin" required>
          </div>
          <div class="form-group">
            <label for="hotel-checkout">Check-out Date</label>
            <input type="date" id="hotel-checkout" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="hotel-guests">Guests</label>
            <select id="hotel-guests">
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5+ Guests</option>
            </select>
          </div>
        </div>
        <button type="submit" class="search-btn">🔍 Search Hotels</button>
      </form>
    </div>
  `;
  
  document.getElementById('accommodations-form').addEventListener('submit', handleAccommodationsSearch);
  
  // Initialize autocomplete for hotels
  setTimeout(() => {
    if (window.travelAutocomplete) {
      window.travelAutocomplete.attachHotels('#hotel-location');
      console.log('✅ Autocomplete attached to hotels form');
    }
  }, 100);
}

function renderGreenTravelContent() {
  dynamicContent.innerHTML = `
    <div class="booking-form">
      <h2>🌱 Green Travel Hub</h2>
      
      <!-- Carbon Footprint Calculator -->
      <div class="carbon-calculator">
        <h3>🌍 Carbon Footprint Calculator</h3>
        <form id="carbon-form">
          <div class="form-row">
            <div class="form-group">
              <label for="transport-mode">Mode of Transport</label>
              <select id="transport-mode" required>
                <option value="">Select transport mode</option>
                <option value="walking">Walking 🚶</option>
                <option value="cycling">Cycling 🚴</option>
                <option value="electric_car">Electric Car 🚗⚡</option>
                <option value="bus">Bus 🚌</option>
                <option value="train">Train 🚆</option>
                <option value="car">Car (Petrol/Diesel) 🚙</option>
                <option value="domestic_flight">Domestic Flight ✈️</option>
                <option value="long_haul_flight">International Flight 🌍</option>
              </select>
            </div>
            <div class="form-group">
              <label for="distance">Distance (km)</label>
              <input type="number" id="distance" placeholder="Enter distance" min="1" required>
            </div>
          </div>
          <button type="submit" class="search-btn">📈 Calculate Carbon Footprint</button>
        </form>
        
        <div id="carbon-result" style="display: none;" class="carbon-result">
          <!-- Results will be displayed here -->
        </div>
      </div>
      
      <!-- Eco-friendly Tips -->
      <div style="margin-top: 40px;">
        <h3>🌿 Eco-Friendly Travel Tips</h3>
        <div id="eco-tips-container">
          <div class="loading-spinner"></div>
          <p>Loading eco tips...</p>
        </div>
      </div>
      
      <!-- Eco-friendly Destinations -->
      <div style="margin-top: 40px;">
        <h3>🏠 Eco-Friendly Destinations in India</h3>
        <div class="eco-destinations" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
          <div class="eco-destination-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 4px solid #28a745;">
            <h4>🌲 Kerala Backwaters</h4>
            <p>Sustainable houseboat tourism with solar-powered boats and organic local cuisine.</p>
          </div>
          <div class="eco-destination-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 4px solid #28a745;">
            <h4>🏔️ Sikkim</h4>
            <p>India's first organic state with eco-friendly homestays and zero-waste initiatives.</p>
          </div>
          <div class="eco-destination-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 4px solid #28a745;">
            <h4>🌊 Andaman Islands</h4>
            <p>Eco-resorts with coral conservation programs and sustainable island tourism.</p>
          </div>
          <div class="eco-destination-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 4px solid #28a745;">
            <h4>🏷️ Spiti Valley</h4>
            <p>Responsible tourism with local community stays and minimal environmental impact.</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add event handlers
  document.getElementById('carbon-form').addEventListener('submit', handleCarbonCalculation);
  loadEcoTips();
}

async function handleCarbonCalculation(e) {
  e.preventDefault();
  
  const mode = document.getElementById('transport-mode').value;
  const distance = parseFloat(document.getElementById('distance').value);
  
  if (!mode || !distance) {
    showError('Please fill in all fields');
    return;
  }
  
  try {
    const response = await fetch('/api/green-travel/calculate-carbon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: mode,
        distance_km: distance,
        details: { timestamp: new Date().toISOString() }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayCarbonResult(data);
    } else {
      showError('Failed to calculate carbon footprint');
    }
  } catch (error) {
    showError('Error calculating carbon footprint');
  }
}

function displayCarbonResult(data) {
  const resultDiv = document.getElementById('carbon-result');
  
  // Get transport mode display name
  const modeNames = {
    'walking': 'Walking 🚶',
    'cycling': 'Cycling 🚴',
    'electric_car': 'Electric Car 🚗⚡',
    'bus': 'Bus 🚌',
    'train': 'Train 🚆',
    'car': 'Car (Petrol/Diesel) 🚙',
    'domestic_flight': 'Domestic Flight ✈️',
    'long_haul_flight': 'International Flight 🌍'
  };
  
  // Enhanced tree calculations
  const treesEquivalent = Math.max(1, Math.round(data.co2_emissions_kg / 22)); // 1 tree absorbs ~22kg CO2/year
  const treesToPlant = Math.ceil(data.co2_emissions_kg / 22); // Trees needed to offset this journey
  const yearlyTrees = Math.round(treesEquivalent * 12); // Trees needed for annual travel at this rate
  
  // Calculate environmental metrics
  const fuelSaved = getFuelSavings(data.mode, data.distance_km);
  const comparison = getTransportComparison(data.mode, data.co2_emissions_g, data.distance_km);
  const carbonCategory = getCarbonCategory(data.co2_emissions_kg);
  const offsetCost = calculateOffsetCost(data.co2_emissions_kg);
  
  resultDiv.innerHTML = `
    <h4>📈 Carbon Footprint Results</h4>
    
    <!-- Main Metrics -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin: 20px 0;">
      <div style="background: ${getCarbonColor(data.co2_emissions_kg)}; padding: 15px; border-radius: 8px; text-align: center; color: white;">
        <div style="font-size: 2rem; font-weight: bold;">${data.co2_emissions_kg} kg</div>
        <div>CO₂ Emissions</div>
        <div style="font-size: 0.8em; opacity: 0.9;">${carbonCategory}</div>
      </div>
      <div style="background: rgba(40, 167, 69, 0.8); padding: 15px; border-radius: 8px; text-align: center; color: white;">
        <div style="font-size: 2rem; font-weight: bold;">${treesToPlant}</div>
        <div>Trees to Plant</div>
        <div style="font-size: 0.8em; opacity: 0.9;">To offset this trip</div>
      </div>
      <div style="background: rgba(23, 162, 184, 0.8); padding: 15px; border-radius: 8px; text-align: center; color: white;">
        <div style="font-size: 2rem; font-weight: bold;">${data.distance_km} km</div>
        <div>Distance</div>
        <div style="font-size: 0.8em; opacity: 0.9;">${modeNames[data.mode]}</div>
      </div>
      <div style="background: rgba(255, 193, 7, 0.8); padding: 15px; border-radius: 8px; text-align: center; color: white;">
        <div style="font-size: 1.5rem; font-weight: bold;">₹${offsetCost}</div>
        <div>Offset Cost</div>
        <div style="font-size: 0.8em; opacity: 0.9;">Carbon credits</div>
      </div>
    </div>
    
    <!-- Environmental Impact Section -->
    <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 25px; border-radius: 12px; margin: 20px 0; color: white;">
      <h5 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
        <span>🌳</span> Environmental Impact & Tree Planting Guide
      </h5>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
        <div>
          <h6>🌱 Immediate Action</h6>
          <p style="margin: 5px 0;">• Plant <strong>${treesToPlant} tree(s)</strong> to offset this journey</p>
          <p style="margin: 5px 0;">• Each tree will absorb 22kg CO₂ annually</p>
          <p style="margin: 5px 0;">• Trees reach maturity in 15-20 years</p>
        </div>
        <div>
          <h6>📅 Annual Impact</h6>
          <p style="margin: 5px 0;">• If you travel like this monthly: <strong>${yearlyTrees} trees/year</strong></p>
          <p style="margin: 5px 0;">• Create a small forest of ${Math.round(yearlyTrees * 5)} trees in 5 years</p>
          <p style="margin: 5px 0;">• Support 1 acre of forest restoration</p>
        </div>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 8px;">
        <h6>🌍 Additional Environmental Facts</h6>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
          <div>• Equivalent to ${Math.round(data.co2_emissions_kg * 2.2)} plastic bags</div>
          <div>• Same as ${Math.round(data.co2_emissions_kg / 0.4)} km driven in average car</div>
          <div>• Energy to power a home for ${Math.round(data.co2_emissions_kg * 0.12)} hours</div>
          <div>• ${fuelSaved} fuel consumption impact</div>
        </div>
      </div>
    </div>
    
    <!-- Smart Recommendations -->
    <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 10px; margin: 20px 0; color: #333;">
      <h5 style="color: #28a745;">🧠 Smart Travel Recommendations</h5>
      <p style="margin: 10px 0; font-weight: 500;">${comparison}</p>
      <div style="margin-top: 15px;">
        <h6>💡 How to Reduce Your Impact:</h6>
        <ul style="text-align: left; margin: 10px 0;">
          ${getEnhancedReductionTips(data.mode, data.distance_km)}
        </ul>
      </div>
      
      ${getTreePlantingTips()}
      
      <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #28a745;">
        <h6 style="color: #155724;">🌱 Tree Planting Resources in India</h6>
        <p style="margin: 5px 0; color: #155724;">• <strong>Grow Billion Trees Foundation:</strong> Plant trees online with geo-tagging</p>
        <p style="margin: 5px 0; color: #155724;">• <strong>Isha Foundation Cauvery Calling:</strong> River revitalization through tree planting</p>
        <p style="margin: 5px 0; color: #155724;">• <strong>Local NGOs:</strong> Contact municipal corporations for community planting drives</p>
        <p style="margin: 5px 0; color: #155724;">• <strong>Carbon Offset Programs:</strong> Invest ₹${offsetCost} in verified carbon credits</p>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div style="display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
      <button onclick="shareResults('${data.mode}', ${data.distance_km}, ${data.co2_emissions_kg}, ${treesToPlant})" 
              style="background: #28a745; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; flex: 1; min-width: 150px;">📤 Share Results</button>
      <button onclick="saveToProfile(${JSON.stringify(data).replace(/"/g, '&quot;')})" 
              style="background: #007bff; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; flex: 1; min-width: 150px;">💾 Save to Profile</button>
      <button onclick="findTreePlanting()" 
              style="background: #17a2b8; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; flex: 1; min-width: 150px;">🌳 Find Tree Planting</button>
    </div>
  `;
  
  resultDiv.style.display = 'block';
  
  // Add some animation
  resultDiv.style.opacity = '0';
  resultDiv.style.transform = 'translateY(20px)';
  setTimeout(() => {
    resultDiv.style.transition = 'all 0.5s ease';
    resultDiv.style.opacity = '1';
    resultDiv.style.transform = 'translateY(0)';
  }, 100);
}

function getTransportComparison(mode, emissions, distance) {
  const alternatives = {
    'car': `Taking the train would reduce emissions by ~80% (${Math.round(distance * 35)}g vs ${Math.round(emissions)}g)`,
    'domestic_flight': `Taking the train would reduce emissions by ~86% (${Math.round(distance * 35)}g vs ${Math.round(emissions)}g)`,
    'long_haul_flight': `This flight produces ${Math.round(emissions / 1000)}x more CO₂ than the same distance by train`,
    'bus': 'Bus travel is already a relatively low-carbon option!',
    'train': 'Train travel is one of the most eco-friendly transport options!',
    'cycling': 'Cycling is carbon-neutral and great for your health!',
    'walking': 'Walking produces zero emissions and is the most sustainable option!',
    'electric_car': 'Electric cars produce ~70% less emissions than petrol cars'
  };
  
  return alternatives[mode] || 'Consider more eco-friendly alternatives for your next journey.';
}

function getReductionTips(mode) {
  const tips = {
    'car': '<li>Choose electric or hybrid vehicles</li><li>Carpool with others</li><li>Use public transport when available</li>',
    'domestic_flight': '<li>Choose direct flights</li><li>Consider train travel for shorter distances</li><li>Pack light to reduce fuel consumption</li>',
    'long_haul_flight': '<li>Offset your emissions through verified programs</li><li>Choose airlines with newer, more efficient aircraft</li><li>Pack light</li>',
    'bus': '<li>Choose electric or hybrid buses when available</li><li>Combine multiple trips</li>',
    'train': '<li>Train travel is already eco-friendly!</li><li>Choose operators using renewable energy</li>',
    'cycling': '<li>Keep your bike well-maintained for efficiency</li><li>Choose bike-friendly routes</li>',
    'walking': '<li>Walking is perfect! Keep it up!</li><li>Encourage others to walk short distances</li>',
    'electric_car': '<li>Charge using renewable energy sources</li><li>Share rides when possible</li>'
  };
  
  return tips[mode] || '<li>Research eco-friendly alternatives</li><li>Consider carbon offset programs</li>';
}

// Enhanced reduction tips with distance-based recommendations
function getEnhancedReductionTips(mode, distance) {
  const baseTips = getReductionTips(mode);
  const distanceSpecificTips = {
    'car': distance > 500 ? '<li>Consider flying or train for long distances (more efficient per km)</li>' : '<li>Perfect distance for carpooling or bus travel</li>',
    'domestic_flight': distance < 300 ? '<li>Train would be more eco-friendly for this short distance</li>' : '<li>Flying is reasonable for this distance, but consider offsetting</li>',
    'long_haul_flight': '<li>This long distance makes flying unavoidable - definitely offset emissions</li>',
    'bus': '<li>Bus travel is eco-friendly for this distance range</li>',
    'train': '<li>Excellent choice! Trains are most efficient for medium to long distances</li>',
    'cycling': distance > 50 ? '<li>Consider train + cycling combination for longer distances</li>' : '<li>Perfect cycling distance for fitness and environment</li>',
    'walking': distance > 20 ? '<li>Consider combining with public transport for longer distances</li>' : '<li>Ideal walking distance</li>',
    'electric_car': '<li>Great choice! Range is perfect for electric vehicles</li>'
  };
  
  return baseTips + (distanceSpecificTips[mode] || '');
}

// Helper functions for enhanced calculations
function getCarbonCategory(emissions_kg) {
  if (emissions_kg === 0) return 'Zero Impact';
  if (emissions_kg < 5) return 'Low Impact';
  if (emissions_kg < 15) return 'Moderate Impact';
  if (emissions_kg < 50) return 'High Impact';
  return 'Very High Impact';
}

function getCarbonColor(emissions_kg) {
  if (emissions_kg === 0) return 'rgba(40, 167, 69, 0.8)';
  if (emissions_kg < 5) return 'rgba(40, 167, 69, 0.8)';
  if (emissions_kg < 15) return 'rgba(255, 193, 7, 0.8)';
  if (emissions_kg < 50) return 'rgba(255, 152, 0, 0.8)';
  return 'rgba(220, 53, 69, 0.8)';
}

function getFuelSavings(mode, distance) {
  const fuelSavings = {
    'walking': `Saved ${Math.round(distance * 0.08)} liters of fuel vs driving`,
    'cycling': `Saved ${Math.round(distance * 0.08)} liters of fuel vs driving`,
    'electric_car': `Saved ${Math.round(distance * 0.05)} liters vs petrol car`,
    'bus': `Shared ${Math.round(distance * 0.02)} liters per person vs individual car`,
    'train': `Used ${Math.round(distance * 0.01)} liters equivalent per person`,
    'car': `Used approximately ${Math.round(distance * 0.08)} liters of fuel`,
    'domestic_flight': `Used ${Math.round(distance * 0.15)} liters of jet fuel`,
    'long_haul_flight': `Used ${Math.round(distance * 0.12)} liters of jet fuel`
  };
  
  return fuelSavings[mode] || 'Fuel impact varies by vehicle';
}

function calculateOffsetCost(emissions_kg) {
  // Average carbon credit cost in India: ₹300-500 per ton CO2
  const costPerKg = 0.4; // ₹0.40 per kg CO2
  return Math.round(emissions_kg * costPerKg);
}

function getTreePlantingTips() {
  return `
    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;">
      <h6 style="color: #155724;">🌳 Tree Planting Tips & Facts</h6>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 10px;">
        <div>
          <strong>Best Trees for India:</strong>
          <ul style="margin: 5px 0; color: #155724;">
            <li>Neem - Fast growing, medicinal</li>
            <li>Banyan - High CO₂ absorption</li>
            <li>Peepal - Sacred, oxygen producer</li>
            <li>Mango - Fruit + carbon absorption</li>
          </ul>
        </div>
        <div>
          <strong>Planting Seasons:</strong>
          <ul style="margin: 5px 0; color: #155724;">
            <li>Monsoon (June-Sep) - Best time</li>
            <li>Post-monsoon (Oct-Nov) - Good</li>
            <li>Winter (Dec-Feb) - Moderate</li>
            <li>Avoid summer planting</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

// Action button functions
function shareResults(mode, distance, emissions, trees) {
  const text = `🌱 My travel carbon footprint: ${emissions}kg CO₂ for ${distance}km by ${mode}. I need to plant ${trees} trees to offset this! 🌳 #CarbonFootprint #GreenTravel #TourioSafe`;
  
  if (navigator.share) {
    navigator.share({
      title: 'My Carbon Footprint',
      text: text,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert('Results copied to clipboard!');
    });
  }
}

function saveToProfile(data) {
  // Save to localStorage for now, can be enhanced to save to user profile
  const savedCalculations = JSON.parse(localStorage.getItem('carbonCalculations') || '[]');
  savedCalculations.push({
    ...data,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('carbonCalculations', JSON.stringify(savedCalculations));
  alert('Results saved to your profile!');
}

function findTreePlanting() {
  const tips = `
🌳 Tree Planting Organizations in India:

1. Grow Billion Trees Foundation
   Website: growbilliontrees.com
   Features: Online tree planting with GPS tracking

2. Isha Foundation - Cauvery Calling
   Website: cauverycalling.org
   Focus: River revitalization through tree planting

3. Green India Challenge
   Website: greenindiachallenge.in
   Initiative: Telangana government tree planting

4. Local Municipal Corporations
   Contact your city's municipal office for community drives

5. NGOs like Chipko Movement, Bhumi, etc.
   Search for local environmental NGOs in your area
  `;
  
  alert(tips);
}

async function loadEcoTips() {
  try {
    const response = await fetch('/api/green-travel/eco-tips');
    const data = await response.json();
    
    if (data.success) {
      displayEcoTips(data.tips);
    } else {
      displayEcoTips(getDefaultEcoTips());
    }
  } catch (error) {
    displayEcoTips(getDefaultEcoTips());
  }
}

function displayEcoTips(tips) {
  const container = document.getElementById('eco-tips-container');
  
  const tipsHtml = tips.map((tip, index) => `
    <div class="eco-tip" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 4px solid #28a745;">
      <h4>💡 Tip ${index + 1}</h4>
      <p>${tip}</p>
    </div>
  `).join('');
  
  container.innerHTML = `
    <div class="eco-tips" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
      ${tipsHtml}
    </div>
  `;
}

function getDefaultEcoTips() {
  return [
    "Prefer trains over flights for medium-distance travel.",
    "Choose direct flights to reduce takeoff/landing emissions.",
    "Pack light to reduce fuel consumption.",
    "Use public transportation or walk when arriving at your destination.",
    "Stay in eco-certified hotels that use renewable energy.",
    "Support local businesses and eat locally-sourced food.",
    "Avoid single-use plastics; carry a reusable water bottle.",
    "Travel off-season to reduce strain on popular destinations."
  ];
}

function renderTravelPartnersContent() {
  dynamicContent.innerHTML = `
    <div class="booking-form">
      <h2>🤝 Travel Partners</h2>
      <div class="partners-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px;">
        <div class="partner-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
          <h3>MakeMyTrip</h3>
          <p>Flights, Hotels, Packages</p>
          <a href="https://www.makemytrip.com" target="_blank" class="search-btn" style="display: inline-block; margin-top: 15px; padding: 10px 20px; font-size: 0.9rem;">Visit →</a>
        </div>
        <div class="partner-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
          <h3>IRCTC</h3>
          <p>Indian Railway Booking</p>
          <a href="https://www.irctc.co.in" target="_blank" class="search-btn" style="display: inline-block; margin-top: 15px; padding: 10px 20px; font-size: 0.9rem;">Visit →</a>
        </div>
        <div class="partner-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
          <h3>RedBus</h3>
          <p>Bus Ticket Booking</p>
          <a href="https://www.redbus.in" target="_blank" class="search-btn" style="display: inline-block; margin-top: 15px; padding: 10px 20px; font-size: 0.9rem;">Visit →</a>
        </div>
        <div class="partner-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
          <h3>Ola</h3>
          <p>Cab Services</p>
          <a href="https://www.olacabs.com" target="_blank" class="search-btn" style="display: inline-block; margin-top: 15px; padding: 10px 20px; font-size: 0.9rem;">Visit →</a>
        </div>
        <div class="partner-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
          <h3>Uber</h3>
          <p>Ride Sharing</p>
          <a href="https://www.uber.com" target="_blank" class="search-btn" style="display: inline-block; margin-top: 15px; padding: 10px 20px; font-size: 0.9rem;">Visit →</a>
        </div>
        <div class="partner-card" style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
          <h3>Booking.com</h3>
          <p>Global Hotel Booking</p>
          <a href="https://www.booking.com" target="_blank" class="search-btn" style="display: inline-block; margin-top: 15px; padding: 10px 20px; font-size: 0.9rem;">Visit →</a>
        </div>
      </div>
    </div>
  `;
}

// API call functions - Modified for direct redirections
async function handleFlightsSearch(e) {
  e.preventDefault();
  
  const from = document.getElementById('flight-from').value;
  const to = document.getElementById('flight-to').value;
  const departure = document.getElementById('flight-departure').value;
  const returnDate = document.getElementById('flight-return').value;
  const travelers = document.getElementById('flight-travelers').value;
  
  if (!from || !to || !departure) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Show loading
  const submitBtn = e.target.querySelector('button[type="submit"]');
  showButtonLoading(submitBtn);
  
  setTimeout(() => {
    // Show multiple flight booking options
    const tripType = returnDate ? 'R' : 'O';
    const returnParam = returnDate ? `&return=${returnDate}` : '';
    
    dynamicContent.innerHTML = `
      <div class="booking-form">
        <h2>✈️ Choose Your Flight Booking Platform</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
          <a href="https://www.makemytrip.com/flight/search?tripType=${tripType}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&departure=${departure}${returnParam}&paxType=A&intl=false&cabinClass=E&ccde=IN&lang=eng&adults=${travelers}&child=0&infant=0" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #FF6B35, #F7931E); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            ✈️ MakeMyTrip<br><small>Best Domestic Deals</small>
          </a>
          <a href="https://www.goibibo.com/flights/search/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&dep=${departure}${returnParam}&adults=${travelers}&child=0&infant=0&class=E" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #FF6900, #FF8F00); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            📱 Goibibo<br><small>Instant Booking</small>
          </a>
          <a href="https://www.cleartrip.com/flights/search/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&depart=${departure}${returnParam}&adults=${travelers}&child=0&infants=0&class=Economy" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #1E90FF, #0080FF); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            ✨ Cleartrip<br><small>Clean Interface</small>
          </a>
          <a href="https://www.yatra.com/flights/search/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&departure=${departure}${returnParam}&adults=${travelers}&child=0&infant=0&class=Economy" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #E74C3C, #C0392B); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🌍 Yatra<br><small>Travel Expert</small>
          </a>
          <a href="https://www.expedia.co.in/Flights-Search?trip=oneway&leg1=from:${encodeURIComponent(from)},to:${encodeURIComponent(to)},departure:${departure}&passengers=adults:${travelers},children:0,seniors:0,infantinlap:Y" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #FFD700, #FFA500); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🌍 Expedia<br><small>International</small>
          </a>
          <a href="https://www.skyscanner.co.in/transport/flights/${encodeURIComponent(from.toLowerCase())}/${encodeURIComponent(to.toLowerCase())}/${departure.replace(/-/g, '')}/?adults=${travelers}&children=0&adultsv2=${travelers}&childrenv2=&infants=0&cabinclass=economy&rtn=${returnDate ? '1' : '0'}" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #0770E3, #0056D6); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🔍 Skyscanner<br><small>Price Comparison</small>
          </a>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px; color: #666;">
          <strong>Flight Details:</strong> ${from} → ${to} | ${departure}${returnDate ? ` → ${returnDate}` : ''} | ${travelers} passenger(s)
        </div>
        <button onclick="renderSectionContent('flights')" class="search-btn" style="margin-top: 20px; background: #6c757d;">↩️ Back to Search</button>
      </div>
    `;
  }, 1000);
}

async function handleTrainsSearch(e) {
  e.preventDefault();
  
  const from = document.getElementById('train-from').value;
  const to = document.getElementById('train-to').value;
  const date = document.getElementById('train-date').value;
  const trainClass = document.getElementById('train-class').value;
  
  if (!from || !to || !date) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Show loading
  const submitBtn = e.target.querySelector('button[type="submit"]');
  showButtonLoading(submitBtn);
  
  // Redirect to IRCTC
  const irctcUrl = `https://www.irctc.co.in/nget/train-search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&quota=GN&class=${trainClass}`;
  
  setTimeout(() => {
    window.open(irctcUrl, '_blank');
    showSuccessMessage('Redirecting to IRCTC train booking...');
  }, 1000);
}

async function handleBusesSearch(e) {
  e.preventDefault();
  
  const from = document.getElementById('bus-from').value;
  const to = document.getElementById('bus-to').value;
  const date = document.getElementById('bus-date').value;
  
  if (!from || !to || !date) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Show loading
  const submitBtn = e.target.querySelector('button[type="submit"]');
  showButtonLoading(submitBtn);
  
  setTimeout(() => {
    // Show multiple bus booking options
    const fromFormatted = from.toLowerCase().replace(/\s+/g, '-');
    const toFormatted = to.toLowerCase().replace(/\s+/g, '-');
    
    dynamicContent.innerHTML = `
      <div class="booking-form">
        <h2>🚌 Choose Your Bus Booking Platform</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
          <a href="https://www.redbus.in/bus-tickets/${fromFormatted}-to-${toFormatted}?date=${date}" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #DC143C, #B22222); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🚌 RedBus<br><small>Most Popular</small>
          </a>
          <a href="https://www.abhibus.com/bus_search/${fromFormatted}/${toFormatted}/${date}" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #FF6B35, #F7931E); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            📱 AbhiBus<br><small>Best Deals</small>
          </a>
          <a href="https://www.traveltriangle.com/bus-booking/${fromFormatted}-to-${toFormatted}" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #1E90FF, #0080FF); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🌍 TravelTriangle<br><small>Tour Packages</small>
          </a>
          <a href="https://www.goibibo.com/bus/search/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #FF6900, #FF8F00); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🏖️ Goibibo<br><small>Combo Deals</small>
          </a>
        </div>
        <p style="margin-top: 20px; color: #666;">From: ${from} → To: ${to} | Date: ${date}</p>
        <button onclick="renderSectionContent('buses')" class="search-btn" style="margin-top: 20px; background: #6c757d;">↩️ Back to Search</button>
      </div>
    `;
  }, 1000);
}

async function handleCabsSearch(e) {
  e.preventDefault();
  
  const pickup = document.getElementById('cab-pickup').value;
  const drop = document.getElementById('cab-drop').value;
  
  if (!pickup || !drop) {
    alert('Please fill in pickup and drop locations');
    return;
  }
  
  // Show loading
  const submitBtn = e.target.querySelector('button[type="submit"]');
  showButtonLoading(submitBtn);
  
  setTimeout(() => {
    // Show options for Ola and Uber
    dynamicContent.innerHTML = `
      <div class="booking-form">
        <h2>🚗 Choose Your Cab Service</h2>
        <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-top: 30px;">
          <a href="https://book.olacabs.com/?serviceType=p2p&utm_source=widget_on_olacabs" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #FFE01B, #F7D117); color: black; text-decoration: none; padding: 20px 30px; font-size: 1.1rem;">
            📱 Book with Ola
          </a>
          <a href="https://m.uber.com/looking" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #000000, #333333); color: white; text-decoration: none; padding: 20px 30px; font-size: 1.1rem;">
            🚗 Book with Uber
          </a>
        </div>
        <p style="margin-top: 20px; color: #666;">From: ${pickup} → To: ${drop}</p>
        <button onclick="renderSectionContent('cabs')" class="search-btn" style="margin-top: 20px; background: #6c757d;">↩️ Back to Search</button>
      </div>
    `;
  }, 1000);
}

async function handleAccommodationsSearch(e) {
  e.preventDefault();
  
  const location = document.getElementById('hotel-location').value;
  const checkin = document.getElementById('hotel-checkin').value;
  const checkout = document.getElementById('hotel-checkout').value;
  const guests = document.getElementById('hotel-guests').value;
  
  if (!location || !checkin || !checkout) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Show loading
  const submitBtn = e.target.querySelector('button[type="submit"]');
  showButtonLoading(submitBtn);
  
  setTimeout(() => {
    // Show options for different hotel booking sites
    dynamicContent.innerHTML = `
      <div class="booking-form">
        <h2>🏨 Choose Your Hotel Booking Platform</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
          <a href="https://www.makemytrip.com/hotels/search?city=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&guest=${guests}" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #FF6B35, #F7931E); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🏨 MakeMyTrip<br><small>Domestic Hotels</small>
          </a>
          <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&group_adults=${guests}" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #003580, #0071c2); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🌍 Booking.com<br><small>Global Hotels</small>
          </a>
          <a href="https://www.goibibo.com/hotels/search?city_code=${encodeURIComponent(location)}&ci=${checkin}&co=${checkout}&r=1-${guests}-0" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #FF6900, #FF8F00); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🏖️ Goibibo<br><small>Best Deals</small>
          </a>
          <a href="https://www.oyo.com/search/?location=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&guests=${guests}" target="_blank" 
             class="search-btn" 
             style="background: linear-gradient(135deg, #EE2E24, #FF4444); color: white; text-decoration: none; padding: 20px; border-radius: 10px; text-align: center; display: block;">
            🏠 OYO Hotels<br><small>Budget Stays</small>
          </a>
        </div>
        <p style="margin-top: 20px; color: #666;">Location: ${location} | ${checkin} to ${checkout} | ${guests} guest(s)</p>
        <button onclick="renderSectionContent('accommodations')" class="search-btn" style="margin-top: 20px; background: #6c757d;">↩️ Back to Search</button>
      </div>
    `;
  }, 1000);
}

// Utility functions
function showButtonLoading(button) {
  if (!button) return;
  
  const originalText = button.innerHTML;
  const originalWidth = button.offsetWidth;
  
  button.style.width = originalWidth + 'px';
  button.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <div class="loading-spinner" style="width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid white; margin: 0;"></div>
      <span>Processing...</span>
    </div>
  `;
  button.disabled = true;
  
  // Reset after 3 seconds (failsafe)
  setTimeout(() => {
    resetButton(button, originalText);
  }, 3000);
}

function resetButton(button, originalText) {
  if (!button) return;
  
  button.innerHTML = originalText;
  button.disabled = false;
  button.style.width = 'auto';
}

function displaySearchResults(type, results) {
  if (!results || results.length === 0) {
    dynamicContent.innerHTML = `
      <div class="booking-form">
        <h2>No Results Found</h2>
        <p>Sorry, no ${type} found for your search criteria.</p>
        <button onclick="renderSectionContent('${type}')" class="search-btn">Search Again</button>
      </div>
    `;
    return;
  }
  
  const resultsHtml = results.map(result => `
    <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 15px;">
      <h3>${result.airline || result.name}</h3>
      <p>${result.flightNumber || ''} | ${result.departure} - ${result.arrival}</p>
      <p><strong>₹${result.price}</strong></p>
    </div>
  `).join('');
  
  dynamicContent.innerHTML = `
    <div class="booking-form">
      <h2>Search Results</h2>
      <div style="margin-top: 20px;">
        ${resultsHtml}
      </div>
      <button onclick="renderSectionContent('${type}')" class="search-btn">New Search</button>
    </div>
  `;
}

function showError(message) {
  dynamicContent.innerHTML = `
    <div class="booking-form">
      <h2>⚠️ Error</h2>
      <p style="color: #dc3545;">${message}</p>
      <button onclick="renderSectionContent(currentSection)" class="search-btn">Try Again</button>
    </div>
  `;
}

function showSuccessMessage(message) {
  dynamicContent.innerHTML = `
    <div class="booking-form">
      <h2>✅ Success</h2>
      <p style="color: #28a745;">${message}</p>
      <button onclick="renderSectionContent(currentSection)" class="search-btn">New Search</button>
    </div>
  `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (dynamicContent) {
    initializeTravelBooking();
  }
});

// --- Original SOS functionality ---

// --- Open Modal ---
sosBtn.addEventListener("click", () => {
  sosModal.classList.remove("hidden");
});

// --- Close Modal ---
function closeModal() {
  sosModal.classList.add("hidden");
}

// --- Send SOS (with backend call) ---
function sendSOS() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      // Call backend API
      fetch("http://localhost:3000/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: latitude,
          lon: longitude,
        }),
      })
        .then((res) => res.json())
        .then(() => {
          alert(`🚨 SOS Sent!\nLat: ${latitude}\nLong: ${longitude}`);
          closeModal();
        })
        .catch((err) => {
          alert("Error sending SOS: " + err);
        });
    },
    () => {
      alert("Unable to retrieve your location.");
    }
  );
}

gsap.registerPlugin(ScrollTrigger);

// Animate the button on scroll (similar to your React code)
gsap.from("#girlBtn", {
  y: 100,                // distance
  opacity: 0,            // initial opacity
  duration: 0.8,         // animation speed
  ease: "power3.out",
  scrollTrigger: {
    trigger: "#girlBtn",
    start: "top 90%",    // when to start animation
    toggleActions: "play none none none",
    once: true
  }
});

// Add click to open new page
document.getElementById("girlBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html"; 
});