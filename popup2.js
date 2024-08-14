document.addEventListener('DOMContentLoaded', function() {
    loadPreferences();
  
    document.getElementById('marketing').addEventListener('change', setPreferences);
    document.getElementById('performance').addEventListener('change', setPreferences);
  
    document.getElementById('loginButton').addEventListener('click', function() {
      // Handle login functionality here
      alert('Login functionality coming soon!');
    });
  
    function loadPreferences() {
      chrome.storage.local.get(['marketing', 'performance'], (preferences) => {
        document.getElementById('marketing').checked = preferences.marketing || false;
        document.getElementById('performance').checked = preferences.performance || false;
      });
    }
  
    function setPreferences() {
      const marketing = document.getElementById('marketing').checked;
      const performance = document.getElementById('performance').checked;
  
      chrome.storage.local.set({ marketing, performance }, () => {
        console.log('Preferences saved locally');
      });
    }
  });
  