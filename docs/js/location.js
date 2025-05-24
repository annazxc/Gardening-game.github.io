async function initLocationMap() {
    try {
        const locationData = await fetchPreciseLocation();
        displayLocationInfo(locationData);
        const weather = document.getElementById('weather');
        
        const isDaytime = checkIfDaytime(locationData.timezone);
        const timeOfDay = isDaytime ? 'day' : 'night';
        
        const map = await showInteractiveMap(locationData.latitude, locationData.longitude, timeOfDay);
         
        displayNearbyPlaces(locationData,addNearbyPlaces());
        
        await addWeather(weather, locationData.latitude, locationData.longitude);
        
        addRoutePlanning(map, locationData.latitude, locationData.longitude);
        
        addCategoryFilters(map, addNearbyPlaces(),locationData);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('location-info').textContent = 'Error detecting location. Please try again.';
    }
}
function fetchPreciseLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                try {
                    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await response.json();
                    
                    resolve({
                        latitude: latitude,
                        longitude: longitude,
                        city: data.locality || data.city,
                        region: data.principalSubdivision,
                        country_name: data.countryName,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        ip: 'Using device location'
                    });
                } catch (error) {
                    resolve({
                        latitude: latitude,
                        longitude: longitude,
                        city: 'Unknown location',
                        region: '',
                        country_name: '',
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        ip: 'Using device location'
                    });
                }
            },
            (error) => {
                console.warn('Geolocation permission denied, falling back to IP', error);
                fetchIPLocation().then(resolve).catch(reject);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

async function fetchIPLocation() {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
        throw new Error('Failed to fetch location data');
    }
    return await response.json();
}


function displayLocationInfo(data) {
    if(data.country_name =='Taiwan (Province of China)'){
        data.country_name='Taiwan';
    }
    const locationInfo = document.getElementById('location-info');
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: data.timezone }));
    const timeString = localTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const isDaytime = checkIfDaytime(data.timezone);
    const timeOfDayText = isDaytime ? 'Daytime' : 'Nighttime';
    
    
    locationInfo.innerHTML = `
        <h2>You are in ${data.city}, ${data.country_name}</h2>
        <p><strong>Coordinates:</strong> ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}</p>
        <p><strong>Local time:</strong> ${timeString} (${timeOfDayText})</p>
    `;
    
    alert(`Welcome ! 
        You are in ${data.city}, ${data.country_name}! 
        Discover interesting places in wonderland nearby !`);
}

function checkIfDaytime(timezone) {
    const now = new Date();
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const hours = localTime.getHours();
    return hours >= 6 && hours < 18;
}

async function showInteractiveMap(latitude, longitude, timeOfDay) {
    const map = L.map('map').setView([latitude, longitude], 13);
    const apiKey = getApiKey("location");
    
    const style = timeOfDay === 'day' ? 'streets' : 'dark';
    
    L.tileLayer(`https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${apiKey}`, {
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup('<strong>You are here!</strong>')
        .openPopup();
        
    document.getElementById('loading').style.display = 'none';
    
    return map;
}

//places in wonderland
function addNearbyPlaces() {
        const places = [
            {
                name: "Bamboo stem",
                category: "garden",
                address: "Wonderland road 23",
                rating: 4.8,
                latitude:25.079841939680758,
                longitude:121.52485088681586
            },
            {
                name: "Exotic Flowers",
                category: "garden",
                address: "Magical street 12",
                rating: 4.6,
                latitude:25.069643238548274,
                longitude: 121.52892654695127
            },
            {
                name: "Cabin Entrance",
                category: "cabin",
                address: "Happy Dream road 34",
                rating: 4.5,
                latitude: 25.09170693312087, 
                longitude: 121.57094395910302
            },
            {
                name: "Pavilion",
                category: "attraction",
                address: "Mushroom View 22",
                rating: 4.7,
                latitude: 25.09213421399661, 
                longitude: 121.57647043602816
            },
            {
                name: "Wonder Library",
                category: "attraction",
                address: "Book Avenue 45",
                rating: 4.9,
                latitude: 25.13652709294163,
                longitude: 121.50687025323924
            },
            {
                name: "Coffee House",
                category: "attraction",
                address: "Bean Street 12",
                rating: 4.5,
                latitude: 25.0509237031393, 
                longitude:121.58392918663694
            }
        ];
        window.allPlaces = places;
            return places;
}

function displayNearbyPlaces(origin,places) {
    const placesContainer = document.getElementById('nearby-places');
    placesContainer.innerHTML = '';
    
    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = `place-card ${place.category}`;
        placeCard.innerHTML = `
            <h3>${place.name}</h3>
            <p>${place.address}</p>
            <p>Rating: ${place.rating} ⭐</p>
            <a href="https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${place.latitude},${place.longitude}" target="_blank">Directions</a>
        `;
        placesContainer.appendChild(placeCard);
    });
}

function addCategoryFilters(map, places,origin) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <button data-category="all" class="active">All Places</button>
        <button data-category="garden">Garden</button>
        <button data-category="attraction">Attraction</button>
        <button data-category="cabin">Cabin</button>
    `;
    
    document.querySelector('.container').insertBefore(filterContainer, document.getElementById('nearby-places'));
    
    filterContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('.filter-container button').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Filter places
            const category = e.target.dataset.category;
            const filteredPlaces = category === 'all' ? 
                window.allPlaces : 
                window.allPlaces.filter(place => place.category === category);
            
            // Update displayed places
            
            (origin,filteredPlaces);
        }
    });
}

async function addWeather(weather, latitude, longitude) {
    try {
        // Fetch real weather data from Open-Meteo API
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`);
        
        if (!response.ok) {
            throw new Error('Weather data fetch failed');
        }
        
        const data = await response.json();
        
        // Extract the weather information from API response
        const temp = Math.round(data.current.temperature_2m);
        const weatherCode = data.current.weather_code;
        
        // Map WMO weather codes to descriptions and icons
        const weatherInfo = getWeatherInfo(weatherCode);
        
        // Create weather info control
        const weatherControl = L.control({position: 'topright'});
        weatherControl.onAdd = function() {
            const div = L.DomUtil.create('div', 'weather-info');
            div.innerHTML = `
                <div class="weather-card">
                    <h3>Current Weather</h3>
                    <div class="weather-icon">${weatherInfo.icon}</div>
                    <p>${temp}${data.current_units.temperature_2m}, ${weatherInfo.description}</p>
                </div>
            `;
            return div;
        };
        weatherControl.addTo(weather);
    } catch (error) {
        console.error('Error adding weather overlay:', error);
    }
}

function getWeatherInfo(code) {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    const weatherCodes = {
        0: { description: 'Clear Sky', icon: '☀️' },
        1: { description: 'Mainly Clear', icon: '🌤️' },
        2: { description: 'Partly Cloudy', icon: '⛅' },
        3: { description: 'Overcast', icon: '☁️' },
        45: { description: 'Fog', icon: '🌫️' },
        48: { description: 'Depositing Rime Fog', icon: '🌫️' },
        51: { description: 'Light Drizzle', icon: '🌦️' },
        53: { description: 'Moderate Drizzle', icon: '🌦️' },
        55: { description: 'Dense Drizzle', icon: '🌧️' },
        56: { description: 'Light Freezing Drizzle', icon: '🌨️' },
        57: { description: 'Dense Freezing Drizzle', icon: '🌨️' },
        61: { description: 'Slight Rain', icon: '🌦️' },
        63: { description: 'Moderate Rain', icon: '🌧️' },
        65: { description: 'Heavy Rain', icon: '🌧️' },
        66: { description: 'Light Freezing Rain', icon: '🌨️' },
        67: { description: 'Heavy Freezing Rain', icon: '🌨️' },
        71: { description: 'Slight Snow Fall', icon: '🌨️' },
        73: { description: 'Moderate Snow Fall', icon: '🌨️' },
        75: { description: 'Heavy Snow Fall', icon: '❄️' },
        77: { description: 'Snow Grains', icon: '❄️' },
        80: { description: 'Slight Rain Showers', icon: '🌦️' },
        81: { description: 'Moderate Rain Showers', icon: '🌧️' },
        82: { description: 'Violent Rain Showers', icon: '⛈️' },
        85: { description: 'Slight Snow Showers', icon: '🌨️' },
        86: { description: 'Heavy Snow Showers', icon: '❄️' },
        95: { description: 'Thunderstorm', icon: '⛈️' },
        96: { description: 'Thunderstorm with Slight Hail', icon: '⛈️' },
        99: { description: 'Thunderstorm with Heavy Hail', icon: '⛈️' }
    };
    
    return weatherCodes[code] || { description: 'Unknown', icon: '❓' };
}

function addRoutePlanning(map, userLat, userLng) {
    if (typeof L.Routing !== 'undefined') {
        // Add a control for route planning
        const routeControl = L.Routing.control({
            waypoints: [
                L.latLng(userLat, userLng)
            ],
            routeWhileDragging: true,
            geocoder: L.Control.Geocoder.nominatim()
        }).addTo(map);
        
        // Add instructions
        const instructionDiv = document.createElement('div');
        instructionDiv.style.textAlign = 'center';
        instructionDiv.style.margin = '10px 0';
        instructionDiv.innerHTML = '<p>Click anywhere on the map to get directions from your location!</p>';
        document.querySelector('.container').insertBefore(instructionDiv, document.getElementById('nearby-places'));
        
        // Let users click to set destination
        map.on('click', function(e) {
            routeControl.spliceWaypoints(1, 1, e.latlng);
        });
    }
}

// Initialize the application
window.onload = initLocationMap;
