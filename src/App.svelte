<script lang="ts">
  import type { GeoJSON } from "geojson";
  import type { LayerData } from "@lib/types";

  import { onMount } from "svelte";
  import { Map } from "mapbox-gl";

  import LayerInput from "@components/LayerInput.svelte";
  import LayerList from "@components/LayerList.svelte";

  let container: HTMLDivElement;
  let map: Map;

  let counter: number = $state(1);
  const colors: string[] = [
    "#f0a01c",
    "#66cf2d",
    "#4b5ae3",
    "#e06577"
  ];

  let layers: LayerData[] = $state([]);

  onMount(() => {
    map = new Map({
      container: container,
      accessToken: "pk.eyJ1IjoibmdjNzI5MyIsImEiOiJjbTljd3J0NzkweHlwMmtxMmhtdGJsZnY5In0.d-AzdQ9pM64VTsrc7yQz2g",
      style: "mapbox://styles/mapbox/streets-v11",
      projection: "globe",
      center: [-73.5674, 45.5019], // Montréal
      zoom: 10,
    });

    map.on("style.load", () => {
      map.setFog({
        color: "rgb(186, 210, 235)", // Lower atmosphere
        "high-color": "rgb(36, 92, 223)", // Upper atmosphere
        "horizon-blend": 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        "space-color": "rgb(11, 11, 25)", // Background color
        "star-intensity": 0.6, // Background star brightness (default 0.35 at low zoooms )
      });
    });

    return () => map.remove();
  });

  function isPolygon(data: GeoJSON): boolean {
    return ["FeatureCollection", "Feature", "Polygon", "MultiPolygon"].indexOf(data.type) !== -1;
  }

  function addLayer(name: string, data: GeoJSON) {
    const color = colors[counter % colors.length];

    const layer: LayerData = { name, data, color, polygon: isPolygon(data), visible: true }
    layers.push(layer);
    counter += 1;

    map.addSource(name, {
      type: "geojson",
      data,
    });
    map.addLayer({
      id: `${name}-point`,
      type: "circle",
      source: name,
      layout: {
        visibility: "visible",
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

    if (layer.polygon) {
      map.addLayer({
        id: `${name}-fill`,
        type: "fill",
        source: name,
        layout: {},
        paint: {
          "fill-color": color,
          "fill-opacity": 0.33,
        },
      });
    }
  }

  function setLayerColor(name: string, color: string) {
    const layer = layers.find((layer) => layer.name === name);

    if (layer) {
      layer.color = color;
      map.setPaintProperty(`${name}-point`, "circle-color", color);
      map.setPaintProperty(`${name}-line`, "line-color", color);

      if (layer.polygon) {
        map.setPaintProperty(`${name}-fill`, "fill-color", color);
      }
    }
  }

  function setLayerVisibility(name: string, visibility: boolean) {
    const layer = layers.find((layer) => layer.name === name);

    if (layer) {
      layer.visible = visibility;
      map.setLayoutProperty(`${name}-point`, "visibility", visibility ? "visible" : "none");
      map.setLayoutProperty(`${name}-line`, "visibility", visibility ? "visible" : "none");

      if (layer.polygon) {
        map.setLayoutProperty(`${name}-fill`, "visibility", visibility ? "visible" : "none");
      }
    }
  }

  function removeLayer(name: string) {
    const index = layers.findIndex((layer) => layer.name === name);

    if (index !== -1) {
      if (layers[index].polygon) {
        map.removeLayer(`${name}-fill`);
      }
      map.removeLayer(`${name}-line`);
      map.removeLayer(`${name}-point`);
      map.removeSource(name);

      layers.splice(index, 1);
    }
  }
</script>

<div id="map-container" bind:this={container}></div>
<div id="controls-container">
  <LayerInput {addLayer} defaultName={`Layer ${counter}`} />
  <LayerList {layers} {setLayerColor} {setLayerVisibility} {removeLayer} />
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
