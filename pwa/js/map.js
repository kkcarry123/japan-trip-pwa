// pwa/js/map.js
let map = null;
let markersLayer = null;

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';

function initMap() {
  map = L.map('map').setView([35.6812, 139.7671], 10);
  L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18 }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

function showDayOnMap(items) {
  markersLayer.clearLayers();
  const points = items.filter((i) => i.lat != null && i.lng != null);
  if (points.length === 0) return;

  points.forEach((item) => {
    const marker = L.marker([item.lat, item.lng]).addTo(markersLayer);
    marker.bindPopup(`<b>${item.time} ${item.title}</b><br>${item.detail || ''}`);
  });

  const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
  map.fitBounds(bounds, { padding: [30, 30] });
}

export { initMap, showDayOnMap };
