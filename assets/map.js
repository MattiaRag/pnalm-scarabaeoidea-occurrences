// Inizializza la mappa
const map = L.map("map").setView([41.9, 13.8], 10);

// Basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Carica confini PNALM (zona esterna)
fetch("../boundaries/pnalm_outer.geojson")
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: "#333", weight: 2, fillOpacity: 0.05 }
    }).addTo(map);
  });

// Carica confini PNALM (zona core)
fetch("../boundaries/pnalm_core.geojson")
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: "#000", weight: 2, fillOpacity: 0.1 }
    }).addTo(map);
  });
