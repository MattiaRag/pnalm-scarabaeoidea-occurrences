# =========================
# geom_calc_valfondillo_altbands_FINAL_EN.R
# =========================

suppressPackageStartupMessages({
  library(sf)
  library(lwgeom)   # st_minimum_bounding_circle
  library(dplyr)
})

# =========================
# SETTINGS
# =========================
setwd("C:/Users/Acer/Downloads/QGIS_data_pnalmscara")

occ_file   <- "geom_occurances_valfondillo.csv"
poly_gpkg  <- "valfondillo_altbands.gpkg"
poly_layer <- "valfondillo_altbands"
metric_crs <- 32633   # UTM 33N (meters)

# =========================
# 1) LOAD DATA
# =========================
occ <- read.csv(occ_file, stringsAsFactors = FALSE)

polys <- st_read(
  poly_gpkg,
  layer = poly_layer,
  quiet = FALSE
)

stopifnot(nrow(polys) == 5)

polys <- st_transform(polys, 4326)

cat("Occurrences rows:", nrow(occ), "\n")
cat("Polygon rows:", nrow(polys), "\n")

# =========================
# 2) FIX polygon_fid (OPTION B)
# =========================
if (!("polygon_fid" %in% names(occ))) {
  stop("The CSV file does not contain the column 'polygon_fid'")
}

# NA polygon_fid -> 1 (explicit methodological choice)
occ$polygon_fid[is.na(occ$polygon_fid)] <- 1

# Force consistent type
occ$polygon_fid   <- as.integer(occ$polygon_fid)
polys$polygon_fid <- as.integer(polys$polygon_fid)

# Final consistency check
missing_ids <- setdiff(unique(occ$polygon_fid), unique(polys$polygon_fid))
stopifnot(length(missing_ids) == 0)

cat("polygon_fid check passed\n")
print(table(occ$polygon_fid))

# =========================
# 3) CENTROID + UNCERTAINTY CALCULATION (METERS)
# =========================
polys$decimalLongitude <- NA_real_
polys$decimalLatitude  <- NA_real_
polys$coordinateUncertaintyInMeters <- NA_integer_
polys$footprintWKT <- st_astext(st_geometry(polys), 10)

polys_m <- st_transform(polys, metric_crs)

for (i in seq_len(nrow(polys_m))) {

  cat(sprintf("Processing polygon %d / %d\n", i, nrow(polys_m)))

  p <- polys_m[i, ]

  # Minimum bounding circle
  circ <- st_minimum_bounding_circle(p)
  center_m <- st_centroid(circ)

  # If centroid falls outside, project to nearest boundary
  if (length(st_intersects(center_m, p)[[1]]) == 0) {
    center_m <- st_endpoint(st_nearest_points(center_m, p))
  }

  # Maximum distance from center to polygon boundary
  p_dense <- st_segmentize(p, dfMaxLength = 50)
  p_pts <- st_cast(st_cast(p_dense, "MULTILINESTRING"), "POINT")
  dist_m <- max(as.numeric(st_distance(center_m, p_pts)), na.rm = TRUE)

  center_ll <- st_transform(center_m, 4326)
  coords <- st_coordinates(center_ll)

  polys$decimalLongitude[i] <- coords[1]
  polys$decimalLatitude[i]  <- coords[2]
  polys$coordinateUncertaintyInMeters[i] <- as.integer(dist_m)
}

# =========================
# 4) POLYGON TABLE (NO GEOMETRY)
# =========================
poly_out_df <- polys %>%
  st_drop_geometry() %>%
  select(
    polygon_fid,
    decimalLongitude,
    decimalLatitude,
    coordinateUncertaintyInMeters,
    footprintWKT
  )

# =========================
# 5) JOIN WITH OCCURRENCES
# =========================
final <- occ %>%
  left_join(poly_out_df, by = "polygon_fid")

# =========================
# 6) FINAL REPORT
# =========================
cat("Final rows:", nrow(final), "\n")
cat(
  "Missing coordinates:",
  sum(is.na(final$decimalLatitude)),
  "out of", nrow(final), "\n"
)

# =========================
# 7) WRITE OUTPUT
# =========================
write.csv(
  final,
  "geom_occurances_valfondillo_georeferenced.csv",
  row.names = FALSE,
  na = ""
)

cat("✔ Output written: geom_occurances_valfondillo_georeferenced.csv\n")
