// Utility function to clear all application data
export const clearAllData = () => {
  // Clear all localStorage data
  const keysToRemove = [
    'mainClients',
    'printJobs', 
    'onboardingClients',
    'notifications',
    'lastNotificationTime',
    'userProfile',
    'systemSettings',
    'pricingConfigs'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  // Clear any other localStorage items that might exist
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.startsWith('printmonitor') || key.startsWith('client') || key.startsWith('printer')) {
      localStorage.removeItem(key);
    }
  });

  console.log('✅ All application data cleared');
  
  // Reload the page to reset the application state
  window.location.reload();
};