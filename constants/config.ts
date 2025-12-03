import Constants from 'expo-constants';

// Get API base URL from environment variables via expo-constants
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

if (!API_BASE_URL) {
  console.error('API_BASE_URL is not defined. Please create a .env file with API_BASE_URL set.');
  throw new Error(
    'API_BASE_URL is not defined. Please create a .env file with API_BASE_URL set.'
  );
}

// Ensure URL doesn't have trailing slash
const cleanUrl = API_BASE_URL.toString().replace(/\/$/, '');

console.log('API Base URL configured:', cleanUrl);

export const config = {
  API_BASE_URL: cleanUrl,
};
