<script lang="ts">
  import { getColor } from "@lib/color";
  import type { Feature, FeatureCollection, GeoJSON, Point } from "geojson";

  type CreateLayerFunc = (name: string, data: GeoJSON) => void;
  type CenterBoxFunc = (
    bbox: [number, number, number, number],
    zoom?: number,
  ) => void;

  type PlaceResult = {
    id: string;
    name: string;
    color: string;
    place: string;
    center: [number, number];
    bbox: [number, number, number, number];
  };

  let {
    createLayer,
    centerBox,
    accessToken,
  }: {
    createLayer: CreateLayerFunc;
    centerBox: CenterBoxFunc;
    accessToken: string;
  } = $props();

  let searchInput: HTMLInputElement;
  let places: PlaceResult[] = $state([]);

  const search = async () => {
    places = [];

    const query = searchInput.value;
    if (!query) {
      return;
    }

    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${query}&access_token=${accessToken}`,
    );
    const data: FeatureCollection = await response.json();

    data.features.forEach((feature: Feature) => {
      const place: PlaceResult = {
        id: feature.properties.mapbox_id,
        name: feature.properties.name || "Unnamed Place",
        color: getColor("places"),
        place: feature.properties.place_formatted || "",
        center: (feature.geometry as Point).coordinates as [number, number],
        bbox: feature.properties.bbox || null,
      };
      places.push(place);
    });
  };
</script>

<div id="place-input" class="vertical">
  <div class="horizontal">
    <input
      bind:this={searchInput}
      id="search-input"
      type="text"
      onkeydown={(e) => {
        if (e.key === "Enter") {
          search();
        }
      }}
      placeholder="Search for a place..."
    />
    <button class="discrete" onclick={search}>🔎</button>
  </div>
</div>

{#each places as place (place.id)}
  <div class="place-item" style="background-color: {place.color}">
    <div class="vertical place-info">
      <span class="place-name">{place.name}</span>
      <span class="place-description">{place.place}</span>
    </div>
    <button class="place-center" onclick={(_) => centerBox(place.bbox)}>
      center
    </button>
    <button
      class="place-add"
      onclick={(_) =>
        createLayer(place.name, { type: "Point", coordinates: place.center })}
    >
      add
    </button>
    <button
      class="place-remove"
      onclick={(_) => (places = places.filter((p) => p.id !== place.id))}
    >
      remove
    </button>
  </div>
{/each}

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

  #place-input {
    background-color: rgb(255, 255, 255, 50%);
    backdrop-filter: blur(10px);
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;

    transition: gap 0.3s ease;
  }

  .place-item {
    display: flex;
    flex-direction: row;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 8px 16px;
    border-radius: 8px;
    align-items: center;
    font-size: 12px;
    font-family: sans-serif;
    line-height: 1.2em;
  }

  div.place-info {
    color: white;
    flex-grow: 1;
    gap: 0px;
  }

  .place-name {
    font-weight: bold;
  }

  .place-item button {
    color: white;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-family: monospace;
    font-size: 12px;
    text-decoration: underline;
  }

  #search-input {
    flex: 1;
  }

  #place-input input {
    min-width: 4em;
    background-color: rgb(255, 255, 255, 50%);
    resize: none;
    border: none;
    border-radius: 4px;
    padding: 8px;
    font-family: monospace;
    font-size: 14px;
  }

  #place-input input:focus {
    outline: none;
  }

  #place-input button:hover {
    background-color: rgb(91, 91, 91);
    transition: background-color 0.2s ease;
  }

  #place-input button.discrete {
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
