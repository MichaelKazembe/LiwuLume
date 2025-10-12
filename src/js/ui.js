// ui.js
import { fetchEnglishTranslations, fetchBooks, fetchChapters } from './api.js';

// Render Bible versions to the UI
async function renderBibleVersions() {
  try {
    const translations = await fetchEnglishTranslations();
    const versionListElement = document.getElementById('version-list');
    if (!versionListElement) {
      console.error('Version list element not found');
      return;
    }
    // Clear existing content
    versionListElement.innerHTML = '';
    // Render each translation as a card
    translations.forEach((translation) => {
      const versionItem = document.createElement('div');
      versionItem.className = 'version-item';
      versionItem.innerHTML = `
        <h3>${translation.name} (${translation.abbreviation})</h3>
        <p>${translation.description || 'A trusted translation.'}</p>
        <button class="button-primary" data-id="${translation.id}">Select Version</button>
      `;
      versionListElement.appendChild(versionItem);
    });
    // Add event listeners to "Select Version" buttons
    document.querySelectorAll('.button-primary[data-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        const selectedVersionId = button.getAttribute('data-id');
        localStorage.setItem('selectedBibleVersion', selectedVersionId);
        await renderBooks(selectedVersionId); // Render books for the selected version
      });
    });
  } catch (error) {
    console.error('Error rendering Bible versions:', error);
    const versionListElement = document.getElementById('version-list');
    if (versionListElement) {
      versionListElement.innerHTML =
        '<p>Failed to load Bible versions. Please try again later.</p>';
    }
  }
}

// Render books for the selected Bible version
async function renderBooks(versionId) {
  try {
    const books = await fetchBooks(versionId);
    const bookListElement = document.getElementById('book-list');
    const viewAllBookElement = document.querySelector('#view-all-books');

    if (!bookListElement || !viewAllBookElement) {
      console.error('Book list or view-all-book element not found');
      return;
    }

    // Clear existing content
    bookListElement.innerHTML = '';

    // Render only the first 6 books
    const firstSixBooks = books.slice(0, 6);
    firstSixBooks.forEach((book) => {
      const bookItem = document.createElement('div');
      bookItem.className = 'book-item';
      bookItem.innerHTML = `
        <h4>${book.name} (${book.abbreviation || ''})</h4>
      `;
      bookItem.addEventListener('click', async () => {
        await renderChapters(versionId, book.id); // Fetch and render chapters for the selected book
      });
      bookListElement.appendChild(bookItem);
    });

    // Show the "View All Books" button
    viewAllBookElement.style.display = 'block';
    viewAllBookElement.onclick = async () => {
      await renderAllBooks(versionId, books); // Render all books
    };

  } catch (error) {
    console.error('Error rendering books:', error);
    const bookListElement = document.getElementById('book-list');
    if (bookListElement) {
      bookListElement.innerHTML =
        '<p>Failed to load books. Please try again later.</p>';
    }
  }
}

// Render all books for the selected Bible version
async function renderAllBooks(versionId, books) {
  try {
    const bookListElement = document.getElementById('book-list');
    const viewAllBookElement = document.querySelector('#view-all-books');

    if (!bookListElement || !viewAllBookElement) {
      console.error('Book list or view-all-book element not found');
      return;
    }

    // Clear existing content
    bookListElement.innerHTML = '';

    // Render all books
    books.forEach((book) => {
      const bookItem = document.createElement('div');
      bookItem.className = 'book-item';
      bookItem.innerHTML = `
        <h4>${book.name} (${book.abbreviation || ''})</h4>
      `;
      bookItem.addEventListener('click', async () => {
        await renderChapters(versionId, book.id); // Fetch and render chapters for the selected book
      });
      bookListElement.appendChild(bookItem);
    });

    // Hide the "View All Books" button
    viewAllBookElement.style.display = 'none';

  } catch (error) {
    console.error('Error rendering all books:', error);
    const bookListElement = document.getElementById('book-list');
    if (bookListElement) {
      bookListElement.innerHTML =
        '<p>Failed to load all books. Please try again later.</p>';
    }
  }
}

// Render chapters for the selected book
async function renderChapters(versionId, bookId) {
  try {
    const chapters = await fetchChapters(versionId, bookId);
    const bookListElement = document.getElementById('book-list');

    if (!bookListElement) {
      console.error('Book list element not found');
      return;
    }

    // Clear existing content
    bookListElement.innerHTML = '';

    // Render chapters
    chapters.forEach((chapter) => {
      const chapterItem = document.createElement('div');
      chapterItem.className = 'chapter-item';
      chapterItem.innerHTML = `
        <h4>Chapter ${chapter.number}</h4>
      `;
      chapterItem.addEventListener('click', async () => {
        // TODO: Fetch and render verses for the selected chapter
        console.log(`Fetch verses for chapter ${chapter.number}`);
      });
      bookListElement.appendChild(chapterItem);
    });

  } catch (error) {
    console.error('Error rendering chapters:', error);
    const bookListElement = document.getElementById('book-list');
    if (bookListElement) {
      bookListElement.innerHTML =
        '<p>Failed to load chapters. Please try again later.</p>';
    }
  }
}

export { renderBibleVersions, renderBooks, renderAllBooks, renderChapters };
