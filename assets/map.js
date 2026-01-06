// =====================================================
// SPECIES PARAMETER FROM URL
// =====================================================
const params = new URLSearchParams(window.location.search);
const SPECIES = params.get("species"); // scientificName

// =====================================================
// DATA PATHS (MATCH YOUR REPOSITORY)
// =====================================================
const CSV_URL = "../data/geom_occurances_valfondillo_georeferenced.csv";
const CORE_GEOJSON = "../boundaries/PNALM_core.geojson";
const OUTER_GEOJSON = "../boundaries/PNALM_externalarea.geojson";

// =====================================================
// INITIALIZE MAP
// =====================================================
const map = L.map("map").setView([41.9, 13.8], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// =====================================================
// PNALM BOUNDARY LAYERS
// =====================================================
const boundaryLayers = {};

// ---------- OUTER / CONTIGUOUS AREA ----------
fetch(OUTER_GEOJSON)
  .then(r => r.json())
  .then(data => {
    boundaryLayers["PNALM – outer area"] = L.geoJSON(data, {
      style: {
        color: "#1f78b4",      // blue outline
        weight: 2,
        fillColor: "#a6cee3",  // light blue fill
        fillOpacity: 0.25      // clearly visible
      }
    }).addTo(map);
  });

// ---------- CORE AREA ----------
fetch(CORE_GEOJSON)
  .then(r => r.json())
  .then(data => {
    boundaryLayers["PNALM – core area"] = L.geoJSON(data, {
      style: {
        color: "#006400",     // dark green outline
        weight: 2,
        fillColor: "#33a02c", // green fill
        fillOpacity: 0.4
      }
    }).addTo(map);

    // FORCE LAYER ORDER:
    // outer area below, core area above
    if (boundaryLayers["PNALM – outer area"]) {
      boundaryLayers["PNALM – outer area"].bringToBack();
    }
    boundaryLayers["PNALM – core area"].bringToFront();
  });

// =====================================================
// TEMPORAL BINS (DECADES)
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
// OCCURRENCE LAYERS
// =====================================================
const pointLayers = {};
const allPoints = L.featureGroup();
const heatPoints = [];

// =====================================================
// LOAD CSV AND DRAW POINTS
// =====================================================
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,

  complete: function (results) {

    results.data.forEach(r => {

      // FILTER BY SPECIES (IF PROVIDED)
      if (SPECIES && r.scientificName !== SPECIES) return;

      // REAL COORDINATES FROM YOUR CSV
      const lat = r["decimalLatitude.y"];
      const lon = r["decimalLongitude.y"];
      const year = r.year;

      if (!lat || !lon || !year) return;

      const bin = binForYear(year);
      if (!bin) return;

      // CREATE LAYER IF NEEDED
      if (!pointLayers[bin.label]) {
        pointLayers[bin.label] = L.featureGroup().addTo(map);
      }

      // POINT MARKER
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

      // HEATMAP INPUT
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
    // LAYER CONTROLS
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
    // AUTO ZOOM
    // =====================================================
    if (allPoints.getLayers().length > 0) {
      map.fitBounds(allPoints.getBounds().pad(0.1));
    }
  }
});
