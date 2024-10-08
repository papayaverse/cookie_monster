// functions to change icon

function updateIconToActive() {
  console.log('Active Icon set');
  chrome.runtime.sendMessage({ action: 'updateIcon', icon: 'active' });
}

function updateIconToDefault() {
  console.log('Default Icon set');
  chrome.runtime.sendMessage({ action: 'updateIcon', icon: 'default' });
}



// Function to handle cookie banners
function handleCookieBanner(buttons, preferences) {
  if (!buttons) {
    console.log('No button data found for domain:', domain);
    return;
  }

  const { marketing, performance } = preferences;

  let actionType = 'reject_all'; // Default to reject_all if no preference for domain
  if (marketing === true && performance === true) {
    actionType = 'accept_all';
  }

  // Helper function to find and click a button
  function findAndClickButton(buttonDetails) {
    let button;

    // Try to find the button by ID
    if (buttonDetails.id) {
      button = document.getElementById(buttonDetails.id);
      if (button) {
        console.log(`Clicking button by ID (${buttonDetails.id}):`, button);
        button.click();
        return true;
      }
      console.log(`Button not found by ID: ${buttonDetails.id}`);
    }

    // Try to find the button by Text
    if (buttonDetails.text) {
      const xpath = `//*[contains(text(), "${buttonDetails.text}")]`; 

      button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (button) {
        console.log(`Clicking button by Text (${buttonDetails.text}):`, button);
        button.click();
        return true;
      }
      console.log(`Button not found by Text: ${buttonDetails.text}`);
    }

    // Try to find the button by Class
    if (buttonDetails.class) {
      const classXpath = `//*[${buttonDetails.class.split(' ').map(cls => `contains(@class, '${cls}')`).join(' and ')}]`;
      button = document.evaluate(classXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      if (button) {
        console.log(`Clicking button by Class (${buttonDetails.class}):`, button);
        button.click();
        return true;
      }
      console.log(`Button not found by Class: ${buttonDetails.class}`);
    }

    console.log('Button not found by any selector:', buttonDetails);
    return false;
  }

  // Function to handle accept all path
  function handleAcceptAll() {
    if (buttons.external_buttons && buttons.external_buttons.accept_all) {
      const acceptAllClicked = findAndClickButton(buttons.external_buttons.accept_all);
      if (acceptAllClicked) return;
    }

    if (buttons.external_buttons && buttons.external_buttons.manage_my_preferences) {
      const manageMyPreferencesClicked = findAndClickButton(buttons.external_buttons.manage_my_preferences);
      if (manageMyPreferencesClicked) {
        // Wait for internal buttons to appear
        setTimeout(() => {
          if (buttons.internal_buttons) {
            buttons.internal_buttons.forEach(button => {
              if (button.option_name === 'accept_all') {
                const acceptAllClicked = findAndClickButton(button);
                  // Click confirm my preferences after accept all
                setTimeout(() => {
                  buttons.internal_buttons.forEach(button => {
                    if (button.option_name === 'confirm_my_preferences') {
                      findAndClickButton(button);
                    }
                  });
                }, 2000);
              }
            });
          }
        }, 2000); // Adjust delay as needed for your pages
        return;
      }
    }
  }

  // Function to handle reject all path
  function handleRejectAll() {
    if (buttons.external_buttons && buttons.external_buttons.reject_all) {
      const rejectAllClicked = findAndClickButton(buttons.external_buttons.reject_all);
      if (rejectAllClicked) return;
    }

    if (buttons.external_buttons && buttons.external_buttons.manage_my_preferences) {
      const manageMyPreferencesClicked = findAndClickButton(buttons.external_buttons.manage_my_preferences);
      if (manageMyPreferencesClicked) {
        // Wait for internal buttons to appear
        setTimeout(() => {
          if (buttons.internal_buttons) {
            buttons.internal_buttons.forEach(button => {
              if (button.option_name === 'reject_all') {
              const rejectAllClicked = findAndClickButton(button);
                // Click confirm my preferences after reject all
                setTimeout(() => {
                  buttons.internal_buttons.forEach(button => {
                    if (button.option_name === 'confirm_my_preferences') {
                      findAndClickButton(button);
                    }
                  });
                }, 2000);
              }
            });
          }
        }, 2000); // Adjust delay as needed for your pages
        return;
      }
    }
  }
  setTimeout(() => {
    updateIconToActive();
    // Notify background script that a banner was clicked
    chrome.runtime.sendMessage({ action: 'bannerClicked' });
    if (actionType === 'accept_all') {
      handleAcceptAll();
    } else {
      handleRejectAll();
    }
    setTimeout(() => {
      updateIconToDefault(); // Revert back to the default icon after a short delay
    }, 3000);
  }, 2000); // Adjust delay as needed for your pages


}

function getBaseDomain(url) {
  const hostname = url.hostname;
  const domainParts = hostname.split('.');
  
  // Known common TLDs that consist of multiple parts
  const knownTLDs = [
    'co.uk', 'org.uk', 'gov.uk', 'ac.uk',
    'com.au', 'net.au', 'org.au',
    'co.in', 'net.in', 'org.in',
    // Add more if needed
  ];

  // Check if the hostname ends with one of the known TLDs
  for (let tld of knownTLDs) {
    if (hostname.endsWith(tld)) {
      return domainParts.slice(-3).join('.'); // Take the last 3 parts (subdomain + domain + TLD)
    }
  }

  // If not, assume the last 2 parts are the domain (like example.com or example.co.uk)
  return domainParts.slice(-2).join('.');
}

const domain = getBaseDomain(window.location);


// Request user preferences and button data from the background script
//chrome.runtime.sendMessage({ action: 'getUserPreferences', domain: domain }, userPreferences => {
chrome.storage.local.get(['marketing', 'performance'], (userPreferences) => {
  if (chrome.runtime.lastError) {
    console.error('Error fetching user preferences:', chrome.runtime.lastError.message);
  } else {
    console.log('User preferences received from local storage :', userPreferences);
    chrome.runtime.sendMessage({ action: 'getButtonData', domain: domain }, buttonData => {
      if (chrome.runtime.lastError) {
        console.error('Error fetching button data:', chrome.runtime.lastError.message);
      } else {
        console.log('Button data received from background script:', buttonData);
        handleCookieBanner(buttonData, userPreferences);
      }
    });
  }
});

// Function to collect data from the webpage
function collectData() {
  const data = {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toISOString()
    // Add any other data you need to collect
  };

  // Send the data to the background script
  chrome.runtime.sendMessage({ action: 'collectData', data: data });
  console.log('Data collected:', data);
}

// Call the function to check preferences and collect data
collectData();

