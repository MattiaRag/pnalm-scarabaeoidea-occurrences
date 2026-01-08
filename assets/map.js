// ===============================
// PARAMETERS
// ===============================
const params = new URLSearchParams(window.location.search);
const SPECIES = params.get("species"); // es: "Acrossus depressus"

const CSV_URL = "../data/geom_occurances_valfondillo_georeferenced.csv";
const CORE_GEOJSON = "../boundaries/PNALM_core.geojson";
const OUTER_GEOJSON = "../boundaries/PNALM_externalarea.geojson";

// ===============================
// MAP
// ===============================
const map = L.map("map").setView([41.9, 13.8], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// ===============================
// PARK BOUNDARIES (LESS INTENSE)
// ===============================
const coreLayer = L.geoJSON(null, {
  style: { color: "#66c2a4", weight: 2, fillOpacity: 0.15 }
});

const outerLayer = L.geoJSON(null, {
  style: { color: "#8da0cb", weight: 2, fillOpacity: 0.1 }
});

fetch(CORE_GEOJSON).then(r => r.json()).then(d => coreLayer.addData(d));
fetch(OUTER_GEOJSON).then(r => r.json()).then(d => outerLayer.addData(d));

// ===============================
// TEMPORAL BINS (ALWAYS VISIBLE)
// ===============================
const YEAR_BINS = [
  { label: "≤ 1999",    test: y => y <= 1999,              color: "#d73027" },
  { label: "2000–2009", test: y => y >= 2000 && y <= 2009, color: "#fc8d59" },
  { label: "2010–2019", test: y => y >= 2010 && y <= 2019, color: "#91bfdb" },
  { label: "≥ 2020",    test: y => y >= 2020,              color: "#1a9850" }
];

const pointLayers = {};
YEAR_BINS.forEach(b => {
  pointLayers[b.label] = L.featureGroup();
});

// ===============================
// CSV PARSE
// ===============================
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,

  complete: function (results) {

    const rows = results.data.filter(r => {
      if (!r.scientificName) return false;
      if (!SPECIES) return true;
      return r.scientificName.startsWith(SPECIES);
    });

    const bounds = [];

    rows.forEach(r => {

      const lat = r["decimalLatitude.y"];
      const lon = r["decimalLongitude.y"];
      const year = r.year;
      const occID = r.occurrenceID;

      if (!lat || !lon || !year) return;

      const bin = YEAR_BINS.find(b => b.test(year));
      if (!bin) return;

      const marker = L.circleMarker([lat, lon], {
        radius: 5,
        color: bin.color,
        weight: 1,
        fillOpacity: 0.9
      }).bindPopup(
        `<b>${r.scientificName}</b><br>
         <b>OccurrenceID:</b> ${occID || "NA"}<br>
         <b>Year:</b> ${year}<br>
         ${r.locality || ""}`
      );

      marker.addTo(pointLayers[bin.label]);
      bounds.push([lat, lon]);
    });

    // ===============================
    // TABLE (WITH occurrenceID)
    // ===============================
    const tableDiv = document.getElementById("table");

    let html = "<table><thead><tr>";
    html += "<th>OccurrenceID</th><th>Year</th><th>Latitude</th><th>Longitude</th><th>Locality</th><th>Basis</th>";
    html += "</tr></thead><tbody>";

    rows.forEach(r => {
      html += "<tr>";
      html += `<td>${r.occurrenceID || ""}</td>`;
      html += `<td>${r.year || ""}</td>`;
      html += `<td>${r["decimalLatitude.y"] || ""}</td>`;
      html += `<td>${r["decimalLongitude.y"] || ""}</td>`;
      html += `<td>${r.locality || ""}</td>`;
      html += `<td>${r.basisOfRecord || ""}</td>`;
      html += "</tr>";
    });

    html += "</tbody></table>";
    tableDiv.innerHTML = html;

    // ===============================
    // ADD LAYERS TO MAP
    // ===============================
    coreLayer.addTo(map);
    outerLayer.addTo(map);

    Object.values(pointLayers).forEach(l => l.addTo(map));

    if (bounds.length > 0) {
      map.fitBounds(bounds);
    }

    // ===============================
    // LAYER CONTROL
    // ===============================
    const overlays = {
      "PNALM – core area": coreLayer,
      "PNALM – outer area": outerLayer
    };

    YEAR_BINS.forEach(b => {
      overlays[`Occurrences ${b.label}`] = pointLayers[b.label];
    });

    L.control.layers(null, overlays, { collapsed: false }).addTo(map);
  }
});
