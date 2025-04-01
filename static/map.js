import { MAPBOX_ACCESS_TOKEN } from '../config/tokens.js';

// Mapbox Access Token
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN; // Replace with a valid token

// Initialize the map
export const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    projection: 'globe',
    zoom: 10,
    center: [-0.1278, 51.5074],
    touchZoomRotate: false
});

// Controls and limits
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
map.scrollZoom.enable();
map.setMinZoom(9);
map.setMaxZoom(18);

const londonBounds = [
  [-0.510375, 51.286760],
  [0.334015, 51.691874]
];
map.setMaxBounds(londonBounds);

map.on('style.load', () => {
    map.setFog({});
});

// Optional: Spinning globe effect
const secondsPerRevolution = 240;
const maxSpinZoom = 5;
const slowSpinZoom = 3;
let userInteracting = false;
const spinEnabled = true;

function spinGlobe() {
    const zoom = map.getZoom();
    if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
    }
    requestAnimationFrame(spinGlobe);
}

map.on('mousedown', () => { userInteracting = true; });
map.on('dragstart', () => { userInteracting = true; });
map.on('moveend', () => { userInteracting = false; });

spinGlobe();
