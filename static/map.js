// Debugging: Log the Mapbox access token
console.log('Mapbox Access Token:', process.env.MAPBOX_ACCESS_TOKEN);

// Mapbox Access Token
mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN; // Ensure the token is loaded from the environment

// Initialize the map
export const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    projection: 'globe',
    zoom: 10,
    center: [-0.1278, 51.5074],
    touchZoomRotate: true // Enable touch gestures for zoom and rotation
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

map.touchZoomRotate.enable(); // Ensure two-finger zoom is enabled
map.touchZoomRotate.disableRotation(); // Optionally disable rotation if not needed

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
