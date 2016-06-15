CREATE TABLE db4geoserver.leaflet_polygon_github
(
  objectid integer NOT NULL,
  name_geofence character varying(250),
  description_geofence character varying(250),
  maxsimptol numeric(38,8),
  minsimptol numeric(38,8),
  shape geometry,
  CONSTRAINT enforce_srid_shape CHECK (st_srid(shape) = 4326)
)
WITH (
  OIDS=FALSE
);

ALTER TABLE db4geoserver.leaflet_polygon_github
  OWNER TO db4geoserver;
GRANT ALL ON TABLE db4geoserver.leaflet_polygon_github TO db4geoserver;
GRANT SELECT ON TABLE db4geoserver.leaflet_polygon_github TO sde;

CREATE INDEX a99_ix1
  ON db4geoserver.leaflet_polygon_github
  USING gist
  (shape);

CREATE UNIQUE INDEX r99_rowid
  ON db4geoserver.leaflet_polygon_github
  USING btree
  (objectid)
  WITH (FILLFACTOR=75);
