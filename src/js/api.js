// api.js
const BASE_URL = 'https://api.scripture.api.bible/v1/';
const API_KEY = import.meta.env.VITE_API_KEY;

// Handle missing API key gracefully without user-facing messages
if (!API_KEY) {
  console.warn('Bible API key not configured. Some features may not work.');
}

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
    throw new Error(
      'Unable to load daily verse. Please check your internet connection.'
    );
  }
}

// Fetches a list of available English Bible translations
async function fetchEnglishTranslations() {
  if (!API_KEY) {
    throw new Error('API key is missing. Please configure your Bible API key.');
  }

  try {
    const response = await fetch(`${BASE_URL}bibles`, {
      headers: {
        'api-key': API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          'Invalid API key. Please check your Bible API key configuration.'
        );
      }
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
    throw error; // Re-throw to let caller handle
  }
}

// Fetches books for a selected Bible version
async function fetchBooks(versionId) {
  if (!API_KEY) {
    throw new Error('API key is missing. Please configure your Bible API key.');
  }

  try {
    const response = await fetch(`${BASE_URL}bibles/${versionId}/books`, {
      headers: {
        'api-key': API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          'Invalid API key. Please check your Bible API key configuration.'
        );
      }
      throw new Error(`Failed to fetch books: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Array of book objects
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error; // Re-throw to let caller handle
  }
}

// Fetches chapters for a selected book
async function fetchChapters(versionId, bookId) {
  if (!API_KEY) {
    throw new Error('API key is missing. Please configure your Bible API key.');
  }

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
      if (response.status === 401) {
        throw new Error(
          'Invalid API key. Please check your Bible API key configuration.'
        );
      }
      throw new Error(`Failed to fetch chapters: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Array of chapter objects
  } catch (error) {
    console.error('Error fetching chapters:', error);
    throw error; // Re-throw to let caller handle
  }
}

// Fetches a complete chapter with verses
async function fetchChapterWithVerses(versionId, chapterId) {
  if (!API_KEY) {
    throw new Error('API key is missing. Please configure your Bible API key.');
  }

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
      if (response.status === 401) {
        throw new Error(
          'Invalid API key. Please check your Bible API key configuration.'
        );
      }
      throw new Error(`Failed to fetch chapter: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Chapter object with content property containing all verses
  } catch (error) {
    console.error('Error fetching chapter:', error);
    throw error; // Re-throw to let caller handle
  }
}

// Fetches a specific verse
async function fetchVerse(versionId, verseId) {
  if (!API_KEY) {
    throw new Error('API key is missing. Please configure your Bible API key.');
  }

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
      if (response.status === 401) {
        throw new Error(
          'Invalid API key. Please check your Bible API key configuration.'
        );
      }
      throw new Error(`Failed to fetch verse: ${response.status}`);
    }

    const data = await response.json();
    return data.data; // Verse object with content property
  } catch (error) {
    console.error('Error fetching verse:', error);
    throw error; // Re-throw to let caller handle
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
