document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('loginTab').addEventListener('click', showTab);
  document.getElementById('registerTab').addEventListener('click', showTab);
  document.getElementById('cookiePreferencesTab').addEventListener('click', showTab);
  document.getElementById('paybackTab').addEventListener('click', showTab);

  document.getElementById('loginButton').addEventListener('click', loginUser);
  document.getElementById('registerButton').addEventListener('click', registerUser);
  document.getElementById('setCookiePreferencesButton').addEventListener('click', setCookiePreferences);
  document.getElementById('setPaybackButton').addEventListener('click', setPayback);

  loadPreferences();

  function showTab(event) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const targetTab = event.target.id.replace('Tab', '');
    document.getElementById(targetTab).classList.add('active');
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

  function registerUser() {
    const firstname = document.getElementById('registerFirstname').value;
    const lastname = document.getElementById('registerLastname').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (firstname && lastname && email && password) {
      const user = { firstname, lastname, email, password };

      fetch('https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/createAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Registration failed');
        }
        return response.json();
      })
      .then(data => {
        alert(data.message);
      })
      .catch(error => console.error('Error registering user:', error));
    } else {
      alert('Please fill out all fields.');
    }
  }

  function setCookiePreferences() {
    const marketing = document.getElementById('marketing').checked;
    const performance = document.getElementById('performance').checked;

    // Save preferences locally
    chrome.storage.local.set({ marketing, performance }, () => {
      console.log('Cookie preferences saved locally');
      alert('Cookie preferences saved successfully!');

      // Check if the user is logged in
      chrome.storage.local.get(['username', 'password'], (credentials) => {
        if (credentials.username && credentials.password) {
          const preferences = { 
            marketing, 
            performance, 
            sell_data: credentials.sell_data !== undefined ? credentials.sell_data : false 
          };

          // Post preferences to the server
          fetch('https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/preferences/default', {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to set preferences on the server');
            }
            return response.json();
          })
          .then(data => {
            console.log('Cookie preferences saved on the server');
          })
          .catch(error => console.error('Error setting preferences on the server:', error));
        }
      });
    });
  }

  function setPayback() {
    chrome.storage.local.get(['username', 'password'], (credentials) => {
      if (credentials.username && credentials.password) {
        const dataType = document.getElementById('dataType').value;
        const recipient = document.getElementById('recipient').value;
        const purpose = document.getElementById('purpose').value;

        const paybackPreferences = {
          data_type: dataType,
          recipient: recipient,
          purpose: purpose
        };

        fetch('https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/payback', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(paybackPreferences)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to set payback preferences');
          }
          return response.json();
        })
        .then(data => {
          alert(data.message);
        })
        .catch(error => console.error('Error setting payback preferences:', error));
      } else {
        alert('Please log in first.');
      }
    });
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

    chrome.storage.local.get(['sell_data'], (preferences) => {
      if (preferences.sell_data !== undefined) {
        document.getElementById('sell_data').checked = preferences.sell_data;
      }
    });
  }
});
