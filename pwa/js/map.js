// pwa/js/map.js
let map = null;
let markersLayer = null;

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';
const PRECACHE_ZOOMS = [12, 13, 14, 15];

function initMap() {
  map = L.map('map').setView([35.6812, 139.7671], 10);
  L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 18 }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  document.getElementById('cache-maps-btn').addEventListener('click', cacheAllMaps);
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

function lngToTileX(lng, z) {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, z));
}

function latToTileY(lat, z) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, z)
  );
}

function tileUrlFor(z, x, y, subdomain) {
  return TILE_URL.replace('{s}', subdomain).replace('{z}', z).replace('{x}', x).replace('{y}', y);
}

async function cacheAllMaps() {
  const btn = document.getElementById('cache-maps-btn');
  btn.disabled = true;
  btn.textContent = '准备中...';

  const allDays = [];
  for (let d = 1; d <= 9; d++) {
    const res = await fetch(`data/d${d}.json`);
    allDays.push(await res.json());
  }

  const cache = await caches.open('map-tiles-v1');
  const subdomains = ['a', 'b', 'c'];
  const urls = new Set();

  for (const day of allDays) {
    const points = day.items.filter((i) => i.lat != null && i.lng != null);
    for (const z of PRECACHE_ZOOMS) {
      for (const p of points) {
        const x = lngToTileX(p.lng, z);
        const y = latToTileY(p.lat, z);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const s = subdomains[(x + y + dx + dy + 300) % subdomains.length];
            urls.add(tileUrlFor(z, x + dx, y + dy, s));
          }
        }
      }
    }
  }

  const urlList = [...urls];
  let done = 0;
  for (const url of urlList) {
    try {
      const res = await fetch(url);
      if (res.ok) await cache.put(url, res);
    } catch (e) {
      // 跳过下载失败的瓦片,不阻塞整体流程
    }
    done++;
    btn.textContent = `缓存中...${Math.round((done / urlList.length) * 100)}%`;
  }

  btn.disabled = false;
  btn.textContent = `离线地图已缓存(${urlList.length}张瓦片)`;
}

export { initMap, showDayOnMap, cacheAllMaps };
