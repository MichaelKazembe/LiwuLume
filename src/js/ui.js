// ui.js
import {
  fetchEnglishTranslations,
  fetchBooks,
  fetchChapters,
  fetchChapterWithVerses,
  fetchVerse,
} from './api.js';

// Global variables to track the current state
let currentVersionId = 'de4e12af7f28f599-02'; // Default to KJV
let currentBookId = null;
let currentChapterId = null;
let currentVerseId = null;

// Initialize tabs and event listeners
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Set up tab switching
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and panes
      tabs.forEach((t) => t.classList.remove('active'));
      tabPanes.forEach((pane) => pane.classList.remove('active'));

      // Add active class to clicked tab and corresponding pane
      tab.classList.add('active');
      const versionId = tab.getAttribute('data-version-id');
      document
        .querySelector(`.tab-pane[data-version-id="${versionId}"]`)
        .classList.add('active');
      currentVersionId = versionId;

      // Re-render books for the selected version
      renderBooks(currentVersionId);
    });
  });

  // Initialize with KJV as the default
  renderBooks(currentVersionId);
}

// Render books for the selected version
async function renderBooks(versionId) {
  try {
    const books = await fetchBooks(versionId);
    const activeTabPane = document.querySelector('.tab-pane.active');
    const bookListElement = activeTabPane.querySelector('#book-list');

    if (!bookListElement) {
      console.error('Book list element not found');
      return;
    }

    // Clear existing content
    bookListElement.innerHTML = '';
    const chapterListElement = activeTabPane.querySelector('#chapter-list');
    const verseListElement = activeTabPane.querySelector('#verse-list');
    const verseContentElement = activeTabPane.querySelector('#verse-content');

    if (chapterListElement) chapterListElement.style.display = 'none';
    if (verseListElement) verseListElement.style.display = 'none';
    if (verseContentElement) verseContentElement.style.display = 'none';

    // Show loading state
    bookListElement.innerHTML = '<p class="loading">Loading books...</p>';

    // Render all books
    books.forEach((book) => {
      const bookItem = document.createElement('div');
      bookItem.className = 'book-item';
      bookItem.textContent = book.name;
      bookItem.addEventListener('click', async () => {
        currentBookId = book.id;
        await renderChapters(versionId, book.id, activeTabPane);
      });
      bookListElement.appendChild(bookItem);
    });

    // Remove loading state
    const loadingElement = bookListElement.querySelector('.loading');
    if (loadingElement) loadingElement.remove();
  } catch (error) {
    console.error('Error rendering books:', error);
    if (bookListElement) {
      bookListElement.innerHTML =
        '<p class="error">Failed to load books. Please try again later.</p>';
    }
  }
}

// Render chapters for the selected book
async function renderChapters(versionId, bookId, tabPane) {
  try {
    const chapters = await fetchChapters(versionId, bookId);
    const chapterListElement = tabPane.querySelector('#chapter-list');
    const bookListElement = tabPane.querySelector('#book-list');

    if (!chapterListElement || !bookListElement) {
      console.error('Chapter or book list element not found');
      return;
    }

    // Hide book list and show chapter list
    bookListElement.style.display = 'none';
    chapterListElement.style.display = 'grid';
    const verseListElement = tabPane.querySelector('#verse-list');
    const verseContentElement = tabPane.querySelector('#verse-content');

    if (verseListElement) verseListElement.style.display = 'none';
    if (verseContentElement) verseContentElement.style.display = 'none';

    // Clear existing content and show loading state
    chapterListElement.innerHTML = '<p class="loading">Loading chapters...</p>';

    // Filter out introduction chapters (number === "intro")
    const filteredChapters = chapters.filter(
      (chapter) => chapter.number !== 'intro'
    );

    // Render chapters
    filteredChapters.forEach((chapter) => {
      const chapterItem = document.createElement('div');
      chapterItem.className = 'chapter-item';
      chapterItem.textContent = `Chapter ${chapter.number}`;
      chapterItem.addEventListener('click', async () => {
        currentChapterId = chapter.id;
        await renderVerses(versionId, chapter.id, tabPane);
      });
      chapterListElement.appendChild(chapterItem);
    });

    // Remove loading state
    const loadingElement = chapterListElement.querySelector('.loading');
    if (loadingElement) loadingElement.remove();
  } catch (error) {
    console.error('Error rendering chapters:', error);
    if (chapterListElement) {
      chapterListElement.innerHTML =
        '<p class="error">Failed to load chapters. Please try again later.</p>';
    }
  }
}

// Render verses for the selected chapter
async function renderVerses(versionId, chapterId, tabPane) {
  try {
    const chapter = await fetchChapterWithVerses(versionId, chapterId);
    const verseListElement = tabPane.querySelector('#verse-list');
    const chapterListElement = tabPane.querySelector('#chapter-list');

    if (!verseListElement || !chapterListElement) {
      console.error('Verse or chapter list element not found');
      return;
    }

    // Hide chapter list and show verse list
    chapterListElement.style.display = 'none';
    verseListElement.style.display = 'grid';
    const verseContentElement = tabPane.querySelector('#verse-content');

    if (verseContentElement) verseContentElement.style.display = 'none';

    // Clear existing content and show loading state
    verseListElement.innerHTML = '<p class="loading">Loading verses...</p>';

    // Parse the HTML content to extract verses
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = chapter.content;

    // Extract verse elements
    const verseElements = tempDiv.querySelectorAll('span.v');
    verseElements.forEach((verseElement) => {
      const verseNumber = verseElement.textContent.trim();
      const verseItem = document.createElement('div');
      verseItem.className = 'verse-item';
      verseItem.textContent = `Verse ${verseNumber}`;
      verseItem.dataset.verseNumber = verseNumber;
      verseItem.addEventListener('click', async () => {
        // Create verse ID (e.g., EXO.2.1)
        const verseId = `${chapter.bookId}.${chapter.number}.${verseNumber}`;
        await renderVerseContent(versionId, verseId, tabPane, chapter.content);
      });
      verseListElement.appendChild(verseItem);
    });

    // Remove loading state
    const loadingElement = verseListElement.querySelector('.loading');
    if (loadingElement) loadingElement.remove();
  } catch (error) {
    console.error('Error rendering verses:', error);
    if (verseListElement) {
      verseListElement.innerHTML =
        '<p class="error">Failed to load verses. Please try again later.</p>';
    }
  }
}

// Render content for the selected verse
async function renderVerseContent(versionId, verseId, tabPane, chapterContent) {
  try {
    const verseListElement = tabPane.querySelector('#verse-list');
    const verseContentElement = tabPane.querySelector('#verse-content');

    if (!verseListElement || !verseContentElement) {
      console.error('Verse content or verse list element not found');
      return;
    }

    // Hide verse list and show verse content
    verseListElement.style.display = 'none';
    verseContentElement.style.display = 'block';

    // Clear existing content
    verseContentElement.innerHTML = '';

    // Create a container for the verse content
    const verseContentContainer = document.createElement('div');
    verseContentContainer.className = 'verse-content-container';

    // Create back button
    const backButton = document.createElement('button');
    backButton.className = 'back-to-verses button-secondary';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Verses';
    backButton.addEventListener('click', async () => {
      await renderVerses(currentVersionId, currentChapterId, tabPane);
    });

    // Parse the chapter content to extract the specific verse
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = chapterContent;

    // Find the verse number in the content
    const verseNumber = verseId.split('.').pop();
    const verseSpan = tempDiv.querySelector(
      `span[data-number="${verseNumber}"]`
    );

    if (verseSpan) {
      // Get the parent paragraph of the verse
      const verseParagraph = verseSpan.closest('p');

      if (verseParagraph) {
        // Style the verse content
        verseParagraph.querySelectorAll('span.v').forEach((span) => {
          span.style.fontWeight = 'bold';
          span.style.color = 'var(--accent-color)';
          span.style.marginRight = '0.5rem';
        });

        verseParagraph.querySelectorAll('span.add').forEach((span) => {
          span.style.fontStyle = 'italic';
          span.style.color = '#666';
        });

        verseContentContainer.appendChild(verseParagraph);
      }
    } else {
      verseContentContainer.innerHTML = '<p>Verse not found.</p>';
    }

    // Append back button
    verseContentContainer.appendChild(backButton);
    verseContentElement.appendChild(verseContentContainer);
  } catch (error) {
    console.error('Error rendering verse content:', error);
    if (verseContentElement) {
      verseContentElement.innerHTML =
        '<p class="error">Failed to load verse content. Please try again later.</p>';
    }
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
});

export {
  initializeTabs,
  renderBooks,
  renderChapters,
  renderVerses,
  renderVerseContent,
};
