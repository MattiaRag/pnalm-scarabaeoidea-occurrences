# ============================================================
# GBIF update script
# Scarabeoidea (family-level)
# PNALM core + contiguous areas
# FINAL DEFINITIVE VERSION
# ============================================================

suppressPackageStartupMessages({
  library(rgbif)
  library(sf)
  library(dplyr)
})

# =========================
# SETTINGS
# =========================
setwd("C:/Users/Acer/Downloads/QGIS_data_pnalmscara")

output_dir <- "data_update/gbif"
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

Sys.setenv(
  GBIF_USER  = "...",
  GBIF_PWD   = "...",
  GBIF_EMAIL = "..."
)

# Shapefiles
core_shp <- "Confine_PNALM.shp"
cont_shp <- "Area_Contigua_PNALM.shp"

# Regions covering PNALM (broad filter)
regions <- c("Abruzzo", "Lazio", "Molise")

# =========================
# 1) LOAD PARK SHAPEFILES
# =========================
core <- st_read(core_shp, quiet = TRUE)
cont <- st_read(cont_shp, quiet = TRUE)

# Assign CRS if missing (WGS84)
if (is.na(st_crs(core))) st_crs(core) <- 4326
if (is.na(st_crs(cont))) st_crs(cont) <- 4326

# Dissolve geometries
core <- st_union(core)
cont <- st_union(cont)

# Make sure CRS objects are identical
st_crs(cont) <- st_crs(core)

# =========================
# 2) TOTAL PNALM AREA
# =========================
pnalm_total <- st_union(core, cont)

# =========================
# 3) SCARABEOIDEA FAMILIES
# =========================
scarab_families <- c(
  "Scarabaeidae",
  "Lucanidae",
  "Geotrupidae",
  "Trogidae",
  "Hybosoridae",
  "Passalidae",
  "Bolboceratidae",
  "Ochodaeidae",
  "Pleocomidae",
  "Glaresidae"
)

# =========================
# 4) GET GBIF TAXON KEYS
# =========================
family_keys <- sapply(scarab_families, function(fam) {
  res <- name_backbone(name = fam, rank = "family")
  if (is.null(res$usageKey)) NA else res$usageKey
})

if (any(is.na(family_keys))) {
  stop("One or more Scarabeoidea families have no GBIF taxonKey")
}

cat("GBIF taxonKeys used:\n")
print(data.frame(family = scarab_families, key = family_keys))

# =========================
# 5) REQUEST GBIF DOWNLOAD
# =========================
gbif_req <- occ_download(
  pred_in("taxonKey", family_keys),
  pred_in("stateProvince", regions),
  pred("hasCoordinate", TRUE),
  pred_not(pred("institutionCode", "iNaturalist"))
)

cat("GBIF download requested. UUID:", gbif_req[[1]], "\n")

# =========================
# 6) WAIT UNTIL READY
# =========================
still_running <- TRUE
while (still_running) {
  meta <- occ_download_meta(gbif_req)
  status <- meta$status
  cat("Status:", status, "\n")
  still_running <- status %in% c("PREPARING", "RUNNING")
  Sys.sleep(10)
}

# =========================
# 7) DOWNLOAD AND IMPORT
# =========================
d <- occ_download_get(gbif_req[[1]])
gbif_raw <- occ_download_import(d)
unlink(d)

cat("GBIF records downloaded:", nrow(gbif_raw), "\n")

# =========================
# 8) BASIC CLEANING
# =========================
gbif_raw <- gbif_raw |>
  filter(
    !is.na(decimalLatitude),
    !is.na(decimalLongitude)
  )

# Convert to sf points (WGS84)
gbif_sf <- st_as_sf(
  gbif_raw,
  coords = c("decimalLongitude", "decimalLatitude"),
  crs = 4326,
  remove = FALSE
)

# Force EXACT same CRS object
st_crs(gbif_sf) <- st_crs(core)

# =========================
# 9) FILTER TO PNALM ONLY
# =========================
inside_pnalm <- st_intersects(gbif_sf, pnalm_total, sparse = FALSE)
gbif_sf <- gbif_sf[inside_pnalm, ]

cat("Records inside PNALM:", nrow(gbif_sf), "\n")

# =========================
# 10) CLASSIFY PARK ZONE
# =========================
gbif_sf$parkZone <- NA_character_

in_core <- st_intersects(gbif_sf, core, sparse = FALSE)
gbif_sf$parkZone[in_core] <- "core"

in_cont <- st_intersects(gbif_sf, cont, sparse = FALSE)
gbif_sf$parkZone[is.na(gbif_sf$parkZone) & in_cont] <- "contiguous"

cat("parkZone summary:\n")
print(table(gbif_sf$parkZone))

# =========================
# 11) EXPORT RESULT
# =========================
gbif_out <- st_drop_geometry(gbif_sf)

outfile <- paste0(
  output_dir, "/gbif_scarabeoidea_PNALM_",
  Sys.Date(), ".csv"
)

write.csv(gbif_out, outfile, row.names = FALSE, na = "")

cat("✔ FINAL GBIF FILE WRITTEN:\n", outfile, "\n")
