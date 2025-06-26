<script lang="ts">
    import type { GeoJSON } from "geojson";

    import polyline from "@mapbox/polyline";

    type AddLayerFunc = (name: string, data: GeoJSON) => void;

    let { addLayer } : { addLayer: AddLayerFunc } = $props();

    let textarea: HTMLTextAreaElement;

    function onClick(_: Event) {
        let trimmed = textarea.value.trim();

        if (!trimmed) {
            return;
        }

        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            // Presume GeoJSON
            addLayer(null, JSON.parse(textarea.value) as GeoJSON);
        } else if (trimmed.match(/^[a-zA-Z0-9@?`]+$/)) {
            addLayer(null, polyline.toGeoJSON(trimmed) as GeoJSON);
        } else {
            alert("Invalid input format. Please provide valid GeoJSON or Polyline.");
            return;
        }


        textarea.value = "";
    };
</script>

<div id="layer-input">
    <textarea bind:this={textarea} placeholder="GeoJSON / Polyline" rows="10"></textarea>
    <button onclick={onClick}>Add</button>
</div>

<style>
    #layer-input {
        background-color: rgb(126, 104, 222);
        padding: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    #layer-input textarea {
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
        background-color: rgb(188, 178, 232);
        color: white;
        font-weight: bold;
        border: none;
        border-radius: 4px;
        padding: 8px;
        cursor: pointer;
    }

    #layer-input button:hover {
        background-color: rgb(213, 206, 245);
        transition: background-color 0.3s ease;
    }
</style>
