<script lang="ts">
  import { tryConvertGeoJSON } from "@lib/parser";
  import type { GeoJSON } from "geojson";

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

  let error: boolean = $state(false);
  let collapsed: boolean = $state(false);

  function addLayer(_: Event) {
    let trimmed = dataInput.value.trim();

    if (!trimmed) {
      return;
    }

    const geojson = tryConvertGeoJSON(trimmed);

    if (geojson !== null) {
      const name = nameInput.value.trim() || defaultName;
      createLayer(name, geojson);

      error = false;
      nameInput.value = "";
      dataInput.value = "";
    } else {
      error = true;
    }
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
    <textarea
      bind:this={dataInput}
      id="data-input"
      placeholder="GeoJSON / Polyline"
      rows="10"
      class:error
      oninput={() => (error = false)}
    ></textarea>
    <button class="loud" onclick={addLayer}>Add</button>
  </div>
</div>

<style>
  div.horizontal {
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  div.vertical {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  #layer-input {
    background-color: rgb(255, 255, 255, 50%);
    backdrop-filter: blur(10px);
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;

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

  #layer-input textarea#data-input.error {
    border: 2px solid rgba(239, 68, 68, 0.8);
    box-shadow: 0 0 8px 8px rgba(239, 68, 68, 0.2) inset;
    box-sizing: border-box;
    padding: 6px;
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
