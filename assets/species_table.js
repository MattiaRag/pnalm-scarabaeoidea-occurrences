const CSV_URL = "../data/geom_occurances_valfondillo_georeferenced.csv";

function loadSpeciesTable(speciesName) {

  fetch(CSV_URL)
    .then(r => r.text())
    .then(text => {
      const results = Papa.parse(text, {
        header: true,
        skipEmptyLines: true
      });

      const rows = results.data.filter(
        r => r.scientificName === speciesName
      );

      if (rows.length === 0) {
        document.getElementById("occurrence-table").innerHTML =
          "<p>No occurrence records available.</p>";
        return;
      }

      const columns = [
        "year",
        "decimalLatitude.y",
        "decimalLongitude.y",
        "locality",
        "basisOfRecord"
      ];

      let html = "<table border='1' cellpadding='4' cellspacing='0'>";
      html += "<thead><tr>";

      columns.forEach(c => {
        html += `<th>${c}</th>`;
      });

      html += "</tr></thead><tbody>";

      rows.forEach(r => {
        html += "<tr>";
        columns.forEach(c => {
          html += `<td>${r[c] || ""}</td>`;
        });
        html += "</tr>";
      });

      html += "</tbody></table>";

      document.getElementById("occurrence-table").innerHTML = html;
    });
}
