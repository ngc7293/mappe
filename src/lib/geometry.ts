import type { Feature, GeoJSON, Position } from "geojson";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getBounds(
  root: GeoJSON,
): [[number, number], [number, number]] | null {
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

export function pointToTile(
  point: [number, number],
  zoom: number,
): [number, number] {
  const [lon, lat] = point;
  const scale = 256 / (1 << zoom);

  const siny = Math.min(
    Math.max(Math.sin(lat * (Math.PI / 180)), -0.9999),
    0.9999,
  );
  const x = 128 + lon * (256 / 360);
  const y =
    128 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(256 / (2 * Math.PI));

  return [Math.floor(x / scale + 0.0001), Math.floor(y / scale + 0.0001)];
}

export function tileToPoint(
  tile: [number, number],
  zoom: number,
): [number, number] {
  const [x, y] = tile;
  const scale = 256 / (1 << zoom);
  const [xf, yf] = [x * scale, y * scale];

  const lon = (xf - 128) / (256 / 360);
  const lat =
    (2 * Math.atan(Math.exp((yf - 128) / -(256 / (2 * Math.PI)))) -
      Math.PI / 2) /
    (Math.PI / 180);

  return [lon, clamp(lat, -85.0511287798066, 85.0511287798066)];
}
