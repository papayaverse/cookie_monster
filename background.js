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

chrome.runtime.onInstalled.addListener((details) => {
  if (details && details.reason === 'install') {
    // Initialize counters on first install
    chrome.storage.local.set({ totalClicks: 0, uniqueSites: {} }, () => {
      console.log('Counters initialized on first install.');
    });

    // Collect cookie preferences for the first time after install
    collectCookiePreferences();
  } else if (details && details.reason === 'update') {
    // Collect preferences after an extension update
    collectCookiePreferences();
    console.log('Extension updated, collecting preferences.');
  }
});

// Function to collect cookie preferences
function collectCookiePreferences() {
  // Check if preferences are already saved
  chrome.storage.local.get(['marketing', 'performance'], (data) => {
    if (data.marketing !== undefined && data.performance !== undefined) {
      console.log('Preferences already exist, no need to collect again.');
      // Send the existing preferences to the backend 
      const cPrefs = {
        allow_marketing: data.marketing,
        allow_performance: data.performance
      }
      saveBackendCookiePreferences(cPrefs);
    } else {
      // If preferences don't exist, collect them (you could trigger the popup or save defaults)
      const defaultPreferences = {
        allow_marketing: false,
        allow_performance: false
      };
      
      chrome.storage.local.set({ marketing: defaultPreferences.allow_marketing, performance: defaultPreferences.allow_performance }, () => {
        console.log('Default preferences saved locally.');
        // Optionally, send these preferences to the backend
        saveBackendCookiePreferences(defaultPreferences);
      });
    }
  });
}

// Call the loadButtonData function and store the Promise
const buttonDataPromise = loadButtonData();

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
  } else if (message.action === 'collectData') {
    chrome.storage.local.get(['username', 'password'], (credentials) => {
      if (credentials.username && credentials.password) {
        // Send data to the server
        fetch('https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/collect', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(message.data)
        })
        .then(response => response.json())
        .then(data => {
          console.log('Data sent to server:', data);
        })
        .catch(error => console.error('Error sending data to server:', error));
      } else {
        console.error('No credentials found for data collection');
      }
    });
    return true; // Will respond asynchronously
  } else if (message.action === 'updateIcon') {
    let iconPath = '';
    if (message.icon === 'active') {
      
      iconPath = 'small_green_tick.png'; // Path to your active icon
    } else {
      
      iconPath = 'cookie_monster_small.png'; // Path to your default icon
    }
    chrome.action.setIcon({ path: iconPath, tabId: sender.tab.id });
  } else if (message.action === 'bannerClicked') {
    const domain = new URL(sender.tab.url).hostname;
    function updateClickData(domain) {
      chrome.storage.local.get(['totalClicks', 'uniqueSites'], (data) => {
        let { totalClicks, uniqueSites } = data;
        if (!totalClicks) {
          totalClicks = 0;
        }
        if (!uniqueSites) {
          uniqueSites = {};
        }
        const newTotalClicks = totalClicks + 1;
        const updatedUniqueSites = { ...uniqueSites };
        if (!updatedUniqueSites[domain]) {
          updatedUniqueSites[domain] = true; // Mark this site as clicked
        }
        chrome.storage.local.set({ totalClicks: newTotalClicks, uniqueSites: updatedUniqueSites });
      });
    }
    updateClickData(domain);
  }
});

// Save preferences to the backend
function saveBackendCookiePreferences(cookiePreferences) {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get(['userIdentifier'], (data) => {
          const userIdentifier = data.userIdentifier;
          const identifierParam = userIdentifier ? userIdentifier : 'null';
          const apiUrl = `https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/cookiePreferences?identifier=${encodeURIComponent(identifierParam)}`;
          fetch(apiUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(cookiePreferences)
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Failed to save preferences. Status: ' + response.status);
              }
              return response.json();
          })
          .then(data => {
              console.log('Server response:', data);
              if (data.id && !userIdentifier) {
                  // Store the returned ID in local storage if it's not already stored
                  chrome.storage.local.set({ userIdentifier: data.id }, () => {
                      //alert(`Preferences saved successfully for ID: ${data.id}`);
                      //alert('Cookie preferences saved successfully!');
                      resolve();
                  });
              } else {
                  //alert('Cookie preferences saved successfully for id ' + userIdentifier);
                  resolve();
              }
          })
          .catch(error => {
              console.error('Error saving preferences:', error);
              reject(error);
          });
      });
  });
}


