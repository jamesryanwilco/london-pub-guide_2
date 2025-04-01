import { map } from './map.js';
import { markers } from './markers.js';

let originalGeojsonSource = null; // Preserve the original GeoJSON source

export function filterPubs() {
  const dogFriendly = document.getElementById('dog-friendly').checked;
  const showsSports = document.getElementById('shows-sports').checked;
  const beerGarden = document.getElementById('beer-garden').checked;
  const servesFood = document.getElementById('serves-food').checked;
  const poolTable = document.getElementById('pool-table').checked;
  const darts = document.getElementById('darts').checked;

  const bounds = map.getBounds();

  // Ensure the original GeoJSON source is preserved
  if (!originalGeojsonSource && map.getSource('pubs')) {
    originalGeojsonSource = map.getSource('pubs')._data;
  }

  // Filter the original GeoJSON source
  const filteredFeatures = originalGeojsonSource.features.filter((feature) => {
    const pub = feature.properties;
    const isInBounds = bounds.contains(feature.geometry.coordinates);
    const matchesFilter =
      (!dogFriendly || pub.is_dog_friendly) &&
      (!showsSports || pub.shows_sports) &&
      (!beerGarden || pub.has_beer_garden) &&
      (!servesFood || pub.serves_food) &&
      (!poolTable || pub.has_pool_table) &&
      (!darts || pub.has_darts);

    return isInBounds && matchesFilter;
  });

  const filteredGeojsonSource = {
    type: 'FeatureCollection',
    features: filteredFeatures,
  };

  // Update the cluster source with the filtered data
  if (map.getSource('pubs')) {
    map.getSource('pubs').setData(filteredGeojsonSource);
  }
}

export function setupFilterListeners() {
  document.querySelectorAll('#sidebar input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', filterPubs);
  });
}
