// ui.js
import {
  fetchEnglishTranslations,
  fetchBooks,
  fetchChapters,
  fetchChapterWithVerses,
  fetchVerse,
  fetchDailyVerse,
} from './api.js';
import { addFavorite, removeFavorite, isFavorite } from './favorites.js';

// State management per version
let versionStates = {};
let currentVersionId = 'de4e12af7f28f599-02'; // Default to KJV

// Helper function to get current state for a version
function getCurrentState(versionId) {
  if (!versionStates[versionId]) {
    versionStates[versionId] = {
      bookId: null,
      chapterId: null,
      verseId: null,
      bookName: null,
      chapterNumber: null,
    };
  }
  return versionStates[versionId];
}

// Helper function to get current state for active version
function getCurrentStateForActive() {
  return getCurrentState(currentVersionId);
}

// Toggle favorite status for a verse
function toggleFavorite(button, verseData) {
  const verseId = `${verseData.bookId}.${verseData.chapter}.${verseData.verse}`;
  const isFav = isFavorite(verseId);

  if (isFav) {
    removeFavorite(verseId);
    button.innerHTML = '<i class="far fa-heart"></i>';
  } else {
    // Get book name from current context or use bookId
    const bookName = getBookNameFromId(verseData.bookId) || verseData.bookId;
    addFavorite({
      ...verseData,
      book: bookName,
    });
    button.innerHTML = '<i class="fas fa-heart"></i>';
  }
}

// Helper function to get book name from ID (simplified)
function getBookNameFromId(bookId) {
  // This is a simplified mapping - in a real app you'd have a proper mapping
  const bookMap = {
    GEN: 'Genesis',
    EXO: 'Exodus',
    LEV: 'Leviticus',
    NUM: 'Numbers',
    DEU: 'Deuteronomy',
    JOS: 'Joshua',
    JDG: 'Judges',
    RUT: 'Ruth',
    '1SA': '1 Samuel',
    '2SA': '2 Samuel',
    '1KI': '1 Kings',
    '2KI': '2 Kings',
    '1CH': '1 Chronicles',
    '2CH': '2 Chronicles',
    EZR: 'Ezra',
    NEH: 'Nehemiah',
    EST: 'Esther',
    JOB: 'Job',
    PSA: 'Psalms',
    PRO: 'Proverbs',
    ECC: 'Ecclesiastes',
    SNG: 'Song of Solomon',
    ISA: 'Isaiah',
    JER: 'Jeremiah',
    LAM: 'Lamentations',
    EZK: 'Ezekiel',
    DAN: 'Daniel',
    HOS: 'Hosea',
    JOL: 'Joel',
    AMO: 'Amos',
    OBA: 'Obadiah',
    JON: 'Jonah',
    MIC: 'Micah',
    NAM: 'Nahum',
    HAB: 'Habakkuk',
    ZEP: 'Zephaniah',
    HAG: 'Haggai',
    ZEC: 'Zechariah',
    MAL: 'Malachi',
    MAT: 'Matthew',
    MRK: 'Mark',
    LUK: 'Luke',
    JHN: 'John',
    ACT: 'Acts',
    ROM: 'Romans',
    '1CO': '1 Corinthians',
    '2CO': '2 Corinthians',
    GAL: 'Galatians',
    EPH: 'Ephesians',
    PHP: 'Philippians',
    COL: 'Colossians',
    '1TH': '1 Thessalonians',
    '2TH': '2 Thessalonians',
    '1TI': '1 Timothy',
    '2TI': '2 Timothy',
    TIT: 'Titus',
    PHM: 'Philemon',
    HEB: 'Hebrews',
    JAS: 'James',
    '1PE': '1 Peter',
    '2PE': '2 Peter',
    '1JN': '1 John',
    '2JN': '2 John',
    '3JN': '3 John',
    JUD: 'Jude',
    REV: 'Revelation',
  };
  return bookMap[bookId] || bookId;
}

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

      // Restore state for this version or render books if no state
      const state = getCurrentState(versionId);
      if (state.bookId) {
        // Restore to chapters view
        renderChapters(versionId, state.bookId, document.querySelector(`.tab-pane[data-version-id="${versionId}"]`));
      } else {
        // No state, render books
        renderBooks(versionId);
      }
      updateBreadcrumbs();
    });
  });

  // Initialize with KJV as the default
  renderBooks(currentVersionId);
  renderDailyVerse(); // Load the daily verse
  updateBreadcrumbs();
}

// Render books for the selected version
async function renderBooks(versionId) {
  try {
    const activeTabPane = document.querySelector('.tab-pane.active');
    const bookListElement = activeTabPane.querySelector(`#book-list-${versionId}`);

    if (!bookListElement) {
      console.error('Book list element not found');
      return;
    }

    // Clear existing content
    bookListElement.innerHTML = '';
    const chapterListElement = activeTabPane.querySelector(`#chapter-list-${versionId}`);
    const verseListElement = activeTabPane.querySelector(`#verse-list-${versionId}`);
    const verseContentElement = activeTabPane.querySelector(`#verse-content-${versionId}`);

    if (chapterListElement) chapterListElement.style.display = 'none';
    if (verseListElement) verseListElement.style.display = 'none';
    if (verseContentElement) verseContentElement.style.display = 'none';

    // Show loading state
    bookListElement.innerHTML = '<p class="loading">Fetching books...</p>';

    const books = await fetchBooks(versionId);

    // Render all books
    books.forEach((book) => {
      const bookItem = document.createElement('div');
      bookItem.className = 'book-item';
      bookItem.textContent = book.name;
      bookItem.addEventListener('click', async () => {
        const state = getCurrentState(versionId);
        state.bookId = book.id;
        state.bookName = book.name;
        await renderChapters(versionId, book.id, activeTabPane);
        updateBreadcrumbs();
      });
      bookListElement.appendChild(bookItem);
    });

    // Remove loading state
    const loadingElement = bookListElement.querySelector('.loading');
    if (loadingElement) loadingElement.remove();
  } catch (error) {
    console.error('Error rendering books:', error);
    const activeTabPane = document.querySelector('.tab-pane.active');
    const bookListElement = activeTabPane.querySelector(`#book-list-${versionId}`);
    if (bookListElement) {
      bookListElement.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

// Render chapters for the selected book
async function renderChapters(versionId, bookId, tabPane) {
  try {
    const chapterListElement = tabPane.querySelector(`#chapter-list-${versionId}`);
    const bookListElement = tabPane.querySelector(`#book-list-${versionId}`);

    if (!chapterListElement || !bookListElement) {
      console.error('Chapter or book list element not found');
      return;
    }

    // Hide book list and show chapter list
    bookListElement.style.display = 'none';
    chapterListElement.style.display = 'grid';
    const verseListElement = tabPane.querySelector(`#verse-list-${versionId}`);
    const verseContentElement = tabPane.querySelector(`#verse-content-${versionId}`);

    if (verseListElement) verseListElement.style.display = 'none';
    if (verseContentElement) verseContentElement.style.display = 'none';

    // Clear existing content and show loading state
    chapterListElement.innerHTML = '<p class="loading">Fetching chapters...</p>';

    const chapters = await fetchChapters(versionId, bookId);

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
        const state = getCurrentState(versionId);
        state.chapterId = chapter.id;
        state.chapterNumber = chapter.number;
        await renderVerses(versionId, chapter.id, tabPane);
        updateBreadcrumbs();
      });
      chapterListElement.appendChild(chapterItem);
    });

    // Remove loading state
    const loadingElement = chapterListElement.querySelector('.loading');
    if (loadingElement) loadingElement.remove();
  } catch (error) {
    console.error('Error rendering chapters:', error);
    const chapterListElement = tabPane.querySelector(`#chapter-list-${versionId}`);
    if (chapterListElement) {
      chapterListElement.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

// Render verses for the selected chapter
async function renderVerses(versionId, chapterId, tabPane) {
  try {
    const verseListElement = tabPane.querySelector(`#verse-list-${versionId}`);
    const chapterListElement = tabPane.querySelector(`#chapter-list-${versionId}`);

    if (!verseListElement || !chapterListElement) {
      console.error('Verse or chapter list element not found');
      return;
    }

    // Hide chapter list and show verse list
    chapterListElement.style.display = 'none';
    verseListElement.style.display = 'grid';
    const verseContentElement = tabPane.querySelector(`#verse-content-${versionId}`);

    if (verseContentElement) verseContentElement.style.display = 'none';

    // Clear existing content and show loading state
    verseListElement.innerHTML = '<p class="loading">Fetching verses...</p>';

    const chapter = await fetchChapterWithVerses(versionId, chapterId);

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
        const state = getCurrentState(versionId);
        state.verseId = verseId;
        await renderVerseContent(versionId, verseId, tabPane, chapter.content);
        updateBreadcrumbs();
      });
      verseListElement.appendChild(verseItem);
    });

    // Remove loading state
    const loadingElement = verseListElement.querySelector('.loading');
    if (loadingElement) loadingElement.remove();
  } catch (error) {
    console.error('Error rendering verses:', error);
    const verseListElement = tabPane.querySelector(`#verse-list-${versionId}`);
    if (verseListElement) {
      verseListElement.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

// Render content for the selected verse
async function renderVerseContent(versionId, verseId, tabPane, chapterContent) {
  try {
    const verseListElement = tabPane.querySelector(`#verse-list-${versionId}`);
    const verseContentElement = tabPane.querySelector(`#verse-content-${versionId}`);

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
      const state = getCurrentState(versionId);
      state.verseId = null;
      await renderVerses(versionId, state.chapterId, tabPane);
      updateBreadcrumbs();
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

    // Create favorite button for individual verse
    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'favorite-verse-btn';
    const verseParts = verseId.split('.');
    const bookId = verseParts[0];
    const chapter = verseParts[1];
    const verse = verseParts[2];
    const isFav = isFavorite(verseId);
    favoriteButton.innerHTML = `<i class="fa${isFav ? 's' : 'r'} fa-heart"></i>`;
    favoriteButton.addEventListener('click', () => {
      toggleFavorite(favoriteButton, {
        bookId,
        chapter,
        verse,
        text: verseContentContainer.textContent.trim(),
        versionId,
      });
    });

    // Create actions container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'verse-actions';
    actionsContainer.appendChild(favoriteButton);
    actionsContainer.appendChild(backButton);

    verseContentContainer.appendChild(actionsContainer);
    verseContentElement.appendChild(verseContentContainer);
  } catch (error) {
    console.error('Error rendering verse content:', error);
    const verseContentElement = tabPane.querySelector(`#verse-content-${versionId}`);
    if (verseContentElement) {
      verseContentElement.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

// Render daily verse
async function renderDailyVerse() {
  try {
    const verseCard = document.querySelector('.verse-card');
    if (!verseCard) return;

    const verseContent = verseCard.querySelector('.verse-content');
    if (!verseContent) return;

    // Show loading state
    verseContent.innerHTML = '<p class="loading">Loading daily verse...</p>';

    const dailyVerse = await fetchDailyVerse();

    // Check if dailyVerse is valid
    if (!dailyVerse || !dailyVerse.text) {
      throw new Error('Invalid daily verse data');
    }

    // Format the verse text with line breaks if text exists
    const formattedText = dailyVerse.text
      ? dailyVerse.text.replace(/\n/g, '<br>')
      : 'Verse text not available';

    // Update the verse content
    const verseId = `${dailyVerse.bookId || 'UNK'}.${dailyVerse.chapter || '1'}.${dailyVerse.verse || '1'}`;
    const isFav = isFavorite(verseId);

    verseContent.innerHTML = `
      <div class="verse-header">
        <i class="fas fa-bible verse-icon"></i>
        <span class="book-title">${dailyVerse.book || 'Unknown Book'}</span>
        <span class="verse-reference">${dailyVerse.chapter || '?'}:${dailyVerse.verse || '?'}</span>
      </div>
      <blockquote class="verse-text">${formattedText}</blockquote>
      <div class="verse-actions">
        <button class="save-verse" data-verse-id="${verseId}">
          <i class="fa${isFav ? 's' : 'r'} fa-heart"></i>
        </button>
        <a id="read-full-chapter" class="button-secondary">
          <i class="fas fa-book"></i> Read Full Chapter
        </a>
      </div>
    `;

    // Add event listener to the favorite button
    const saveVerseBtn = verseContent.querySelector('.save-verse');
    if (saveVerseBtn) {
      saveVerseBtn.addEventListener('click', () => {
        toggleFavorite(saveVerseBtn, {
          bookId: dailyVerse.bookId || 'UNK',
          book: dailyVerse.book || 'Unknown Book',
          chapter: dailyVerse.chapter || '1',
          verse: dailyVerse.verse || '1',
          text: formattedText,
          versionId: 'daily', // Special identifier for daily verses
        });
      });
    }

    // Add click event to "Read Full Chapter" button
    const readFullChapterBtn = verseCard.querySelector('#read-full-chapter');
    if (readFullChapterBtn && dailyVerse.bookId) {
      readFullChapterBtn.addEventListener('click', () => {
        // Navigate to the specific verse in the bible section
        const verseId = `${dailyVerse.bookId}.${dailyVerse.chapter}.${dailyVerse.verse}`;
        navigateToVerse(verseId);
      });
    }
  } catch (error) {
    console.error('Error rendering daily verse:', error);
    const verseContent = document.querySelector('.verse-content');
    if (verseContent) {
      verseContent.innerHTML = `
        <div class="verse-header">
          <i class="fas fa-bible verse-icon"></i>
          <span class="book-title">Daily Verse</span>
        </div>
        <blockquote class="verse-text">
          "Your word is a lamp to my feet and a light to my path." - Psalm 119:105
        </blockquote>
        <div class="verse-actions">
          <button class="save-verse">
            <i class="far fa-heart"></i>
          </button>
        </div>
        <p class="error">Failed to load today's verse. Showing a default verse instead.</p>
      `;
    }
  }
}

// Update breadcrumb navigation
function updateBreadcrumbs() {
  const breadcrumbContainer = document.querySelector('.breadcrumb-container');
  if (!breadcrumbContainer) return;

  const breadcrumbs = [];

  // Get current version name
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    breadcrumbs.push({
      text: activeTab.textContent.trim(),
      level: 'version'
    });
  }

  // Add book if selected
  const state = getCurrentState(currentVersionId);
  if (state.bookName) {
    breadcrumbs.push({
      text: state.bookName,
      level: 'book'
    });
  }

  // Add chapter if selected
  if (state.chapterNumber) {
    breadcrumbs.push({
      text: `Chapter ${state.chapterNumber}`,
      level: 'chapter'
    });
  }

  // Add verse if selected
  if (state.verseId) {
    const verseNumber = state.verseId.split('.').pop();
    breadcrumbs.push({
      text: `Verse ${verseNumber}`,
      level: 'verse'
    });
  }

  // Render breadcrumbs with click handlers
  breadcrumbContainer.innerHTML = breadcrumbs.map((crumb, index) => {
    if (index === breadcrumbs.length - 1) {
      return `<span class="breadcrumb-current">${crumb.text}</span>`;
    }
    return `<button class="breadcrumb-item clickable" data-level="${crumb.level}">${crumb.text}</button><span class="breadcrumb-separator"> > </span>`;
  }).join('');

  // Add click event listeners to breadcrumb items
  const clickableBreadcrumbs = breadcrumbContainer.querySelectorAll('.breadcrumb-item.clickable');
  clickableBreadcrumbs.forEach((breadcrumb, index) => {
    breadcrumb.addEventListener('click', () => {
      navigateToBreadcrumbLevel(breadcrumbs[index].level);
    });
  });
}

// Navigate to a specific breadcrumb level
function navigateToBreadcrumbLevel(level) {
  const activeTabPane = document.querySelector('.tab-pane.active');
  const state = getCurrentState(currentVersionId);

  switch (level) {
    case 'version':
      // Reset to books view
      state.bookId = null;
      state.bookName = null;
      state.chapterId = null;
      state.chapterNumber = null;
      state.verseId = null;
      renderBooks(currentVersionId);
      break;

    case 'book':
      // Go back to chapters view
      state.chapterId = null;
      state.chapterNumber = null;
      state.verseId = null;
      renderChapters(currentVersionId, state.bookId, activeTabPane);
      break;

    case 'chapter':
      // Go back to verses view
      state.verseId = null;
      renderVerses(currentVersionId, state.chapterId, activeTabPane);
      break;
  }

  updateBreadcrumbs();
}

// Navigate to a specific verse in the bible section
function navigateToVerse(verseId) {
  const [bookId, chapter, verse] = verseId.split('.');

  // Switch to KJV tab (default version)
  const kjvTab = document.querySelector(
    '.tab[data-version-id="de4e12af7f28f599-02"]'
  );
  if (kjvTab) {
    kjvTab.click();
  }

  // Wait a bit for the tab switch, then navigate to the verse
  setTimeout(async () => {
    const activeTabPane = document.querySelector('.tab-pane.active');
    if (activeTabPane) {
      try {
        // Get book name from ID
        const books = await fetchBooks('de4e12af7f28f599-02');
        const book = books.find((b) => b.id === bookId);
        if (book) {
          const state = getCurrentState('de4e12af7f28f599-02');
          state.bookId = bookId;
          state.bookName = book.name;
          await renderChapters('de4e12af7f28f599-02', bookId, activeTabPane);

          // Find and click the specific chapter
          const chapterItems = activeTabPane.querySelectorAll('.chapter-item');
          for (const chapterItem of chapterItems) {
            if (chapterItem.textContent.includes(`Chapter ${chapter}`)) {
              chapterItem.click();

              // Wait for verses to load, then find and click the specific verse
              setTimeout(() => {
                const verseItem = activeTabPane.querySelector(
                  `.verse-item[data-verse-number="${verse}"]`
                );
                if (verseItem) {
                  verseItem.click();
                }
              }, 500);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error navigating to verse:', error);
      }
    }
  }, 200);
}

// Make navigateToVerse available globally for favorites page
window.navigateToVerse = navigateToVerse;

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
  renderDailyVerse,
};
