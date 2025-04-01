import { db } from '../config/firebase-config.js'; // Import Firestore instance
import { filterPubs } from './filters.js';
import { saveFavorites } from './auth.js';
import { loadFavorites, initializeFavoritesDragAndDrop } from './favourites.js'; // Import centralized functions
import { fetchLeaderboard } from './leaderboard.js'; // Import fetchLeaderboard

export function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const resetFiltersButton = document.getElementById('reset-filters');

  // Sidebar toggle logic
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    document.body.classList.toggle('sidebar-open');
    sidebarToggle.textContent = sidebar.classList.contains('open') ? '✖' : '☰';
  });

  // Reset filters functionality
  resetFiltersButton.addEventListener('click', () => {
    document.querySelectorAll('#sidebar input[type="checkbox"]').forEach((checkbox) => {
      checkbox.checked = false;
    });
    filterPubs();
  });

  // Tab switching logic
  const filterTab = document.getElementById('filter-tab');
  const favouritesTab = document.getElementById('favourites-tab');
  const filterContent = document.getElementById('filter-content');
  const favouritesContent = document.getElementById('favourites-content');
  const leaderboardTab = document.getElementById('leaderboard-tab');
  const leaderboardContent = document.getElementById('leaderboard-content');

  filterTab.addEventListener('click', () => {
    filterContent.classList.add('active');
    favouritesContent.classList.remove('active');
    leaderboardContent.classList.remove('active');
    filterTab.classList.add('active');
    favouritesTab.classList.remove('active');
    leaderboardTab.classList.remove('active');
  });

  favouritesTab.addEventListener('click', () => {
    favouritesContent.classList.add('active');
    filterContent.classList.remove('active');
    leaderboardContent.classList.remove('active');
    favouritesTab.classList.add('active');
    filterTab.classList.remove('active');
    leaderboardTab.classList.remove('active');
  });

  leaderboardTab.addEventListener('click', () => {
    leaderboardContent.classList.add('active');
    filterContent.classList.remove('active');
    favouritesContent.classList.remove('active');
    leaderboardTab.classList.add('active');
    filterTab.classList.remove('active');
    favouritesTab.classList.remove('active');

    fetchLeaderboard(); // Fetch and display leaderboard data
  });

  // Load favorites from Firestore on initialization
  loadFavorites();

  // Initialize drag-and-drop for favorites
  initializeFavoritesDragAndDrop();

  // Update pub count and progress bar
  updatePubCountAndProgress();
}

export function clearSidebarFavourites() {
  const favourites = document.getElementById('favourites');
  if (favourites) favourites.innerHTML = '';
}

function updateFavouritesCounter() {
  const favouritesCounter = document.getElementById('favourites-counter');
  const favourites = document.getElementById('favourites');
  console.log(`Favourites count: ${favourites.children.length}`); // Debugging log
  favouritesCounter.textContent = favourites.children.length;
}

function saveToFirestore() {
  const user = firebase.auth().currentUser;
  if (user) {
    // Get the updated favourites list from the sidebar
    const favourites = Array.from(document.getElementById('favourites').children).map(item => ({
      name: item.querySelector('.pub-name').textContent,
      image_url: item.querySelector('img').src
    }));

    db.collection('users').doc(user.uid).set({ favourites })
      .then(() => {
        console.log('Favourites successfully updated in Firestore.');
      })
      .catch((error) => {
        console.error('Error updating favourites in Firestore:', error.message);
      });
  } else {
    console.error('User is not authenticated. Cannot update favourites.');
  }
}

function updatePopupButtonState(pubName, isFavourite) {
  const popupButton = document.querySelector(`.custom-marker[data-pub-id="${pubName}"] .add-to-favourites`);
  if (popupButton) {
    popupButton.textContent = isFavourite ? '❌ Remove from Favourites' : '⭐ Add to Favourites';
  }
}

function updatePubCountAndProgress() {
  const totalPubsInLondon = 3544; // Total number of pubs in London
  const pubCountText = document.getElementById('pub-count-text');
  const progressBar = document.getElementById('progress-bar');

  fetch('data/pubs.json')
    .then((response) => response.json())
    .then((pubs) => {
      const pubCount = pubs.length;
      const percentage = Math.min((pubCount / totalPubsInLondon) * 100, 100);

      pubCountText.textContent = `${pubCount} pubs collected, out of ${totalPubsInLondon} pubs in London.`;
      progressBar.style.width = `${percentage}%`;
    })
    .catch((error) => {
      console.error('Error fetching pub data:', error);
    });
}
