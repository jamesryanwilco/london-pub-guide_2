import { db } from '../config/firebase-config.js';

export function fetchLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  leaderboard.innerHTML = '<li>Loading...</li>'; // Show loading state

  db.collection('users')
    .get()
    .then((snapshot) => {
      const pubCounts = {};

      snapshot.forEach((doc) => {
        const favourites = doc.data().favourites || [];
        favourites.forEach((pub) => {
          pubCounts[pub.name] = (pubCounts[pub.name] || 0) + 1;
        });
      });

      const sortedPubs = Object.entries(pubCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      leaderboard.innerHTML = sortedPubs
        .map(([name, count], index) => {
          let medal = '';
          let fontSize = '16px'; // Default font size
          if (index === 0) {
            medal = '🥇'; // Gold medal
            fontSize = '24px'; // Largest font size
          } else if (index === 1) {
            medal = '🥈'; // Silver medal
            fontSize = '20px'; // Medium font size
          } else if (index === 2) {
            medal = '🥉'; // Bronze medal
            fontSize = '18px'; // Smaller than silver
          }

          return `<li style="font-size: ${fontSize};"><strong>${index + 1}. ${medal} ${name}</strong><span>${count} ♥︎</span></li>`;
        })
        .join('');
    })
    .catch((error) => {
      console.error('Error fetching leaderboard:', error);
      leaderboard.innerHTML = '<li>Error loading leaderboard</li>';
    });
}
