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
  }
});
