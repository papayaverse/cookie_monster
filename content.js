// Function to handle cookie banners
function handleCookieBanner(buttons) {
    if (!buttons) {
      console.log('No button data found for domain:{', domain, '}');
      return;
    }
  
    // Helper function to find and click a button
    function findAndClickButton(buttonSelector, buttonId) {
      const button = document.getElementById(buttonId) || document.querySelector(buttonSelector);
      if (button) {
        console.log(`Clicking button ${buttonId || buttonSelector}:`, button);
        button.click();
        return true;
      }
      console.log(`Button ${buttonId || buttonSelector} not found.`);
      return false;
    }
  
    // Wait for external buttons to load
    setTimeout(() => {
      // Try to click the "Reject All" button
      if (buttons.external_buttons && buttons.external_buttons.reject_all) {
        const rejectAllClicked = findAndClickButton(buttons.external_buttons.reject_all.selector, buttons.external_buttons.reject_all.id);
        if (rejectAllClicked) return;
      }
  
      // If "Reject All" is not found, try to click "Manage My Preferences"
      if (buttons.external_buttons && buttons.external_buttons.manage_my_preferences) {
        const manageMyPreferencesClicked = findAndClickButton(buttons.external_buttons.manage_my_preferences.selector, buttons.external_buttons.manage_my_preferences.id);
        if (manageMyPreferencesClicked) {
          // Wait for internal buttons to appear
          setTimeout(() => {
            if (buttons.internal_buttons) {
              buttons.internal_buttons.forEach(button => {
                if (button.option_name === 'reject_all') {
                  findAndClickButton(button.selector, button.id);
                }
              });
            }
          }, 2000); // Adjust delay as needed for your pages
          return;
        }
      }
  
      // If neither "Reject All" nor "Manage My Preferences" are found, click "Accept All"
      if (buttons.external_buttons && buttons.external_buttons.accept_all) {
        findAndClickButton(buttons.external_buttons.accept_all.selector, buttons.external_buttons.accept_all.id);
      }
    }, 2000); // Adjust delay as needed for your pages
  }
  
  const domain = window.location.hostname.replace('www.', '').trim();
  
  // Request button data from the background script
  chrome.runtime.sendMessage({ action: 'getButtonData', domain: domain }, response => {
    if (chrome.runtime.lastError) {
      console.error('Error fetching button data:', chrome.runtime.lastError.message);
    } else {
      console.log('Button data received from background script:', response);
      handleCookieBanner(response);
    }
  });
  