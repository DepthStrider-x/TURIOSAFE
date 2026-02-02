// Smart Itinerary Builder JavaScript
class TourioSafeItineraryBuilder {
  constructor() {
    this.selectedInterests = [];
    this.selectedTravelStyle = 'moderate';
    this.autocompleteData = {
      cities: [
        'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
        'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam', 'Indore', 'Thane',
        'Bhopal', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra',
        'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi',
        'Srinagar', 'Dhanbad', 'Jodhpur', 'Amritsar', 'Raipur', 'Allahabad', 'Coimbatore',
        'Jabalpur', 'Gwalior', 'Vijayawada', 'Madurai', 'Gurgaon', 'Navi Mumbai', 'Aurangabad',
        'Shimla', 'Manali', 'Goa', 'Rishikesh', 'Haridwar', 'Udaipur', 'Jodhpur', 'Kerala',
        'Munnar', 'Kochi', 'Alleppey', 'Darjeeling', 'Gangtok', 'Leh', 'Ladakh', 'Srinagar',
        'Pondicherry', 'Ooty', 'Kodaikanal', 'Hampi', 'Mahabalipuram', 'Kanchipuram',
        'Muzaffarnagar', 'Saharanpur', 'Dehradun', 'Nainital', 'Almora', 'Ranikhet'
      ]
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAutocomplete();
    this.setupSliders();
  }

  setupEventListeners() {
    // Form submission
    const form = document.getElementById('itineraryForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Interest tags
    document.querySelectorAll('.interest-tag').forEach(tag => {
      tag.addEventListener('click', (e) => this.toggleInterest(e));
    });

    // Travel style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectTravelStyle(e));
    });

    // Quick destination cards
    document.querySelectorAll('.destination-card').forEach(card => {
      card.addEventListener('click', (e) => this.selectQuickDestination(e));
    });

    // Budget slider
    const budgetSlider = document.getElementById('budget');
    if (budgetSlider) {
      budgetSlider.addEventListener('input', (e) => this.updateBudgetDisplay(e));
    }
  }

  setupAutocomplete() {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');

    if (originInput) {
      this.setupAutocompleteForInput(originInput, 'originSuggestions');
    }
    
    if (destinationInput) {
      this.setupAutocompleteForInput(destinationInput, 'destinationSuggestions');
    }
  }

  setupAutocompleteForInput(input, suggestionsId) {
    const suggestionsContainer = document.getElementById(suggestionsId);
    
    input.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      if (query.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
      }

      const matches = this.autocompleteData.cities
        .filter(city => city.toLowerCase().includes(query))
        .slice(0, 5);

      if (matches.length > 0) {
        suggestionsContainer.innerHTML = matches
          .map(city => `<div class="suggestion-item" data-city="${city}">${city}</div>`)
          .join('');
        
        suggestionsContainer.style.display = 'block';

        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            input.value = item.dataset.city;
            suggestionsContainer.style.display = 'none';
          });
        });
      } else {
        suggestionsContainer.style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.style.display = 'none';
      }
    });
  }

  setupSliders() {
    const budgetSlider = document.getElementById('budget');
    if (budgetSlider) {
      this.updateBudgetDisplay({ target: budgetSlider });
    }
  }

  updateBudgetDisplay(e) {
    const value = parseInt(e.target.value);
    const display = document.querySelector('.budget-display');
    if (display) {
      display.textContent = `₹${value.toLocaleString('en-IN')}`;
    }
  }

  toggleInterest(e) {
    e.preventDefault();
    const tag = e.currentTarget;
    const interest = tag.dataset.interest;
    
    tag.classList.toggle('active');
    
    if (this.selectedInterests.includes(interest)) {
      this.selectedInterests = this.selectedInterests.filter(i => i !== interest);
    } else {
      this.selectedInterests.push(interest);
    }
    
    const hiddenInput = document.getElementById('selectedInterests');
    if (hiddenInput) {
      hiddenInput.value = this.selectedInterests.join(',');
    }
  }

  selectTravelStyle(e) {
    e.preventDefault();
    
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    e.currentTarget.classList.add('active');
    this.selectedTravelStyle = e.currentTarget.dataset.style;
    
    const hiddenInput = document.getElementById('travelStyle');
    if (hiddenInput) {
      hiddenInput.value = this.selectedTravelStyle;
    }
  }

  selectQuickDestination(e) {
    const destination = e.currentTarget.dataset.destination;
    const destinationInput = document.getElementById('destination');
    if (destinationInput) {
      destinationInput.value = destination;
      destinationInput.focus();
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    data.interests = this.selectedInterests.join(',');
    data.travelStyle = this.selectedTravelStyle;
    data.days = parseInt(data.days); // Ensure days is a number
    data.budget = parseInt(data.budget); // Ensure budget is a number
    
    if (!this.validateForm(data)) {
      return;
    }
    
    const submitBtn = document.querySelector('.generate-itinerary-btn');
    this.setLoadingState(submitBtn, true);
    
    try {
      await this.generateItinerary(data);
      
      // Generate dynamic itinerary based on user input
      const dynamicItinerary = this.generateDynamicItinerary(data);
      sessionStorage.setItem('itineraryData', JSON.stringify(data));
      sessionStorage.setItem('generatedItinerary', JSON.stringify(dynamicItinerary));
      
      // Redirect to result page
      window.location.href = 'itinerary-result.html';
      
    } catch (error) {
      console.error('Error generating itinerary:', error);
      this.showError('Failed to generate itinerary. Please try again.');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  // NEW: Generate dynamic itinerary based on user input
  generateDynamicItinerary(data) {
    const destination = data.destination;
    const days = parseInt(data.days);
    const budget = parseInt(data.budget);
    const origin = data.origin;
    const interests = data.interests.split(',').filter(i => i.trim());
    const travelStyle = data.travelStyle;
    
    // Get base destination data
    const baseItinerary = this.getBaseDestinationData(destination);
    
    // Generate dynamic daily itinerary based on number of days
    const dailyItinerary = this.generateDailyItinerary(destination, days, budget, interests, travelStyle);
    
    // Calculate dynamic weather forecast
    const weatherForecast = this.generateWeatherForecast(destination, days);
    
    // Calculate dynamic budget distribution
    const budgetPerDay = Math.floor(budget / days);
    const totalCalculatedCost = dailyItinerary.reduce((sum, day) => sum + day.totalCost, 0);
    
    return {
      title: `${days}-Day ${destination} ${this.getTripTypeByInterests(interests)}`,
      origin: origin,
      destination: destination,
      days: days,
      budget: budget,
      tourioRating: baseItinerary.tourioRating,
      totalCost: Math.min(totalCalculatedCost, budget * 0.9),
      carbonFootprint: this.calculateCarbonFootprint(destination, days, travelStyle),
      dailyItinerary: dailyItinerary,
      weatherForecast: weatherForecast,
      safetyAlerts: baseItinerary.safetyAlerts,
      localTips: baseItinerary.localTips,
      carbonFootprint: {
        total: this.calculateCarbonFootprint(destination, days, travelStyle),
        breakdown: this.getCarbonBreakdown(days, travelStyle),
        treesToOffset: Math.ceil(this.calculateCarbonFootprint(destination, days, travelStyle) / 22),
        ecoTips: baseItinerary.carbonFootprint?.ecoTips || [
          '🚌 Use public transportation to reduce emissions',
          '♻️ Choose eco-friendly accommodations',
          '🌱 Support local businesses and reduce food miles'
        ]
      }
    };
  }

  // Generate daily itinerary based on days count
  generateDailyItinerary(destination, days, budget, interests, travelStyle) {
    const dailyBudget = Math.floor(budget / days);
    const baseActivities = this.getDestinationActivities(destination);
    const dailyItinerary = [];
    
    for (let day = 1; day <= days; day++) {
      const dayTitle = this.getDayTitle(destination, day, days);
      const dayActivities = this.selectActivitiesForDay(destination, day, days, baseActivities, interests, dailyBudget, travelStyle);
      
      const dayTotalCost = dayActivities.reduce((sum, activity) => sum + activity.cost, 0);
      const dayTotalDuration = dayActivities.reduce((sum, activity) => sum + activity.duration, 0);
      
      dailyItinerary.push({
        day: day,
        date: this.getDateForDay(day),
        title: dayTitle,
        activities: dayActivities,
        totalCost: dayTotalCost,
        totalDuration: dayTotalDuration
      });
    }
    
    return dailyItinerary;
  }

  // Get day title based on day number and total days
  getDayTitle(destination, day, totalDays) {
    const titles = {
      1: "Arrival & Initial Exploration",
      2: totalDays === 2 ? "Main Attractions & Departure" : "Main Attractions & Cultural Experience",
      3: totalDays === 3 ? "Heritage Sites & Departure" : "Adventure Activities & Nature",
      4: totalDays === 4 ? "Shopping & Departure" : "Heritage Sites & Local Culture",
      5: totalDays === 5 ? "Leisure & Departure" : "Hidden Gems & Unique Experiences",
      6: "Shopping & Leisure Activities",
      7: "Final Exploration & Departure"
    };
    
    if (day === totalDays && totalDays > 2) {
      return "Final Day & Departure";
    }
    
    return titles[day] || `Day ${day} Activities`;
  }

  getDetailedItineraryByDestination(destination) {
    const itineraries = {
      'Shimla': this.getDetailedShimlaItinerary(),
      'Jaipur': this.getDetailedJaipurItinerary(),
      'Agra': this.getDetailedAgraItinerary(),
      'Delhi': this.getDetailedDelhiItinerary(),
      'Mumbai': this.getDetailedMumbaiItinerary(),
      'Udaipur': this.getDetailedUdaipurItinerary(),
      'Kerala': this.getDetailedKeralaItinerary(),
      'Mysore': this.getDetailedMysoreItinerary(),
      'Ladakh': this.getDetailedLadakhItinerary(),
      'Manali': this.getDetailedManaliItinerary(),
      'Darjeeling': this.getDetailedDarjeelingItinerary(),
      'Gangtok': this.getDetailedGangtokItinerary(),
      'Munnar': this.getDetailedMunnarItinerary(),
      'Rishikesh': this.getDetailedRishikeshItinerary(),
      'Haridwar': this.getDetailedHaridwarItinerary(),
      'Bodh Gaya': this.getDetailedBodhGayaItinerary(),
      'Amritsar': this.getDetailedAmritsarItinerary(),
      'Kolkata': this.getDetailedKolkataItinerary(),
      'Goa': this.getDetailedGoaItinerary(),
      'Hyderabad': this.getDetailedHyderabadItinerary(),
      'Bangalore': this.getDetailedBangaloreItinerary(),
      'Chennai': this.getDetailedChennaiItinerary(),
      'Ahmedabad': this.getDetailedAhmedabadItinerary(),
      'Ajmer': this.getDetailedAjmerItinerary()
    };
    
    return itineraries[destination] || this.getDetailedShimlaItinerary();
  }

  // NEW: Get base destination data for dynamic generation
  getBaseDestinationData(destination) {
    const baseData = {
      'Shimla': {
        tourioRating: 4.7,
        coordinates: { lat: 31.1048, lng: 77.1734 },
        safetyAlerts: [
          { type: 'safe', icon: '✅', message: 'Shimla is very safe for tourists with excellent local support' },
          { type: 'weather', icon: '🌡️', message: 'Mountain weather changes quickly - carry layers and warm clothes' },
          { type: 'altitude', icon: '⛰️', message: 'Take time to acclimatize to mountain altitude, stay hydrated' }
        ],
        localTips: [
          { category: 'Transport', tip: 'Toy train and taxi services available. Book Kalka-Shimla train in advance.' },
          { category: 'Food', tip: 'Must try: Chana Madra, Dham, local trout, and mountain honey.' },
          { category: 'Shopping', tip: 'Best buys: Woolen clothes, wooden handicrafts, local honey, dry fruits.' },
          { category: 'Weather', tip: 'Carry layers - weather changes quickly. Evening can be cold even in summer.' }
        ],
        carbonFootprint: {
          ecoTips: ['🚌 Use local buses to reduce carbon footprint', '♻️ Support eco-friendly hotels', '🌱 Choose local restaurants to reduce food miles']
        }
      },
      'Jaipur': {
        tourioRating: 4.6,
        coordinates: { lat: 26.9124, lng: 75.7873 },
        safetyAlerts: [
          { type: 'safe', icon: '✅', message: 'Jaipur is safe for tourists with normal precautions' },
          { type: 'weather', icon: '☀️', message: 'Hot and dry weather - stay hydrated and use sunscreen' },
          { type: 'shopping', icon: '🛍️', message: 'Bargain expected in markets - start at 40% of asking price' }
        ],
        localTips: [
          { category: 'Transport', tip: 'Auto-rickshaws available but negotiate fare beforehand. Uber/Ola reliable.' },
          { category: 'Food', tip: 'Must try: Dal-baati-churma, Ghewar, Pyaaz Kachori. Drink bottled water.' },
          { category: 'Shopping', tip: 'Best buys: Kundan jewelry, block-printed textiles, blue pottery, precious stones' },
          { category: 'Culture', tip: 'Remove shoes before entering temples. Dress modestly. Photography may be restricted.' }
        ],
        carbonFootprint: {
          ecoTips: ['🚌 Use public buses to reduce carbon footprint', '♻️ Support local artisans and crafts']
        }
      },
      'Agra': {
        tourioRating: 4.8,
        coordinates: { lat: 27.1767, lng: 78.0081 },
        safetyAlerts: [
          { type: 'safe', icon: '✅', message: 'Agra is generally safe for tourists around main attractions' },
          { type: 'weather', icon: '☀️', message: 'Very hot in summer - visit early morning or late evening' },
          { type: 'heritage', icon: '🏛️', message: 'Photography restrictions inside Taj Mahal main dome' }
        ],
        localTips: [
          { category: 'Transport', tip: 'Book train tickets in advance. Taxi from Delhi takes 3-4 hours.' },
          { category: 'Food', tip: 'Must try: Agra petha, Mughlai cuisine, local street food with caution.' },
          { category: 'Shopping', tip: 'Best buys: Marble inlay work, leather goods, carpets. Bargain in local markets.' },
          { category: 'Heritage', tip: 'Buy combo tickets for multiple monuments. Guides available at main sites.' }
        ],
        carbonFootprint: {
          ecoTips: ['🚆 Use trains instead of cars for longer journeys', '♻️ Support heritage conservation efforts']
        }
      }
    };
    
    return baseData[destination] || baseData['Shimla'];
  }

  // Generate activities for a specific day
  selectActivitiesForDay(destination, day, totalDays, baseActivities, interests, dailyBudget, travelStyle) {
    const activityPool = this.getDestinationActivities(destination);
    const selectedActivities = [];
    let remainingBudget = dailyBudget;
    let currentTime = day === 1 ? "09:00" : "08:00"; // Start later on first day
    
    // Day 1: Arrival and initial exploration
    if (day === 1) {
      selectedActivities.push(...this.getArrivalActivities(destination, currentTime, remainingBudget));
    }
    // Last day: Departure activities
    else if (day === totalDays) {
      selectedActivities.push(...this.getDepartureActivities(destination, currentTime, remainingBudget));
    }
    // Middle days: Full exploration
    else {
      selectedActivities.push(...this.getExplorationActivities(destination, day, currentTime, remainingBudget, interests, travelStyle));
    }
    
    return selectedActivities;
  }

  // Get arrival day activities
  getArrivalActivities(destination, startTime, budget) {
    const activities = [];
    let currentTime = startTime;
    let currentBudget = budget;
    
    // Hotel check-in
    activities.push({
      id: `arr-1`,
      name: `🏨 ${currentTime} - Hotel Check-in & Freshen Up`,
      type: "accommodation",
      description: `Check into your hotel and freshen up. Get oriented with the local area and hotel amenities.`,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 1),
      duration: 60,
      cost: 0,
      rating: 4.5,
      coordinates: this.getDestinationCoords(destination),
      safetyRating: 9.5,
      tips: ["Keep valuables in hotel safe", "Ask for local area map", "Get breakfast timings", "Confirm checkout procedures"]
    });
    
    currentTime = this.addHours(currentTime, 1.5);
    
    // Local lunch
    const lunchCost = Math.min(800, currentBudget * 0.15);
    activities.push({
      id: `arr-2`,
      name: `🍽️ ${currentTime} - Local Cuisine Lunch`,
      type: "food",
      description: `Enjoy authentic local cuisine and get your first taste of ${destination}'s culinary specialties.`,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 1.5),
      duration: 90,
      cost: lunchCost,
      rating: 4.4,
      coordinates: this.getDestinationCoords(destination),
      safetyRating: 9.2,
      tips: ["Try local specialties", "Ask for mild spice level if needed", "Carry hand sanitizer", "Stay hydrated"]
    });
    
    currentTime = this.addHours(currentTime, 2);
    currentBudget -= lunchCost;
    
    // Initial exploration
    const exploreCost = Math.min(1200, currentBudget * 0.3);
    activities.push({
      id: `arr-3`,
      name: `🚶 ${currentTime} - Initial City Exploration`,
      type: "heritage",
      description: `Take a walking tour of the main areas and get familiar with ${destination}'s layout and key landmarks.`,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 2.5),
      duration: 150,
      cost: exploreCost,
      rating: 4.6,
      coordinates: this.getDestinationCoords(destination),
      safetyRating: 9.0,
      tips: ["Wear comfortable walking shoes", "Carry water bottle", "Take photos at landmarks", "Ask locals for directions"]
    });
    
    currentTime = this.addHours(currentTime, 3);
    currentBudget -= exploreCost;
    
    // Evening activity
    const eveningCost = Math.min(1000, currentBudget * 0.4);
    activities.push({
      id: `arr-4`,
      name: `🌅 ${currentTime} - Sunset Viewing & Evening Stroll`,
      type: "nature",
      description: `Watch the sunset from a scenic viewpoint and enjoy an evening stroll through local markets or promenades.`,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 2),
      duration: 120,
      cost: eveningCost,
      rating: 4.7,
      coordinates: this.getDestinationCoords(destination),
      safetyRating: 8.8,
      tips: ["Best time for photos", "Carry light jacket", "Watch for traffic", "Try local snacks"]
    });
    
    return activities;
  }

  // Get departure day activities
  getDepartureActivities(destination, startTime, budget) {
    const activities = [];
    let currentTime = startTime;
    let currentBudget = budget;
    
    // Morning breakfast
    activities.push({
      id: `dep-1`,
      name: `🍳 ${currentTime} - Leisurely Breakfast & Packing`,
      type: "accommodation",
      description: "Enjoy a relaxed breakfast and pack your belongings. Check out formalities and prepare for departure.",
      startTime: currentTime,
      endTime: this.addHours(currentTime, 1.5),
      duration: 90,
      cost: 0,
      rating: 4.4,
      coordinates: this.getDestinationCoords(destination),
      safetyRating: 9.7,
      tips: ["Pack souvenirs safely", "Keep essentials in hand luggage", "Confirm checkout time", "Keep travel documents ready"]
    });
    
    currentTime = this.addHours(currentTime, 2);
    
    // Final sightseeing
    const sightseeingCost = Math.min(1500, currentBudget * 0.4);
    activities.push({
      id: `dep-2`,
      name: `🏛️ ${currentTime} - Final Sightseeing`,
      type: "heritage",
      description: `Visit any remaining must-see attractions or revisit your favorite spots for final photos and memories.`,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 2.5),
      duration: 150,
      cost: sightseeingCost,
      rating: 4.8,
      coordinates: this.getDestinationCoords(destination),
      safetyRating: 9.5,
      tips: ["Take final photos", "Buy last-minute souvenirs", "Keep time for departure", "Check travel route"]
    });
    
    currentTime = this.addHours(currentTime, 3);
    currentBudget -= sightseeingCost;
    
    // Final shopping
    const shoppingCost = Math.min(2000, currentBudget * 0.5);
    activities.push({
      id: `dep-3`,
      name: `🛍️ ${currentTime} - Final Shopping & Souvenirs`,
      type: "shopping",
      description: "Last-minute shopping for souvenirs, local products, and gifts to remember your trip.",
      startTime: currentTime,
      endTime: this.addHours(currentTime, 1.5),
      duration: 90,
      cost: shoppingCost,
      rating: 4.3,
      coordinates: this.getDestinationCoords(destination),
      safetyRating: 9.2,
      tips: ["Buy authentic local products", "Keep receipts", "Pack fragile items carefully", "Check airline baggage limits"]
    });
    
    currentTime = this.addHours(currentTime, 2);
    currentBudget -= shoppingCost;
    
    // Departure
    const transportCost = Math.min(3000, currentBudget);
    activities.push({
      id: `dep-4`,
      name: `🚗 ${currentTime} - Departure Journey`,
      type: "transport",
      description: `Begin your return journey with beautiful memories of ${destination}. Safe travels!`,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 4),
      duration: 240,
      cost: transportCost,
      rating: 4.5,
      coordinates: this.getDestinationCoords(destination),
      safetyRating: 9.0,
      tips: ["Leave early to avoid traffic", "Keep snacks for journey", "Check vehicle condition", "Plan rest stops"]
    });
    
    return activities;
  }

  // Get exploration activities for middle days
  getExplorationActivities(destination, day, startTime, budget, interests, travelStyle) {
    const activities = [];
    let currentTime = startTime;
    let currentBudget = budget;
    
    // Morning activities based on interests and travel style
    const morningActivities = this.getMorningActivities(destination, day, currentTime, currentBudget, interests, travelStyle);
    activities.push(...morningActivities);
    
    // Afternoon activities
    currentTime = this.addHours(currentTime, 4);
    const afternoonActivities = this.getAfternoonActivities(destination, day, currentTime, currentBudget * 0.6, interests);
    activities.push(...afternoonActivities);
    
    // Evening activities
    currentTime = this.addHours(currentTime, 4);
    const eveningActivities = this.getEveningActivities(destination, day, currentTime, currentBudget * 0.3, travelStyle);
    activities.push(...eveningActivities);
    
    return activities;
  }

  getDetailedJaipurItinerary() {
    return {
      title: "3-Day Pink City Royal Experience",
      origin: "Delhi",
      destination: "Jaipur",
      days: 3,
      budget: 20000,
      tourioRating: 4.6,
      totalCost: 18500,
      carbonFootprint: 15.2,
      // ... rest of static data
    };
  }

  // NEW: Helper methods for dynamic itinerary generation
  
  // Get morning activities based on interests
  getMorningActivities(destination, day, startTime, budget, interests, travelStyle) {
    const activities = [];
    let currentTime = startTime;
    
    // Get real attractions for this destination and time
    const morningAttractions = this.getRealAttractions(destination, 'morning', interests);
    const selectedAttraction = morningAttractions[Math.min(day - 1, morningAttractions.length - 1)];
    
    // Early morning activity
    activities.push({
      id: `d${day}-morning-1`,
      name: `🏛️ ${currentTime} - ${selectedAttraction.name}`,
      type: selectedAttraction.type,
      description: selectedAttraction.description,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 2),
      duration: 120,
      cost: selectedAttraction.cost,
      rating: selectedAttraction.rating,
      coordinates: selectedAttraction.coordinates || this.getDestinationCoords(destination),
      safetyRating: selectedAttraction.safetyRating || 9.2,
      tips: selectedAttraction.tips
    });
    
    currentTime = this.addHours(currentTime, 2.5);
    
    // Breakfast at local place
    const breakfastPlace = this.getLocalFood(destination, 'breakfast');
    activities.push({
      id: `d${day}-morning-2`,
      name: `🍽️ ${currentTime} - ${breakfastPlace.name}`,
      type: "food",
      description: breakfastPlace.description,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 1),
      duration: 60,
      cost: breakfastPlace.cost,
      rating: breakfastPlace.rating,
      coordinates: breakfastPlace.coordinates || this.getDestinationCoords(destination),
      safetyRating: 9.5,
      tips: breakfastPlace.tips
    });
    
    return activities;
  }
  
  // Get afternoon activities
  getAfternoonActivities(destination, day, startTime, budget, interests) {
    const activities = [];
    let currentTime = startTime;
    
    // Main afternoon attraction - get real places
    const afternoonAttractions = this.getRealAttractions(destination, 'afternoon', interests);
    const selectedAttraction = afternoonAttractions[Math.min(day - 1, afternoonAttractions.length - 1)];
    
    activities.push({
      id: `d${day}-afternoon-1`,
      name: `🏛️ ${currentTime} - ${selectedAttraction.name}`,
      type: selectedAttraction.type,
      description: selectedAttraction.description,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 2.5),
      duration: 150,
      cost: selectedAttraction.cost,
      rating: selectedAttraction.rating,
      coordinates: selectedAttraction.coordinates || this.getDestinationCoords(destination),
      safetyRating: selectedAttraction.safetyRating || 9.3,
      tips: selectedAttraction.tips
    });
    
    currentTime = this.addHours(currentTime, 3);
    
    // Lunch at famous local restaurant
    const lunchPlace = this.getLocalFood(destination, 'lunch');
    activities.push({
      id: `d${day}-afternoon-2`,
      name: `🍽️ ${currentTime} - ${lunchPlace.name}`,
      type: "food",
      description: lunchPlace.description,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 1.5),
      duration: 90,
      cost: lunchPlace.cost,
      rating: lunchPlace.rating,
      coordinates: lunchPlace.coordinates || this.getDestinationCoords(destination),
      safetyRating: 9.1,
      tips: lunchPlace.tips
    });
    
    return activities;
  }
  
  // Get evening activities
  getEveningActivities(destination, day, startTime, budget, travelStyle) {
    const activities = [];
    let currentTime = startTime;
    
    // Evening exploration - get real places
    const eveningAttractions = this.getRealAttractions(destination, 'evening', []);
    const selectedAttraction = eveningAttractions[Math.min(day - 1, eveningAttractions.length - 1)];
    
    activities.push({
      id: `d${day}-evening-1`,
      name: `🌆 ${currentTime} - ${selectedAttraction.name}`,
      type: selectedAttraction.type,
      description: selectedAttraction.description,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 2),
      duration: 120,
      cost: selectedAttraction.cost,
      rating: selectedAttraction.rating,
      coordinates: selectedAttraction.coordinates || this.getDestinationCoords(destination),
      safetyRating: selectedAttraction.safetyRating || 8.9,
      tips: selectedAttraction.tips
    });
    
    currentTime = this.addHours(currentTime, 2.5);
    
    // Dinner at famous restaurant
    const dinnerPlace = this.getLocalFood(destination, 'dinner');
    activities.push({
      id: `d${day}-evening-2`,
      name: `🍽️ ${currentTime} - ${dinnerPlace.name}`,
      type: "food",
      description: dinnerPlace.description,
      startTime: currentTime,
      endTime: this.addHours(currentTime, 1.5),
      duration: 90,
      cost: dinnerPlace.cost,
      rating: dinnerPlace.rating,
      coordinates: dinnerPlace.coordinates || this.getDestinationCoords(destination),
      safetyRating: 9.3,
      tips: dinnerPlace.tips
    });
    
    return activities;
  }
  
  // Helper method to get destination coordinates
  getDestinationCoords(destination) {
    const coords = {
      'Shimla': { lat: 31.1048, lng: 77.1734 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Agra': { lat: 27.1767, lng: 78.0081 },
      'Delhi': { lat: 28.6139, lng: 77.2090 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Goa': { lat: 15.2993, lng: 74.1240 },
      'Kerala': { lat: 10.8505, lng: 76.2711 },
      'Udaipur': { lat: 24.5854, lng: 73.7125 }
    };
    return coords[destination] || coords['Shimla'];
  }
  
  // Helper method to add hours to time string
  addHours(timeStr, hours) {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = h * 60 + m + (hours * 60);
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
  
  // Generate activity descriptions
  getActivityDescription(destination, timeOfDay, interests) {
    const descriptions = {
      'Shimla': {
        morning: "Explore the beautiful mountain landscapes and enjoy fresh mountain air with panoramic Himalayan views.",
        afternoon: "Visit the colonial architecture and heritage sites that showcase Shimla's rich British-era history.",
        evening: "Experience the vibrant local culture and markets while enjoying stunning sunset views over the valleys."
      },
      'Jaipur': {
        morning: "Discover the magnificent forts and palaces that showcase Rajasthan's royal heritage and architectural marvels.",
        afternoon: "Explore the bustling markets and traditional crafts that make Jaipur the cultural heart of Rajasthan.",
        evening: "Immerse yourself in royal Rajasthani culture with traditional performances and authentic local cuisine."
      },
      'Agra': {
        morning: "Visit the world-famous Taj Mahal and other Mughal monuments that represent India's architectural grandeur.",
        afternoon: "Explore the historical Red Fort and learn about the rich Mughal empire and its fascinating stories.",
        evening: "Experience the local markets and traditional crafts while enjoying views of illuminated monuments."
      }
    };
    
    const destDesc = descriptions[destination] || descriptions['Shimla'];
    return destDesc[timeOfDay] || `Enjoy ${timeOfDay} activities in ${destination} with local experiences.`;
  }
  
  // Get activity tips
  getActivityTips(timeOfDay, destination) {
    const tips = {
      morning: ["Start early to avoid crowds", "Carry water bottle", "Wear comfortable shoes", "Check weather conditions"],
      afternoon: ["Take breaks in shade", "Stay hydrated", "Use sunscreen", "Carry light snacks"],
      evening: ["Carry light jacket", "Be aware of local timing", "Try local street food safely", "Keep camera ready"]
    };
    return tips[timeOfDay] || ["Follow local guidelines", "Stay safe", "Enjoy the experience", "Respect local culture"];
  }
  
  // Generate weather forecast for multiple days
  generateWeatherForecast(destination, days) {
    const forecast = [];
    const baseWeather = this.getBaseWeather(destination);
    
    for (let day = 1; day <= days; day++) {
      forecast.push({
        day: day,
        date: this.getDateForDay(day),
        condition: this.getRandomWeatherCondition(destination),
        temperature: {
          high: baseWeather.high + Math.floor(Math.random() * 6) - 3,
          low: baseWeather.low + Math.floor(Math.random() * 4) - 2
        },
        humidity: baseWeather.humidity + Math.floor(Math.random() * 20) - 10,
        rainfall: Math.floor(Math.random() * 10),
        windSpeed: baseWeather.windSpeed + Math.floor(Math.random() * 8) - 4,
        uvIndex: baseWeather.uvIndex + Math.floor(Math.random() * 3) - 1,
        sunrise: "06:30",
        sunset: "18:30",
        description: `Day ${day} weather perfect for outdoor activities and sightseeing`
      });
    }
    
    return forecast;
  }
  
  // Get base weather for destinations
  getBaseWeather(destination) {
    const weather = {
      'Shimla': { high: 22, low: 8, humidity: 65, windSpeed: 8, uvIndex: 6 },
      'Jaipur': { high: 32, low: 18, humidity: 35, windSpeed: 12, uvIndex: 8 },
      'Agra': { high: 30, low: 16, humidity: 45, windSpeed: 10, uvIndex: 7 },
      'Delhi': { high: 28, low: 15, humidity: 55, windSpeed: 9, uvIndex: 7 },
      'Mumbai': { high: 30, low: 24, humidity: 75, windSpeed: 15, uvIndex: 8 },
      'Goa': { high: 32, low: 22, humidity: 80, windSpeed: 12, uvIndex: 9 }
    };
    return weather[destination] || weather['Shimla'];
  }
  
  // Get random weather conditions
  getRandomWeatherCondition(destination) {
    const conditions = ['Sunny', 'Partly Cloudy', 'Light Clouds', 'Clear Skies'];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }
  
  // Calculate carbon footprint based on days and travel style
  calculateCarbonFootprint(destination, days, travelStyle) {
    const baseFootprint = {
      'Shimla': 6.2,
      'Jaipur': 5.1,
      'Agra': 4.8,
      'Delhi': 3.5,
      'Mumbai': 4.2,
      'Goa': 7.1
    };
    
    const multiplier = {
      'slow': 0.8,
      'moderate': 1.0,
      'fast': 1.3
    };
    
    const base = baseFootprint[destination] || 5.0;
    const styleMultiplier = multiplier[travelStyle] || 1.0;
    const dayMultiplier = Math.sqrt(days); // Non-linear scaling
    
    return Math.round((base * styleMultiplier * dayMultiplier) * 10) / 10;
  }
  
  // Get carbon breakdown
  getCarbonBreakdown(days, travelStyle) {
    const total = this.calculateCarbonFootprint('generic', days, travelStyle);
    return {
      transport: Math.round(total * 0.6 * 10) / 10,
      accommodation: Math.round(total * 0.2 * 10) / 10,
      food: Math.round(total * 0.15 * 10) / 10,
      activities: Math.round(total * 0.05 * 10) / 10
    };
  }
  
  // Get trip type based on interests
  getTripTypeByInterests(interests) {
    if (interests.includes('heritage')) return 'Heritage Tour';
    if (interests.includes('adventure')) return 'Adventure Experience';
    if (interests.includes('nature')) return 'Nature Expedition';
    if (interests.includes('food')) return 'Culinary Journey';
    if (interests.includes('spiritual')) return 'Spiritual Retreat';
    return 'Cultural Experience';
  }
  
  // Utility function to capitalize first letter
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  // Get destination activities (placeholder - this would be expanded)
  getDestinationActivities(destination) {
    // This would contain a comprehensive database of activities
    // For now, returning empty array as we generate activities dynamically
    return [];
  }

  getDetailedAgraItinerary() {
    return {
      title: "2-Day Taj Mahal & Mughal Heritage Tour",
      origin: "Delhi",
      destination: "Agra",
      days: 2,
      budget: 15000,
      tourioRating: 4.8,
      totalCost: 13500,
      carbonFootprint: 12.4,
      dailyItinerary: [
        {
          day: 1,
          date: this.getDateForDay(1),
          title: "Taj Mahal Sunrise & Agra Fort",
          activities: [
            {
              id: "a1-1",
              name: "🌅 5:30 AM - Taj Mahal Sunrise Visit",
              type: "heritage",
              description: "Experience magical sunrise at Taj Mahal. Golden light on white marble creates unforgettable views. Best photography time with fewer crowds.",
              startTime: "05:30",
              endTime: "08:30",
              duration: 180,
              cost: 1100,
              rating: 4.9,
              coordinates: { lat: 27.1751, lng: 78.0421 },
              safetyRating: 9.8,
              tips: ["Book tickets online in advance", "Carry ID proof mandatory", "No photography inside main tomb", "Security check takes time"]
            },
            {
              id: "a1-2",
              name: "☕ 9:00 AM - Breakfast at Sheroes Cafe",
              type: "food",
              description: "Special breakfast at cafe run by acid attack survivors. Support social cause while enjoying great food with Taj view from rooftop.",
              startTime: "09:00",
              endTime: "10:00",
              duration: 60,
              cost: 300,
              rating: 4.6,
              coordinates: { lat: 27.1751, lng: 78.0421 },
              safetyRating: 9.5,
              tips: ["Support social cause", "Great Taj views from rooftop", "Try their special masala chai", "Leave generous tip"]
            },
            {
              id: "a1-3",
              name: "🏰 11:00 AM - Agra Fort Red Sandstone Marvel",
              type: "heritage",
              description: "Explore massive Mughal fort complex. See Jahangir Palace, Diwan-i-Khas, prison where Shah Jahan spent last years looking at Taj Mahal.",
              startTime: "11:00",
              endTime: "13:30",
              duration: 150,
              cost: 650,
              rating: 4.7,
              coordinates: { lat: 27.1795, lng: 78.0211 },
              safetyRating: 9.4,
              tips: ["Audio guide recommended", "Carry water bottle", "Wear comfortable shoes", "Best Taj views from fort"]
            },
            {
              id: "a1-4",
              name: "🍛 2:00 PM - Mughlai Lunch at Pinch of Spice",
              type: "food",
              description: "Authentic Mughlai cuisine: biryani, kebabs, korma, naan. Rich flavors representing royal Mughal cooking tradition in modern restaurant.",
              startTime: "14:00",
              endTime: "15:30",
              duration: 90,
              cost: 800,
              rating: 4.5,
              coordinates: { lat: 27.1767, lng: 78.0081 },
              safetyRating: 9.2,
              tips: ["Try Agra famous petha for dessert", "Mutton biryani highly recommended", "Portion sizes are large", "AC restaurant with clean restrooms"]
            }
          ],
          totalCost: 2850,
          totalDuration: 480
        }
      ],
      weatherForecast: [
        {
          day: 1,
          date: this.getDateForDay(1),
          condition: "Clear Sky",
          temperature: { high: 35, low: 22 },
          humidity: 40,
          rainfall: 0,
          windSpeed: 8,
          uvIndex: 9,
          sunrise: "06:15",
          sunset: "18:45"
        }
      ],
      safetyAlerts: [
        { type: 'safe', icon: '✅', message: 'Agra is safe for tourists around major monuments' },
        { type: 'weather', icon: '☀️', message: 'Very hot during day - start early and stay hydrated' },
        { type: 'crowds', icon: '👥', message: 'Taj Mahal gets very crowded after 9 AM - visit early' }
      ],
      localTips: [
        { category: 'Monument', tip: 'Taj Mahal closed on Fridays. Buy tickets online. Sunrise/sunset best times.' },
        { category: 'Food', tip: 'Must try: Agra Petha (sweet), Mughlai cuisine, Bedai with aloo sabzi' },
        { category: 'Shopping', tip: 'Famous for: Marble inlay work, leather goods, carpets. Bargain expected.' },
        { category: 'Transport', tip: 'Pre-paid taxis available. Avoid overcharging. Book return transport early.' }
      ],
      carbonFootprint: {
        total: 12.4,
        breakdown: { transport: 8.2, accommodation: 2.1, food: 1.4, activities: 0.7 },
        treesToOffset: 1,
        ecoTips: ['🚌 Use shared transport to monuments', '♻️ Carry reusable water bottle']
      }
    };
  }

  // Additional city itineraries for all major Indian destinations
  getDetailedDelhiItinerary() {
    return {
      title: "3-Day Delhi Capital Heritage Tour",
      destination: "Delhi", days: 3, tourioRating: 4.5,
      dailyItinerary: [{
        day: 1, date: this.getDateForDay(1), title: "Old Delhi Walk",
        activities: [{
          id: "d1-1", name: "🏰 9:00 AM - Red Fort", type: "heritage",
          description: "Mughal fortress with red walls", startTime: "09:00", endTime: "11:30",
          cost: 500, rating: 4.6, tips: ["Audio guide recommended"]
        }]
      }], carbonFootprint: { total: 16.8, ecoTips: ['🚇 Use Metro'] }
    };
  }

  getDetailedMumbaiItinerary() {
    return {
      title: "3-Day Mumbai City of Dreams", destination: "Mumbai", days: 3, tourioRating: 4.4,
      dailyItinerary: [{ day: 1, date: this.getDateForDay(1), title: "South Mumbai",
        activities: [{ id: "m1-1", name: "🏛️ 8:00 AM - Gateway of India", type: "heritage",
          description: "Iconic arch monument", startTime: "08:00", cost: 100, rating: 4.7 }]
      }], carbonFootprint: { total: 19.6, ecoTips: ['🚆 Use trains'] }
    };
  }

  // Placeholder methods for all other cities with proper structure
  getDetailedUdaipurItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Udaipur Lakes", destination: "Udaipur" }; }
  getDetailedMysoreItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Mysore Palace", destination: "Mysore" }; }
  getDetailedManaliItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "4-Day Manali Adventure", destination: "Manali" }; }
  getDetailedDarjeelingItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Darjeeling Tea", destination: "Darjeeling" }; }
  getDetailedGangtokItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Gangtok Monasteries", destination: "Gangtok" }; }
  getDetailedMunnarItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Munnar Tea Hills", destination: "Munnar" }; }
  getDetailedRishikeshItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Rishikesh Yoga", destination: "Rishikesh" }; }
  getDetailedHaridwarItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "2-Day Haridwar Pilgrimage", destination: "Haridwar" }; }
  getDetailedBodhGayaItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "2-Day Bodh Gaya Buddhist", destination: "Bodh Gaya" }; }
  getDetailedAmritsarItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "2-Day Amritsar Golden Temple", destination: "Amritsar" }; }
  getDetailedKolkataItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Kolkata Culture", destination: "Kolkata" }; }
  getDetailedGoaItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "4-Day Goa Beaches", destination: "Goa" }; }
  getDetailedHyderabadItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Hyderabad Biryani", destination: "Hyderabad" }; }
  getDetailedBangaloreItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Bangalore Gardens", destination: "Bangalore" }; }
  getDetailedChennaiItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Chennai Temples", destination: "Chennai" }; }
  getDetailedAhmedabadItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "3-Day Ahmedabad Heritage", destination: "Ahmedabad" }; }
  getDetailedAjmerItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "2-Day Ajmer Sufi", destination: "Ajmer" }; }
  getDetailedKeralaItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "4-Day Kerala Backwaters", destination: "Kerala" }; }
  getDetailedLadakhItinerary() { const base = this.getDetailedShimlaItinerary(); return { ...base, title: "5-Day Ladakh Adventure", destination: "Ladakh" }; }

  getDetailedShimlaItinerary() {
    return {
      title: "3-Day Shimla Hill Station Adventure",
      origin: "Delhi",
      destination: "Shimla",
      days: 3,
      budget: 25000,
      tourioRating: 4.7,
      totalCost: 22500,
      carbonFootprint: 18.5,
      dailyItinerary: [
        {
          day: 1,
          date: this.getDateForDay(1),
          title: "Arrival & Mall Road Exploration",
          activities: [
            {
              id: "1-1",
              name: "Hotel Check-in & Freshen Up",
              type: "accommodation",
              description: "Check into your cozy hill station hotel with mountain views",
              startTime: "12:00",
              endTime: "13:00",
              duration: 60,
              cost: 0,
              rating: 4.5,
              coordinates: { lat: 31.1048, lng: 77.1734 },
              safetyRating: 9.5,
              tips: ["Keep valuables in hotel safe", "Ask for room with valley view", "Get local area map from reception"]
            },
            {
              id: "1-2", 
              name: "Mall Road Walking Tour",
              type: "heritage",
              description: "Explore the famous pedestrian street with colonial architecture, shops, and cafes. Perfect for acclimatization to the altitude.",
              startTime: "14:00",
              endTime: "17:00",
              duration: 180,
              cost: 500,
              rating: 4.6,
              coordinates: { lat: 31.1038, lng: 77.1734 },
              safetyRating: 9.8,
              tips: ["Wear comfortable walking shoes", "Bargain politely at local shops", "Try local Himachali snacks"]
            },
            {
              id: "1-3",
              name: "Christ Church Visit",
              type: "heritage",
              description: "Visit the beautiful neo-Gothic church from 1857, one of the oldest churches in North India.",
              startTime: "17:30",
              endTime: "18:30",
              duration: 60,
              cost: 0,
              rating: 4.4,
              coordinates: { lat: 31.1038, lng: 77.1734 },
              safetyRating: 9.7,
              tips: ["Maintain silence inside", "Photography may be restricted", "Best photos during golden hour"]
            }
          ],
          totalCost: 500,
          totalDuration: 300
        },
        {
          day: 2,
          date: this.getDateForDay(2),
          title: "Adventure & Nature Day",
          activities: [
            {
              id: "2-1",
              name: "Jakhu Temple Trek",
              type: "spiritual",
              description: "Trek to the highest peak in Shimla to visit the ancient Hanuman temple. Panoramic views of the city and surrounding mountains.",
              startTime: "08:00",
              endTime: "11:00",
              duration: 180,
              cost: 100,
              rating: 4.8,
              coordinates: { lat: 31.1055, lng: 77.1827 },
              safetyRating: 8.9,
              tips: ["Start early to avoid crowds", "Carry water and snacks", "Beware of monkeys - don't feed them"]
            },
            {
              id: "2-2",
              name: "Kufri Adventure Sports",
              type: "adventure",
              description: "Experience horse riding, yak rides, and visit the Himalayan Nature Park. Great for adventure enthusiasts.",
              startTime: "13:00",
              endTime: "17:00",
              duration: 240,
              cost: 1200,
              rating: 4.5,
              coordinates: { lat: 31.0959, lng: 77.2643 },
              safetyRating: 8.8,
              tips: ["Book activities in advance", "Carry warm clothes", "Follow safety instructions strictly"]
            },
            {
              id: "2-3",
              name: "Local Himachali Dinner",
              type: "food",
              description: "Traditional Himachali cuisine at a local restaurant. Try specialties like Chana Madra, Siddu, and Himachali Trout.",
              startTime: "19:00",
              endTime: "21:00",
              duration: 120,
              cost: 800,
              rating: 4.7,
              coordinates: { lat: 31.1040, lng: 77.1725 },
              safetyRating: 9.2,
              tips: ["Try the local apple wine", "Ask for spice level preference", "Book popular restaurants in advance"]
            }
          ],
          totalCost: 2100,
          totalDuration: 540
        },
        {
          day: 3,
          date: this.getDateForDay(3),
          title: "Heritage & Departure",
          activities: [
            {
              id: "3-1",
              name: "Viceregal Lodge Tour",
              type: "heritage",
              description: "Explore the former summer residence of British Viceroys, now Indian Institute of Advanced Study. Magnificent architecture and gardens.",
              startTime: "09:00",
              endTime: "11:30",
              duration: 150,
              cost: 200,
              rating: 4.9,
              coordinates: { lat: 31.0975, lng: 77.1712 },
              safetyRating: 9.6,
              tips: ["Book guided tour for better insights", "Photography restricted in some areas", "Beautiful gardens for photos"]
            },
            {
              id: "3-2",
              name: "Shimla State Museum",
              type: "heritage",
              description: "Discover Himachal's rich cultural heritage through artifacts, sculptures, and historical exhibits.",
              startTime: "12:00",
              endTime: "13:30",
              duration: 90,
              cost: 50,
              rating: 4.3,
              coordinates: { lat: 31.1021, lng: 77.1734 },
              safetyRating: 9.4,
              tips: ["Entry fee required", "Photography may have extra charges", "Audio guide available"]
            },
            {
              id: "3-3",
              name: "Shopping & Departure",
              type: "shopping",
              description: "Last-minute shopping for local handicrafts, woolen clothes, and famous Himachali apples before departure.",
              startTime: "14:00",
              endTime: "16:00",
              duration: 120,
              cost: 1500,
              rating: 4.2,
              coordinates: { lat: 31.1035, lng: 77.1730 },
              safetyRating: 9.1,
              tips: ["Bargain politely", "Check for authenticity certificates", "Pack fragile items carefully"]
            }
          ],
          totalCost: 1750,
          totalDuration: 360
        }
      ],
      weatherForecast: [
        {
          day: 1,
          date: this.getDateForDay(1),
          condition: "Partly Cloudy",
          temperature: { high: 22, low: 12 },
          humidity: 65,
          rainfall: 0,
          windSpeed: 8,
          uvIndex: 6,
          sunrise: "06:15",
          sunset: "19:45"
        },
        {
          day: 2,
          date: this.getDateForDay(2),
          condition: "Sunny",
          temperature: { high: 24, low: 14 },
          humidity: 55,
          rainfall: 0,
          windSpeed: 5,
          uvIndex: 7,
          sunrise: "06:16",
          sunset: "19:44"
        },
        {
          day: 3,
          date: this.getDateForDay(3),
          condition: "Light Clouds",
          temperature: { high: 20, low: 11 },
          humidity: 70,
          rainfall: 5,
          windSpeed: 12,
          uvIndex: 5,
          sunrise: "06:17",
          sunset: "19:43"
        }
      ],
      safetyAlerts: [
        { type: 'safe', icon: '✅', message: 'All destinations are currently safe for tourists' },
        { type: 'weather', icon: '🌦️', message: 'Light rainfall possible on Day 3 - carry umbrella' },
        { type: 'traffic', icon: '🚗', message: 'Heavy traffic expected on Mall Road during weekend evenings' },
        { type: 'wildlife', icon: '🐒', message: 'Monkeys at Jakhu Temple - avoid feeding and secure belongings' }
      ],
      localTips: [
        { category: 'Transport', tip: 'Use local buses or book a taxi for Kufri trip - negotiate fare beforehand' },
        { category: 'Food', tip: 'Try local specialties: Chana Madra, Siddu, and Himachali Trout at authentic restaurants' },
        { category: 'Shopping', tip: 'Best buys: Himachali caps, woolen shawls, local honey, and fresh apples' },
        { category: 'Safety', tip: 'Altitude is 2200m - stay hydrated and take it easy on first day' },
        { category: 'Best Time', tip: 'Visit Mall Road early morning or evening for best experience and photos' }
      ],
      carbonFootprint: {
        total: 18.5,
        breakdown: {
          transport: 12.8,
          accommodation: 3.2,
          food: 1.8,
          activities: 0.7
        },
        treesToOffset: 1,
        ecoTips: [
          '💚 Use public transport or shared taxis to reduce emissions by 40%',
          '♻️ Choose eco-friendly hotels that use solar heating',
          '🌱 Support local communities by buying from local vendors'
        ]
      }
    };
  }

  getDateForDay(day) {
    const today = new Date();
    const targetDate = new Date(today.getTime() + (day * 24 * 60 * 60 * 1000));
    return targetDate.toLocaleDateString('en-GB');
  }

  validateForm(data) {
    if (!data.origin || !data.destination) {
      this.showError('Please enter both origin and destination.');
      return false;
    }
    
    if (data.origin.toLowerCase() === data.destination.toLowerCase()) {
      this.showError('Origin and destination cannot be the same.');
      return false;
    }
    
    if (!data.days || data.days < 1 || data.days > 30) {
      this.showError('Please enter a valid number of days (1-30).');
      return false;
    }
    
    return true;
  }

  async generateItinerary(data) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.itineraryData = this.generateMockItinerary(data);
    return this.itineraryData;
  }

  generateMockItinerary(data) {
    const days = parseInt(data.days);
    const budget = parseInt(data.budget);
    
    return {
      title: `${days}-Day ${data.destination} Adventure`,
      origin: data.origin,
      destination: data.destination,
      days: days,
      budget: budget,
      tourioRating: 4.8,
      totalCost: Math.min(budget, budget * 0.9),
      carbonFootprint: 2.4
    };
  }

  setLoadingState(button, isLoading) {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  showError(message) {
    alert(message);
  }

  // Real attractions database for authentic location-specific activities
  getRealAttractions(destination, timeOfDay, interests) {
    const attractionDatabase = {
      'Delhi': {
        morning: [
          { name: 'Lal Qila (Red Fort)', type: 'historical', description: 'UNESCO World Heritage Site, Mughal architecture masterpiece', duration: '2-3 hours', cost: 50, rating: 4.7, safetyRating: 9.5, tips: ['Carry ID proof', 'Audio guide recommended', 'Photography restrictions inside', 'Best visited early morning'] },
          { name: 'Jama Masjid', type: 'religious', description: 'Largest mosque in India, stunning Mughal architecture', duration: '1-2 hours', cost: 0, rating: 4.6, safetyRating: 9.3, tips: ['Remove shoes before entering', 'Dress modestly', 'Maintain silence inside', 'Climb minaret for city views'] },
          { name: 'Raj Ghat', type: 'memorial', description: 'Memorial to Mahatma Gandhi, peaceful garden setting', duration: '1 hour', cost: 0, rating: 4.4, safetyRating: 9.8, tips: ['Maintain silence and respect', 'Remove shoes before memorial', 'Beautiful gardens for walk', 'Early morning is peaceful'] },
          { name: 'Lotus Temple', type: 'religious', description: 'Bahá\'í House of Worship, unique lotus-shaped architecture', duration: '1-2 hours', cost: 0, rating: 4.8, safetyRating: 9.7, tips: ['Maintain silence inside', 'No photography inside temple', 'Beautiful gardens surrounding', 'Peaceful meditation spot'] },
          { name: 'Akshardham Temple', type: 'religious', description: 'Modern Hindu temple complex, stunning architecture', duration: '3-4 hours', cost: 250, rating: 4.9, safetyRating: 9.6, tips: ['No electronic items allowed', 'Book tickets online', 'Water and light show in evening', 'Plan for full morning visit'] }
        ],
        afternoon: [
          { name: 'India Gate', type: 'monument', description: 'War memorial and iconic Delhi landmark', duration: '1-2 hours', cost: 0, rating: 4.5, safetyRating: 9.2, tips: ['Great for evening visit too', 'Street food vendors nearby', 'Perfect for photography', 'Watch out for crowds'] },
          { name: 'Sansad Bhawan (Parliament House)', type: 'government', description: 'Seat of Indian Parliament, colonial architecture', duration: '1 hour', cost: 0, rating: 4.3, safetyRating: 9.5, tips: ['Exterior viewing only', 'Photography from distance', 'Combine with nearby attractions', 'Security checks in area'] },
          { name: 'Humayun\'s Tomb', type: 'historical', description: 'UNESCO World Heritage Site, Mughal garden tomb', duration: '2-3 hours', cost: 40, rating: 4.8, safetyRating: 9.4, tips: ['Beautiful gardens and architecture', 'Precursor to Taj Mahal design', 'Best lighting for photography', 'Carry water bottle'] },
          { name: 'Qutub Minar', type: 'historical', description: 'UNESCO World Heritage Site, tallest brick minaret', duration: '2-3 hours', cost: 40, rating: 4.7, safetyRating: 9.3, tips: ['Cannot climb the minaret', 'Complex has multiple monuments', 'Iron Pillar is highlight', 'Guided tour recommended'] },
          { name: 'National Museum', type: 'museum', description: 'Premier museum showcasing Indian heritage', duration: '2-3 hours', cost: 20, rating: 4.5, safetyRating: 9.6, tips: ['Rich collection of artifacts', 'Audio guide available', 'Photography charges extra', 'Plan sufficient time'] }
        ],
        evening: [
          { name: 'Connaught Place', type: 'shopping', description: 'Central business district, shopping and dining hub', duration: '2-3 hours', cost: 0, rating: 4.4, safetyRating: 9.1, tips: ['Circular market layout', 'Metro connectivity good', 'Street food and restaurants', 'Watch for overpricing'] },
          { name: 'Chandni Chowk', type: 'market', description: 'Historic market, street food and shopping paradise', duration: '2-3 hours', cost: 0, rating: 4.6, safetyRating: 8.8, tips: ['Try famous street food', 'Bargain for good prices', 'Very crowded area', 'Keep belongings safe'] },
          { name: 'Karol Bagh Market', type: 'shopping', description: 'Popular shopping destination for clothes and accessories', duration: '2-3 hours', cost: 0, rating: 4.3, safetyRating: 9.0, tips: ['Good for wedding shopping', 'Reasonable prices', 'Try local snacks', 'Evening is less crowded'] },
          { name: 'Khan Market', type: 'shopping', description: 'Upscale market with cafes, bookstores, and boutiques', duration: '2-3 hours', cost: 0, rating: 4.5, safetyRating: 9.2, tips: ['More expensive but quality goods', 'Great cafes and restaurants', 'Book shopping at Bahrisons', 'Less haggling required'] },
          { name: 'Dilli Haat', type: 'cultural', description: 'Craft bazaar showcasing Indian handicrafts and food', duration: '2-3 hours', cost: 30, rating: 4.4, safetyRating: 9.3, tips: ['Authentic handicrafts from all states', 'Fixed prices, no bargaining', 'Cultural food court', 'Regular craft exhibitions'] }
        ]
      },
      'Mumbai': {
        morning: [
          { name: 'Gateway of India', type: 'monument', description: 'Iconic arch monument overlooking Arabian Sea', duration: '1-2 hours', cost: 0, rating: 4.5, safetyRating: 9.2, tips: ['Early morning less crowded', 'Ferry to Elephanta from here', 'Street vendors around', 'Beautiful sunrise views'] },
          { name: 'Elephanta Caves', type: 'historical', description: 'UNESCO World Heritage Site, ancient rock-cut caves', duration: '4-5 hours', cost: 190, rating: 4.7, safetyRating: 9.0, tips: ['Take ferry from Gateway', 'Wear comfortable shoes', 'Carry water and snacks', 'Audio guide recommended'] },
          { name: 'Chhatrapati Shivaji Terminus', type: 'historical', description: 'UNESCO World Heritage Site, Victorian Gothic architecture', duration: '1 hour', cost: 0, rating: 4.6, safetyRating: 9.4, tips: ['Functioning railway station', 'Beautiful architecture to admire', 'Very crowded during rush hours', 'Photography from outside'] },
          { name: 'Sanjay Gandhi National Park', type: 'nature', description: 'Urban national park with Kanheri Caves', duration: '4-5 hours', cost: 46, rating: 4.3, safetyRating: 8.9, tips: ['Entry from Borivali', 'Lion and tiger safari available', 'Kanheri Caves inside park', 'Carry insect repellent'] },
          { name: 'Siddhivinayak Temple', type: 'religious', description: 'Famous Ganesha temple, spiritual significance', duration: '1-2 hours', cost: 0, rating: 4.8, safetyRating: 9.1, tips: ['Very crowded on Tuesdays', 'Early morning or late evening better', 'Remove leather items', 'Long queues expected'] }
        ],
        afternoon: [
          { name: 'Marine Drive', type: 'scenic', description: 'Queen\'s Necklace, iconic seafront promenade', duration: '2-3 hours', cost: 0, rating: 4.7, safetyRating: 9.3, tips: ['Perfect for walking and jogging', 'Beautiful sunset views', 'Street food available', 'Art Deco buildings nearby'] },
          { name: 'Chowpatty Beach', type: 'beach', description: 'Popular beach with street food and sunset views', duration: '2-3 hours', cost: 0, rating: 4.4, safetyRating: 8.7, tips: ['Famous for bhel puri', 'Sunset views are spectacular', 'Not for swimming', 'Try pav bhaji and kulfi'] },
          { name: 'Prince of Wales Museum', type: 'museum', description: 'Premier art and history museum in Mumbai', duration: '2-3 hours', cost: 70, rating: 4.5, safetyRating: 9.5, tips: ['Rich collection of artifacts', 'Beautiful Indo-Saracenic architecture', 'Photography charges extra', 'Audio guide available'] },
          { name: 'Hanging Gardens', type: 'park', description: 'Terraced gardens on Malabar Hill with city views', duration: '1-2 hours', cost: 0, rating: 4.2, safetyRating: 9.4, tips: ['Great city views', 'Sunset point nearby', 'Well-maintained gardens', 'Combine with Kamala Nehru Park'] },
          { name: 'Mani Bhavan', type: 'museum', description: 'Gandhi\'s former residence, now a museum', duration: '1-2 hours', cost: 5, rating: 4.4, safetyRating: 9.6, tips: ['Gandhi\'s Mumbai home', 'Historical significance', 'Photo gallery and library', 'Peaceful environment'] }
        ],
        evening: [
          { name: 'Colaba Causeway', type: 'shopping', description: 'Bustling street market and shopping area', duration: '2-3 hours', cost: 0, rating: 4.3, safetyRating: 8.9, tips: ['Great for bargain shopping', 'Variety of items available', 'Try Leopold Cafe nearby', 'Bargain heavily for best prices'] },
          { name: 'Linking Road', type: 'shopping', description: 'Popular shopping street in Bandra', duration: '2-3 hours', cost: 0, rating: 4.4, safetyRating: 9.0, tips: ['Fashion and accessories hub', 'Reasonable prices', 'Evening is cooler', 'Try street food'] },
          { name: 'Juhu Beach', type: 'beach', description: 'Famous beach with street food and sunset views', duration: '2-3 hours', cost: 0, rating: 4.2, safetyRating: 8.8, tips: ['Famous for pav bhaji', 'Bollywood celebrity homes nearby', 'Sunset views', 'Crowded on weekends'] },
          { name: 'Bandra-Worli Sea Link', type: 'scenic', description: 'Cable-stayed bridge with stunning architecture', duration: '1 hour', cost: 75, rating: 4.6, safetyRating: 9.5, tips: ['Drive or cab ride across', 'Beautiful night illumination', 'Great views of Mumbai skyline', 'Photography from Bandra fort'] },
          { name: 'Crawford Market', type: 'market', description: 'Historic market for fruits, vegetables, and spices', duration: '2-3 hours', cost: 0, rating: 4.1, safetyRating: 8.9, tips: ['Historic British-era market', 'Fresh fruits and dry fruits', 'Spice section is aromatic', 'Bargain for good deals'] }
        ]
      },
      'Jaipur': {
        morning: [
          { name: 'Amber Fort (Amer Fort)', type: 'historical', description: 'Magnificent hilltop fort with stunning architecture', duration: '3-4 hours', cost: 100, rating: 4.8, safetyRating: 9.2, tips: ['Elephant ride to fort available', 'Light and sound show in evening', 'Wear comfortable shoes', 'Photography allowed in most areas'] },
          { name: 'Jaigarh Fort', type: 'historical', description: 'Victory fort with world\'s largest cannon on wheels', duration: '2-3 hours', cost: 35, rating: 4.6, safetyRating: 9.1, tips: ['Great views of Amber Fort', 'Jaivana cannon is main attraction', 'Less crowded than Amber', 'Combine with Amber Fort visit'] },
          { name: 'Nahargarh Fort', type: 'historical', description: 'Tiger fort with panoramic city views', duration: '2-3 hours', cost: 30, rating: 4.5, safetyRating: 9.0, tips: ['Best sunset views in Jaipur', 'Restaurant inside fort', 'Great for photography', 'Drive or trek up the hill'] },
          { name: 'Galtaji Temple', type: 'religious', description: 'Ancient Hindu pilgrimage site with natural springs', duration: '2-3 hours', cost: 0, rating: 4.4, safetyRating: 8.8, tips: ['Also called Monkey Temple', 'Many monkeys around', 'Natural water springs', 'Peaceful morning visit'] },
          { name: 'Sisodia Rani Garden', type: 'garden', description: 'Beautiful Mughal-style garden with fountains', duration: '1-2 hours', cost: 20, rating: 4.2, safetyRating: 9.3, tips: ['Beautiful landscaped gardens', 'Painted pavilions', 'Peaceful environment', 'Best in winter months'] }
        ],
        afternoon: [
          { name: 'City Palace', type: 'palace', description: 'Royal residence with museums and courtyards', duration: '2-3 hours', cost: 200, rating: 4.7, safetyRating: 9.4, tips: ['Still houses royal family', 'Multiple palaces and museums', 'Audio guide recommended', 'Photography charges extra'] },
          { name: 'Hawa Mahal', type: 'palace', description: 'Palace of Winds, iconic pink sandstone facade', duration: '1-2 hours', cost: 50, rating: 4.6, safetyRating: 9.5, tips: ['Best viewed from outside first', 'Internal structure different', 'Early morning best light', 'Combine with City Palace'] },
          { name: 'Jantar Mantar', type: 'astronomical', description: 'UNESCO World Heritage Site, astronomical observatory', duration: '1-2 hours', cost: 40, rating: 4.5, safetyRating: 9.6, tips: ['Astronomical instruments from 1734', 'Guide explains working', 'UNESCO World Heritage Site', 'Fascinating for science lovers'] },
          { name: 'Albert Hall Museum', type: 'museum', description: 'Oldest museum in Rajasthan with Indo-Saracenic architecture', duration: '2-3 hours', cost: 40, rating: 4.4, safetyRating: 9.5, tips: ['Beautiful architecture', 'Egyptian mummy on display', 'Large collection of artifacts', 'Evening lighting is beautiful'] },
          { name: 'Jal Mahal', type: 'palace', description: 'Water palace in the middle of Man Sagar Lake', duration: '1 hour', cost: 0, rating: 4.3, safetyRating: 9.2, tips: ['Can only view from outside', 'Beautiful reflection in water', 'Sunset views are spectacular', 'Boat rides not available'] }
        ],
        evening: [
          { name: 'Johari Bazaar', type: 'shopping', description: 'Famous jewelry market in the heart of old city', duration: '2-3 hours', cost: 0, rating: 4.5, safetyRating: 8.9, tips: ['World-famous for jewelry', 'Kundan and enamel work', 'Bargain heavily', 'Get authenticity certificates'] },
          { name: 'Bapu Bazaar', type: 'shopping', description: 'Traditional market for textiles and handicrafts', duration: '2-3 hours', cost: 0, rating: 4.4, safetyRating: 8.8, tips: ['Famous for textiles', 'Rajasthani handicrafts', 'Reasonable prices', 'Try local snacks nearby'] },
          { name: 'Chokhi Dhani', type: 'cultural', description: 'Ethnic village resort showcasing Rajasthani culture', duration: '3-4 hours', cost: 800, rating: 4.6, safetyRating: 9.3, tips: ['Cultural evening with dinner', 'Folk dances and music', 'Traditional Rajasthani experience', 'Book in advance'] },
          { name: 'Tripolia Bazaar', type: 'shopping', description: 'Traditional market known for lac jewelry and bangles', duration: '2-3 hours', cost: 0, rating: 4.2, safetyRating: 8.9, tips: ['Famous for lac bangles', 'Iron and brass work', 'Part of old walled city', 'Combine with other bazaars'] },
          { name: 'Central Park', type: 'park', description: 'Large park perfect for evening walks and relaxation', duration: '1-2 hours', cost: 0, rating: 4.1, safetyRating: 9.4, tips: ['Jogging and walking tracks', 'Musical fountain', 'Good for families', 'Evening is cooler'] }
        ]
      },
      'Shimla': {
        morning: [
          { name: 'Jakhoo Temple', type: 'religious', description: 'Ancient Hanuman temple with panoramic Himalayan views', duration: '2-3 hours', cost: 0, rating: 4.7, safetyRating: 8.9, tips: ['Highest point in Shimla', 'Beware of monkeys', 'Trek or drive up', 'Stunning mountain views'] },
          { name: 'Christ Church', type: 'religious', description: 'Second oldest church in North India, neo-Gothic architecture', duration: '1 hour', cost: 0, rating: 4.5, safetyRating: 9.7, tips: ['Beautiful stained glass windows', 'Historical significance', 'Photography allowed outside', 'Peaceful atmosphere'] },
          { name: 'Viceregal Lodge', type: 'historical', description: 'Former British Viceroy residence, now Indian Institute of Advanced Study', duration: '2-3 hours', cost: 30, rating: 4.8, safetyRating: 9.6, tips: ['Guided tours available', 'Beautiful architecture and gardens', 'Historical significance', 'Photography restrictions inside'] },
          { name: 'Summer Hill', type: 'scenic', description: 'Beautiful hill station with lush green surroundings', duration: '2-3 hours', cost: 0, rating: 4.3, safetyRating: 9.2, tips: ['Potter\'s Hill nearby', 'Toy train station', 'University campus', 'Peaceful walks'] },
          { name: 'Annandale', type: 'recreational', description: 'Flat terrain ideal for golf, cricket and polo', duration: '2-3 hours', cost: 0, rating: 4.2, safetyRating: 9.4, tips: ['Army Heritage Museum nearby', 'Golf course available', 'Helicopter rides sometimes', 'Great for picnics'] }
        ],
        afternoon: [
          { name: 'The Mall Road', type: 'shopping', description: 'Main shopping street with colonial architecture', duration: '2-3 hours', cost: 0, rating: 4.6, safetyRating: 9.8, tips: ['No vehicles allowed', 'Colonial architecture', 'Shopping and dining', 'Heart of Shimla'] },
          { name: 'The Ridge', type: 'scenic', description: 'Large open space in heart of Shimla with mountain views', duration: '1-2 hours', cost: 0, rating: 4.5, safetyRating: 9.7, tips: ['Central location', 'Events and festivals', 'Great mountain views', 'Christ Church nearby'] },
          { name: 'Scandal Point', type: 'scenic', description: 'Famous meeting point with valley views', duration: '1 hour', cost: 0, rating: 4.3, safetyRating: 9.5, tips: ['Historic significance', 'Meeting point for tourists', 'Good views of valleys', 'Part of Mall Road walk'] },
          { name: 'Himachal State Museum', type: 'museum', description: 'Rich collection of sculptures, paintings, and artifacts', duration: '2-3 hours', cost: 15, rating: 4.4, safetyRating: 9.6, tips: ['Himachali culture and history', 'Bronze sculptures', 'Pahari paintings', 'Colonial building'] },
          { name: 'Kalka-Shimla Toy Train', type: 'experience', description: 'UNESCO World Heritage narrow gauge railway', duration: '5-6 hours', cost: 1000, rating: 4.9, safetyRating: 9.3, tips: ['Book in advance', 'Scenic mountain journey', 'UNESCO World Heritage', 'Multiple tunnels and bridges'] }
        ],
        evening: [
          { name: 'Lakkar Bazaar', type: 'shopping', description: 'Famous wooden handicrafts and souvenirs market', duration: '2-3 hours', cost: 0, rating: 4.4, safetyRating: 9.2, tips: ['Wooden handicrafts specialty', 'Walking sticks famous', 'Bargain for good prices', 'Local Himachali products'] },
          { name: 'Lower Bazaar', type: 'shopping', description: 'Local market for woolen clothes and local products', duration: '2-3 hours', cost: 0, rating: 4.2, safetyRating: 9.1, tips: ['Cheaper than Mall Road', 'Woolen clothes', 'Local products', 'More authentic shopping'] },
          { name: 'Gaiety Theatre', type: 'cultural', description: 'Historic theatre hosting cultural performances', duration: '2-3 hours', cost: 200, rating: 4.5, safetyRating: 9.5, tips: ['Check show timings', 'Historical theatre', 'Cultural performances', 'Book tickets in advance'] },
          { name: 'Café Shimla Times', type: 'dining', description: 'Popular café with mountain views and local cuisine', duration: '1-2 hours', cost: 500, rating: 4.3, safetyRating: 9.4, tips: ['Great mountain views', 'Local and continental food', 'Cozy atmosphere', 'Good for evening relaxation'] },
          { name: 'Mall Road Evening Walk', type: 'leisure', description: 'Peaceful evening stroll with mountain air', duration: '1-2 hours', cost: 0, rating: 4.4, safetyRating: 9.6, tips: ['Perfect for relaxation', 'Mountain fresh air', 'People watching', 'Beautiful colonial architecture'] }
        ]
      },
      'Goa': {
        morning: [
          { name: 'Basilica of Bom Jesus', type: 'religious', description: 'UNESCO World Heritage Site, holds St. Francis Xavier\'s remains', duration: '1-2 hours', cost: 0, rating: 4.7, safetyRating: 9.4, tips: ['UNESCO World Heritage Site', 'Photography allowed outside', 'Dress modestly', 'Historical significance'] },
          { name: 'Se Cathedral', type: 'religious', description: 'One of the largest churches in Asia, Portuguese architecture', duration: '1 hour', cost: 0, rating: 4.6, safetyRating: 9.5, tips: ['Largest church in Asia', 'Beautiful Portuguese architecture', 'Golden Bell famous', 'Peaceful atmosphere'] },
          { name: 'Fort Aguada', type: 'historical', description: '17th-century Portuguese fort with lighthouse', duration: '2-3 hours', cost: 25, rating: 4.5, safetyRating: 9.1, tips: ['Portuguese fort from 1612', 'Lighthouse and jail', 'Great sea views', 'Sunset point nearby'] },
          { name: 'Dudhsagar Falls', type: 'nature', description: 'Four-tiered waterfall, one of India\'s tallest', duration: '6-7 hours', cost: 30, rating: 4.8, safetyRating: 8.7, tips: ['Best during monsoon', 'Jeep safari required', 'Trek to base of falls', 'Carry water and snacks'] },
          { name: 'Spice Plantation Tour', type: 'nature', description: 'Guided tour through aromatic spice gardens', duration: '3-4 hours', cost: 600, rating: 4.4, safetyRating: 9.0, tips: ['Learn about spices', 'Traditional lunch included', 'Elephant rides available', 'Buy fresh spices'] }
        ],
        afternoon: [
          { name: 'Calangute Beach', type: 'beach', description: 'Queen of beaches, water sports and beach activities', duration: '3-4 hours', cost: 0, rating: 4.3, safetyRating: 8.9, tips: ['Water sports available', 'Beach shacks for food', 'Crowded but lively', 'Lifeguards on duty'] },
          { name: 'Baga Beach', type: 'beach', description: 'Famous for nightlife, water sports, and beach shacks', duration: '3-4 hours', cost: 0, rating: 4.4, safetyRating: 8.8, tips: ['Popular for nightlife', 'Water sports hub', 'Famous beach shacks', 'Saturday night market nearby'] },
          { name: 'Anjuna Beach', type: 'beach', description: 'Hippie culture hub with Wednesday flea market', duration: '3-4 hours', cost: 0, rating: 4.2, safetyRating: 8.7, tips: ['Famous flea market on Wednesday', 'Hippie culture heritage', 'Red cliffs and rocks', 'Sunset views'] },
          { name: 'Old Goa Churches', type: 'historical', description: 'Collection of beautiful Portuguese-era churches', duration: '2-3 hours', cost: 0, rating: 4.6, safetyRating: 9.3, tips: ['Multiple churches in area', 'UNESCO World Heritage Sites', 'Portuguese architecture', 'Historical walking tour'] },
          { name: 'Panaji City Tour', type: 'cultural', description: 'Capital city with Portuguese colonial architecture', duration: '2-3 hours', cost: 0, rating: 4.3, safetyRating: 9.2, tips: ['Latin Quarter in Fontainhas', 'Colorful Portuguese houses', 'River cruise available', 'Local markets'] }
        ],
        evening: [
          { name: 'Sunset at Vagator Beach', type: 'scenic', description: 'Dramatic cliffs and stunning sunset views', duration: '2-3 hours', cost: 0, rating: 4.7, safetyRating: 8.6, tips: ['Best sunset views in Goa', 'Dramatic red cliffs', 'Chapora Fort nearby', 'Less crowded than other beaches'] },
          { name: 'Saturday Night Market (Arpora)', type: 'shopping', description: 'Vibrant night market with food, drinks, and shopping', duration: '3-4 hours', cost: 0, rating: 4.5, safetyRating: 8.9, tips: ['Open only on Saturdays', 'Live music and entertainment', 'International food court', 'Unique shopping items'] },
          { name: 'Casino Cruise', type: 'entertainment', description: 'Floating casinos on Mandovi River', duration: '4-5 hours', cost: 2000, rating: 4.2, safetyRating: 9.1, tips: ['Age limit 21+', 'Dinner and entertainment included', 'Dress code required', 'Book in advance'] },
          { name: 'Tito\'s Lane (Baga)', type: 'nightlife', description: 'Famous nightlife district with clubs and bars', duration: '3-4 hours', cost: 1000, rating: 4.1, safetyRating: 8.5, tips: ['Famous nightclub', 'Entry charges vary', 'Peak season crowded', 'Age verification required'] },
          { name: 'Beach Shack Dinner', type: 'dining', description: 'Fresh seafood at beachside restaurants', duration: '2-3 hours', cost: 800, rating: 4.6, safetyRating: 9.0, tips: ['Fresh seafood specialty', 'Beachside dining', 'Try local fish curry', 'Romantic sunset dining'] }
        ]
      },
      'Varanasi': {
        morning: [
          { name: 'Ghats of Varanasi', type: 'religious', description: 'Sacred riverfront steps along the Ganges River', duration: '2-3 hours', cost: 0, rating: 4.8, safetyRating: 9.2, tips: ['Dashashwamedh Ghat for Ganga Aarti', 'Assi Ghat for morning dip', 'Photography best at sunrise', 'Respect religious customs'] },
          { name: 'Kashi Vishwanath Temple', type: 'religious', description: 'Famous Hindu temple dedicated to Lord Shiva', duration: '1-2 hours', cost: 0, rating: 4.7, safetyRating: 9.0, tips: ['Silver temple architecture', 'Security check is strict', 'Best visited early morning', 'Dress modestly and remove shoes'] },
          { name: 'Sarnath', type: 'historical', description: 'Buddhist pilgrimage site where Buddha gave his first sermon', duration: '3-4 hours', cost: 360, rating: 4.6, safetyRating: 9.3, tips: ['Dhamek Stupa and Ashoka Pillar', 'Archaeological Museum on site', 'Peaceful meditation environment', 'Buddhist temples to explore'] },
          { name: 'Banaras Hindu University', type: 'educational', description: 'Prestigious university campus with beautiful architecture', duration: '2-3 hours', cost: 0, rating: 4.3, safetyRating: 9.4, tips: ['Scenic campus with gardens', 'Bharat Kala Bhavan Museum', 'Architecture worth exploring', 'Art and sculpture collections'] },
          { name: 'Tulsi Manas Temple', type: 'religious', description: 'Temple dedicated to Lord Rama, built with white marble', duration: '1 hour', cost: 0, rating: 4.4, safetyRating: 9.1, tips: ['White marble architecture', 'Dedicated to Lord Rama', 'Peaceful environment', 'Near Hanuman Ghat'] }
        ],
        afternoon: [
          { name: 'Boat Ride on Ganges', type: 'experience', description: 'Scenic boat ride along the sacred Ganges River', duration: '1-2 hours', cost: 400, rating: 4.5, safetyRating: 8.8, tips: ['Sunrise or sunset recommended', 'Photography opportunities', 'Listen to boatmen stories', 'Life jackets provided'] },
          { name: 'Ramnagar Fort', type: 'historical', description: '18th-century fort and museum showcasing royal collections', duration: '2-3 hours', cost: 300, rating: 4.2, safetyRating: 9.0, tips: ['Royal museum with artifacts', 'Views of Varanasi from fort', 'Historical weapons and costumes', 'Photography allowed'] },
          { name: 'Bharat Kala Bhavan Museum', type: 'museum', description: 'University museum with art and archaeological collections', duration: '2 hours', cost: 20, rating: 4.3, safetyRating: 9.2, tips: ['Ancient sculptures and paintings', 'Bronze and stone artifacts', 'Miniature paintings collection', 'University campus location'] },
          { name: 'Durga Temple', type: 'religious', description: 'Unique temple shaped like a pentagon dedicated to Goddess Durga', duration: '1 hour', cost: 0, rating: 4.1, safetyRating: 8.9, tips: ['Distinctive architecture', 'Monkey population around', 'Photography from outside', 'Near Vishwanath Temple'] },
          { name: 'New Vishwanath Temple', type: 'religious', description: 'Modern temple with gold-plated spire and corridors', duration: '1-2 hours', cost: 0, rating: 4.5, safetyRating: 9.1, tips: ['Gold-plated temple structure', '1500+ idols in corridors', 'Modern architecture', 'Security check required'] }
        ],
        evening: [
          { name: 'Ganga Aarti at Dashashwamedh Ghat', type: 'religious', description: 'Evening ritual with prayers, lamps, and chanting', duration: '1-2 hours', cost: 0, rating: 4.9, safetyRating: 9.3, tips: ['Arrive early for good view', 'Photography allowed from distance', 'Ceremony at 7 PM daily', 'Spiritual and cultural experience'] },
          { name: 'Evening Ghat Walk', type: 'cultural', description: 'Stroll along the illuminated riverfront ghats', duration: '2 hours', cost: 0, rating: 4.6, safetyRating: 9.0, tips: ['Illuminated temples and ghats', 'Street food vendors', 'Cultural performances', 'Photography opportunities'] },
          { name: 'Street Food Tour', type: 'food', description: 'Tasting local delicacies like kachori, lassi, and sweets', duration: '2 hours', cost: 300, rating: 4.4, safetyRating: 8.7, tips: ['Try kachori and lassi', 'Local sweet shops', 'Street food safety', 'Evening is best time'] },
          { name: 'Handloom Shopping', type: 'shopping', description: 'Buying silk sarees and handicrafts from local markets', duration: '2-3 hours', cost: 0, rating: 4.3, safetyRating: 8.9, tips: ['Famous Banarasi silk sarees', 'Bargaining expected', 'Check authenticity', 'Popular markets: Vishwanath Gali'] },
          { name: 'Cultural Show', type: 'entertainment', description: 'Traditional music and dance performance', duration: '1.5 hours', cost: 500, rating: 4.5, safetyRating: 9.2, tips: ['Cultural centers and hotels', 'Classical music and dance', 'Advance booking recommended', 'Traditional costumes'] }
        ]
      },
      'Haridwar': {
        morning: [
          { name: 'Har Ki Pauri', type: 'religious', description: 'Sacred ghat on the banks of the Ganges River', duration: '2 hours', cost: 0, rating: 4.7, safetyRating: 9.1, tips: ['Holy dip in Ganges', 'Morning prayers', 'Photography best at sunrise', 'Crowded during festivals'] },
          { name: 'Mansa Devi Temple', type: 'religious', description: 'Temple dedicated to Goddess Mansa Devi, reached by cable car', duration: '2-3 hours', cost: 750, rating: 4.6, safetyRating: 8.9, tips: ['Cable car ride with views', 'Temple on Bilwa Parvat', 'Wish fulfillment temple', 'Security check at entry'] },
          { name: 'Chandi Devi Temple', type: 'religious', description: 'Ancient temple dedicated to Goddess Chandi Devi', duration: '3-4 hours', cost: 0, rating: 4.5, safetyRating: 8.8, tips: ['Trek or cable car access', 'Ancient temple with history', 'Scenic mountain views', 'Morning visit recommended'] },
          { name: 'Maya Devi Temple', type: 'religious', description: 'UNESCO World Heritage Site, birthplace of Buddha', duration: '1.5 hours', cost: 0, rating: 4.4, safetyRating: 9.0, tips: ['UNESCO World Heritage Site', 'Archaeological remains', 'Peaceful meditation spot', 'Historical significance'] },
          { name: 'Vaishno Devi Temple (Haridwar)', type: 'religious', description: 'Temple dedicated to Vaishno Devi, replica of main shrine', duration: '1 hour', cost: 0, rating: 4.3, safetyRating: 8.9, tips: ['Replica temple', 'Less crowded than Katra', 'Same deity worship', 'Quick darshan option'] }
        ],
        afternoon: [
          { name: 'ISKCON Temple', type: 'religious', description: 'Beautiful temple with Krishna idols and cultural activities', duration: '1.5 hours', cost: 0, rating: 4.5, safetyRating: 9.2, tips: ['Beautiful architecture', 'Evening aarti at 7 PM', 'Vegetarian food available', 'Peaceful environment'] },
          { name: 'Bharat Mata Temple', type: 'religious', description: 'Unique temple with map of undivided India', duration: '1 hour', cost: 0, rating: 4.2, safetyRating: 9.0, tips: ['Map of undivided India', 'No idol worship', 'Unique concept', 'Photography allowed'] },
          { name: 'Neelkanth Mahadev Temple', type: 'religious', description: 'Temple dedicated to Lord Shiva with Shiva lingam', duration: '4-5 hours', cost: 0, rating: 4.6, safetyRating: 8.7, tips: ['Scenic location', 'Long walk or vehicle access', 'Shiva lingam temple', 'Peaceful environment'] },
          { name: 'Daksha Mahadev Temple', type: 'religious', description: 'Ancient temple with mythological significance', duration: '3-4 hours', cost: 0, rating: 4.4, safetyRating: 8.6, tips: ['Mythological significance', 'Scenic location', 'Peaceful temple', 'History of Daksha Yagna'] },
          { name: 'Piran Kaliyar Sharif', type: 'religious', description: 'Sufi shrine with annual Urs festival', duration: '2-3 hours', cost: 0, rating: 4.3, safetyRating: 8.8, tips: ['Sufi shrine', 'Annual Urs festival', 'Peaceful atmosphere', 'Spiritual significance'] }
        ],
        evening: [
          { name: 'Ganga Aarti at Har Ki Pauri', type: 'religious', description: 'Evening ritual with prayers, lamps, and chanting', duration: '1 hour', cost: 0, rating: 4.8, safetyRating: 9.3, tips: ['Daily evening ceremony', 'Crowded but spiritual', 'Photography from distance', 'Best spiritual experience'] },
          { name: 'Evening Ghat Walk', type: 'cultural', description: 'Stroll along illuminated ghats and temples', duration: '2 hours', cost: 0, rating: 4.5, safetyRating: 9.0, tips: ['Illuminated temples', 'Street food options', 'Cultural atmosphere', 'Photography opportunities'] },
          { name: 'Shopping at Local Markets', type: 'shopping', description: 'Buying religious items, souvenirs, and local products', duration: '2-3 hours', cost: 0, rating: 4.2, safetyRating: 8.8, tips: ['Astrologers and pundits', 'Religious items and books', 'Local handicrafts', 'Bargaining expected'] },
          { name: 'Cultural Performance', type: 'entertainment', description: 'Traditional music and dance shows', duration: '1.5 hours', cost: 400, rating: 4.4, safetyRating: 9.1, tips: ['Cultural centers', 'Traditional performances', 'Advance booking', 'Local artists'] },
          { name: 'Ayurvedic Spa Treatment', type: 'relaxation', description: 'Traditional Ayurvedic massage and wellness therapies', duration: '2 hours', cost: 1500, rating: 4.6, safetyRating: 9.4, tips: ['Authentic Ayurvedic treatment', 'Wellness centers', 'Relaxing experience', 'Advance appointment'] }
        ]
      },
      'Mathura': {
        morning: [
          { name: 'Shri Krishna Janmabhoomi', type: 'religious', description: 'Birthplace of Lord Krishna with temples and museums', duration: '2-3 hours', cost: 500, rating: 4.7, safetyRating: 9.0, tips: ['Krishna birthplace', 'Temples and museums', 'Security check required', 'Early morning darshan'] },
          { name: 'Dwarkadhish Temple', type: 'religious', description: 'Ancient temple dedicated to Lord Krishna', duration: '1.5 hours', cost: 0, rating: 4.6, safetyRating: 8.9, tips: ['Ancient temple architecture', 'Krishna deity', 'Daily rituals', 'Photography restrictions'] },
          { name: 'Govardhan Hill', type: 'religious', description: 'Sacred hill with Govardhan Puja significance', duration: '4-5 hours', cost: 0, rating: 4.5, safetyRating: 8.7, tips: ['Govardhan Puja site', 'Trekking opportunities', 'Temples on hill', 'Mythological significance'] },
          { name: 'Banke Bihari Temple', type: 'religious', description: 'Famous temple with unique idol of Lord Krishna', duration: '1.5 hours', cost: 0, rating: 4.8, safetyRating: 9.1, tips: ['Unique Krishna idol', 'Strict security', 'Limited darshan time', 'Popular with devotees'] },
          { name: 'Prem Mandir', type: 'religious', description: 'Modern temple with beautiful architecture and light shows', duration: '2 hours', cost: 0, rating: 4.6, safetyRating: 9.2, tips: ['Modern temple design', 'Evening light show', 'Peaceful environment', 'Well-maintained gardens'] }
        ],
        afternoon: [
          { name: 'Vrindavan Tour', type: 'religious', description: 'Visit to various temples associated with Lord Krishna', duration: '4-5 hours', cost: 0, rating: 4.7, safetyRating: 8.9, tips: ['Radha Raman Temple', 'ISKCON Temple', 'Temples with Krishna history', 'Sacred pilgrimage'] },
          { name: 'Kusum Sarovar', type: 'scenic', description: 'Beautiful lake with temple dedicated to Radha', duration: '1.5 hours', cost: 0, rating: 4.3, safetyRating: 8.8, tips: ['Scenic lake', 'Radha temple', 'Peaceful environment', 'Photography spot'] },
          { name: 'Mathura Museum', type: 'museum', description: 'Archaeological museum with ancient artifacts', duration: '1.5 hours', cost: 30, rating: 4.2, safetyRating: 9.0, tips: ['Ancient sculptures', 'Archaeological artifacts', 'History of Mathura', 'Government museum'] },
          { name: 'Gita Mandir', type: 'religious', description: 'Temple with all 700 verses of Bhagavad Gita', duration: '1 hour', cost: 0, rating: 4.4, safetyRating: 8.9, tips: ['All Gita verses', 'Peaceful meditation', 'Spiritual significance', 'Quiet atmosphere'] },
          { name: 'Rangji Temple', type: 'religious', description: 'Unique temple with South Indian architecture', duration: '1 hour', cost: 0, rating: 4.3, safetyRating: 8.8, tips: ['South Indian style', 'Unique in Vrindavan', 'Peaceful temple', 'Different from others'] }
        ],
        evening: [
          { name: 'Rang Panchami Celebration', type: 'cultural', description: 'Color festival celebration at various temples', duration: '3 hours', cost: 0, rating: 4.8, safetyRating: 9.1, tips: ['Color festival', 'Seasonal celebration', 'Crowded but fun', 'Participate in joy'] },
          { name: 'Temple Light Shows', type: 'entertainment', description: 'Evening light and sound shows at temples', duration: '1 hour', cost: 0, rating: 4.5, safetyRating: 9.0, tips: ['Prem Mandir light show', 'Evening timing', 'Beautiful illumination', 'Spiritual atmosphere'] },
          { name: 'Local Food Experience', type: 'food', description: 'Tasting Mathura famous peda and other sweets', duration: '1.5 hours', cost: 200, rating: 4.4, safetyRating: 8.9, tips: ['Famous Mathura peda', 'Local sweet shops', 'Pure vegetarian', 'Fresh preparation'] },
          { name: 'Evening Temple Visit', type: 'religious', description: 'Visiting temples during evening aarti', duration: '2 hours', cost: 0, rating: 4.6, safetyRating: 9.0, tips: ['Evening aarti', 'Peaceful atmosphere', 'Devotional songs', 'Spiritual experience'] },
          { name: 'Cultural Walk', type: 'cultural', description: 'Exploring local markets and cultural sites', duration: '2 hours', cost: 0, rating: 4.3, safetyRating: 8.8, tips: ['Local markets', 'Cultural sites', 'Shopping for souvenirs', 'Street food options'] }
        ]
      }
    };

    const cityAttractions = attractionDatabase[destination] || attractionDatabase['Delhi'];
    const timeAttractions = cityAttractions[timeOfDay] || cityAttractions.morning;
    
    // Filter by interests if provided
    if (interests && interests.length > 0) {
      const filtered = timeAttractions.filter(attraction => 
        interests.some(interest => 
          attraction.type.includes(interest.toLowerCase()) ||
          attraction.description.toLowerCase().includes(interest.toLowerCase())
        )
      );
      return filtered.length > 0 ? filtered : timeAttractions;
    }
    
    return timeAttractions;
  }

  // Local food database for authentic culinary experiences
  getLocalFood(destination, mealType) {
    const foodDatabase = {
      'Delhi': {
        breakfast: [
          { name: 'Paranthe Wali Gali', cuisine: 'North Indian', specialty: 'Stuffed Parathas', cost: 250, rating: 4.5, description: 'Famous narrow lane serving variety of stuffed parathas since 1872', tips: ['Try aloo, gobhi, and paneer parathas', 'Best with curd and pickle', 'Cash only payment', 'Very crowded on weekends'] },
          { name: 'Karim\'s', cuisine: 'Mughlai', specialty: 'Kebabs & Mutton Korma', cost: 400, rating: 4.6, description: 'Legendary Mughlai restaurant serving authentic dishes since 1913', tips: ['Famous for mutton dishes', 'Try seekh kebabs', 'Cash preferred', 'Located near Jama Masjid'] },
          { name: 'Haldiram\'s', cuisine: 'Indian Sweets', specialty: 'Chole Bhature', cost: 300, rating: 4.3, description: 'Famous chain for North Indian breakfast and sweets', tips: ['Try their chole bhature', 'Great variety of sweets', 'Clean and hygienic', 'Multiple locations'] }
        ],
        lunch: [
          { name: 'Khan Chacha', cuisine: 'Mughlai', specialty: 'Chicken Rolls', cost: 200, rating: 4.4, description: 'Iconic rolls and kebabs joint in Khan Market since 1972', tips: ['Famous chicken rolls', 'Mutton seekh kebabs excellent', 'Quick service', 'Limited seating'] },
          { name: 'Rajdhani Thali', cuisine: 'Gujarati', specialty: 'Unlimited Thali', cost: 500, rating: 4.5, description: 'Traditional Gujarati thali restaurant with unlimited servings', tips: ['Unlimited authentic Gujarati food', 'No onion-garlic options', 'Fixed menu changes daily', 'Advance booking recommended'] },
          { name: 'Saravana Bhavan', cuisine: 'South Indian', specialty: 'Dosa & Idli', cost: 300, rating: 4.4, description: 'Authentic South Indian vegetarian restaurant chain', tips: ['Crispy dosas and soft idlis', 'Filter coffee is authentic', 'Pure vegetarian', 'Consistent quality'] }
        ],
        dinner: [
          { name: 'Bukhara (ITC Maurya)', cuisine: 'North Indian', specialty: 'Dal Bukhara & Tandoor', cost: 4000, rating: 4.8, description: 'World-famous restaurant known for rustic North Indian cuisine', tips: ['Expensive but worth it', 'No cutlery provided', 'Advance reservations must', 'Dress code enforced'] },
          { name: 'Pandara Road Market', cuisine: 'Multi-cuisine', specialty: 'Various restaurants', cost: 800, rating: 4.3, description: 'Food market near India Gate with multiple restaurant options', tips: ['Multiple restaurant choices', 'Good for groups', 'Parking available', 'Evening is best time'] },
          { name: 'Dilli 6 On Wheels', cuisine: 'Street Food', specialty: 'Chaat & Golgappa', cost: 150, rating: 4.2, description: 'Street food cart serving authentic Delhi chaat', tips: ['Hygienic street food', 'Try golgappa and chaat', 'Evening timing only', 'Cash only'] }
        ]
      },
      'Mumbai': {
        breakfast: [
          { name: 'Café Madras', cuisine: 'South Indian', specialty: 'Filter Coffee & Dosa', cost: 250, rating: 4.6, description: 'Authentic South Indian breakfast joint in Matunga', tips: ['Best filter coffee in Mumbai', 'Crispy dosas and idlis', 'Old-style Udupi restaurant', 'Cash only'] },
          { name: 'Kyani & Co.', cuisine: 'Irani', specialty: 'Bun Maska & Chai', cost: 150, rating: 4.4, description: 'Heritage Irani cafe serving traditional Parsi breakfast', tips: ['Famous bun maska', 'Old-world charm', 'Irani chai is special', 'Heritage building'] },
          { name: 'Prakash Uphar Kendra', cuisine: 'Gujarati', specialty: 'Dhokla & Khandvi', cost: 200, rating: 4.3, description: 'Popular Gujarati snacks and breakfast place', tips: ['Fresh dhokla and khandvi', 'Gujarati thali available', 'No onion-garlic', 'Takeaway available'] }
        ],
        lunch: [
          { name: 'Trishna', cuisine: 'Seafood', specialty: 'Koliwada Prawns', cost: 2000, rating: 4.7, description: 'Upscale seafood restaurant with innovative coastal cuisine', tips: ['Expensive but excellent', 'Reservations required', 'Try their tasting menu', 'Fresh seafood daily'] },
          { name: 'Leopold Café', cuisine: 'Continental', specialty: 'Fish & Chips', cost: 600, rating: 4.2, description: 'Historic cafe and bar in Colaba, popular with tourists', tips: ['Tourist favorite', 'Good for Continental food', 'Historic significance', 'Can be crowded'] },
          { name: 'Mahesh Lunch Home', cuisine: 'Mangalorean', specialty: 'Fish Curry Rice', cost: 500, rating: 4.5, description: 'Famous for authentic Mangalorean seafood since 1973', tips: ['Authentic coastal cuisine', 'Fish curry rice is signature', 'Multiple locations', 'Spicy food'] }
        ],
        dinner: [
          { name: 'Khyber', cuisine: 'North Indian', specialty: 'Rogan Josh', cost: 1200, rating: 4.6, description: 'Upscale North Indian restaurant with rich décor', tips: ['Elegant dining experience', 'Rich North Indian curries', 'Good ambiance', 'Advance booking preferred'] },
          { name: 'Bademiya', cuisine: 'Mughlai', specialty: 'Seekh Kebabs', cost: 400, rating: 4.4, description: 'Famous street-side kebab joint near Colaba', tips: ['Late night dining', 'Authentic kebabs', 'Street-side seating', 'Cash only'] },
          { name: 'Chowpatty Street Food', cuisine: 'Street Food', specialty: 'Bhel Puri & Pav Bhaji', cost: 100, rating: 4.3, description: 'Beach-side street food stalls at Chowpatty', tips: ['Evening is best time', 'Try bhel puri and kulfi', 'Beachside dining', 'Hygienic vendors recommended'] }
        ]
      },
      'Jaipur': {
        breakfast: [
          { name: 'Rawat Mishtan Bhandar', cuisine: 'Rajasthani', specialty: 'Pyaaz Kachori', cost: 150, rating: 4.7, description: 'Famous for kachoris since 1944, local favorite', tips: ['Must try pyaaz kachori', 'Best in early morning', 'Take sweets as gifts', 'Very popular with locals'] },
          { name: 'Laxmi Mishthan Bhandar', cuisine: 'Rajasthani', specialty: 'Ghewar & Sweets', cost: 250, rating: 4.5, description: 'Traditional sweet shop and restaurant in old city', tips: ['Famous for ghewar', 'Rajasthani thali available', 'Heritage sweet shop', 'Try malpua and rabri'] },
          { name: 'Peacock Rooftop Restaurant', cuisine: 'Multi-cuisine', specialty: 'Continental Breakfast', cost: 400, rating: 4.2, description: 'Rooftop restaurant with Hawa Mahal views', tips: ['Great Hawa Mahal view', 'Tourist-friendly menu', 'Good for breakfast', 'Advance booking for view tables'] }
        ],
        lunch: [
          { name: 'Chokhi Dhani', cuisine: 'Rajasthani', specialty: 'Dal Baati Churma', cost: 1000, rating: 4.6, description: 'Ethnic village resort with traditional Rajasthani experience', tips: ['Complete cultural experience', 'Traditional village setting', 'Folk performances included', 'Advance booking required'] },
          { name: '1135 AD', cuisine: 'Rajasthani', specialty: 'Royal Thali', cost: 2000, rating: 4.8, description: 'Heritage restaurant inside Amber Fort premises', tips: ['Royal dining experience', 'Heritage location', 'Expensive but unique', 'Combine with fort visit'] },
          { name: 'Thali House', cuisine: 'Rajasthani', specialty: 'Traditional Thali', cost: 500, rating: 4.4, description: 'Simple restaurant serving authentic Rajasthani thali', tips: ['Authentic local flavors', 'Good value for money', 'Traditional preparation', 'Local crowd favorite'] }
        ],
        dinner: [
          { name: 'Suvarna Mahal (Rambagh Palace)', cuisine: 'Royal Indian', specialty: 'Laal Maas', cost: 4000, rating: 4.9, description: 'Royal dining in former Maharaja\'s palace', tips: ['Ultimate luxury dining', 'Former royal palace', 'Dress code required', 'Advance reservations must'] },
          { name: 'Baradari Restaurant', cuisine: 'Rajasthani', specialty: 'Ker Sangri', cost: 1000, rating: 4.5, description: 'Heritage restaurant in City Palace complex', tips: ['Heritage palace location', 'Traditional Rajasthani cuisine', 'Royal ambiance', 'Combine with palace visit'] },
          { name: 'Tapri Central', cuisine: 'Fusion', specialty: 'Kulhad Chai & Snacks', cost: 300, rating: 4.3, description: 'Modern tea house with fusion snacks', tips: ['Great for evening chai', 'Rooftop seating', 'Fusion Indian snacks', 'Young crowd favorite'] }
        ]
      },
      'Shimla': {
        breakfast: [
          { name: 'Indian Coffee House', cuisine: 'Continental', specialty: 'Coffee & Omelette', cost: 200, rating: 4.4, description: 'Heritage coffee house on The Mall, retro charm', tips: ['Retro charm and nostalgia', 'Good filter coffee', 'Simple continental breakfast', 'Heritage building'] },
          { name: 'Himachali Rasoi', cuisine: 'Himachali', specialty: 'Sidu & Chutney', cost: 250, rating: 4.6, description: 'Authentic Himachali breakfast place', tips: ['Try traditional sidu', 'Local Himachali flavors', 'Authentic preparation', 'Family-run restaurant'] },
          { name: 'Wake & Bake', cuisine: 'Bakery', specialty: 'Fresh Breads & Pastries', cost: 150, rating: 4.2, description: 'European-style bakery with fresh items', tips: ['Fresh baked goods', 'Good coffee and tea', 'European style pastries', 'Great for light breakfast'] }
        ],
        lunch: [
          { name: 'Ashiana Restaurant', cuisine: 'North Indian', specialty: 'Himachali Thali', cost: 400, rating: 4.5, description: 'Popular restaurant on The Ridge with mountain views', tips: ['Good mountain views', 'Himachali specialties', 'Tourist-friendly', 'Central location'] },
          { name: 'Cecil Restaurant', cuisine: 'Multi-cuisine', specialty: 'Continental & Indian', cost: 700, rating: 4.7, description: 'Upscale restaurant in heritage Oberoi Cecil hotel', tips: ['Heritage hotel dining', 'Excellent service', 'Multi-cuisine menu', 'Advance booking preferred'] },
          { name: 'Eighteen71', cuisine: 'Multi-cuisine', specialty: 'Wood-fired Pizza', cost: 500, rating: 4.3, description: 'Modern restaurant on The Mall with diverse menu', tips: ['Good for Western food', 'Wood-fired pizzas', 'Mall Road location', 'Good for families'] }
        ],
        dinner: [
          { name: 'Wildflower Hall', cuisine: 'Fine Dining', specialty: 'Continental & Indian', cost: 3000, rating: 4.9, description: 'Luxury resort dining with mountain views', tips: ['Ultimate luxury dining', 'Spectacular mountain views', 'Expensive but worth it', 'Advance reservations must'] },
          { name: 'Baljees', cuisine: 'North Indian', specialty: 'Mutton & Chicken Dishes', cost: 500, rating: 4.4, description: 'Old restaurant on The Mall, local favorite', tips: ['Local institution', 'Good North Indian food', 'Reasonable prices', 'Popular with locals and tourists'] },
          { name: 'Café Shimla Times', cuisine: 'Multi-cuisine', specialty: 'Local Trout Fish', cost: 400, rating: 4.3, description: 'Cozy cafe with mountain views and local cuisine', tips: ['Try local trout fish', 'Cozy mountain ambiance', 'Good views', 'Relaxed atmosphere'] }
        ]
      },
      'Goa': {
        breakfast: [
          { name: 'Café Chocolatti', cuisine: 'Continental', specialty: 'Pancakes & Coffee', cost: 300, rating: 4.4, description: 'European-style cafe in Panaji with fresh offerings', tips: ['European style cafe', 'Fresh pancakes and coffee', 'Good for continental breakfast', 'Panaji location'] },
          { name: 'Vinayak Family Restaurant', cuisine: 'Goan', specialty: 'Fish Curry Rice', cost: 250, rating: 4.6, description: 'Local Goan restaurant serving authentic home-style food', tips: ['Authentic Goan home cooking', 'Fish curry rice is signature', 'Local family restaurant', 'Good value for money'] },
          { name: 'Joseph Bar', cuisine: 'Goan', specialty: 'Poi Bread & Chai', cost: 100, rating: 4.2, description: 'Traditional Goan bakery and bar', tips: ['Traditional Goan poi bread', 'Local chai', 'Heritage place', 'Simple and authentic'] }
        ],
        lunch: [
          { name: 'Fisherman\'s Wharf', cuisine: 'Seafood', specialty: 'Goan Fish Curry', cost: 700, rating: 4.5, description: 'Popular seafood restaurant with multiple locations', tips: ['Tourist favorite', 'Good Goan seafood', 'Multiple locations', 'Advance booking recommended'] },
          { name: 'Souza Lobo', cuisine: 'Goan', specialty: 'Bebinca & Seafood', cost: 600, rating: 4.6, description: 'Heritage beachside restaurant at Calangute', tips: ['Heritage restaurant since 1932', 'Beachside location', 'Famous for bebinca dessert', 'Goan specialties'] },
          { name: 'Britto\'s', cuisine: 'Multi-cuisine', specialty: 'Seafood Platter', cost: 800, rating: 4.3, description: 'Famous beach shack at Baga Beach', tips: ['Iconic beach shack', 'Good seafood platter', 'Beachside dining', 'Tourist favorite'] }
        ],
        dinner: [
          { name: 'Thalassa', cuisine: 'Greek', specialty: 'Greek Seafood', cost: 1200, rating: 4.7, description: 'Greek restaurant on clifftop with sunset views', tips: ['Greek cuisine in Goa', 'Spectacular sunset views', 'Clifftop location', 'Advance booking essential'] },
          { name: 'Gunpowder', cuisine: 'South Indian', specialty: 'Authentic South Indian', cost: 500, rating: 4.8, description: 'Authentic South Indian restaurant in heritage house', tips: ['Outstanding South Indian food', 'Heritage house setting', 'Spicy authentic flavors', 'Hidden gem'] },
          { name: 'Martin\'s Corner', cuisine: 'Goan', specialty: 'Chicken Cafreal', cost: 600, rating: 4.4, description: 'Popular local restaurant known for Goan specialties', tips: ['Local favorite', 'Try chicken cafreal', 'Good Goan pork dishes', 'Advance booking recommended'] }
        ]
      },
      'Varanasi': {
        breakfast: [
          { name: 'Keshav Prasad', cuisine: 'North Indian', specialty: 'Ghewar and Malaiyyo', cost: 200, rating: 4.6, description: 'Famous sweet shop for traditional Varanasi sweets', tips: ['Try Malaiyyo (seasonal)', 'Freshly made sweets', 'Ghewar is signature', 'Popular with locals'] },
          { name: 'Deena Chaat Bhandar', cuisine: 'Street Food', specialty: 'Kachori and Lassi', cost: 150, rating: 4.5, description: 'Popular street food joint for local delicacies', tips: ['Famous for kachori', 'Sweet lassi is special', 'Street-side seating', 'Very popular with tourists'] },
          { name: 'Blue Diamond', cuisine: 'North Indian', specialty: 'Paratha and Tea', cost: 250, rating: 4.3, description: 'Local favorite for breakfast parathas', tips: ['Variety of stuffed parathas', 'Hot tea and chai', 'Popular with office goers', 'Good value for money'] }
        ],
        lunch: [
          { name: 'Pandit Bhojanalaya', cuisine: 'Pure Vegetarian', specialty: 'Bhojpuri Thali', cost: 400, rating: 4.7, description: 'Authentic vegetarian restaurant serving traditional thali', tips: ['Unlimited traditional food', 'Pure vegetarian', 'Good portion sizes', 'Popular with pilgrims'] },
          { name: 'Kabir Chaura', cuisine: 'North Indian', specialty: 'Kachori and Chaat', cost: 200, rating: 4.4, description: 'Famous for street food and local snacks', tips: ['Popular kachori center', 'Variety of chaat items', 'Affordable prices', 'Always crowded'] },
          { name: 'Chholay Ke Prabhu', cuisine: 'North Indian', specialty: 'Chhole Bhature', cost: 300, rating: 4.5, description: 'Famous for chhole bhature and North Indian dishes', tips: ['Best chhole in Varanasi', 'Fresh bhature daily', 'Popular lunch spot', 'Reasonable prices'] }
        ],
        dinner: [
          { name: 'Sai Nath Restaurant', cuisine: 'North Indian', specialty: 'Pure Vegetarian', cost: 500, rating: 4.6, description: 'Popular pure vegetarian restaurant with good ambiance', tips: ['Wide variety of dishes', 'Good service', 'Clean and hygienic', 'Popular with families'] },
          { name: 'Ganpati Restaurant', cuisine: 'North Indian', specialty: 'Thali and Aloo Pie', cost: 350, rating: 4.4, description: 'Famous for thali and local specialties', tips: ['Famous for aloo pie', 'Good quality food', 'Reasonable prices', 'Popular with locals'] },
          { name: 'Bhojnalaya', cuisine: 'Pure Vegetarian', specialty: 'Bhojpuri Cuisine', cost: 450, rating: 4.7, description: 'Authentic Bhojpuri food in peaceful setting', tips: ['Traditional Bhojpuri food', 'Peaceful environment', 'Good for groups', 'Advance booking recommended'] }
        ]
      },
      'Haridwar': {
        breakfast: [
          { name: 'Annapurna Bhojnalaya', cuisine: 'North Indian', specialty: 'Puri Sabzi and Tea', cost: 150, rating: 4.4, description: 'Local favorite for simple North Indian breakfast', tips: ['Fresh puri and sabzi', 'Hot tea available', 'Popular with pilgrims', 'Very affordable'] },
          { name: 'Ganga Kinare', cuisine: 'North Indian', specialty: 'Paratha and Dahi', cost: 200, rating: 4.3, description: 'Restaurant near Ganga with traditional breakfast', tips: ['Riverside location', 'Variety of parathas', 'Fresh dahi and lassi', 'Scenic views'] },
          { name: 'Santushti Restaurant', cuisine: 'North Indian', specialty: 'North Indian Thali', cost: 250, rating: 4.5, description: 'Vegetarian restaurant with good variety', tips: ['Good quality food', 'Clean environment', 'Reasonable prices', 'Popular with tourists'] }
        ],
        lunch: [
          { name: 'Shiv Shakti Restaurant', cuisine: 'North Indian', specialty: 'Thali and Chaat', cost: 300, rating: 4.6, description: 'Popular restaurant with variety of North Indian dishes', tips: ['Good portion sizes', 'Variety of chaat', 'Clean and hygienic', 'Popular with locals'] },
          { name: 'Madrasi Cafe', cuisine: 'South Indian', specialty: 'Dosa and Idli', cost: 250, rating: 4.4, description: 'South Indian food in Haridwar', tips: ['Fresh dosas and idlis', 'Good filter coffee', 'South Indian specialties', 'Vegetarian only'] },
          { name: 'Bikaner Sweets', cuisine: 'North Indian', specialty: 'Sweets and Snacks', cost: 200, rating: 4.3, description: 'Famous for sweets and light snacks', tips: ['Variety of sweets', 'Fresh preparation', 'Popular with pilgrims', 'Good for takeaway'] }
        ],
        dinner: [
          { name: 'Ganga Restaurant', cuisine: 'North Indian', specialty: 'Pure Vegetarian', cost: 400, rating: 4.5, description: 'Popular riverside restaurant with good food', tips: ['Riverside location', 'Pure vegetarian', 'Good ambiance', 'Popular with families'] },
          { name: 'Paramount Restaurant', cuisine: 'North Indian', specialty: 'Chinese and North Indian', cost: 450, rating: 4.4, description: 'Multi-cuisine restaurant with good service', tips: ['Chinese and North Indian', 'Good service', 'Clean environment', 'Popular with tourists'] },
          { name: 'Chaar Dhaam', cuisine: 'North Indian', specialty: 'Pure Vegetarian Thali', cost: 350, rating: 4.6, description: 'Authentic vegetarian food with good variety', tips: ['Pure vegetarian', 'Good portion sizes', 'Traditional preparation', 'Popular with pilgrims'] }
        ]
      },
      'Mathura': {
        breakfast: [
          { name: 'Rajbhog', cuisine: 'North Indian', specialty: 'Peda and Sweets', cost: 200, rating: 4.7, description: 'Famous for Mathura peda and other sweets', tips: ['Famous Mathura peda', 'Variety of sweets', 'Fresh preparation', 'Popular with tourists'] },
          { name: 'Gokul Doodh Bhandar', cuisine: 'North Indian', specialty: 'Doodh Jalebi and Paratha', cost: 150, rating: 4.3, description: 'Local favorite for milk-based sweets', tips: ['Fresh milk products', 'Hot jalebi', 'Popular with locals', 'Early morning only'] },
          { name: 'Brijwasi Sweets', cuisine: 'North Indian', specialty: 'Sweets and Namkeen', cost: 250, rating: 4.5, description: 'Popular sweet shop with variety of items', tips: ['Variety of sweets', 'Namkeen and snacks', 'Good for gifts', 'Popular with pilgrims'] }
        ],
        lunch: [
          { name: 'Brij Rasoi', cuisine: 'North Indian', specialty: 'Vegetarian Thali', cost: 300, rating: 4.6, description: 'Traditional vegetarian food in peaceful setting', tips: ['Traditional preparation', 'Good portion sizes', 'Peaceful environment', 'Popular with pilgrims'] },
          { name: 'Krishna Dhaba', cuisine: 'North Indian', specialty: 'North Indian Thali', cost: 250, rating: 4.4, description: 'Popular dhaba with good North Indian food', tips: ['Good quality food', 'Affordable prices', 'Popular with locals', 'Simple environment'] },
          { name: 'Sweets and Snacks', cuisine: 'North Indian', specialty: 'Local Delicacies', cost: 200, rating: 4.2, description: 'Local food stalls with traditional snacks', tips: ['Local delicacies', 'Affordable prices', 'Street-side eating', 'Popular with tourists'] }
        ],
        dinner: [
          { name: 'Banke Bihari Restaurant', cuisine: 'North Indian', specialty: 'Pure Vegetarian', cost: 400, rating: 4.7, description: 'Popular restaurant near temple with good food', tips: ['Temple proximity', 'Pure vegetarian', 'Good ambiance', 'Popular with devotees'] },
          { name: 'Prem Rasoi', cuisine: 'North Indian', specialty: 'Vegetarian Thali', cost: 350, rating: 4.5, description: 'Traditional food in spiritual environment', tips: ['Spiritual environment', 'Good quality food', 'Traditional preparation', 'Popular with pilgrims'] },
          { name: 'Brijwasi Dhaba', cuisine: 'North Indian', specialty: 'North Indian Cuisine', cost: 300, rating: 4.3, description: 'Popular dhaba with variety of dishes', tips: ['Variety of dishes', 'Good portion sizes', 'Affordable prices', 'Popular with locals'] }
        ]
      }
    };

    const cityFood = foodDatabase[destination] || foodDatabase['Delhi'];
    const mealFood = cityFood[mealType] || cityFood.lunch;
    
    // Return random restaurant from the meal type
    const randomIndex = Math.floor(Math.random() * mealFood.length);
    return mealFood[randomIndex];
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('itineraryForm')) {
    new TourioSafeItineraryBuilder();
  }
});

// Itinerary Result Page Functions
function initializeItinerary() {
  const data = sessionStorage.getItem('generatedItinerary');
  if (data) {
    const itinerary = JSON.parse(data);
    populateItineraryData(itinerary);
  } else {
    // Load detailed Shimla sample data
    const shimlaItinerary = getDetailedShimlaItinerary();
    populateItineraryData(shimlaItinerary);
    populateDetailedSections(shimlaItinerary);
  }
}

function getDetailedShimlaItinerary() {
  return {
    title: "3-Day Shimla Hill Station Adventure",
    origin: "Delhi",
    destination: "Shimla",
    days: 3,
    budget: 25000,
    tourioRating: 4.7,
    totalCost: 22500,
    carbonFootprint: 18.5,
    dailyItinerary: [
      {
        day: 1,
        date: getDateForDay(1),
        title: "Arrival & Mall Road Exploration",
        activities: [
          {
            id: "1-1",
            name: "Hotel Check-in & Freshen Up",
            type: "accommodation",
            description: "Check into your cozy hill station hotel with mountain views",
            startTime: "12:00",
            endTime: "13:00",
            duration: 60,
            cost: 0,
            rating: 4.5,
            coordinates: { lat: 31.1048, lng: 77.1734 },
            safetyRating: 9.5,
            tips: ["Keep valuables in hotel safe", "Ask for room with valley view", "Get local area map from reception"]
          },
          {
            id: "1-2", 
            name: "Mall Road Walking Tour",
            type: "heritage",
            description: "Explore the famous pedestrian street with colonial architecture, shops, and cafes. Perfect for acclimatization to the altitude.",
            startTime: "14:00",
            endTime: "17:00",
            duration: 180,
            cost: 500,
            rating: 4.6,
            coordinates: { lat: 31.1038, lng: 77.1734 },
            safetyRating: 9.8,
            tips: ["Wear comfortable walking shoes", "Bargain politely at local shops", "Try local Himachali snacks"]
          },
          {
            id: "1-3",
            name: "Christ Church Visit",
            type: "heritage",
            description: "Visit the beautiful neo-Gothic church from 1857, one of the oldest churches in North India.",
            startTime: "17:30",
            endTime: "18:30",
            duration: 60,
            cost: 0,
            rating: 4.4,
            coordinates: { lat: 31.1038, lng: 77.1734 },
            safetyRating: 9.7,
            tips: ["Maintain silence inside", "Photography may be restricted", "Best photos during golden hour"]
          }
        ],
        totalCost: 500,
        totalDuration: 300
      },
      {
        day: 2,
        date: getDateForDay(2),
        title: "Adventure & Nature Day",
        activities: [
          {
            id: "2-1",
            name: "Jakhu Temple Trek",
            type: "spiritual",
            description: "Trek to the highest peak in Shimla to visit the ancient Hanuman temple. Panoramic views of the city and surrounding mountains.",
            startTime: "08:00",
            endTime: "11:00",
            duration: 180,
            cost: 100,
            rating: 4.8,
            coordinates: { lat: 31.1055, lng: 77.1827 },
            safetyRating: 8.9,
            tips: ["Start early to avoid crowds", "Carry water and snacks", "Beware of monkeys - don't feed them"]
          },
          {
            id: "2-2",
            name: "Kufri Adventure Sports",
            type: "adventure",
            description: "Experience horse riding, yak rides, and visit the Himalayan Nature Park. Great for adventure enthusiasts.",
            startTime: "13:00",
            endTime: "17:00",
            duration: 240,
            cost: 1200,
            rating: 4.5,
            coordinates: { lat: 31.0959, lng: 77.2643 },
            safetyRating: 8.8,
            tips: ["Book activities in advance", "Carry warm clothes", "Follow safety instructions strictly"]
          },
          {
            id: "2-3",
            name: "Local Himachali Dinner",
            type: "food",
            description: "Traditional Himachali cuisine at a local restaurant. Try specialties like Chana Madra, Siddu, and Himachali Trout.",
            startTime: "19:00",
            endTime: "21:00",
            duration: 120,
            cost: 800,
            rating: 4.7,
            coordinates: { lat: 31.1040, lng: 77.1725 },
            safetyRating: 9.2,
            tips: ["Try the local apple wine", "Ask for spice level preference", "Book popular restaurants in advance"]
          }
        ],
        totalCost: 2100,
        totalDuration: 540
      },
      {
        day: 3,
        date: getDateForDay(3),
        title: "Heritage & Departure",
        activities: [
          {
            id: "3-1",
            name: "Viceregal Lodge Tour",
            type: "heritage",
            description: "Explore the former summer residence of British Viceroys, now Indian Institute of Advanced Study. Magnificent architecture and gardens.",
            startTime: "09:00",
            endTime: "11:30",
            duration: 150,
            cost: 200,
            rating: 4.9,
            coordinates: { lat: 31.0975, lng: 77.1712 },
            safetyRating: 9.6,
            tips: ["Book guided tour for better insights", "Photography restricted in some areas", "Beautiful gardens for photos"]
          },
          {
            id: "3-2",
            name: "Shimla State Museum",
            type: "heritage",
            description: "Discover Himachal's rich cultural heritage through artifacts, sculptures, and historical exhibits.",
            startTime: "12:00",
            endTime: "13:30",
            duration: 90,
            cost: 50,
            rating: 4.3,
            coordinates: { lat: 31.1021, lng: 77.1734 },
            safetyRating: 9.4,
            tips: ["Entry fee required", "Photography may have extra charges", "Audio guide available"]
          },
          {
            id: "3-3",
            name: "Shopping & Departure",
            type: "shopping",
            description: "Last-minute shopping for local handicrafts, woolen clothes, and famous Himachali apples before departure.",
            startTime: "14:00",
            endTime: "16:00",
            duration: 120,
            cost: 1500,
            rating: 4.2,
            coordinates: { lat: 31.1035, lng: 77.1730 },
            safetyRating: 9.1,
            tips: ["Bargain politely", "Check for authenticity certificates", "Pack fragile items carefully"]
          }
        ],
        totalCost: 1750,
        totalDuration: 360
      }
    ],
    weatherForecast: [
      {
        day: 1,
        date: getDateForDay(1),
        condition: "Partly Cloudy",
        temperature: { high: 22, low: 12 },
        humidity: 65,
        rainfall: 0,
        windSpeed: 8,
        uvIndex: 6,
        sunrise: "06:15",
        sunset: "19:45"
      },
      {
        day: 2,
        date: getDateForDay(2),
        condition: "Sunny",
        temperature: { high: 24, low: 14 },
        humidity: 55,
        rainfall: 0,
        windSpeed: 5,
        uvIndex: 7,
        sunrise: "06:16",
        sunset: "19:44"
      },
      {
        day: 3,
        date: getDateForDay(3),
        condition: "Light Clouds",
        temperature: { high: 20, low: 11 },
        humidity: 70,
        rainfall: 5,
        windSpeed: 12,
        uvIndex: 5,
        sunrise: "06:17",
        sunset: "19:43"
      }
    ],
    safetyAlerts: [
      { type: 'safe', icon: '✅', message: 'All destinations are currently safe for tourists' },
      { type: 'weather', icon: '🌦️', message: 'Light rainfall possible on Day 3 - carry umbrella' },
      { type: 'traffic', icon: '🚗', message: 'Heavy traffic expected on Mall Road during weekend evenings' },
      { type: 'wildlife', icon: '🐒', message: 'Monkeys at Jakhu Temple - avoid feeding and secure belongings' }
    ],
    localTips: [
      { category: 'Transport', tip: 'Use local buses or book a taxi for Kufri trip - negotiate fare beforehand' },
      { category: 'Food', tip: 'Try local specialties: Chana Madra, Siddu, and Himachali Trout at authentic restaurants' },
      { category: 'Shopping', tip: 'Best buys: Himachali caps, woolen shawls, local honey, and fresh apples' },
      { category: 'Safety', tip: 'Altitude is 2200m - stay hydrated and take it easy on first day' },
      { category: 'Best Time', tip: 'Visit Mall Road early morning or evening for best experience and photos' }
    ],
    carbonFootprint: {
      total: 18.5,
      breakdown: {
        transport: 12.8,
        accommodation: 3.2,
        food: 1.8,
        activities: 0.7
      },
      treesToOffset: 1,
      ecoTips: [
        '💚 Use public transport or shared taxis to reduce emissions by 40%',
        '♻️ Choose eco-friendly hotels that use solar heating',
        '🌱 Support local communities by buying from local vendors'
      ]
    }
  };
}

function getDateForDay(day) {
  const today = new Date();
  const targetDate = new Date(today.getTime() + (day * 24 * 60 * 60 * 1000));
  return targetDate.toLocaleDateString('en-GB');
}

function populateItineraryData(itinerary) {
  document.getElementById('itinerary-title').textContent = itinerary.title || 'Your Perfect Journey';
  document.getElementById('trip-duration').textContent = `${itinerary.days} Days`;
  document.getElementById('trip-budget').textContent = `₹${itinerary.budget.toLocaleString('en-IN')}`;
  document.getElementById('rating-score').textContent = itinerary.tourioRating || '4.8';
  
  // Update rating stars
  const starsContainer = document.getElementById('trip-rating');
  if (starsContainer) {
    const rating = itinerary.tourioRating || 4.8;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '★';
    }
    if (hasHalfStar) {
      starsHtml += '☆';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
      starsHtml += '☆';
    }
    
    starsContainer.innerHTML = starsHtml;
  }
}

function populateDetailedSections(itinerary) {
  populateDayTabs(itinerary);
  populateTimelineContent(itinerary);
  populateCostBreakdown(itinerary);
  populateWeatherForecast(itinerary);
  populateSafetyAlerts(itinerary);
  populateLocalTips(itinerary);
  populateCarbonFootprint(itinerary);
  initializeMap(itinerary);
}

function populateDayTabs(itinerary) {
  const dayTabsContainer = document.getElementById('dayTabs');
  if (!dayTabsContainer) return;
  
  let tabsHtml = '';
  itinerary.dailyItinerary.forEach((day, index) => {
    tabsHtml += `
      <button class="day-tab ${index === 0 ? 'active' : ''}" data-day="${day.day}">
        <div class="tab-content">
          <span class="day-number">Day ${day.day}</span>
          <span class="day-title">${day.title}</span>
          <span class="day-cost">₹${day.totalCost}</span>
        </div>
      </button>
    `;
  });
  
  dayTabsContainer.innerHTML = tabsHtml;
  
  // Add click handlers
  dayTabsContainer.querySelectorAll('.day-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      dayTabsContainer.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const day = parseInt(tab.dataset.day);
      showDayActivities(itinerary, day);
    });
  });
  
  // Show first day by default
  showDayActivities(itinerary, 1);
}

function populateTimelineContent(itinerary) {
  const timelineContainer = document.getElementById('timelineContent');
  if (!timelineContainer) return;
  
  timelineContainer.innerHTML = '<div id="day-activities">Select a day to see activities</div>';
}

function showDayActivities(itinerary, dayNumber) {
  const dayData = itinerary.dailyItinerary.find(d => d.day === dayNumber);
  if (!dayData) return;
  
  const container = document.getElementById('day-activities') || document.getElementById('timelineContent');
  if (!container) return;
  
  let activitiesHtml = `
    <div class="day-header">
      <h4>Day ${dayData.day} - ${dayData.title}</h4>
      <span class="day-date">${dayData.date}</span>
    </div>
  `;
  
  dayData.activities.forEach((activity, index) => {
    const typeIcon = getActivityIcon(activity.type);
    activitiesHtml += `
      <div class="timeline-item" data-activity="${activity.id}">
        <div class="time-badge">${activity.startTime}</div>
        <div class="activity-info">
          <div class="activity-header">
            <span class="activity-icon">${typeIcon}</span>
            <h5 class="activity-title">${activity.name}</h5>
            <span class="activity-rating">★ ${activity.rating}</span>
          </div>
          <p class="activity-description">${activity.description}</p>
          <div class="activity-meta">
            <span class="duration">🕐 ${Math.floor(activity.duration / 60)}h ${activity.duration % 60}m</span>
            <span class="cost">💰 ₹${activity.cost}</span>
            <span class="safety">🛡️ ${activity.safetyRating}/10</span>
          </div>
          <div class="activity-tips">
            <strong>💡 Tips:</strong>
            <ul>
              ${activity.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="activity-actions">
          <button class="activity-btn" onclick="showOnMap('${activity.id}')" title="Show on Map">
            📍
          </button>
          <button class="activity-btn" onclick="editActivity('${activity.id}')" title="Edit">
            ✏️
          </button>
          <button class="activity-btn" onclick="removeActivity('${activity.id}')" title="Remove">
            🗑️
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = activitiesHtml;
}

function getActivityIcon(type) {
  const icons = {
    heritage: '🏛️',
    nature: '🌿',
    adventure: '🏔️',
    food: '🍽️',
    spiritual: '🕉️',
    shopping: '🛍️',
    accommodation: '🏨',
    transport: '🚗'
  };
  return icons[type] || '📍';
}

function populateCostBreakdown(itinerary) {
  const costContainer = document.getElementById('costBreakdown');
  if (!costContainer) return;
  
  let totalCost = 0;
  const costByCategory = {};
  
  itinerary.dailyItinerary.forEach(day => {
    day.activities.forEach(activity => {
      totalCost += activity.cost;
      costByCategory[activity.type] = (costByCategory[activity.type] || 0) + activity.cost;
    });
  });
  
  let costHtml = '';
  Object.entries(costByCategory).forEach(([category, cost]) => {
    const icon = getActivityIcon(category);
    costHtml += `
      <div class="cost-item">
        <span class="cost-category">${icon} ${category.charAt(0).toUpperCase() + category.slice(1)}</span>
        <span class="cost-amount">₹${cost.toLocaleString('en-IN')}</span>
      </div>
    `;
  });
  
  costContainer.innerHTML = costHtml;
  
  // Update total cost
  const totalCostElement = document.getElementById('totalCost');
  if (totalCostElement) {
    totalCostElement.textContent = totalCost.toLocaleString('en-IN');
  }
}

function loadItineraryData() {
  // Load and display detailed itinerary data
  console.log('Loading itinerary data...');
}

function populateWeatherForecast(itinerary) {
  const weatherContainer = document.getElementById('weatherForecast');
  if (!weatherContainer) return;
  
  let weatherHtml = '';
  itinerary.weatherForecast.forEach(forecast => {
    const conditionIcon = getWeatherIcon(forecast.condition);
    weatherHtml += `
      <div class="weather-day">
        <div class="weather-date">Day ${forecast.day}</div>
        <div class="weather-condition">
          <span class="weather-icon">${conditionIcon}</span>
          <span class="condition-text">${forecast.condition}</span>
        </div>
        <div class="weather-temp">
          <span class="high">${forecast.temperature.high}°C</span>
          <span class="low">${forecast.temperature.low}°C</span>
        </div>
        <div class="weather-details">
          <span>💧 ${forecast.humidity}%</span>
          <span>🌬️ ${forecast.windSpeed}km/h</span>
          <span>☀️ UV ${forecast.uvIndex}</span>
        </div>
        <div class="sunrise-sunset">
          <span>🌅 ${forecast.sunrise}</span>
          <span>🌇 ${forecast.sunset}</span>
        </div>
      </div>
    `;
  });
  
  weatherContainer.innerHTML = weatherHtml;
}

function getWeatherIcon(condition) {
  const icons = {
    'Sunny': '☀️',
    'Partly Cloudy': '⛅',
    'Cloudy': '☁️',
    'Light Clouds': '🌤️',
    'Light Rain': '🌦️',
    'Heavy Rain': '🌧️'
  };
  return icons[condition] || '☀️';
}

function populateSafetyAlerts(itinerary) {
  const safetyContainer = document.getElementById('safetyAlerts');
  if (!safetyContainer) return;
  
  let alertsHtml = '';
  itinerary.safetyAlerts.forEach(alert => {
    const alertClass = alert.type === 'safe' ? 'safe' : 'warning';
    alertsHtml += `
      <div class="alert-item ${alertClass}">
        <span class="alert-icon">${alert.icon}</span>
        <span class="alert-message">${alert.message}</span>
      </div>
    `;
  });
  
  safetyContainer.innerHTML = alertsHtml;
}

function populateLocalTips(itinerary) {
  const tipsContainer = document.getElementById('localTips');
  if (!tipsContainer) return;
  
  let tipsHtml = '';
  itinerary.localTips.forEach(tip => {
    tipsHtml += `
      <div class="tip-item">
        <strong>${tip.category}:</strong> ${tip.tip}
      </div>
    `;
  });
  
  tipsContainer.innerHTML = tipsHtml;
}

function populateCarbonFootprint(itinerary) {
  const carbonContainer = document.getElementById('carbonFootprint');
  if (!carbonContainer) return;
  
  const carbon = itinerary.carbonFootprint;
  let carbonHtml = `
    <div class="carbon-summary">
      <div class="carbon-stat">
        <span class="value">${carbon.total} kg</span>
        <span class="label">Total CO₂ Emissions</span>
      </div>
      <div class="carbon-stat">
        <span class="value">${carbon.treesToOffset}</span>
        <span class="label">Trees to Offset</span>
      </div>
    </div>
    
    <div class="carbon-breakdown">
      <h5>Emission Breakdown:</h5>
      <div class="breakdown-item">
        <span>Transport:</span><span>${carbon.breakdown.transport} kg CO₂</span>
      </div>
      <div class="breakdown-item">
        <span>Accommodation:</span><span>${carbon.breakdown.accommodation} kg CO₂</span>
      </div>
      <div class="breakdown-item">
        <span>Food:</span><span>${carbon.breakdown.food} kg CO₂</span>
      </div>
      <div class="breakdown-item">
        <span>Activities:</span><span>${carbon.breakdown.activities} kg CO₂</span>
      </div>
    </div>
    
    <div class="eco-tips">
      <h5>🌱 Eco-Friendly Tips:</h5>
      ${carbon.ecoTips.map(tip => `<p>${tip}</p>`).join('')}
    </div>
  `;
  
  carbonContainer.innerHTML = carbonHtml;
}

function initializeMap(itinerary) {
  // Initialize Leaflet map
  if (typeof L !== 'undefined') {
    const mapContainer = document.getElementById('map');
    if (mapContainer && !mapContainer._leaflet_id) {
      const map = L.map('map').setView([31.1048, 77.1734], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      // Add markers for all activities
      itinerary.dailyItinerary.forEach(day => {
        day.activities.forEach(activity => {
          if (activity.coordinates) {
            const icon = getActivityIcon(activity.type);
            const marker = L.marker([activity.coordinates.lat, activity.coordinates.lng])
              .addTo(map)
              .bindPopup(`
                <div class="map-popup">
                  <h4>${icon} ${activity.name}</h4>
                  <p>${activity.description}</p>
                  <div class="popup-meta">
                    <span>★ ${activity.rating}</span>
                    <span>₹${activity.cost}</span>
                    <span>${activity.startTime}</span>
                  </div>
                </div>
              `);
          }
        });
      });
      
      // Store map reference
      window.shimlaMap = map;
    }
  }
}

function setupEventListeners() {
  // Setup all event listeners for the result page
  document.getElementById('saveItinerary')?.addEventListener('click', saveItinerary);
  document.getElementById('shareItinerary')?.addEventListener('click', shareItinerary);
  document.getElementById('exportItinerary')?.addEventListener('click', exportItinerary);
  
  // Map controls
  document.getElementById('routeView')?.addEventListener('click', () => toggleMapView('route'));
  document.getElementById('satelliteView')?.addEventListener('click', () => toggleMapView('satellite'));
  document.getElementById('safetyLayer')?.addEventListener('click', () => toggleMapView('safety'));
  document.getElementById('weatherLayer')?.addEventListener('click', () => toggleMapView('weather'));
  
  // Close modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.add('hidden');
    });
  });
  
  // Close modals on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

function toggleMapView(viewType) {
  // Remove active class from all map buttons
  document.querySelectorAll('.map-btn').forEach(btn => btn.classList.remove('active'));
  
  // Add active class to clicked button
  document.getElementById(viewType + 'View')?.classList.add('active');
  
  // Update map view based on type
  if (window.shimlaMap) {
    switch(viewType) {
      case 'satellite':
        // Switch to satellite view (would use satellite tiles in real implementation)
        console.log('Switching to satellite view');
        break;
      case 'safety':
        // Show safety layer
        console.log('Showing safety layer');
        break;
      case 'weather':
        // Show weather layer  
        console.log('Showing weather layer');
        break;
      default:
        // Default route view
        console.log('Showing route view');
    }
  }
}

function showOnMap(activityId) {
  console.log('Showing activity on map:', activityId);
  // Would center map on activity location and open popup
}

function editActivity(activityId) {
  console.log('Editing activity:', activityId);
  alert('Activity editing feature coming soon!');
}

function removeActivity(activityId) {
  console.log('Removing activity:', activityId);
  if (confirm('Are you sure you want to remove this activity?')) {
    // Would remove activity from itinerary
    alert('Activity removed!');
  }
}

function saveItinerary() {
  alert('Itinerary saved to My Trips!');
}

function shareItinerary() {
  document.getElementById('shareModal')?.classList.remove('hidden');
}

function exportItinerary() {
  alert('Exporting to PDF...');
}

function copyToClipboard() {
  const shareLink = document.getElementById('shareLink');
  shareLink.select();
  document.execCommand('copy');
  alert('Link copied to clipboard!');
}