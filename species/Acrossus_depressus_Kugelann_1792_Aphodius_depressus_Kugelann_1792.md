<script>
const SPECIES_PREFIX = "Acrossus depressus";
const CSV_URL = "../data/geom_occurances_valfondillo_georeferenced.csv";
const CORE_GEOJSON = "../boundaries/PNALM_core.geojson";
const OUTER_GEOJSON = "../boundaries/PNALM_outer.geojson";

// ---------------- MAP ----------------
const map = L.map("map").setView([41.9, 13.8], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// ---------------- BOUNDARIES ----------------
fetch(OUTER_GEOJSON)
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: "#1f78b4", weight: 2, fillOpacity: 0.15 }
    }).addTo(map);
  });

fetch(CORE_GEOJSON)
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: { color: "#006400", weight: 2, fillOpacity: 0.3 }
    }).addTo(map);
  });

// ---------------- CSV ----------------
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,

  complete: function(results) {

    const rows = results.data.filter(r =>
      r.scientificName &&
      r.scientificName.startsWith(SPECIES_PREFIX)
    );

    console.log("Records found:", rows.length);

    if (rows.length === 0) {
      document.getElementById("occurrence-table").innerHTML =
        "<p><strong>No records found for this species.</strong></p>";
      return;
    }

    const bounds = [];

    rows.forEach(r => {
      const lat = r["decimalLatitude.y"];
      const lon = r["decimalLongitude.y"];
      if (!lat || !lon) return;

      L.circleMarker([lat, lon], {
        radius: 5,
        color: "#e31a1c",
        fillOpacity: 0.8
      }).addTo(map);

      bounds.push([lat, lon]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds);
    }

    // ---------------- TABLE ----------------
    let html = "<table border='1' cellpadding='4' cellspacing='0'>";
    html += "<thead><tr>";
    html += "<th>Year</th><th>Latitude</th><th>Longitude</th><th>Locality</th><th>Basis</th>";
    html += "</tr></thead><tbody>";

    rows.forEach(r => {
      html += "<tr>";
      html += `<td>${r.year ?? ""}</td>`;
      html += `<td>${r["decimalLatitude.y"] ?? ""}</td>`;
      html += `<td>${r["decimalLongitude.y"] ?? ""}</td>`;
      html += `<td>${r.locality ?? ""}</td>`;
      html += `<td>${r.basisOfRecord ?? ""}</td>`;
      html += "</tr>";
    });

    html += "</tbody></table>";
    document.getElementById("occurrence-table").innerHTML = html;
  }
});
</script>
