// Load JSON data
const jsonUrl = chrome.runtime.getURL('url_data2.json');
console.log('Fetching URL:', jsonUrl);
// Load JSON data
fetch(jsonUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(buttonData => {
    console.log('Button data loaded successfully:', buttonData);

    // Function to handle cookie banners
    function handleCookieBanner(domain) {
      const buttons = buttonData[domain];
      if (!buttons) {
        console.log('No button data found for domain:', domain);
        return;
      }

      // Try to click the "Reject All" button
      if (buttons.external_buttons && buttons.external_buttons.reject_all) {
        const rejectButton = document.getElementById(buttons.external_buttons.reject_all.id);
        if (rejectButton) {
          console.log('Clicking "Reject All" button:', rejectButton);
          rejectButton.click();
          return;
        } else {
          console.log('"Reject All" button not found:', buttons.external_buttons.reject_all.id);
        }
      }

      // If "Reject All" is not found, try to click "Manage My Preferences"
      if (buttons.external_buttons && buttons.external_buttons.manage_my_preferences) {
        const manageButton = document.getElementById(buttons.external_buttons.manage_my_preferences.id);
        if (manageButton) {
          console.log('Clicking "Manage My Preferences" button:', manageButton);
          manageButton.click();
          // Wait for internal buttons to appear
          setTimeout(() => {
            if (buttons.internal_buttons) {
              buttons.internal_buttons.forEach(button => {
                if (button.option_name === 'reject_all') {
                  const internalRejectButton = document.getElementById(button.id);
                  if (internalRejectButton) {
                    console.log('Clicking internal "Reject All" button:', internalRejectButton);
                    internalRejectButton.click();
                    return;
                  } else {
                    console.log('Internal "Reject All" button not found:', button.id);
                  }
                }
              });
            }
          }, 2000); // Adjust delay as needed for your pages
          return;
        } else {
          console.log('"Manage My Preferences" button not found:', buttons.external_buttons.manage_my_preferences.id);
        }
      }

      // If neither "Reject All" nor "Manage My Preferences" are found, click "Accept All"
      if (buttons.external_buttons && buttons.external_buttons.accept_all) {
        const acceptButton = document.getElementById(buttons.external_buttons.accept_all.id);
        if (acceptButton) {
          console.log('Clicking "Accept All" button:', acceptButton);
          acceptButton.click();
        } else {
          console.log('"Accept All" button not found:', buttons.external_buttons.accept_all.id);
        }
      }
    }

    const domain = window.location.hostname.replace('www.', '');
    handleCookieBanner(domain);
  })
  .catch(error => {
    console.error('Error loading button data:', error);
  });
