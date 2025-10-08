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
  let collapsed: boolean = $state(false);

  function isWithinPolylineRange(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      if (charCode < 63 || charCode > 126) {
        return false;
      }
    }

    return true;
  }

  function addLayer(_: Event) {
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

  function toggleCollapse() {
    collapsed = !collapsed;
  }

  function iconForCollapseButton(): string {
    return collapsed ? "▼" : "▲";
  }
</script>

<div id="layer-input" class="vertical" class:collapsed>
  <div class="horizontal">
    <textarea
      bind:this={nameInput}
      id="name-input"
      placeholder="Layer Name"
      rows="1"
    ></textarea>
    <button class="discrete" onclick={toggleCollapse}
      >{iconForCollapseButton()}</button
    >
  </div>
  <div class="vertical collapsible-content" class:collapsed>
    <textarea bind:this={dataInput} placeholder="GeoJSON / Polyline" rows="10"
    ></textarea>
    <button class="loud" onclick={addLayer}>Add</button>
  </div>
</div>

<style>
  div.horizontal {
    display: flex;
    flex-direction: row;
  }

  div.vertical {
    display: flex;
    flex-direction: column;
  }

  #layer-input {
    background-color: rgb(255, 255, 255, 50%);
    backdrop-filter: blur(10px);
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    gap: 8px;
    transition: gap 0.3s ease;
  }

  #layer-input.collapsed {
    gap: 0;
  }

  .collapsible-content {
    max-height: 500px;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .collapsible-content.collapsed {
    max-height: 0;
  }

  #name-input {
    flex: 1;
  }

  #layer-input textarea {
    min-width: 4em;
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

  #layer-input button.loud {
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

  #layer-input button.discrete {
    aspect-ratio: 1 / 1;
    background-color: transparent;
    color: rgb(0, 0, 0);
    font-weight: bold;
    border: none;
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
  }
</style>
