// api.js
const BASE_URL = 'https://api.scripture.api.bible/v1/';
const API_KEY = 'ac1088740a1e4f1b145827d3eeb1e8b3';

// Recommended Bible IDs for LiwuLume
const RECOMMENDED_BIBLE_IDS = [
  'de4e12af7f28f599-02', // KJV (Protestant) - Default
  '9879dbb7cfe39e4d-04', // WEB (Protestant)
  'bba9f40183526463-01', // BSB (Berean Standard Bible)
  '06125adad2d5898a-01', // ASV (American Standard Version)
];

// Fetches a list of available English Bible translations
async function fetchEnglishTranslations() {
  try {
    const response = await fetch(`${BASE_URL}bibles`, {
      headers: {
        'api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch translations: ${response.status}`);
    }

    const bibleTranslations = await response.json();
    const translations = bibleTranslations.data;

    // Filter for English translations
    const englishTranslations = translations.filter(
      (translation) => translation.language.id === 'eng'
    );

    // Filter for recommended translations
    const recommendedTranslations = englishTranslations.filter((translation) =>
      RECOMMENDED_BIBLE_IDS.includes(translation.id)
    );

    // Ensure KJV is first (default)
    recommendedTranslations.sort((a, b) => {
      if (a.id === 'de4e12af7f28f599-02') return -1;
      if (b.id === 'de4e12af7f28f599-02') return 1;
      return 0;
    });

    return recommendedTranslations;
  } catch (error) {
    console.error('Error fetching translations:', error);
    return []; // Return empty array on error
  }
}

// Fetches books for a selected Bible version
async function fetchBooks(versionId) {
  try {
    const response = await fetch(`${BASE_URL}bibles/${versionId}/books`, {
      headers: {
        'api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Array of book objects
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

// Fetches chapters for a selected book
async function fetchChapters(versionId, bookId) {
  try {
    const response = await fetch(
      `${BASE_URL}bibles/${versionId}/books/${bookId}/chapters`,
      {
        headers: {
          'api-key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chapters: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Array of chapter objects
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
}

export { fetchEnglishTranslations, fetchBooks, fetchChapters };
