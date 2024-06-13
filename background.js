chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });
  
  let buttonData = {};
  
  // Fetch the JSON data when the extension is installed
  fetch(chrome.runtime.getURL('url_data2.json'))
    .then(response => response.json())
    .then(data => {
      buttonData = data;
      console.log('Button data loaded in background script:', buttonData);
    })
    .catch(error => console.error('Error loading button data in background script:', error));
  
  // Listen for messages from content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getButtonData') {
      const domain = message.domain;
      sendResponse(buttonData[domain]);
    }
  });
  