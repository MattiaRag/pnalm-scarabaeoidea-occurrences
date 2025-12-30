suppressPackageStartupMessages({
  library(rinat)
  library(sf)
  library(dplyr)
})

# =========================
# SETTINGS
# =========================
setwd("C:/Users/Acer/Downloads/QGIS_data_pnalmscara")

output_dir <- "data_update/inat"
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

core_shp <- "Confine_PNALM.shp"
cont_shp <- "Area_Contigua_PNALM.shp"

# iNaturalist taxon_id per Scarabaeoidea
SCARAB_TAXON_ID <- 48202

# =========================
# 1) LOAD SHAPEFILES
# =========================
core <- st_read(core_shp, quiet = TRUE)
cont <- st_read(cont_shp, quiet = TRUE)

if (is.na(st_crs(core)) || is.na(st_crs(cont))) {
  stop("CRS mancante in uno shapefile. Imposta il CRS corretto prima di st_transform().")
}

# =========================
# 2) REPROJECT TO WGS84
# =========================
core_wgs <- st_transform(core, 4326)
cont_wgs <- st_transform(cont, 4326)

core_u <- st_union(core_wgs)
cont_u <- st_union(cont_wgs)
pnalm_total <- st_union(core_u, cont_u)

# =========================
# 3) BBOX per iNat (swlat, swlng, nelat, nelng)
# =========================
bb <- st_bbox(pnalm_total)

bounds_vec <- as.numeric(c(
  bb[["ymin"]],  # south latitude
  bb[["xmin"]],  # west longitude
  bb[["ymax"]],  # north latitude
  bb[["xmax"]]   # east longitude
))

stopifnot(
  length(bounds_vec) == 4,
  bounds_vec[1] < bounds_vec[3],
  bounds_vec[2] < bounds_vec[4]
)

cat("BBOX iNat:", bounds_vec, "\n")

# =========================
# 4) DOWNLOAD iNAT — SOLO SCARABAEOIDEA
# =========================
inat_raw <- get_inat_obs(
  taxon_id   = SCARAB_TAXON_ID,
  quality    = "research",
  bounds     = bounds_vec,
  maxresults = 10000
)

cat("Raw Scarabaeoidea records:", nrow(inat_raw), "\n")

if (nrow(inat_raw) == 0) {
  stop("Nessun record Scarabaeoidea trovato nell'area.")
}

# =========================
# 5) BASIC CLEANING
# =========================
inat_raw <- inat_raw |>
  filter(
    !is.na(latitude),
    !is.na(longitude)
  )

if ("license" %in% names(inat_raw)) {
  inat_raw <- inat_raw |>
    filter(license %in% c("CC-BY", "CC-BY-NC", "CC0"))
}

# =========================
# 6) SPATIAL FILTER (PNALM)
# =========================
inat_sf <- st_as_sf(
  inat_raw,
  coords = c("longitude", "latitude"),
  crs = 4326,
  remove = FALSE
)

inside <- st_intersects(inat_sf, pnalm_total, sparse = FALSE)
inat_sf <- inat_sf[inside, , drop = FALSE]

cat("Records inside PNALM:", nrow(inat_sf), "\n")

# =========================
# 7) CLASSIFY PARK ZONE
# =========================
inat_sf$parkZone <- NA_character_

inat_sf$parkZone[
  st_intersects(inat_sf, core_u, sparse = FALSE)
] <- "core"

inat_sf$parkZone[
  is.na(inat_sf$parkZone) &
    st_intersects(inat_sf, cont_u, sparse = FALSE)
] <- "contiguous"

cat("parkZone summary:\n")
print(table(inat_sf$parkZone, useNA = "ifany"))

# =========================
# 8) EXPORT CSV (Darwin Core–like)
# =========================
inat_out <- st_drop_geometry(inat_sf)

rename_map <- c(
  latitude = "decimalLatitude",
  longitude = "decimalLongitude",
  scientific_name = "scientificName",
  observed_on = "eventDate",
  user_name = "recordedBy",
  positional_accuracy = "coordinateUncertaintyInMeters",
  url = "associatedReferences",
  id = "inatID"
)

for (old in names(rename_map)) {
  if (old %in% names(inat_out)) {
    names(inat_out)[names(inat_out) == old] <- rename_map[[old]]
  }
}

outfile <- file.path(
  output_dir,
  paste0("inat_Scarabaeoidea_PNALM_", Sys.Date(), ".csv")
)

write.csv(inat_out, outfile, row.names = FALSE, na = "")

cat("✔ FILE FINALE SCRITTO:\n", outfile, "\n")
