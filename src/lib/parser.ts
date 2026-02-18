import type { Feature, GeoJSON } from "geojson";
import polyline from "@mapbox/polyline";
import type { CoordinateOrder } from "./coordinateOrder.svelte";

function isWithinPolylineRange(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode < 63 || charCode > 126) {
      return false;
    }
  }

  return true;
}

function tryParseCSV(input: string, order: CoordinateOrder): GeoJSON | null {
  try {
    const lines = input.trim().split("\n");
    const features: Feature[] = [];

    for (const line of lines) {
      const parts = line.trim().split(",");
      if (parts.length !== 2) continue;

      const a = parseFloat(parts[0]);
      const b = parseFloat(parts[1]);

      if (isNaN(a) || isNaN(b)) continue;

      // Interpret based on user preference
      let lon: number, lat: number;
      if (order === "xy") {
        lon = a;
        lat = b;
      } else {
        lat = a;
        lon = b;
      }

      // Validate ranges: lon: -180 to 180, lat: -90 to 90
      if (Math.abs(lon) <= 180 && Math.abs(lat) <= 90) {
        features.push({
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [lon, lat],
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

export function tryConvertGeoJSON(
  input: string,
  order: CoordinateOrder = "xy",
): GeoJSON | null {
  if (input.startsWith("{") && input.endsWith("}")) {
    try {
      return JSON.parse(input) as GeoJSON;
    } catch (_) {
      return null;
    }
  } else if (isWithinPolylineRange(input)) {
    return polyline.toGeoJSON(input) as GeoJSON;
  } else {
    return tryParseCSV(input, order);
  }
}
