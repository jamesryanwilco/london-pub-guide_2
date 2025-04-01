import { db } from '../config/firebase-config.js';
import { saveFavorites } from './auth.js'; // Import saveFavorites
import { map } from './map.js'; // Import the map object


// Debounce function to limit Firestore updates
let saveToFirestoreTimeout;
function debounceSaveToFirestore() {
  clearTimeout(saveToFirestoreTimeout);
  saveToFirestoreTimeout = setTimeout(() => {
    saveToFirestore();
  }, 300); // Adjust debounce delay as needed
}

export function addToFavourites(pub) {
  const favourites = document.getElementById('favourites');

  // Check if the pub is already in the favourites list
  const existingItem = Array.from(favourites.children).find(
    (item) => item.querySelector('.pub-name').textContent === pub.name
  );
  if (existingItem) {
    console.warn(`Pub "${pub.name}" is already in favourites.`);
    return;
  }

  const listItem = document.createElement('li');
  listItem.innerHTML = `
    <img src="${pub.image_url || 'placeholder.jpg'}" alt="${pub.name}" class="favourites-thumbnail">
    <div class="favourites-details">
      <span class="pub-name">${pub.name}</span>
    </div>
    <button class="goto-button">📍</button>
  `;
  favourites.appendChild(listItem);

  const gotoButton = listItem.querySelector('.goto-button');
  gotoButton.addEventListener('click', () => {
    fetch('data/pubs.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((pubs) => {
        const pubData = pubs.find((p) => p.name === pub.name);
        if (!pubData || isNaN(pubData.lng) || isNaN(pubData.lat)) {
          console.error(`Invalid coordinates for pub: ${pub.name}`, pubData);
          alert(`Cannot navigate to "${pub.name}" due to invalid location.`);
          return;
        }

        map.flyTo({
          center: [pubData.lng, pubData.lat],
          zoom: 16,
          essential: true,
        });
      })
      .catch((error) => {
        console.error('Error fetching pub data:', error);
        alert('Failed to fetch pub location. Please try again later.');
      });
  });

  // Update Firestore
  saveToFirestore();

  // Update the marker and popup button state
  updatePopupButtonState(pub.name, true);
  updateFavouritesCounter();
}

export function removeFromFavourites(pub) {
  const favourites = document.getElementById('favourites');
  const items = favourites.querySelectorAll('li');
  let removed = false;

  items.forEach((item) => {
    if (item.querySelector('span').textContent === pub.name) {
      item.remove();
      removed = true;
    }
  });

  if (!removed) {
    console.warn(`Pub "${pub.name}" not found in favourites list.`);
  }

  // Update Firestore
  saveToFirestore();

  // Update the marker and popup button state
  updatePopupButtonState(pub.name, false);
  updateFavouritesCounter();
}

export function updateFavouritesRanking() {
  const favourites = document.getElementById('favourites').children;
  Array.from(favourites).forEach((item, index) => {
    const rankingElement = item.querySelector('.favourites-ranking');
    if (rankingElement) {
      rankingElement.textContent = index + 1; // Update ranking number
    }
  });
}

export function clearSidebarFavourites() {
  const favourites = document.getElementById('favourites');
  if (favourites) favourites.innerHTML = '';
}

export function updateFavouritesCounter() {
  const favouritesCounter = document.getElementById('favourites-counter');
  const favourites = document.getElementById('favourites');
  console.log(`Favourites count: ${favourites.children.length}`); // Debugging log
  favouritesCounter.textContent = favourites.children.length;
}

export function loadFavorites() {
  const user = firebase.auth().currentUser;
  if (user) {
    // Clear the favourites list in the UI
    clearSidebarFavourites();

    db.collection('users')
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const favourites = doc.data().favourites || [];
          favourites.forEach((pub) => {
            addToFavourites(pub);

            // Ensure the popup button state is updated for each favourite
            updatePopupButtonState(pub.name, true);
          });

          updateFavouritesRanking(); // Ensure rankings are visible immediately
          initializeFavoritesDragAndDrop(); // Initialize drag-and-drop
          updateAllPopupButtonStates(favourites); // Update popup button states
        }
      })
      .catch((error) => console.error('Error loading favourites:', error.message));
  }
}

// Update popup button states for all markers
export function updateAllPopupButtonStates(favourites) {
  const markers = document.querySelectorAll('.custom-marker');
  markers.forEach(marker => {
    const pubName = marker.getAttribute('data-pub-id');
    const isFavourite = favourites.some(fav => fav.name === pubName);
    updatePopupButtonState(pubName, isFavourite);
  });
}

export function saveToFirestore() {
  const user = firebase.auth().currentUser;
  if (user) {
    // Get the updated favourites list from the sidebar
    const favourites = Array.from(document.getElementById('favourites').children).map(item => ({
      name: item.querySelector('span').textContent,
      image_url: item.querySelector('img').src
    }));

    // Use saveFavorites from auth.js
    saveFavorites(user.uid, favourites);
  } else {
    console.error('User is not authenticated. Cannot update favourites.');
  }
}

export function updatePopupButtonState(pubName, isFavourite) {
  const popupButton = document.querySelector(`.popup-content .add-to-favourites`);
  if (popupButton) {
    popupButton.textContent = isFavourite ? '❌ Remove from Favourites' : '⭐ Add to Favourites';
  }
}

export function initializeFavoritesDragAndDrop() {
  const favourites = document.getElementById('favourites');

  if (!favourites) return;

  // Initialize SortableJS
  Sortable.create(favourites, {
    animation: 150, // Smooth animation
    onEnd: () => {
      console.log('Favorites reordered'); // Debugging log
      updateFavouritesRanking(); // Update rankings after reordering
      saveToFirestore(); // Save the updated order to Firestore
    },
  });
}
