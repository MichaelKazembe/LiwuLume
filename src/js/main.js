// main.js
import { initializeTabs } from './ui.js';

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the tabbed interface
  initializeTabs();

  // Check if we're on the favorites page and handle URL parameters
  if (window.location.pathname.includes('favourite.html')) {
    handleFavoritesPageLoad();
  }

  // Add loading state styles (if not already in CSS)
  const style = document.createElement('style');
  style.textContent = `
    .loading {
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 1rem;
    }
    .error {
      color: #d32f2f;
      text-align: center;
      padding: 1rem;
    }
  `;
  document.head.appendChild(style);

  // Add Font Awesome if not already loaded
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href =
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(fontAwesome);
  }
});

// Handle favorites page specific functionality
function handleFavoritesPageLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('book');
  const chapter = urlParams.get('chapter');

  if (bookId && chapter) {
    // If coming from favorites page with book/chapter params,
    // we could auto-navigate to that chapter, but for now just clean the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}
