// api.js
const BASE_URL = 'https://api.scripture.api.bible/v1/';
const API_KEY = import.meta.env.VITE_API_KEY;

// Fetches a random daily verse
async function fetchDailyVerse() {
  try {
    const DAILY_VERSE_URL = 'https://bible-api.com/data/web/random';
    const response = await fetch(DAILY_VERSE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch daily verse: ${response.status}`);
    }

    const data = await response.json();
    return data.random_verse;
  } catch (error) {
    console.error('Error fetching daily verse:', error);
    return null;
  }
}

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

    const data = await response.json();
    const translations = data.data;

    // Filter for recommended English translations
    const recommendedTranslationIds = [
      'de4e12af7f28f599-02', // KJV (Protestant)
      '9879dbb7cfe39e4d-04', // WEB (Protestant)
      'bba9f40183526463-01', // BSB (Berean Standard Bible)
      '06125adad2d5898a-01', // ASV (American Standard Version)
    ];

    const englishTranslations = translations.filter(
      (translation) =>
        translation.language.id === 'eng' &&
        recommendedTranslationIds.includes(translation.id)
    );

    return englishTranslations;
  } catch (error) {
    console.error('Error fetching translations:', error);
    return [];
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

// Fetches a complete chapter with verses
async function fetchChapterWithVerses(versionId, chapterId) {
  try {
    const response = await fetch(
      `${BASE_URL}bibles/${versionId}/chapters/${chapterId}`,
      {
        headers: {
          'api-key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Chapter object with content property containing all verses
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return null;
  }
}

// Fetches a specific verse
async function fetchVerse(versionId, verseId) {
  try {
    const response = await fetch(
      `${BASE_URL}bibles/${versionId}/verses/${verseId}`,
      {
        headers: {
          'api-key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch verse: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Verse object with content property
  } catch (error) {
    console.error('Error fetching verse:', error);
    return null;
  }
}

export {
  fetchEnglishTranslations,
  fetchBooks,
  fetchChapters,
  fetchChapterWithVerses,
  fetchVerse,
  fetchDailyVerse,
};
