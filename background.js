let buttonData = {};

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

// Fetch user preferences from API
function fetchUserPreferences(domain, callback) {
  chrome.storage.local.get(['session_id'], (data) => {
    const sessionId = data.session_id;
    if (sessionId) {
      fetch(`https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/preferences/${domain}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        cookies: {
          'session_id': sessionId
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        return response.json();
      })
      .then(data => {
        console.log('User preferences loaded:', data);
        callback(data);
      })
      .catch(error => console.error('Error loading user preferences:', error));
    } else {
      console.error('No session ID found');
    }
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
