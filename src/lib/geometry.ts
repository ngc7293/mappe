import type { Feature, GeoJSON, Position } from "geojson";

export function getBounds(root: GeoJSON): [Position, Position] | null {
  const coords: Position[] = [];

  function extractCoords(geom: GeoJSON) {
    switch (geom.type) {
      case "Point":
        coords.push(geom.coordinates);
        break;
      case "LineString":
      case "MultiPoint":
        coords.push(...geom.coordinates);
        break;
      case "Polygon":
      case "MultiLineString":
        geom.coordinates.forEach((c: Position[]) => coords.push(...c));
        break;
      case "MultiPolygon":
        geom.coordinates.forEach((poly: Position[][]) =>
          poly.forEach((c: Position[]) => coords.push(...c)),
        );
        break;
      case "GeometryCollection":
        geom.geometries.forEach(extractCoords);
        break;
    }
  }

  switch (root.type) {
    case "FeatureCollection":
      root.features.forEach((f: Feature) => extractCoords(f.geometry));
      break;
    case "Feature":
      extractCoords(root.geometry);
      break;
    default:
      extractCoords(root);
  }

  if (coords.length === 0) return null;

  return [
    [
      Math.min(...coords.map((c) => c[0])),
      Math.min(...coords.map((c) => c[1])),
    ],
    [
      Math.max(...coords.map((c) => c[0])),
      Math.max(...coords.map((c) => c[1])),
    ],
  ];
}
