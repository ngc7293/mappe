<script lang="ts">
  import { onMount } from "svelte";
  import { Map } from "mapbox-gl";

  import LayerInput from "@components/LayerInput.svelte";
  import LayerList from "@components/LayerList.svelte";
  import BasemapInput from "@components/BasemapInput.svelte";
  import TilemapInput from "@components/TilemapInput.svelte";

  import { BasemapType } from "@lib/enum";
  import { createMap, setupMapAtmosphere } from "@lib/MapManager.svelte";
  import { LayerManager } from "@lib/LayerManager.svelte";
  import { TilemapManager } from "@lib/TilemapManager.svelte";
  import { BasemapManager } from "@lib/BasemapManager.svelte";
  import { tryConvertGeoJSON } from "@lib/parser";
  import { coordinateOrder } from "@lib/coordinateOrder.svelte";
  import PlaceInput from "@components/PlaceInput.svelte";

  let container: HTMLDivElement;
  let map: Map;

  let layerManager: LayerManager = $state(null);
  let tilemapManager: TilemapManager = $state(null);
  let basemapManager: BasemapManager = $state(null);

  onMount(() => {
    map = createMap({
      container: container,
      accessToken: import.meta.env.VITE_MAPBOX_TOKEN,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-73.5674, 45.5019], // Montréal
      zoom: 10,
    });

    // Initialize managers
    layerManager = new LayerManager(map);
    tilemapManager = new TilemapManager(map);
    basemapManager = new BasemapManager(map, BasemapType.MapboxStreets);

    map.on("style.load", () => {
      setupMapAtmosphere(map);
      basemapManager.initializeOSMLayer();
      layerManager.restoreLayers();
      tilemapManager.updateTilemaps();
      loadDataFromHash();
    });

    // Add global paste event listener
    window.addEventListener("paste", handlePaste);

    return () => {
      map.remove();
      window.removeEventListener("paste", handlePaste);
    };
  });

  let hashDataLoaded = false;

  function loadDataFromHash() {
    if (hashDataLoaded) return;
    hashDataLoaded = true;

    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.slice(1));
    const data = params.get("data");
    if (!data) return;

    const geojson = tryConvertGeoJSON(data, coordinateOrder.order);
    if (geojson && layerManager) {
      layerManager.createLayer("Link Data", geojson);
    }
  }

  function handlePaste(event: ClipboardEvent) {
    // Ignore paste events from textarea or input elements (like LayerInput)
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
      return;
    }

    const clipboardData = event.clipboardData;
    if (!clipboardData) {
      return;
    }

    const pastedText = clipboardData.getData("text");
    if (pastedText) {
      // Attempt to parse the pasted text as GeoJSON and add it as a new layer
      const geojson = tryConvertGeoJSON(pastedText, coordinateOrder.order);
      if (geojson && layerManager) {
        event.preventDefault(); // Prevent default paste behavior
        const layerName = `Pasted Layer ${layerManager.getCounter()}`;
        layerManager.createLayer(layerName, geojson);
      }
    }
  }
</script>

<div id="map-container" bind:this={container}></div>
{#if layerManager && tilemapManager && basemapManager}
  <div id="controls-container">
    <PlaceInput
      accessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      createLayer={layerManager.createLayer}
      centerBox={(bbox) => map.fitBounds(bbox)}
    />
    <LayerInput
      createLayer={layerManager.createLayer}
      defaultName={`Layer ${layerManager.getCounter()}`}
    />
    <TilemapInput
      allowed={tilemapManager.allowed}
      enabled={tilemapManager.enabled}
      active={tilemapManager.active}
      toggleTileMap={tilemapManager.toggleTileMap}
    />
    <BasemapInput
      basemap={basemapManager.currentBasemap}
      setBasemap={basemapManager.setBasemap}
    />
    <LayerList
      layers={layerManager.layers}
      centerLayer={layerManager.centerLayer}
      setLayerColor={layerManager.setLayerColor}
      setLayerVisibility={layerManager.setLayerVisibility}
      removeLayer={layerManager.removeLayer}
    />
  </div>
{/if}

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
