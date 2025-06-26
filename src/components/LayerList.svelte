<script lang="ts">
    import type { LayerData } from "@lib/types";

    type SetLayerVisibilityFunc = (name: string, visibility: boolean) => void;
    type RemoveLayerFunc = (name: string) => void;

    let { 
        layers,
        setLayerVisibility,
        removeLayer
    } : {
        layers: LayerData[],
        setLayerVisibility: SetLayerVisibilityFunc,
        removeLayer: RemoveLayerFunc
    } = $props();
</script>

<div id="layer-list">
    {#each layers as layer}
        <div class="layer-item" style="background-color:{layer.color};">
            <span class="layer-name">{layer.name}</span>
            <!-- <button class="layer-color">recolor</button> TODO: Implement -->
            <button class="layer-toggle" onclick={(_) => setLayerVisibility(layer.name, !layer.visible)}>{#if layer.visible }hide{:else}show{/if}</button>
            <button class="layer-remove" onclick={(_) => removeLayer(layer.name)}>remove</button>
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
        align-items: left;
        font-size: 12px;
        font-family: monospace;
    }

    .layer-name {
        flex-grow: 1;
        color: white;
        font-weight: bold;
    }

    .layer-item button {
        color: white;
        background-color: transparent;
        border: none;
        cursor: pointer;
        font-family: monospace;
        font-size: 12px;;
        text-decoration: underline;
    }

</style>