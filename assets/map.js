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
// PARK BOUNDARIES
// ===============================
fetch(OUTER_GEOJSON)
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: "#1f78b4", weight: 2, fillOpacity: 0.1 }
    }).addTo(map);
  });

fetch(CORE_GEOJSON)
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: "#006400", weight: 2, fillOpacity: 0.3 }
    }).addTo(map);
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

    console.log("Species parameter:", SPECIES);
    console.log("Matching records:", rows.length);

    const bounds = [];
    const heatPoints = [];

    rows.forEach(r => {
      const lat = r["decimalLatitude.y"];
      const lon = r["decimalLongitude.y"];

      if (!lat || !lon) return;

      const marker = L.circleMarker([lat, lon], {
        radius: 5,
        color: "#e31a1c",
        weight: 1,
        fillOpacity: 0.85
      }).bindPopup(
        `<b>${r.scientificName}</b><br>
         Year: ${r.year || ""}<br>
         ${r.locality || ""}`
      );

      marker.addTo(map);
      bounds.push([lat, lon]);
      heatPoints.push([lat, lon, 1]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds);
    }

    // ===============================
    // HEATMAP
    // ===============================
    const heat = L.heatLayer(heatPoints, {
      radius: 20,
      blur: 15
    });

    // ===============================
    // TABLE
    // ===============================
    const tableDiv = document.getElementById("table");

    if (rows.length === 0) {
      tableDiv.innerHTML = "<p><b>No occurrence records found.</b></p>";
      return;
    }

    let html = "<table><thead><tr>";
    html += "<th>Year</th><th>Latitude</th><th>Longitude</th><th>Locality</th><th>Basis</th>";
    html += "</tr></thead><tbody>";

    rows.forEach(r => {
      html += "<tr>";
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
    // LAYER CONTROL
    // ===============================
    L.control.layers(null, {
      "Heatmap (density)": heat
    }).addTo(map);
  }
});
