<script lang="ts">
  import type { LayerData } from "@lib/types";

  type CenterLayerFunc = (name: string) => void;
  type SetLayerColorFunc = (name: string, color: string) => void;
  type SetLayerVisibilityFunc = (name: string, visibility: boolean) => void;
  type RemoveLayerFunc = (name: string) => void;

  let {
    layers,
    centerLayer,
    setLayerColor,
    setLayerVisibility,
    removeLayer,
  }: {
    layers: LayerData[];
    centerLayer: CenterLayerFunc;
    setLayerColor: SetLayerColorFunc;
    setLayerVisibility: SetLayerVisibilityFunc;
    removeLayer: RemoveLayerFunc;
  } = $props();
</script>

<div id="layer-list">
  {#each layers as layer (layer.name)}
    <div class="layer-item" style="background-color:{layer.color};">
      <span class="layer-name">{layer.name}</span>
      <input
        class="layer-color"
        type="color"
        onchange={(e) =>
          setLayerColor(layer.name, (e.target as HTMLInputElement).value)}
        value={layer.color}
      />
      <button class="layer-center" onclick={(_) => centerLayer(layer.name)}>
        center
      </button>
      <button
        class="layer-toggle"
        onclick={(_) => setLayerVisibility(layer.name, !layer.visible)}
      >
        {#if layer.visible}hide{:else}show{/if}
      </button>
      <button class="layer-remove" onclick={(_) => removeLayer(layer.name)}>
        remove
      </button>
    </div>
  {/each}
</div>

<style>
  #layer-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .layer-item {
    display: flex;
    flex-direction: row;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 8px 16px;
    border-radius: 8px;
    align-items: center;
    font-size: 12px;
    font-family: monospace;
  }

  .layer-name {
    flex-grow: 1;
    color: white;
    font-weight: bold;
  }

  .layer-item button,
  .layer-item input {
    color: white;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-family: monospace;
    font-size: 12px;
    text-decoration: underline;
  }

  .layer-item input[type="color"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: 8px;
    width: 40px;
    height: 24px;
    border: white 1px solid;
    margin: 0 4px;
  }
  .layer-item input[type="color"]::-webkit-color-swatch {
    border: none;
  }
  .layer-item input[type="color"]::-moz-color-swatch {
    border: none;
  }
</style>
