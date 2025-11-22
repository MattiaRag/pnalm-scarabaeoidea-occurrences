## Data model

The main table `data/occurrences.csv` follows the Darwin Core standard
(https://dwc.tdwg.org/terms/) for all core biodiversity fields
(e.g. taxonomy, locality, dates, georeferencing, licensing), with a small
set of project-specific custom columns (e.g. `source`, `validationStatus`,
`pnalmpTaxonGroup`) described in `metadata/data_dictionary.md`.

Each record has:
- a stable `occurrenceID`;
- complete taxonomic information down to at least species level (when possible);
- georeferencing fields including `decimalLatitude`, `decimalLongitude`,
  `coordinateUncertaintyInMeters` and `footprintWKT` where available;
- a per-record `license` field indicating the applicable data license.
