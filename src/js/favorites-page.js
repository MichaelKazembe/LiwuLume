// favorites-page.js - Handles the favorites page functionality
import { getFavorites, removeFavorite } from './favorites.js';

// Initialize the favorites page
document.addEventListener('DOMContentLoaded', () => {
  renderFavorites();
});

// Render all favorite verses
function renderFavorites() {
  const favorites = getFavorites();
  const favoritesGrid = document.getElementById('favorites-grid');
  const noFavorites = document.getElementById('no-favorites');

  if (!favoritesGrid) return;

  // Clear existing content
  favoritesGrid.innerHTML = '';

  if (favorites.length === 0) {
    // Show no favorites message
    if (noFavorites) noFavorites.style.display = 'block';
    favoritesGrid.style.display = 'none';
    return;
  }

  // Hide no favorites message and show grid
  if (noFavorites) noFavorites.style.display = 'none';
  favoritesGrid.style.display = 'grid';

  // Sort favorites by timestamp (newest first)
  favorites.sort((a, b) => b.timestamp - a.timestamp);

  // Render each favorite
  favorites.forEach((favorite) => {
    const favoriteCard = createFavoriteCard(favorite);
    favoritesGrid.appendChild(favoriteCard);
  });
}

// Create a favorite verse card
function createFavoriteCard(favorite) {
  const card = document.createElement('div');
  card.className = 'favorite-card';
  card.dataset.verseId = favorite.id;

  card.innerHTML = `
    <div class="favorite-header">
      <span class="favorite-book">${favorite.book}</span>
      <span class="favorite-reference">${favorite.chapter}:${favorite.verse}</span>
      <button class="remove-favorite" data-verse-id="${favorite.id}">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <blockquote class="favorite-text">${favorite.text}</blockquote>
    <div class="favorite-actions">
      <button class="read-full-chapter button-secondary" data-book-id="${favorite.bookId}" data-chapter="${favorite.chapter}">
        <i class="fas fa-book"></i> Read Full Chapter
      </button>
    </div>
  `;

  // Add event listener to remove button
  const removeBtn = card.querySelector('.remove-favorite');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      removeFavorite(favorite.id);
      renderFavorites(); // Re-render after removal
    });
  }

  // Add event listener to read full chapter button
  const readChapterBtn = card.querySelector('.read-full-chapter');
  if (readChapterBtn) {
    readChapterBtn.addEventListener('click', () => {
      // Navigate to the specific verse in the bible section
      const verseId = `${favorite.bookId}.${favorite.chapter}.1`; // Start with verse 1
      window.location.href = `../index.html`;
      // Use a timeout to ensure page loads before navigating
      setTimeout(() => {
        if (window.navigateToVerse) {
          window.navigateToVerse(verseId);
        }
      }, 1000);
    });
  }

  return card;
}
