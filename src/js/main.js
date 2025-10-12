// main.js
import {
  renderBibleVersions,
  renderBooks,
  renderChapters,
  renderAllBooks,
} from './ui.js';

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  renderBibleVersions();
  renderBooks(
    localStorage.getItem('selectedBibleVersion') || 'de4e12af7f28f599-02'
  ); // Default to KJV if none selected
  // renderChapters();
  // renderAllBooks();
});
