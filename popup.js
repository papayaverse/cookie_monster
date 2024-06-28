document.getElementById('loginButton').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    if (username && password) {
      // Make the login request
      fetch('https://cookie-monster-preferences-api-499c0307911c.herokuapp.com/login', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + password),
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.json();
      })
      .then(data => {
        if (data.message.includes('Logged in successfully')) {
          // Store the session ID cookie securely
          chrome.storage.local.set({ session_id: data.session_id }, () => {
            console.log('Session ID saved');
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
  });
  
  