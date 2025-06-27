<script lang="ts">
  import type { GeoJSON } from "geojson";

  import polyline from "@mapbox/polyline";

  type CreateLayerFunc = (name: string, data: GeoJSON) => void;

  let {
    createLayer,
    defaultName,
  }: {
    createLayer: CreateLayerFunc;
    defaultName: string;
  } = $props();

  let nameInput: HTMLTextAreaElement;
  let dataInput: HTMLTextAreaElement;

  function isWithinPolylineRange(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode < 63 || charCode > 126) {
        return false;
      }
    }

    return true;
  }

  function onClick(_: Event) {
    let trimmed = dataInput.value.trim();
    let name = nameInput.value.trim() || defaultName;

    if (!trimmed) {
      return;
    }

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      createLayer(name, JSON.parse(dataInput.value) as GeoJSON);
    } else if (isWithinPolylineRange(trimmed)) {
      createLayer(name, polyline.toGeoJSON(trimmed) as GeoJSON);
    } else {
      alert("Invalid input format. Please provide valid GeoJSON or Polyline.");
      return;
    }

    nameInput.value = "";
    dataInput.value = "";
  }
</script>

<div id="layer-input">
  <textarea bind:this={nameInput} placeholder="Layer Name" rows="1"></textarea>
  <textarea bind:this={dataInput} placeholder="GeoJSON / Polyline" rows="10"
  ></textarea>
  <button onclick={onClick}>Add</button>
</div>

<style>
  #layer-input {
    background-color: rgb(255, 255, 255, 50%);
    backdrop-filter: blur(10px);
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  #layer-input textarea {
    background-color: rgb(255, 255, 255, 50%);
    resize: none;
    border: none;
    border-radius: 4px;
    padding: 8px;
    font-family: monospace;
    font-size: 14px;
  }

  #layer-input textarea:focus {
    outline: none;
  }

  #layer-input button {
    background-color: rgb(0, 0, 0);
    color: rgb(255, 255, 255);
    font-weight: bold;
    border: none;
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
  }

  #layer-input button:hover {
    background-color: rgb(91, 91, 91);
    transition: background-color 0.2s ease;
  }
</style>
