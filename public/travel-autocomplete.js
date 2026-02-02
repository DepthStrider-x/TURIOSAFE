/**
 * TravelAutocomplete - A reusable autocomplete component for travel booking forms
 * Supports airports, railway stations, bus stops, and hotels with debounced search
 */

class TravelAutocomplete {
  constructor() {
    this.datasets = {
      airports: [],
      railwayStations: [],
      busStops: [],
      hotels: []
    };
    this.loaded = {
      airports: false,
      railwayStations: false,
      busStops: false,
      hotels: false
    };
    this.debounceTimers = new Map();
    this.activeDropdowns = new Map();
    
    // Load all datasets on initialization
    this.loadAllDatasets();
  }

  /**
   * Load all travel datasets from JSON files
   */
  async loadAllDatasets() {
    try {
      const [airports, stations, buses, hotels] = await Promise.all([
        fetch('/data/airports.json').then(r => r.json()),
        fetch('/data/railway-stations.json').then(r => r.json()),
        fetch('/data/bus-stops.json').then(r => r.json()),
        fetch('/data/hotels.json').then(r => r.json())
      ]);

      this.datasets.airports = airports;
      this.datasets.railwayStations = stations;
      this.datasets.busStops = buses;
      this.datasets.hotels = hotels;

      this.loaded.airports = true;
      this.loaded.railwayStations = true;
      this.loaded.busStops = true;
      this.loaded.hotels = true;

      console.log('✅ All travel datasets loaded successfully');
    } catch (error) {
      console.error('❌ Error loading travel datasets:', error);
    }
  }

  /**
   * Debounce function to limit API calls
   */
  debounce(func, delay, key) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timer = setTimeout(func, delay);
    this.debounceTimers.set(key, timer);
  }

  /**
   * Search function for different travel types
   */
  search(query, dataType) {
    if (!query || query.length < 2) return [];
    
    const dataset = this.datasets[dataType];
    if (!dataset || !this.loaded[dataType]) return [];

    const searchTerm = query.toLowerCase().trim();
    
    return dataset
      .filter(item => {
        const searchableText = this.getSearchableText(item, dataType);
        return searchableText.toLowerCase().includes(searchTerm);
      })
      .slice(0, 10) // Increased to 10 results for better coverage
      .sort((a, b) => {
        const aText = this.getSearchableText(a, dataType).toLowerCase();
        const bText = this.getSearchableText(b, dataType).toLowerCase();
        
        // Prioritize Muzaffarnagar and nearby areas
        const muzaffarnagarRelated = ['muzaffarnagar', 'saharanpur', 'meerut', 'roorkee', 'haridwar', 'dehradun'];
        const aMuzaffarnagar = muzaffarnagarRelated.some(city => aText.includes(city));
        const bMuzaffarnagar = muzaffarnagarRelated.some(city => bText.includes(city));
        
        if (aMuzaffarnagar && !bMuzaffarnagar) return -1;
        if (!aMuzaffarnagar && bMuzaffarnagar) return 1;
        
        // Prioritize exact city matches
        if (a.city && a.city.toLowerCase().startsWith(searchTerm)) return -1;
        if (b.city && b.city.toLowerCase().startsWith(searchTerm)) return 1;
        
        // Prioritize by distance from Muzaffarnagar if available
        if (a.distance_from_muzaffarnagar && b.distance_from_muzaffarnagar) {
          const aDistance = parseInt(a.distance_from_muzaffarnagar);
          const bDistance = parseInt(b.distance_from_muzaffarnagar);
          return aDistance - bDistance;
        }
        
        return aText.indexOf(searchTerm) - bText.indexOf(searchTerm);
      });
  }

  /**
   * Get searchable text based on data type
   */
  getSearchableText(item, dataType) {
    switch (dataType) {
      case 'airports':
        return `${item.city} ${item.name} ${item.iata_code} ${item.state || ''}`;
      case 'railwayStations':
        return `${item.city} ${item.name} ${item.station_code} ${item.state || ''}`;
      case 'busStops':
        return `${item.city} ${item.name} ${item.area || ''} ${item.state || ''}`;
      case 'hotels':
        return `${item.city} ${item.name} ${item.area || ''} ${item.category || ''} ${item.state || ''}`;
      default:
        return item.name || '';
    }
  }

  /**
   * Format display text for dropdown options
   */
  formatDisplayText(item, dataType) {
    switch (dataType) {
      case 'airports':
        const airportInfo = item.distance_from_muzaffarnagar ? 
          ` - ${item.distance_from_muzaffarnagar}` : '';
        return `${item.city} - ${item.name} (${item.iata_code})${airportInfo}`;
      case 'railwayStations':
        const stationInfo = item.platforms ? ` - ${item.platforms} platforms` : '';
        return `${item.city} - ${item.name} (${item.station_code})${stationInfo}`;
      case 'busStops':
        const routeInfo = item.routes ? ` - Routes: ${item.routes.slice(0, 2).join(', ')}` : '';
        return `${item.city} - ${item.name}${routeInfo}`;
      case 'hotels':
        const priceInfo = item.price_range ? ` - ${item.price_range}` : '';
        return `${item.city} - ${item.name} (${item.category})${priceInfo}`;
      default:
        return item.name || '';
    }
  }

  /**
   * Create dropdown element
   */
  createDropdown(inputId) {
    const dropdown = document.createElement('ul');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.id = `${inputId}-dropdown`;
    dropdown.style.display = 'none';
    return dropdown;
  }

  /**
   * Show dropdown with results
   */
  showDropdown(inputElement, results, dataType) {
    const inputId = inputElement.id;
    let dropdown = document.getElementById(`${inputId}-dropdown`);
    
    if (!dropdown) {
      dropdown = this.createDropdown(inputId);
      inputElement.parentNode.appendChild(dropdown);
      inputElement.parentNode.style.position = 'relative';
    }

    // Clear previous results
    dropdown.innerHTML = '';

    if (results.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    // Add results to dropdown
    results.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'autocomplete-item';
      li.setAttribute('data-type', dataType);
      li.innerHTML = this.formatDisplayText(item, dataType);
      li.setAttribute('data-index', index);
      
      // Add click handler
      li.addEventListener('click', () => {
        this.selectItem(inputElement, item, dataType);
        this.hideDropdown(inputId);
      });

      // Add hover effect
      li.addEventListener('mouseenter', () => {
        this.clearActive(dropdown);
        li.classList.add('active');
      });

      dropdown.appendChild(li);
    });

    // Position and show dropdown
    this.positionDropdown(inputElement, dropdown);
    dropdown.style.display = 'block';
    this.activeDropdowns.set(inputId, { dropdown, results, dataType });
  }

  /**
   * Position dropdown relative to input
   */
  positionDropdown(inputElement, dropdown) {
    const rect = inputElement.getBoundingClientRect();
    const inputHeight = inputElement.offsetHeight;
    
    dropdown.style.position = 'absolute';
    dropdown.style.top = `${inputHeight + 5}px`;
    dropdown.style.left = '0';
    dropdown.style.right = '0';
    dropdown.style.zIndex = '1000';
  }

  /**
   * Hide dropdown
   */
  hideDropdown(inputId) {
    const dropdown = document.getElementById(`${inputId}-dropdown`);
    if (dropdown) {
      dropdown.style.display = 'none';
    }
    this.activeDropdowns.delete(inputId);
  }

  /**
   * Select an item from dropdown
   */
  selectItem(inputElement, item, dataType) {
    let displayValue = '';
    
    switch (dataType) {
      case 'airports':
        displayValue = `${item.city} (${item.iata_code})`;
        break;
      case 'railwayStations':
        displayValue = `${item.city} (${item.station_code})`;
        break;
      case 'busStops':
      case 'hotels':
        displayValue = item.city;
        break;
      default:
        displayValue = item.name;
    }
    
    inputElement.value = displayValue;
    
    // Store full item data
    inputElement.setAttribute('data-selected-item', JSON.stringify(item));
    
    // Trigger change event
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Clear active states
   */
  clearActive(dropdown) {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    items.forEach(item => item.classList.remove('active'));
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(inputElement, event) {
    const inputId = inputElement.id;
    const activeData = this.activeDropdowns.get(inputId);
    
    if (!activeData) return;
    
    const { dropdown, results } = activeData;
    const items = dropdown.querySelectorAll('.autocomplete-item');
    const activeItem = dropdown.querySelector('.autocomplete-item.active');
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!activeItem) {
          items[0]?.classList.add('active');
        } else {
          const nextIndex = parseInt(activeItem.dataset.index) + 1;
          if (nextIndex < items.length) {
            this.clearActive(dropdown);
            items[nextIndex].classList.add('active');
          }
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (activeItem) {
          const prevIndex = parseInt(activeItem.dataset.index) - 1;
          this.clearActive(dropdown);
          if (prevIndex >= 0) {
            items[prevIndex].classList.add('active');
          }
        }
        break;
        
      case 'Enter':
        event.preventDefault();
        if (activeItem) {
          const index = parseInt(activeItem.dataset.index);
          this.selectItem(inputElement, results[index], activeData.dataType);
          this.hideDropdown(inputId);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.hideDropdown(inputId);
        break;
    }
  }

  /**
   * Main function to attach autocomplete to an input element
   */
  attachTo(inputSelector, dataType, options = {}) {
    const inputElement = document.querySelector(inputSelector);
    if (!inputElement) {
      console.error(`Input element not found: ${inputSelector}`);
      return;
    }

    const debounceDelay = options.debounceDelay || 300;
    const minLength = options.minLength || 2;

    // Input event handler
    inputElement.addEventListener('input', (e) => {
      const query = e.target.value;
      
      if (query.length < minLength) {
        this.hideDropdown(inputElement.id);
        return;
      }

      this.debounce(() => {
        const results = this.search(query, dataType);
        this.showDropdown(inputElement, results, dataType);
      }, debounceDelay, inputElement.id);
    });

    // Keyboard navigation
    inputElement.addEventListener('keydown', (e) => {
      this.handleKeydown(inputElement, e);
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!inputElement.contains(e.target)) {
        this.hideDropdown(inputElement.id);
      }
    });

    // Focus event to show recent results
    inputElement.addEventListener('focus', (e) => {
      if (e.target.value.length >= minLength) {
        const results = this.search(e.target.value, dataType);
        if (results.length > 0) {
          this.showDropdown(inputElement, results, dataType);
        }
      }
    });

    console.log(`✅ Autocomplete attached to ${inputSelector} for ${dataType}`);
  }

  /**
   * Convenience methods for different travel types
   */
  attachAirports(inputSelector, options = {}) {
    this.attachTo(inputSelector, 'airports', options);
  }

  attachRailwayStations(inputSelector, options = {}) {
    this.attachTo(inputSelector, 'railwayStations', options);
  }

  attachBusStops(inputSelector, options = {}) {
    this.attachTo(inputSelector, 'busStops', options);
  }

  attachHotels(inputSelector, options = {}) {
    this.attachTo(inputSelector, 'hotels', options);
  }

  /**
   * Get selected item data from input
   */
  getSelectedItem(inputSelector) {
    const inputElement = document.querySelector(inputSelector);
    if (!inputElement) return null;
    
    const itemData = inputElement.getAttribute('data-selected-item');
    return itemData ? JSON.parse(itemData) : null;
  }

  /**
   * Clean up all autocomplete instances
   */
  destroy() {
    // Clear all timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    // Hide all dropdowns
    this.activeDropdowns.forEach((data, inputId) => {
      this.hideDropdown(inputId);
    });
    this.activeDropdowns.clear();
    
    // Remove all dropdown elements
    document.querySelectorAll('.autocomplete-dropdown').forEach(dropdown => {
      dropdown.remove();
    });
  }
}

// Create global instance
window.travelAutocomplete = new TravelAutocomplete();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TravelAutocomplete;
}