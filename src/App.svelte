<script lang="ts">
  import type { GeoJSON } from "geojson";
  import type { LayerData } from "@lib/types";
  import type { MapboxStyle } from "@lib/enum";

  import { onMount } from "svelte";
  import { Map, MapMouseEvent, GeoJSONSource } from "mapbox-gl";

  import LayerInput from "@components/LayerInput.svelte";
  import LayerList from "@components/LayerList.svelte";
  import BasemapInput from "@components/BasemapInput.svelte";
  import { BasemapType } from "@lib/enum";
  import { getBounds, pointToTile, tileToPoint } from "@lib/geometry";
  import TilemapInput from "@components/TilemapInput.svelte";

  let container: HTMLDivElement;
  let map: Map;

  let counter: number = $state(1);
  const colors: string[] = ["#f0a01c", "#66cf2d", "#4b5ae3", "#e06577"];

  let underlyingStyle: MapboxStyle = $state(BasemapType.MapboxStreets);
  let basemap: BasemapType = $state(BasemapType.MapboxStreets);
  let layers: LayerData[] = $state([]);
  let tilemaps: number[] = $state([]);

  onMount(() => {
    map = new Map({
      container: container,
      accessToken:
        "pk.eyJ1IjoiZGF2aWRib3VyZ2F1bHQiLCJhIjoiY21nZnl0MW54MGV4ODJqb3I4anVkeGtyMSJ9.i57iGlt21PspglTyanR9Cw",
      style: "mapbox://styles/mapbox/streets-v11",
      projection: "globe",
      center: [-73.5674, 45.5019], // Montréal
      zoom: 10,
    });

    map.boxZoom.disable();

    map.on("click", (e: MapMouseEvent) => {
      if (e.originalEvent.ctrlKey) {
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

    map.on("style.load", () => {
      map.addLayer({
        id: "basemap-osm",
        type: "raster",
        source: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
        },
        layout: {
          visibility:
            basemap === BasemapType.OpenStreetMap ? "visible" : "none",
        },
        paint: {
          "raster-fade-duration": 0,
        },
      });
      map.setFog({
        color: "rgb(186, 210, 235)", // Lower atmosphere
        "high-color": "rgb(36, 92, 223)", // Upper atmosphere
        "horizon-blend": 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        "space-color": "rgb(11, 11, 25)", // Background color
        "star-intensity": 0.6, // Background star brightness (default 0.35 at low zoooms )
      });

      for (const layer of layers) {
        addLayerToMap(layer);
      }

      for (const z of tilemaps) {
        createTileBoundaryLayer(z, "#000000");
      }
    });

    return () => map.remove();
  });

  function toggleTileMap(z: number) {
    const index = tilemaps.indexOf(z);
    if (index === -1) {
      tilemaps.push(z);
      createTileBoundaryLayer(z, "#000000");
    } else {
      tilemaps.splice(index, 1);
      const layerName = `tile-boundaries-z${z}`;
      if (map.getLayer(`${layerName}-line`)) {
        map.removeLayer(`${layerName}-line`);
      }
      if (map.getLayer(`${layerName}-fill`)) {
        map.removeLayer(`${layerName}-fill`);
      }
      if (map.getLayer(`${layerName}-labels`)) {
        map.removeLayer(`${layerName}-labels`);
      }
      if (map.getSource(layerName)) {
        map.removeSource(layerName);
      }
      if (map.getSource(`${layerName}-labels`)) {
        map.removeSource(`${layerName}-labels`);
      }
    }
  }

  function createLayer(name: string, data: GeoJSON) {
    const index = layers.findIndex((layer) => layer.name === name);

    if (index !== -1) {
      layers.splice(index, 1);
    }

    const layer: LayerData = {
      name,
      data,
      color: colors[counter % colors.length],
      visible: true,
    };

    layers.push(layer);
    counter += 1;

    addLayerToMap(layer);
  }

  function createTileBoundaryLayer(z: number, color: string) {
    const layerName = `tile-boundaries-z${z}`;

    // Remove existing layer if it exists
    if (map.getLayer(`${layerName}-line`)) {
      map.removeLayer(`${layerName}-line`);
    }
    if (map.getSource(layerName)) {
      map.removeSource(layerName);
    }

    const updateTileBoundaries = () => {
      const zoom = map.getZoom();
      if (zoom < z - 2) {
        if (map.getLayer(`${layerName}-labels`)) {
          map.setLayoutProperty(`${layerName}-labels`, "visibility", "none");
        }
      } else {
        if (map.getLayer(`${layerName}-labels`)) {
          map.setLayoutProperty(`${layerName}-labels`, "visibility", "visible");
        }
      }

      if (zoom < z - 6) {
        (map.getSource(layerName) as GeoJSONSource).setData({
          type: "FeatureCollection",
          features: [],
        });
        return;
      }

      const bounds = map.getBounds();
      const nw = bounds.getNorthWest();
      const se = bounds.getSouthEast();

      // Calculate tile coordinates for the viewport
      const [minx, miny] = pointToTile(nw.toArray(), z);
      const [maxx, maxy] = pointToTile(se.toArray(), z);

      const features = [];
      const centroids = [];

      for (let x = minx; x <= maxx + 1; x++) {
        for (let y = miny; y <= maxy + 1; y++) {
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

      const geojson: GeoJSON = {
        type: "FeatureCollection",
        features,
      };

      if (map.getSource(layerName) && map.getSource(`${layerName}-labels`)) {
        (map.getSource(layerName) as GeoJSONSource).setData(geojson);
        (map.getSource(`${layerName}-labels`) as GeoJSONSource).setData({
          type: "FeatureCollection",
          features: centroids,
        });

        if (map.getLayer(`${layerName}-line`)) {
          map.setLayoutProperty(`${layerName}-line`, "visibility", "visible");
        }
      } else {
        map.addSource(layerName, {
          type: "geojson",
          data: geojson,
          generateId: true,
        });
        map.addSource(`${layerName}-labels`, {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: centroids,
          },
          generateId: true,
        });
        map.addLayer({
          id: `${layerName}-line`,
          type: "line",
          source: layerName,
          slot: "content",
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-opacity": 1.2 - z / 10,
            "line-color": color,
            "line-width": 2,
          },
        });
        map.addLayer({
          id: `${layerName}-fill`,
          type: "fill",
          source: layerName,
          slot: "content",
          layout: {
            visibility: "visible",
          },
          paint: {
            "fill-opacity": 0,
          },
        });
        map.addLayer({
          id: `${layerName}-labels`,
          type: "symbol",
          source: `${layerName}-labels`,
          layout: {
            "text-field": ["get", "name"], // Get text from the 'name' property
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 14,
            "text-anchor": "center", // Center the text over the point
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#000000",
            "text-halo-width": 1,
          },
        });
      }
    };

    updateTileBoundaries();
    map.on("moveend", updateTileBoundaries);
    map.on("zoomend", updateTileBoundaries);
  }

  function addLayerToMap(layer: LayerData) {
    const { name, data, color, visible } = layer;

    map.addSource(name, {
      type: "geojson",
      data,
    });
    map.addLayer({
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
    map.addLayer({
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
    map.addLayer({
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

  function centerLayer(name: string) {
    const layer = layers.find((layer) => layer.name === name);
    map.fitBounds(getBounds(layer.data), { padding: 40 });
  }

  function setLayerColor(name: string, color: string) {
    const layer = layers.find((layer) => layer.name === name);

    if (layer) {
      layer.color = color;
      map.setPaintProperty(`${name}-point`, "circle-color", color);
      map.setPaintProperty(`${name}-line`, "line-color", color);
      map.setPaintProperty(`${name}-fill`, "fill-color", color);
    }
  }

  function setLayerVisibility(name: string, visibility: boolean) {
    const layer = layers.find((layer) => layer.name === name);

    if (layer) {
      layer.visible = visibility;
      map.setLayoutProperty(
        `${name}-point`,
        "visibility",
        visibility ? "visible" : "none",
      );
      map.setLayoutProperty(
        `${name}-line`,
        "visibility",
        visibility ? "visible" : "none",
      );
      map.setLayoutProperty(
        `${name}-fill`,
        "visibility",
        visibility ? "visible" : "none",
      );
    }
  }

  function removeLayer(name: string) {
    const index = layers.findIndex((layer) => layer.name === name);

    if (index !== -1) {
      map.removeLayer(`${name}-fill`);
      map.removeLayer(`${name}-line`);
      map.removeLayer(`${name}-point`);
      map.removeSource(name);

      layers.splice(index, 1);
    }
  }

  function setBasemap(value: BasemapType) {
    if (basemap === value) return;

    basemap = value;
    switch (basemap) {
      case BasemapType.OpenStreetMap:
        map.setLayoutProperty("basemap-osm", "visibility", "visible");
        break;
      case BasemapType.MapboxStreets:
        map.setLayoutProperty("basemap-osm", "visibility", "none");
        if (underlyingStyle !== BasemapType.MapboxStreets) {
          map.setStyle("mapbox://styles/mapbox/streets-v12");
          underlyingStyle = BasemapType.MapboxStreets;
        }
        break;
      case BasemapType.MapboxSatellite:
        map.setLayoutProperty("basemap-osm", "visibility", "none");
        if (underlyingStyle !== BasemapType.MapboxSatellite) {
          map.setStyle("mapbox://styles/mapbox/satellite-v9");
          underlyingStyle = BasemapType.MapboxSatellite;
        }
        break;
    }
  }
</script>

<div id="map-container" bind:this={container}></div>
<div id="controls-container">
  <LayerInput {createLayer} defaultName={`Layer ${counter}`} />
  <TilemapInput activeTilemaps={tilemaps} {toggleTileMap} />
  <BasemapInput {basemap} {setBasemap} />
  <LayerList
    {layers}
    {centerLayer}
    {setLayerColor}
    {setLayerVisibility}
    {removeLayer}
  />
</div>

<style>
  #map-container {
    position: absolute;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
  }

  #controls-container {
    position: absolute;
    top: 32px;
    right: 32px;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
