import type { GeoJSON } from "geojson";
import type { Map } from "mapbox-gl";
import type { LayerData } from "./types";
import { getBounds } from "./geometry";

/**
 * Manages GeoJSON layers on a Mapbox map
 */
export class LayerManager {
  public layers: LayerData[] = $state([]);
  private counter: number = $state(1);

  private map: Map;
  private colors: string[] = ["#f0a01c", "#66cf2d", "#4b5ae3", "#e06577"];

  constructor(map: Map) {
    this.map = map;
  }

  /**
   * Creates or updates a layer with the given name and data
   */
  createLayer = (name: string, data: GeoJSON): LayerData => {
    const index = this.layers.findIndex((layer) => layer.name === name);

    if (index !== -1) {
      this.removeLayer(name);
    }

    const layer: LayerData = {
      name,
      data,
      color: this.colors[this.counter % this.colors.length],
      visible: true,
    };

    this.layers.push(layer);
    this.counter += 1;

    this.addLayerToMap(layer);

    return layer;
  };

  /**
   * Adds a layer to the map with appropriate styling
   */
  private addLayerToMap(layer: LayerData): void {
    const { name, data, color, visible } = layer;

    this.map.addSource(name, {
      type: "geojson",
      data,
    });

    // Add point layer
    this.map.addLayer({
      id: `${name}-point`,
      type: "circle",
      source: name,
      slot: "content",
      filter: ["any", ["==", "$type", "Point"]],
      layout: {
        visibility: visible ? "visible" : "none",
      },
      paint: {
        "circle-color": color,
        "circle-radius": 4,
      },
    });

    // Add line layer
    this.map.addLayer({
      id: `${name}-line`,
      type: "line",
      source: name,
      slot: "content",
      filter: [
        "any",
        ["==", "$type", "LineString"],
        ["==", "$type", "Polygon"],
      ],
      layout: {
        visibility: "visible",
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": color,
        "line-width": 4,
      },
    });

    // Add fill layer
    this.map.addLayer({
      id: `${name}-fill`,
      type: "fill",
      source: name,
      slot: "content",
      filter: ["any", ["==", "$type", "Polygon"]],
      layout: {},
      paint: {
        "fill-color": color,
        "fill-opacity": 0.33,
      },
    });
  }

  /**
   * Centers the map on a specific layer
   */
  centerLayer = (name: string): void => {
    const layer = this.layers.find((layer) => layer.name === name);
    if (layer) {
      this.map.fitBounds(getBounds(layer.data), { padding: 40 });
    }
  };

  /**
   * Sets the color of a layer
   */
  setLayerColor = (name: string, color: string): void => {
    const layer = this.layers.find((layer) => layer.name === name);

    if (layer) {
      layer.color = color;
      this.map.setPaintProperty(`${name}-point`, "circle-color", color);
      this.map.setPaintProperty(`${name}-line`, "line-color", color);
      this.map.setPaintProperty(`${name}-fill`, "fill-color", color);
    }
  };

  /**
   * Sets the visibility of a layer
   */
  setLayerVisibility = (name: string, visibility: boolean): void => {
    const layer = this.layers.find((layer) => layer.name === name);

    if (layer) {
      layer.visible = visibility;
      this.map.setLayoutProperty(
        `${name}-point`,
        "visibility",
        visibility ? "visible" : "none",
      );
      this.map.setLayoutProperty(
        `${name}-line`,
        "visibility",
        visibility ? "visible" : "none",
      );
      this.map.setLayoutProperty(
        `${name}-fill`,
        "visibility",
        visibility ? "visible" : "none",
      );
    }
  };

  /**
   * Removes a layer from the map
   */
  removeLayer = (name: string): void => {
    const index = this.layers.findIndex((layer) => layer.name === name);

    if (index !== -1) {
      if (this.map.getLayer(`${name}-fill`)) {
        this.map.removeLayer(`${name}-fill`);
      }
      if (this.map.getLayer(`${name}-line`)) {
        this.map.removeLayer(`${name}-line`);
      }
      if (this.map.getLayer(`${name}-point`)) {
        this.map.removeLayer(`${name}-point`);
      }
      if (this.map.getSource(name)) {
        this.map.removeSource(name);
      }

      this.layers.splice(index, 1);
    }
  };

  /**
   * Restores all layers to the map (useful after style changes)
   */
  restoreLayers = (): void => {
    for (const layer of this.layers) {
      this.addLayerToMap(layer);
    }
  };

  /**
   * Gets the current counter value (useful for default layer naming)
   */
  getCounter = (): number => {
    return this.counter;
  };
}
