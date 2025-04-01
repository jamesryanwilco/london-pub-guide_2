import { map } from './map.js';
import { loadPubs } from './markers.js';
import { setupFilterListeners } from './filters.js';
import { setupSidebar } from './sidebar.js';
import { googleSignIn, logIn, signUp, logOut } from './auth.js';
import { fetchLeaderboard } from './leaderboard.js';

document.addEventListener('DOMContentLoaded', () => {
  map.on('load', () => {
    loadPubs(); // Load pubs regardless of authentication
    setupFilterListeners();
    setupSidebar();
  });

  const loginButton = document.getElementById('login-button');
  const signupButton = document.getElementById('signup-button');
  const logoutButton = document.getElementById('logout-button');
  const headerLogoutButton = document.getElementById('header-logout-button');
  const googleSignInButton = document.getElementById('google-signin-button');

  if (loginButton) {
    loginButton.addEventListener('click', () => {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      logIn(email, password)
        .then(() => {
          document.getElementById('login-modal').style.display = 'none'; // Hide modal on successful login
        })
        .catch(console.error);
    });
  }

  if (signupButton) {
    signupButton.addEventListener('click', () => {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      if (!email || !password) {
        alert('Please provide both email and password.');
        return;
      }

      signUp(email, password)
        .then(() => {
          document.getElementById('login-modal').style.display = 'none'; // Hide modal on successful signup
        })
        .catch(console.error);
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logOut().catch(console.error);
    });
  }

  if (headerLogoutButton) {
    headerLogoutButton.addEventListener('click', () => {
      logOut().catch(console.error);
    });
  }

  if (googleSignInButton) {
    googleSignInButton.addEventListener('click', () => {
      googleSignIn()
        .then(() => {
          document.getElementById('login-modal').style.display = 'none'; // Hide modal on successful login
        })
        .catch(console.error);
    });
  }

  // Disable sidebar until logged in
  firebase.auth().onAuthStateChanged((user) => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const usernameDisplay = document.getElementById('username-display');

    if (user) {
      sidebar.style.pointerEvents = 'auto';
      sidebar.style.opacity = '1';
      sidebarToggle.style.pointerEvents = 'auto';
      sidebarToggle.style.opacity = '1';

      usernameDisplay.textContent = `Logged in as: ${user.email}`;
    } else {
      sidebar.style.pointerEvents = 'none';
      sidebar.style.opacity = '0.5';
      sidebarToggle.style.pointerEvents = 'none';
      sidebarToggle.style.opacity = '0.5';

      usernameDisplay.textContent = '';
    }
  });

  // Add a close button to the login modal
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.addEventListener('click', (event) => {
      if (event.target === loginModal) {
        loginModal.style.display = 'none'; // Close modal when clicking outside the content
      }
    });
  }
});
