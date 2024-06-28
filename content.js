// Function to handle cookie banners
function handleCookieBanner(buttons, preferences) {
  if (!buttons) {
    console.log('No button data found for domain:', domain);
    return;
  }

  const preference = preferences || 'reject_all'; // Default to reject_all if no preference for domain

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
      const xpath = `//button[contains(text(), "${buttonDetails.text}")]`;
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
      button = document.querySelector(`.${buttonDetails.class}`);
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

  // Wait for external buttons to load
  setTimeout(() => {
    if (preference === 'reject_all' && buttons.external_buttons && buttons.external_buttons.reject_all) {
      const rejectAllClicked = findAndClickButton(buttons.external_buttons.reject_all);
      if (rejectAllClicked) return;
    }

    if (preference === 'manage_my_preferences' && buttons.external_buttons && buttons.external_buttons.manage_my_preferences) {
      const manageMyPreferencesClicked = findAndClickButton(buttons.external_buttons.manage_my_preferences);
      if (manageMyPreferencesClicked) {
        // Wait for internal buttons to appear
        setTimeout(() => {
          let rejectAllClicked = false;
          if (buttons.internal_buttons) {
            buttons.internal_buttons.forEach(button => {
              if (button.option_name === 'reject_all') {
                rejectAllClicked = findAndClickButton(button);
              }
            });
          }

          // If "Reject All" is not found, try to click "Confirm My Preferences"
          if (!rejectAllClicked) {
            if (buttons.internal_buttons) {
              buttons.internal_buttons.forEach(button => {
                if (button.option_name === 'confirm_my_preferences') {
                  findAndClickButton(button);
                }
              });
            }
          }
        }, 2000); // Adjust delay as needed for your pages
        return;
      }
    }

    if (preference === 'accept_all' && buttons.external_buttons && buttons.external_buttons.accept_all) {
      findAndClickButton(buttons.external_buttons.accept_all);
    }
  }, 2000); // Adjust delay as needed for your pages
}

const domain = window.location.hostname.replace('www.', '');

// Request user preferences and button data from the background script
chrome.runtime.sendMessage({ action: 'getUserPreferences', domain: domain }, userPreferences => {
  if (chrome.runtime.lastError) {
    console.error('Error fetching user preferences:', chrome.runtime.lastError.message);
  } else {
    console.log('User preferences received from background script:', userPreferences);
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
