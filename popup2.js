document.addEventListener('DOMContentLoaded', function() {
  const menuButton = document.getElementById('menuButton');
  const menuItems = document.getElementById('menuItems');
  const content = document.getElementById('content');

  // Toggle the menu display
  menuButton.addEventListener('click', function() {
    menuItems.style.display = menuItems.style.display === 'block' ? 'none' : 'block';
  });

  // Switch between tabs
  document.getElementById('dashboardLink').addEventListener('click', function() {
    showTab('dashboard');
  });

  document.getElementById('cookiePreferencesLink').addEventListener('click', function() {
    showTab('cookiePreferences');
  });

  document.getElementById('paybackLink').addEventListener('click', function() {
    showTab('payback');
  });

  function showTab(tabId) {
    // Hide all tab contents
    const tabs = content.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show the selected tab
    document.getElementById(tabId).classList.add('active');
  }

  // Initialize the first tab as active
  showTab('dashboard');

  // Load preferences
  loadPreferences();

  // Save preferences
  document.getElementById('savePreferences').addEventListener('click', savePreferences);

  // Load preferences from storage
  function loadPreferences() {
    chrome.storage.local.get(['marketing', 'performance'], (preferences) => {
      document.getElementById('marketing').checked = preferences.marketing || false;
      document.getElementById('performance').checked = preferences.performance || false;
    });
  }

  // Save preferences to storage
  function savePreferences() {
    const marketing = document.getElementById('marketing').checked;
    const performance = document.getElementById('performance').checked;

    chrome.storage.local.set({ marketing, performance }, () => {
      alert('Preferences saved successfully!');
    });
  }
});
