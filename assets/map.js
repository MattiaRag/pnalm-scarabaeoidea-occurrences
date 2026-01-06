// =====================================================
// PARAMETRO SPECIE DA URL
// =====================================================
const params = new URLSearchParams(window.location.search);
const SPECIES = params.get("species"); // scientificName

// =====================================================
// PERCORSI DATI
// =====================================================
const CSV_URL = "../data/occurrences.csv";
const CORE_GEOJSON = "../boundaries/pnalm_core.geojson";
const OUTER_GEOJSON = "../boundaries/pnalm_outer.geojson";

// =====================================================
// INIZIALIZZA MAPPA
// =====================================================
const map = L.map("map").setView([41.9, 13.8], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// =====================================================
// LAYER CONFINI PNALM
// =====================================================
const boundaryLayers = {};

fetch(OUTER_GEOJSON)
  .then(r => r.json())
  .then(data => {
    boundaryLayers["PNALM – zona esterna"] = L.geoJSON(data, {
      style: { color: "#555", weight: 2, fillOpacity: 0.05 }
    }).addTo(map);
  });

fetch(CORE_GEOJSON)
  .then(r => r.json())
  .then(data => {
    boundaryLayers["PNALM – zona core"] = L.geoJSON(data, {
      style: { color: "#000", weight: 2, fillOpacity: 0.1 }
    }).addTo(map);
  });

// =====================================================
// INTERVALLI TEMPORALI (DECADI)
// =====================================================
const YEAR_BINS = [
  { label: "≤ 1999",    test: y => y <= 1999,              color: "#d73027" },
  { label: "2000–2009", test: y => y >= 2000 && y <= 2009, color: "#fc8d59" },
  { label: "2010–2019", test: y => y >= 2010 && y <= 2019, color: "#91bfdb" },
  { label: "≥ 2020",    test: y => y >= 2020,              color: "#1a9850" }
];

function binForYear(year) {
  for (const b of YEAR_BINS) {
    if (b.test(year)) return b;
  }
  return null;
}

// =====================================================
// CONTENITORI LAYER
// =====================================================
const pointLayers = {};
const allPoints = L.featureGroup();
const heatPoints = [];

// =====================================================
// CARICA CSV
// =====================================================
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,

  complete: function (results) {

    results.data.forEach(r => {

      // -----------------------------
      // FILTRO SPECIE (se presente)
      // -----------------------------
      if (SPECIES && r.scientificName !== SPECIES) return;

      // -----------------------------
      // COORDINATE REALI DEL TUO CSV
      // -----------------------------
      const lat = r["decimalLatitude.y"];
      const lon = r["decimalLongitude.y"];
      const year = r.year;

      if (!lat || !lon || !year) return;

      const bin = binForYear(year);
      if (!bin) return;

      // -----------------------------
      // CREA LAYER SE NON ESISTE
      // -----------------------------
      if (!pointLayers[bin.label]) {
        pointLayers[bin.label] = L.featureGroup().addTo(map);
      }

      // -----------------------------
      // MARKER
      // -----------------------------
      const marker = L.circleMarker([lat, lon], {
        radius: 5,
        color: bin.color,
        weight: 1,
        fillOpacity: 0.85
      }).bindPopup(
        `<b>${r.scientificName}</b><br>
         Year: ${year}<br>
         ${r.locality || ""}`
      );

      marker.addTo(pointLayers[bin.label]);
      marker.addTo(allPoints);

      // -----------------------------
      // HEATMAP
      // -----------------------------
      heatPoints.push([lat, lon, 1]);
    });

    // =====================================================
    // HEATMAP LAYER
    // =====================================================
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 18,
      blur: 16,
      maxZoom: 17
    });

    // =====================================================
    // CONTROLLO LAYER
    // =====================================================
    const overlays = {
      ...boundaryLayers,
      "Heatmap (density)": heatLayer
    };

    for (const label in pointLayers) {
      overlays[`Occurrences ${label}`] = pointLayers[label];
    }

    L.control.layers(null, overlays, { collapsed: false }).addTo(map);

    // =====================================================
    // ZOOM AUTOMATICO
    // =====================================================
    if (allPoints.getLayers().length > 0) {
      map.fitBounds(allPoints.getBounds().pad(0.1));
    }
  }
});
