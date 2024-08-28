document.addEventListener('DOMContentLoaded', function() {
  // Switch between tabs when sidebar items are clicked
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
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');

    // Show the selected tab
    document.getElementById(tabId).style.display = 'block';

    // Update active state in the sidebar
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => item.style.backgroundColor = '');
    document.getElementById(tabId + 'Link').style.backgroundColor = '#444';
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
  
  function updateDashboard() {
    chrome.storage.local.get(['totalClicks', 'uniqueSites'], (data) => {
      const { totalClicks, uniqueSites } = data;
      const uniqueSitesCount = Object.keys(uniqueSites).length;
  
      document.getElementById('totalClicks').textContent = `Total Clicks: ${totalClicks}`;
      document.getElementById('uniqueSites').textContent = `Unique Websites: ${uniqueSitesCount}`;
    });
  }

  updateDashboard();
  
});
