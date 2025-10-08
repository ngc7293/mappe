import { Map, MapMouseEvent } from "mapbox-gl";

export interface MapConfig {
  container: HTMLDivElement;
  accessToken: string;
  style: string;
  center: [number, number];
  zoom: number;
}

/**
 * Creates and initializes a Mapbox GL map instance with default configurations
 */
export function createMap(config: MapConfig): Map {
  const map = new Map({
    container: config.container,
    accessToken: config.accessToken,
    style: config.style,
    projection: "globe",
    center: config.center,
    zoom: config.zoom,
  });

  // Disable box zoom by default
  map.boxZoom.disable();

  // Set up click handler for copying coordinates
  map.on("click", (e: MapMouseEvent) => {
    if (
      e.originalEvent.ctrlKey ||
      (e.originalEvent.metaKey && navigator.platform.includes("Mac"))
    ) {
      if (e.originalEvent.shiftKey) {
        navigator.clipboard.writeText(
          `${e.lngLat.lat.toFixed(6)},${e.lngLat.lng.toFixed(6)}`,
        );
      } else {
        navigator.clipboard.writeText(
          `${e.lngLat.lng.toFixed(6)},${e.lngLat.lat.toFixed(6)}`,
        );
      }
    }
  });

  return map;
}

/**
 * Configures map atmosphere and fog effects
 */
export function setupMapAtmosphere(map: Map): void {
  map.setFog({
    color: "rgb(186, 210, 235)", // Lower atmosphere
    "high-color": "rgb(36, 92, 223)", // Upper atmosphere
    "horizon-blend": 0.02, // Atmosphere thickness (default 0.2 at low zooms)
    "space-color": "rgb(11, 11, 25)", // Background color
    "star-intensity": 0.6, // Background star brightness (default 0.35 at low zoooms )
  });
}
