import type { Map as MapboxMap, GeoJSONSource } from "mapbox-gl";
import type { GeoJSON } from "geojson";
import { pointToTile, tileToPoint } from "./geometry";

/**
 * Manages tile boundary overlay layers on a Mapbox map
 */
export class TilemapManager {
  public allowed: number[] = $state([2, 4, 6, 8, 10]);
  public enabled: number[] = $state([]);
  public active: number[] = $state([]);

  private map: MapboxMap;

  constructor(map: MapboxMap) {
    this.map = map;
    this.map.on("moveend", () => this.updateTilemaps());
    this.map.on("zoomend", () => this.updateTilemaps());
  }

  /**
   * Toggles a tile boundary layer for a specific zoom level
   */
  toggleTileMap = (z: number): void => {
    const index = this.enabled.indexOf(z);
    if (index === -1) {
      this.enabled.push(z);
    } else {
      this.enabled.splice(index, 1);
    }

    this.updateTilemaps();
  };

  updateTilemaps(): void {
    for (const z of this.allowed) {
      this.updateTilemap(z, this.enabled.includes(z));
    }
  }

  private updateTilemap(z: number, enabled: boolean): void {
    const baseName = `tile-z${z}`;

    console.log(`Updating tilemap: ${baseName}, enabled: ${enabled}`);

    if (!enabled) {
      this.removeTilemap(baseName);
      return;
    } else {
      this.addTilemap(baseName, 1.2 - z / 10);
    }

    const boundaryActive = this.map.getZoom() > z - 6;
    const labelActive = this.map.getZoom() > z - 2;

    this.map.setLayoutProperty(
      `${baseName}-boundary`,
      "visibility",
      boundaryActive ? "visible" : "none",
    );
    this.map.setLayoutProperty(
      `${baseName}-labels`,
      "visibility",
      labelActive ? "visible" : "none",
    );

    if (boundaryActive || labelActive) {
      if (!this.active.includes(z)) {
        this.active.push(z);
      }
      this.updateTilemapData(baseName, z);
    } else {
      const index = this.active.indexOf(z);
      if (index !== -1) {
        this.active.splice(index, 1);
      }
    }
  }

  private addTilemap(name: string, opacity: number): void {
    if (!this.map.getSource(`${name}-boundary`)) {
      this.map.addSource(`${name}-boundary`, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        generateId: true,
      });
    }
    if (!this.map.getSource(`${name}-labels`)) {
      this.map.addSource(`${name}-labels`, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        generateId: true,
      });
    }
    if (!this.map.getLayer(`${name}-boundary`)) {
      this.map.addLayer({
        id: `${name}-boundary`,
        type: "line",
        source: `${name}-boundary`,
        paint: {
          "line-color": "#000000",
          "line-width": 1,
          "line-opacity": opacity,
        },
      });
    }
    if (!this.map.getLayer(`${name}-labels`)) {
      this.map.addLayer({
        id: `${name}-labels`,
        type: "symbol",
        source: `${name}-labels`,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 14,
          "text-anchor": "center",
        },
      });
    }
  }

  private removeTilemap(name: string): void {
    if (this.map.getLayer(`${name}-labels`)) {
      this.map.removeLayer(`${name}-labels`);
    }
    if (this.map.getLayer(`${name}-boundary`)) {
      this.map.removeLayer(`${name}-boundary`);
    }
    if (this.map.getSource(`${name}-labels`)) {
      this.map.removeSource(`${name}-labels`);
    }
    if (this.map.getSource(`${name}-boundary`)) {
      this.map.removeSource(`${name}-boundary`);
    }
  }

  private updateTilemapData(name: string, z: number): void {
    const bounds = this.map.getBounds();
    const nw = bounds.getNorthWest();
    const se = bounds.getSouthEast();

    // Calculate tile coordinates for the viewport
    let [minx, miny] = pointToTile(nw.toArray(), z);
    let [maxx, maxy] = pointToTile(se.toArray(), z);

    [minx, miny] = [Math.max(0, minx - 2), Math.max(0, miny - 2)];
    [maxx, maxy] = [Math.min(1 << z, maxx + 2), Math.min(1 << z, maxy + 2)];

    const features = [];
    const centroids = [];

    for (let x = minx; x <= maxx; x++) {
      for (let y = miny; y <= maxy; y++) {
        const [west, north] = tileToPoint([x, y], z);
        const [east, south] = tileToPoint([x + 1, y + 1], z);

        features.push({
          type: "Feature",
          properties: { x, y, z },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [west, north],
                [east, north],
                [east, south],
                [west, south],
                [west, north],
              ],
            ],
          },
        });

        centroids.push({
          type: "Feature",
          properties: { x, y, z, name: `${x}, ${y}` },
          geometry: {
            type: "Point",
            coordinates: [(west + east) / 2, (north + south) / 2],
          },
        });
      }
    }

    (this.map.getSource(`${name}-boundary`) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features,
    } as GeoJSON);
    (this.map.getSource(`${name}-labels`) as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: centroids,
    } as GeoJSON);
  }
}
