---
title: Acrossus depressus (Kugelann, 1792)
---

## Acrossus depressus (Kugelann, 1792)

### Occurrence map

<div id="map-container" style="border:1px solid #aaa; padding:6px; margin-bottom:20px;">
  <div id="map" style="height:500px;"></div>
</div>

### Occurrence records

<div id="occurrence-table"></div>

<!-- LIBRARIES -->
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/papaparse@5.4.1/papaparse.min.js"></script>

<!-- SCRIPT SPECIE -->
<script>
const SPECIES_NAME = "Acrossus depressus (Kugelann, 1792) (= Aphodius depressus (Kugelann, 1792))";
const CSV_URL = "../data/geom_occurances_valfondillo_georeferenced.csv";

// ---------------- MAP ----------------
const map = L.map("map").setView([41.9, 13.8], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

Papa.parse(CSV_URL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function(results) {

    const rows = results.data.filter(
      r => r.scientificName === SPECIES_NAME
    );

    const bounds = [];

    rows.forEach(r => {
      const lat = r["decimalLatitude.y"];
      const lon = r["decimalLongitude.y"];

      if (!lat || !lon) return;

      const marker = L.circleMarker([lat, lon], {
        radius: 5,
        color: "#1a9850",
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
