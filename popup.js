document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('loginTab').addEventListener('click', showTab);
  document.getElementById('registerTab').addEventListener('click', showTab);
  document.getElementById('preferencesTab').addEventListener('click', showTab);

  document.getElementById('loginButton').addEventListener('click', loginUser);
  document.getElementById('registerButton').addEventListener('click', registerUser);
  document.getElementById('setPreferencesButton').addEventListener('click', setPreferences);

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

  function setPreferences() {
    chrome.storage.local.get(['username', 'password'], (credentials) => {
      if (credentials.username && credentials.password) {
        const marketing = document.getElementById('marketing').checked;
        const performance = document.getElementById('performance').checked;
        const sell_data = document.getElementById('sell_data').checked;
        const preferences = { marketing, performance, sell_data };

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
            throw new Error('Failed to set preferences');
          }
          return response.json();
        })
        .then(data => {
          alert(data.message);
        })
        .catch(error => console.error('Error setting preferences:', error));
      } else {
        alert('Please log in first.');
      }
    });
  }
});
