// const API_KEY = import.meta.env.API_KEY;
const BASE_URL = 'https://api.scripture.api.bible/v1/';

// Fetches a list of available Bible translations
export async function fetchTranslations() {
  const response = await fetch(`${BASE_URL}bibles`, {
    headers: {
      'api-key': 'ac1088740a1e4f1b145827d3eeb1e8b3',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch translations ${response.status}`);
  }
  const translations = await response.json();
  return translations.data; // Returns an array of Bible translations
}
