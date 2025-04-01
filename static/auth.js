import { db } from '../config/firebase-config.js';
import { addToFavourites, removeFromFavourites, clearSidebarFavourites } from './favourites.js'; // Import clearSidebarFavourites
import { loadFavorites, updateFavouritesRanking } from './favourites.js'; // Import loadFavorites and updateFavouritesRanking

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider(); // Google Auth Provider

// Ensure clearFavoritesUI is defined
function clearFavoritesUI() {
  const favourites = document.getElementById('favourites');
  if (favourites) favourites.innerHTML = '';
}

// Sign Up
export function signUp(email, password) {
  return auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User signed up:', user.email);
      return db.collection('users').doc(user.uid).set({ favourites: [] });
    })
    .catch((error) => {
      if (error.code === 'auth/email-already-in-use') {
        alert('The email address is already in use by another account. Please use a different email or log in instead.');
      } else {
        console.error('Signup error:', error.message);
      }
      throw error; // Re-throw the error for further handling if needed
    });
}

// Login
export function logIn(email, password) {
  return auth.signInWithEmailAndPassword(email, password)
    .catch((error) => console.error('Login error:', error.message));
}

// Google Sign-In
export function googleSignIn() {
  return auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log('Google Sign-In successful:', user.email);

      // Check if the user already has favourites in Firestore
      return db.collection('users').doc(user.uid).get()
        .then((doc) => {
          if (!doc.exists || !doc.data().favourites) {
            // If no favourites exist, initialize with an empty array
            return db.collection('users').doc(user.uid).set({ favourites: [] }, { merge: true });
          }
          return null; // Explicitly return null if no action is needed
        });
    })
    .then(() => {
      console.log('User favourites initialized or preserved.');
    })
    .catch((error) => {
      console.error('Google Sign-In error:', error.message);
      throw error; // Re-throw the error to ensure proper error handling
    });
}

// Logout
export function logOut() {
  return auth.signOut();
}

// Auth state change listener
auth.onAuthStateChanged((user) => {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const usernameDisplay = document.getElementById('username-display');
  const headerAuthButton = document.getElementById('header-auth-button');
  const loginModal = document.getElementById('login-modal');

  if (user) {
    console.log('User logged in:', user.email);
    headerAuthButton.textContent = 'Logout';
    headerAuthButton.onclick = () => logOut().catch(console.error);
    loginModal.style.display = 'none'; // Hide login modal if user is logged in
    clearFavoritesUI();
    clearSidebarFavourites();
    loadFavorites(); // Reverted to original call without `.then`
    updateFavouritesRanking(); // Ensure rankings are updated after loading favourites
    sidebar.style.pointerEvents = 'auto';
    sidebar.style.opacity = '1';
    sidebarToggle.style.pointerEvents = 'auto';
    sidebarToggle.style.opacity = '1';
    usernameDisplay.textContent = `Logged in as: ${user.email}`;
  } else {
    console.log('User not logged in');
    headerAuthButton.textContent = 'Login';
    headerAuthButton.onclick = () => {
      loginModal.style.display = 'flex'; // Show login modal only when "Login" is clicked
    };
    clearFavoritesUI();
    clearSidebarFavourites();
    sidebar.style.pointerEvents = 'none';
    sidebar.style.opacity = '0.5';
    sidebarToggle.style.pointerEvents = 'none';
    sidebarToggle.style.opacity = '0.5';
    usernameDisplay.textContent = '';

    // Hide all heart icons on logout
    document.querySelectorAll('.custom-marker .favourites-icon').forEach((heartIcon) => {
      heartIcon.style.display = 'none';
    });

    // Remove favourites-marker class from all markers
    document.querySelectorAll('.custom-marker').forEach((marker) => {
      marker.classList.remove('favourites-marker');
    });
  }
});

// Save favourites to Firestore
export function saveFavorites(userId, favourites) {
  console.log(`Saving favourites for user: ${userId}`, favourites); // Debugging log
  return db.collection('users').doc(userId).set({ favourites })
    .then(() => {
      console.log('Favourites successfully saved to Firestore.');
    })
    .catch((error) => {
      console.error('Error saving favourites to Firestore:', error.message);
    });
}
