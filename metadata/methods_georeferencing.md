# Georeferencing methods – Scarabaeoidea PNALM

This document describes how locality descriptions were interpreted and georeferenced
for Scarabaeoidea records in the Abruzzo, Lazio and Molise National Park (PNALM).

The following Darwin Core fields are used for georeferencing:

- `verbatimLocality`, `verbatimLatitude`, `verbatimLongitude`, `verbatimElevation`
- interpreted locality fields (`locality`, `country`, `stateProvince`, `county`, `municipality`)
- coordinate fields (`decimalLatitude`, `decimalLongitude`)
- uncertainty and footprint fields (`coordinateUncertaintyInMeters`, `footprintWKT`)
- provenance fields (`georeferencedBy`, `georeferencedDate`, `georeferenceRemarks`, `georeferenceSources`)
- polygon linkage (`polygon_fid` matching polygons stored in `data/geom.gpkg`)

Detailed rules for:
- using OSM / Nominatim and other maps to digitize polygons;
- computing centroids and coordinate uncertainty from polygons;
- handling incomplete or ambiguous locality descriptions;

will be added in the next phases of the project.
