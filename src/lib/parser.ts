import type { Feature, GeoJSON } from "geojson";
import polyline from "@mapbox/polyline";

function isWithinPolylineRange(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 63 || charCode > 126) {
      return false;
    }
  }

  return true;
}

function tryParseCSV(input: string): GeoJSON | null {
  try {
    const lines = input.trim().split("\n");
    const features: Feature[] = [];

    for (const line of lines) {
      const parts = line.trim().split(",");
      if (parts.length !== 2) continue;

      const a = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);

      if (isNaN(a) || isNaN(b)) continue;

      // Check if lon,lat or lat,lon based on valid ranges
      // lon: -180 to 180, lat: -90 to 90
      if (Math.abs(a) <= 180 && Math.abs(b) <= 90) {
        features.push({
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [a, b],
          },
        });
      } else if (Math.abs(b) <= 180 && Math.abs(a) <= 90) {
        features.push({
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [b, a],
          },
        });
      }
    }

    if (features.length > 0) {
      return {
        type: "FeatureCollection",
        features: features,
      } as GeoJSON;
    }
  } catch (_) {
    // Fall through to return null
  }

  return null;
}

export function tryConvertGeoJSON(input: string): GeoJSON | null {
  if (input.startsWith("{") && input.endsWith("}")) {
    try {
      return JSON.parse(input) as GeoJSON;
    } catch (_) {
      return null;
    }
  } else if (isWithinPolylineRange(input)) {
    return polyline.toGeoJSON(input) as GeoJSON;
  } else {
    return tryParseCSV(input);
  }
}
