<script lang="ts">
  import { BasemapType } from "@lib/enum";

  type SetBasemapFunc = (basemap: BasemapType) => void;

  let {
    basemap,
    setBasemap,
  }: {
    basemap: BasemapType;
    setBasemap: SetBasemapFunc;
  } = $props();

  function classForOption(option: BasemapType): string {
    return basemap === option ? "active" : "inactive";
  }
</script>

<div id="basemap-container">
  <button
    onclick={(_) => setBasemap(BasemapType.MapboxStreets)}
    class={classForOption(BasemapType.MapboxStreets)}>Streets</button
  >
  <button
    onclick={(_) => setBasemap(BasemapType.OpenStreetMap)}
    class={classForOption(BasemapType.OpenStreetMap)}>OpenStreetMap</button
  >
  <button
    onclick={(_) => setBasemap(BasemapType.MapboxSatellite)}
    class={classForOption(BasemapType.MapboxSatellite)}>Satellite</button
  >
</div>

<style>
  #basemap-container {
    display: flex;
    flex-direction: row;
    backdrop-filter: blur(10px);
    border-radius: 8px;
  }

  #basemap-container button:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  #basemap-container button:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  #basemap-container button {
    flex: 1;
    padding: 8px;
    border: none;
    background-color: rgba(255, 255, 255, 0.5);
    color: black;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  #basemap-container button:hover {
    background-color: rgba(255, 255, 255, 0.9);
  }

  #basemap-container button.active {
    background-color: rgba(0, 0, 0, 0.2);
    color: white;
  }

  #basemap-container button.active:hover {
    background-color: rgba(100, 100, 100, 0.2);
  }
</style>
