let buttonData = {};

// Fetch the JSON data once when the service worker starts
fetch(chrome.runtime.getURL('url_data2.json'))
  .then(response => response.json())
  .then(data => {
    buttonData = data;
    console.log('Button data loaded in background script:', buttonData);
  })
  .catch(error => console.error('Error loading button data in background script:', error));

// Fetch user preferences from API
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
        console.log('User preferences loaded:', data);
        callback(data);
      })
      .catch(error => console.error('Error loading user preferences:', error));
    } else {
      console.error('No credentials found');
    }
  });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getButtonData') {
    const domain = message.domain;
    sendResponse(buttonData[domain]);
  } else if (message.action === 'getUserPreferences') {
    const domain = message.domain;
    fetchUserPreferences(domain, preferences => {
      sendResponse(preferences);
    });
    return true; // Will respond asynchronously
  }
});