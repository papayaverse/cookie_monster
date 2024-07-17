document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('cookiePreferencesTab').addEventListener('click', showTab);
  document.getElementById('loginTab').addEventListener('click', showTab);

  document.getElementById('setCookiePreferencesButton').addEventListener('click', setCookiePreferences);
  document.getElementById('loginButton').addEventListener('click', loginUser);

  loadPreferences();

  function showTab(event) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const targetTab = event.target.id.replace('Tab', '');
    document.getElementById(targetTab).classList.add('active');
  }

  function setCookiePreferences() {
    const marketing = document.getElementById('marketing').checked;
    const performance = document.getElementById('performance').checked;

    // Save preferences locally
    chrome.storage.local.set({ marketing, performance }, () => {
      console.log('Cookie preferences saved locally');
      alert('Cookie preferences saved successfully!');
    });
  }

  function loginUser() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username && password) {
      fetch('https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/login', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.json();
      })
      .then(data => {
        if (data.message.includes('Logged in successfully')) {
          chrome.storage.local.set({ username, password }, () => {
            console.log('Credentials saved');
            alert('Login successful!');
          });
        } else {
          alert('Login failed: ' + data.detail);
        }
      })
      .catch(error => console.error('Error logging in:', error));
    } else {
      alert('Please enter both username and password.');
    }
  }

  function loadPreferences() {
    chrome.storage.local.get(['marketing', 'performance'], (preferences) => {
      if (preferences.marketing !== undefined) {
        document.getElementById('marketing').checked = preferences.marketing;
      }
      if (preferences.performance !== undefined) {
        document.getElementById('performance').checked = preferences.performance;
      }
    });
  }
});
