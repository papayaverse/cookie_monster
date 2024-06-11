// Load JSON data
fetch(chrome.runtime.getURL('url_data.json'))
  .then(response => response.json())
  .then(buttonData => {
    // Function to handle cookie banners
    function handleCookieBanner(domain) {
      const buttons = buttonData[domain];
      if (!buttons) return;

      // Try to click the "Reject All" button
      if (buttons.external_buttons && buttons.external_buttons.reject_all) {
        const rejectButton = document.getElementById(buttons.external_buttons.reject_all.id);
        if (rejectButton) {
          rejectButton.click();
          return;
        }
      }

      // If "Reject All" is not found, try to click "Manage My Preferences"
      if (buttons.external_buttons && buttons.external_buttons.manage_my_preferences) {
        const manageButton = document.getElementById(buttons.external_buttons.manage_my_preferences.id);
        if (manageButton) {
          manageButton.click();
          // Wait for internal buttons to appear
          setTimeout(() => {
            if (buttons.internal_buttons) {
              buttons.internal_buttons.forEach(button => {
                if (button.option_name === 'reject_all') {
                  const internalRejectButton = document.getElementById(button.id);
                  if (internalRejectButton) {
                    internalRejectButton.click();
                    return;
                  }
                }
              });
            }
          }, 2000); // Adjust delay as needed for your pages
          return;
        }
      }

      // If neither "Reject All" nor "Manage My Preferences" are found, click "Accept All"
      if (buttons.external_buttons && buttons.external_buttons.accept_all) {
        const acceptButton = document.getElementById(buttons.external_buttons.accept_all.id);
        if (acceptButton) {
          acceptButton.click();
        }
      }
    }

    const domain = window.location.hostname.replace('www.', '');
    handleCookieBanner(domain);
  })
  .catch(error => console.error('Error loading button data:', error));
