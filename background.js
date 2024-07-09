let buttonData = [];

// Load the JSON data once when the service worker starts and store it in a Promise
const loadButtonData = () => {
  return fetch(chrome.runtime.getURL('url_data2.json'))
    .then(response => response.json())
    .then(data => {
      buttonData = data;
      console.log('Button data loaded in background script:', buttonData);
      return data;
    })
    .catch(error => {
      console.error('Error loading button data in background script:', error);
      throw error;
    });
};

// Call the loadButtonData function and store the Promise
const buttonDataPromise = loadButtonData();

// Fetch user preferences from API if logged in, otherwise use local storage
function fetchUserPreferences(domain, callback) {
  chrome.storage.local.get(['username', 'password'], (credentials) => {
    if (credentials.username && credentials.password) {
      fetch(`https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/preferences/${domain}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password),
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        return response.json();
      })
      .then(data => {
        console.log('User preferences loaded from API:', data);
        callback(data);
      })
      .catch(error => {
        console.error('Error loading user preferences from API:', error);
        fetchLocalPreferences(callback);
      });
    } else {
      fetchLocalPreferences(callback);
    }
  });
}

// Fetch preferences from local storage
function fetchLocalPreferences(callback) {
  chrome.storage.local.get(['marketing', 'performance', 'sell_data'], (preferences) => {
    const userPreferences = {
      marketing: preferences.marketing || false,
      performance: preferences.performance || false,
      sell_data: preferences.sell_data || false
    };
    console.log('User preferences loaded from local storage:', userPreferences);
    callback(userPreferences);
  });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getButtonData') {
    const domain = message.domain;
    // Wait for the button data to be loaded before responding
    buttonDataPromise.then(() => {
      sendResponse(buttonData[domain]);
    }).catch(error => {
      console.error('Error sending button data:', error);
      sendResponse({});
    });
    return true; // Will respond asynchronously
  } else if (message.action === 'getUserPreferences') {
    const domain = message.domain;
    fetchUserPreferences(domain, preferences => {
      sendResponse(preferences);
    });
    return true; // Will respond asynchronously
  }
});

// Periodically send collected data to the server
setInterval(() => {
  if (collectedData.length > 0) {
    chrome.storage.local.get(['username', 'password'], (credentials) => {
      if (credentials.username && credentials.password) {
        chrome.storage.local.get(['marketing', 'performance'], (cookiePreferences) => {
          const preferences = {
            marketing: cookiePreferences.marketing || false,
            performance: cookiePreferences.performance || false,
            sell_data: true
          };

          fetch('https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/collect', {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
          })
          .then(response => response.json())
          .then(data => {
            console.log('Data sent to server:', data);
            // Clear collected data after successful send
            collectedData = [];
          })
          .catch(error => console.error('Error sending data to server:', error));
        });
      } else {
        console.error('No credentials found');
      }
    });
  }
}, 6000); // Adjust the interval as needed (e.g., every minute)
