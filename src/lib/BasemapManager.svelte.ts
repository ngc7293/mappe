import type { Map } from "mapbox-gl";
import { BasemapType } from "./enum";

/**
 * Manages basemap switching on a Mapbox map
 */
export class BasemapManager {
  currentBasemap: BasemapType = $state(BasemapType.MapboxStreets);

  private map: Map;
  private underlyingStyle: BasemapType;

  constructor(
    map: Map,
    initialBasemap: BasemapType = BasemapType.MapboxStreets,
  ) {
    this.map = map;
    this.currentBasemap = initialBasemap;
    this.underlyingStyle = initialBasemap;
  }

  /**
   * Initializes the OpenStreetMap overlay layer
   * Should be called on map style load
   */
  initializeOSMLayer = (): void => {
    if (!this.map.getLayer("basemap-osm")) {
      this.map.addLayer({
        id: "basemap-osm",
        type: "raster",
        source: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
        },
        layout: {
          visibility:
            this.currentBasemap === BasemapType.OpenStreetMap
              ? "visible"
              : "none",
        },
        paint: {
          "raster-fade-duration": 0,
        },
      });
    }
  };
  /**
   * Sets the basemap to a new value
   */
  setBasemap = (value: BasemapType): void => {
    if (this.currentBasemap === value) return;

    this.currentBasemap = value;

    switch (this.currentBasemap) {
      case BasemapType.OpenStreetMap:
        this.map.setLayoutProperty("basemap-osm", "visibility", "visible");
        break;
      case BasemapType.MapboxStreets:
        this.map.setLayoutProperty("basemap-osm", "visibility", "none");
        if (this.underlyingStyle !== BasemapType.MapboxStreets) {
          this.map.setStyle("mapbox://styles/mapbox/streets-v12");
          this.underlyingStyle = BasemapType.MapboxStreets;
        }
        break;
      case BasemapType.MapboxSatellite:
        this.map.setLayoutProperty("basemap-osm", "visibility", "none");
        if (this.underlyingStyle !== BasemapType.MapboxSatellite) {
          this.map.setStyle("mapbox://styles/mapbox/satellite-v9");
          this.underlyingStyle = BasemapType.MapboxSatellite;
        }
        break;
    }
  };
}
