// Weather App JavaScript - ICT Project Class 8
// This app gets weather data and shows it in a beautiful interface

// Global variables
let currentCity = '';
let lastSearchTime = '';

// Function to get weather data
async function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value.trim();
    
    if (city === '') {
        showNotification('Please enter a city name!', 'warning');
        return;
    }
    
    // Show loading
    showLoading();
    hideError();
    
    try {
        // Get current weather data
        const weatherData = await getCurrentWeather(city);
        
        if (!weatherData) {
            showError();
            return;
        }
        
        currentCity = city;
        lastSearchTime = new Date().toLocaleTimeString();
        
        // Create weather for yesterday, today, and tomorrow
        const yesterday = createWeatherData(weatherData, -2);
        const today = weatherData;
        const tomorrow = createWeatherData(weatherData, 2);
        
        // Display the weather data
        displayWeather('yesterday', yesterday);
        displayWeather('today', today);
        displayWeather('tomorrow', tomorrow);
        
        // Show additional information
        displayAdditionalInfo(weatherData);
        
        // Hide loading
        hideLoading();
        
        // Show success notification
        showNotification(`Weather data loaded for ${city}!`, 'success');
        
    } catch (error) {
        console.log('Error:', error);
        showError();
    }
}

// Function to search for a specific city (for quick buttons)
function searchCity(cityName) {
    document.getElementById('cityInput').value = cityName;
    getWeather();
}

// Function to get current weather data
async function getCurrentWeather(city) {
    // Using WeatherAPI.com
    // IMPORTANT: Replace YOUR_API_KEY with your actual WeatherAPI.com API key
    const apiKey = 'YOUR_API_KEY'; // Replace this with your actual API key
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        
        return {
            temperature: Math.round(data.current.temp_c),
            description: data.current.condition.text,
            humidity: data.current.humidity,
            windSpeed: data.current.wind_kph / 3.6, // Convert km/h to m/s
            cityName: data.location.name,
            country: data.location.country,
            visibility: data.current.vis_km,
            pressure: data.current.pressure_mb,
            feelsLike: Math.round(data.current.feelslike_c),
            lastUpdated: data.current.last_updated,
            uv: data.current.uv,
            windDirection: data.current.wind_dir
        };
    } catch (error) {
        console.log('Error getting weather:', error);
        return null;
    }
}

// Function to create weather data for other days (simulated)
function createWeatherData(baseData, tempChange) {
    return {
        temperature: Math.round(baseData.temperature + tempChange),
        description: baseData.description,
        humidity: Math.max(0, Math.min(100, baseData.humidity + (Math.random() * 10 - 5))),
        windSpeed: Math.max(0, baseData.windSpeed + (Math.random() * 2 - 1)),
        cityName: baseData.cityName,
        country: baseData.country,
        visibility: baseData.visibility,
        pressure: baseData.pressure,
        feelsLike: Math.round(baseData.feelsLike + tempChange),
        lastUpdated: baseData.lastUpdated
    };
}

// Function to display weather data
function displayWeather(dayId, weatherData) {
    const dayElement = document.getElementById(dayId);
    
    if (weatherData) {
        dayElement.innerHTML = `
            <div class="temperature">${weatherData.temperature}°C</div>
            <div class="description">${weatherData.description}</div>
            <p>Humidity: ${Math.round(weatherData.humidity)}%</p>
            <p>Wind: ${weatherData.windSpeed.toFixed(1)} m/s</p>
            ${weatherData.country ? `<p><small>${weatherData.cityName}, ${weatherData.country}</small></p>` : ''}
        `;
    } else {
        dayElement.innerHTML = '<div class="placeholder"><i class="fas fa-exclamation-triangle"></i><p>Weather data not available</p></div>';
    }
}

// Function to display additional weather information
function displayAdditionalInfo(weatherData) {
    const additionalInfo = document.getElementById('additionalInfo');
    
    if (weatherData) {
        document.getElementById('visibility').textContent = `${weatherData.visibility} km`;
        document.getElementById('pressure').textContent = `${weatherData.pressure} mb`;
        document.getElementById('feelsLike').textContent = `${weatherData.feelsLike}°C`;
        document.getElementById('lastUpdated').textContent = formatTime(weatherData.lastUpdated);
        
        additionalInfo.style.display = 'block';
    }
}

// Function to format time
function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleString();
}

// Function to show loading
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('yesterday').innerHTML = '<div class="placeholder"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
    document.getElementById('today').innerHTML = '<div class="placeholder"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
    document.getElementById('tomorrow').innerHTML = '<div class="placeholder"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';
    document.getElementById('additionalInfo').style.display = 'none';
}

// Function to hide loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Function to show error
function showError() {
    hideLoading();
    document.getElementById('error').style.display = 'block';
}

// Function to hide error
function hideError() {
    document.getElementById('error').style.display = 'none';
}

// Function to show notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Function to get current location weather
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const apiKey = 'YOUR_API_KEY'; // Replace this with your actual API key
                const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;
                
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data.location) {
                        document.getElementById('cityInput').value = data.location.name;
                        getWeather();
                    }
                } catch (error) {
                    console.log('Error getting location weather:', error);
                }
            },
            (error) => {
                console.log('Error getting location:', error);
                showNotification('Could not get your location', 'warning');
            }
        );
    } else {
        showNotification('Geolocation is not supported by your browser', 'warning');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Allow Enter key to search
    document.getElementById('cityInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            getWeather();
        }
    });
    
    // Add current location button functionality
    const locationBtn = document.createElement('button');
    locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> My Location';
    locationBtn.onclick = getCurrentLocationWeather;
    locationBtn.style.marginLeft = '10px';
    document.querySelector('.search-box').appendChild(locationBtn);
    
    // Add some sample data on page load
    setTimeout(() => {
        if (document.getElementById('yesterday').innerHTML.includes('Enter a city')) {
            showNotification('Welcome! Enter a city name to get started.', 'info');
        }
    }, 1000);
});
