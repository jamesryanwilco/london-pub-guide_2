import { map } from './map.js';
import { addToFavourites, removeFromFavourites, updatePopupButtonState } from './favourites.js';
import { filterPubs } from './filters.js';
import { db } from '../config/firebase-config.js'; // Ensure the import path is correct

export let markers = [];
let geojsonSource;

// Helper function to create GeoJSON from pubs
function createGeoJSON(pubs) {
  return {
    type: 'FeatureCollection',
    features: pubs.map((pub) => ({
      type: 'Feature',
      properties: {
        ...pub,
        isFavourite: false, // Default favorite status
      },
      geometry: {
        type: 'Point',
        coordinates: [pub.lng, pub.lat],
      },
    })),
  };
}

// Add clustering source and layers
function addClusterLayers() {
  map.addSource('pubs', {
    type: 'geojson',
    data: geojsonSource,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points
    clusterRadius: 50, // Radius of each cluster
  });

  // Cluster layer
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'pubs',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#FFD700', // Gold for small clusters
        10,
        '#FF5733', // Orange for medium clusters
        50,
        '#FF4500', // Red for large clusters
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        18, // Increased from 15 to 18
        10,
        24, // Increased from 20 to 24
        50,
        30, // Increased from 25 to 30
      ],
    },
  });

  // Cluster count labels
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'pubs',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#000000', // Changed from white (#FFFFFF) to black (#000000)
    },
  });

  // Individual marker layer
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'pubs',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#FFD700',
      'circle-radius': 10, // Increased from 8 to 10
      'circle-stroke-width': 2,
      'circle-stroke-color': '#333',
    },
  });

  // Pub name labels (visible only when zoomed in)
  map.addLayer({
    id: 'pub-labels',
    type: 'symbol',
    source: 'pubs',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'name'], // Display the pub name
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 16, // Increased font size for better readability
      'text-offset': [0, 1.5], // Offset the text slightly below the marker
      'text-anchor': 'top',
    },
    paint: {
      'text-color': '#FFFFFF', // White text color for better contrast
      'text-halo-color': '#000000', // Black halo for better visibility
      'text-halo-width': 2, // Increased halo width for better clarity
      'text-halo-blur': 1, // Slight blur for a smoother halo effect
    },
    minzoom: 15, // Only show labels when zoomed in to level 15 or higher
  });

  // Add click event for clusters
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['clusters'],
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('pubs').getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom,
      });
    });
  });

  // Add click event for individual markers
  map.on('click', 'unclustered-point', (e) => {
    const pub = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();
    const isAuthenticated = !!firebase.auth().currentUser; // Check if the user is authenticated

    // Dynamically generate the list of attributes
    const attributes = [
      pub.is_dog_friendly && '🐕 Dog Friendly',
      pub.shows_sports && '🏟️ Shows Sports',
      pub.has_beer_garden && '🌳 Beer Garden',
      pub.is_historic && '🏰 Historic Pub',
      pub.serves_food && '🍴 Serves Food',
      pub.has_pool_table && '🎱 Has Pool Table',
      pub.has_darts && '🎯 Has Darts',
    ].filter(Boolean); // Remove falsy values

    const attributesHtml = attributes
      .map((attr) => `<div>${attr}</div>`)
      .join('');

    const popupContent = `
      <div class="popup-content">
        ${pub.image_url ? `<img src="${pub.image_url}" alt="${pub.name}" class="popup-image">` : ''}
        <h3>${pub.name}</h3>
        <button class="add-to-favourites" ${!isAuthenticated ? 'disabled' : ''}>
          ${pub.isFavourite ? '❌ Remove from Favourites' : '⭐ Add to Favourites'}
        </button>
        <p>${pub.description}</p>
        <div class="popup-attributes">
          ${attributesHtml}
        </div>
      </div>
    `;

    const popup = new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map);

    const button = popup.getElement().querySelector('.add-to-favourites');
    button.addEventListener('click', () => {
      if (pub.isFavourite) {
        removeFromFavourites(pub);
        pub.isFavourite = false; // Update the state immediately
        button.textContent = '⭐ Add to Favourites'; // Update button text immediately
      } else {
        addToFavourites(pub);
        pub.isFavourite = true; // Update the state immediately
        button.textContent = '❌ Remove from Favourites'; // Update button text immediately
      }
    });
  });

  // Change cursor to pointer on hover
  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = '';
  });
}

// Load pubs and initialize clustering
export function loadPubs() {
  fetch('data/pubs.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((pubs) => {
      geojsonSource = createGeoJSON(pubs);

      firebase.auth().onAuthStateChanged((user) => {
        const isAuthenticated = !!user;

        const favouritesPromise = isAuthenticated
          ? db.collection('users').doc(user.uid).get().then((doc) => doc.exists ? doc.data().favourites || [] : [])
          : Promise.resolve([]);

        favouritesPromise.then((favourites) => {
          // Mark favorites in GeoJSON
          geojsonSource.features.forEach((feature) => {
            feature.properties.isFavourite = favourites.some((fav) => fav.name === feature.properties.name);
          });

          addClusterLayers();
          filterPubs(); // Apply filters after loading
        });
      });
    })
    .catch((error) => {
      console.error('❌ Error loading pubs from pubs.json:', error);
    });
}

// Clear markers (if needed)
export function clearMapMarkers() {
  if (map.getSource('pubs')) {
    map.removeLayer('clusters');
    map.removeLayer('cluster-count');
    map.removeLayer('unclustered-point');
    map.removeLayer('pub-labels');
    map.removeSource('pubs');
  }
  markers = [];
}
