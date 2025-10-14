// favorites.js - Utility functions for managing favorite verses in localStorage

const FAVORITES_KEY = 'liwuLume_favorites';

// Get all favorites from localStorage
function getFavorites() {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites from localStorage:', error);
    return [];
  }
}

// Save favorites to localStorage
function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
}

// Add a verse to favorites
function addFavorite(verseData) {
  const favorites = getFavorites();
  const verseId = `${verseData.bookId}.${verseData.chapter}.${verseData.verse}`;

  // Check if already favorited
  if (favorites.some((fav) => fav.id === verseId)) {
    return false; // Already exists
  }

  const favoriteVerse = {
    id: verseId,
    bookId: verseData.bookId,
    book: verseData.book,
    chapter: verseData.chapter,
    verse: verseData.verse,
    text: verseData.text,
    versionId: verseData.versionId || 'de4e12af7f28f599-02', // Default to KJV
    timestamp: Date.now(),
  };

  favorites.push(favoriteVerse);
  saveFavorites(favorites);
  return true;
}

// Remove a verse from favorites
function removeFavorite(verseId) {
  const favorites = getFavorites();
  const filteredFavorites = favorites.filter((fav) => fav.id !== verseId);
  saveFavorites(filteredFavorites);
  return filteredFavorites.length !== favorites.length; // Return true if removed
}

// Check if a verse is favorited
function isFavorite(verseId) {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.id === verseId);
}

// Get favorite by ID
function getFavorite(verseId) {
  const favorites = getFavorites();
  return favorites.find((fav) => fav.id === verseId);
}

export { getFavorites, addFavorite, removeFavorite, isFavorite, getFavorite };
