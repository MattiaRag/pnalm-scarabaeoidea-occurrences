# Data dictionary – PNALM insect occurrence datasets

This document describes the columns used in `data/occurrences.csv`.
Most fields follow Darwin Core (DwC) terminology.
The column **Level** indicates whether a field is considered:

- **core** – expected for (almost) every record;
- **recommended** – strongly recommended when information is available;
- **optional** – useful but not strictly required.

| Column name                    | Darwin Core term                 | Level        | Type    | Description                                                  | Example                                      |
|--------------------------------|----------------------------------|-------------|---------|--------------------------------------------------------------|----------------------------------------------|
| occurrenceID                   | occurrenceID                     | core        | string  | Unique identifier for each occurrence record                 | `pnalm_scarab_000001`                        |
| scientificName                 | scientificName                   | core        | string  | Full scientific name including authorship if known           | `Geotrupes stercorarius (Linnaeus, 1758)`    |
| scientificNameAuthorship       | scientificNameAuthorship         | recommended | string  | Authorship of the scientific name                            | `Linnaeus, 1758`                             |
| taxonRank                      | taxonRank                        | core        | string  | The taxonomic rank of the most specific name                 | `species`                                    |
| identificationQualifier        | identificationQualifier          | optional    | string  | Qualifier for identification certainty                       | `cf.`, `aff.`                                |
| originalNameUsage              | originalNameUsage                | optional    | string  | Original name as used in the source                          | `Geotrupes stercorarius var. xxx`           |
| nomenclaturalStatus            | nomenclaturalStatus              | optional    | string  | Nomenclatural status                                         | `valid`, `synonym`, `nomen dubium`          |
| superfamily                    | superfamily                      | core        | string  | Superfamily                                                  | `Scarabaeoidea`                              |
| order                          | order                            | core        | string  | Order                                                        | `Coleoptera`, `Orthoptera`                   |
| family                         | family                           | core        | string  | Family                                                       | `Scarabaeidae`                               |
| subfamily                      | subfamily                        | recommended | string  | Subfamily (if applicable)                                    | `Scarabaeinae`                               |
| genus                          | genus                            | core        | string  | Genus                                                        | `Geotrupes`                                  |
| specificEpithet                | specificEpithet                  | core        | string  | Species epithet                                              | `stercorarius`                               |
| infraspecificEpithet           | infraspecificEpithet             | optional    | string  | Subspecies or other rank below species                       |                                              |
| country                        | country                          | core        | string  | Country name                                                 | `Italy`                                      |
| countryCode                    | countryCode                      | core        | string  | ISO 3166-1-alpha-2 country code                              | `IT`                                         |
| stateProvince                  | stateProvince                    | core        | string  | First administrative division                                | `Abruzzo`                                    |
| county                         | county                           | recommended | string  | Second administrative division (province)                    | `L'Aquila`                                   |
| municipality                   | municipality                     | recommended | string  | Municipality                                                 | `Pescasseroli`                               |
| locality                       | locality                         | core        | string  | Interpreted locality description                             | `Val Fondillo, PNALM`                        |
| verbatimLocality               | verbatimLocality                 | recommended | string  | Locality exactly as on labels / in literature                | `Val Fondillo (Parco Nazionale)`             |
| verbatimElevation              | verbatimElevation                | recommended | string  | Elevation as reported in the source                          | `ca. 1300 m`                                 |
| minimumElevationInMeters       | minimumElevationInMeters         | optional    | number  | Minimum elevation (m)                                        | 1280                                         |
| maximumElevationInMeters       | maximumElevationInMeters         | optional    | number  | Maximum elevation (m)                                        | 1350                                         |
| verbatimLatitude               | verbatimLatitude                 | optional    | string  | Latitude exactly as in the source                            | `41°47'03"N`                                 |
| verbatimLongitude              | verbatimLongitude                | optional    | string  | Longitude exactly as in the source                           | `13°51'51"E`                                 |
| decimalLatitude                | decimalLatitude                  | core        | number  | Latitude in decimal degrees (WGS84)                          | 41.7843                                      |
| decimalLongitude               | decimalLongitude                 | core        | number  | Longitude in decimal degrees (WGS84)                         | 13.8642                                      |
| coordinateUncertaintyInMeters  | coordinateUncertaintyInMeters    | core        | number  | Radius of the uncertainty circle around the coordinates (m)  | 500                                          |
| footprintWKT                   | footprintWKT                     | recommended | string  | Polygon representing the occupied area in WKT                | `POLYGON ((...))`                            |
| georeferencedBy                | georeferencedBy                  | recommended | string  | Person(s) who assigned the coordinates                       | `M. Ragazzini`                               |
| georeferencedDate              | georeferencedDate                | recommended | date    | Date of georeferencing (YYYY-MM-DD)                          | `2025-03-15`                                 |
| georeferenceRemarks            | georeferenceRemarks              | recommended | string  | Notes on georeferencing decisions                            | `Polygon from OSM + 100 m buffer`            |
| georeferenceSources            | georeferenceSources              | recommended | string  | Sources used for georeferencing                              | `OSM, OpenTopoMap, PNALM maps`               |
| eventDate                      | eventDate                        | core        | date    | Collection/observation date (ISO 8601)                       | `2024-07-21`                                 |
| year                           | year                             | core        | integer | Year of collection/observation                               | 2024                                         |
| month                          | month                            | recommended | integer | Month                                                        | 7                                            |
| day                            | day                              | recommended | integer | Day                                                          | 21                                           |
| recordedBy                     | recordedBy                       | core        | string  | Collector(s)                                                 | `M. Ragazzini & A. Segatore`                 |
| recordedByID                   | recordedByID                     | optional    | string  | Identifier(s) of collector(s) (e.g. ORCID)                   | `https://orcid.org/0000-0000-0000-0000`      |
| identifiedBy                   | identifiedBy                     | recommended | string  | Identifier(s) who made the identification                    | `M. Ragazzini`                               |
| basisOfRecord                  | basisOfRecord                    | core        | string  | Type of record                                               | `PreservedSpecimen`, `HumanObservation`      |
| organismRemarks                | organismRemarks                  | recommended | string  | Notes on the individual organism / population                |                                              |
| institutionCode                | institutionCode                  | recommended | string  | Code of the institution housing the specimen                 | `MCR`, `UZH`                                 |
| collectionCode                 | collectionCode                   | recommended | string  | Name/code of the collection                                  | `Scarabaeoidea_PNALM`                        |
| catalogNumber                  | catalogNumber                    | recommended | string  | Internal specimen ID                                         | `MCR-SCARAB-1234`                            |
| typeStatus                     | typeStatus                       | optional    | string  | Type status if applicable                                    |                                              |
| samplingProtocol               | samplingProtocol                 | recommended | string  | Collecting method                                            | `pitfall traps with dung bait`               |
| habitat                        | habitat                          | recommended | string  | Brief description of habitat                                 | `montane pasture with scattered shrubs`      |
| associatedReferences           | associatedReferences             | recommended | string  | Bibliographic references associated with the record          | DOI, citation string                         |
| taxonRemarks                   | taxonRemarks                     | optional    | string  | Notes on taxonomy / identification issues                    |                                              |
| source                         | (custom)                         | core        | string  | Origin of the record                                         | `museum`, `field_survey`, `GBIF`, `iNat`     |
| sourceReference                | (custom)                         | recommended | string  | Reference / DOI / URL of source record                       |                                              |
| license                        | license                          | core        | string  | Data license for this record                                 | `CC BY 4.0`, `CC0`, `all rights reserved`    |
| validationStatus               | (custom)                         | recommended | string  | Taxonomic/spatial validation status                          | `verified`, `dubious`, `needs_review`        |
| gbifID                         | (custom, as in Zoraptera)        | recommended | string  | GBIF occurrence ID (if applicable)                           | `3739201836`                                 |
| inatID                         | (custom, as in Zoraptera)        | recommended | string  | iNaturalist observation ID (if applicable)
