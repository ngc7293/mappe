<script lang="ts">
  type ToggleTileMap = (zoom: number) => void;

  let {
    allowed,
    enabled,
    active,
    toggleTileMap,
  }: {
    allowed: number[];
    enabled: number[];
    active: number[];
    toggleTileMap: ToggleTileMap;
  } = $props();

  function classForZoom(zoom: number): string {
    const classes = [
      active.includes(zoom) ? "active" : "inactive",
      enabled.includes(zoom) ? "enabled" : "disabled",
    ];
    return classes.join(" ");
  }
</script>

<div id="basemap-container">
  {#each allowed as z (z)}
    <button onclick={(_) => toggleTileMap(z)} class={classForZoom(z)}
      >Tiles {z}</button
    >
  {/each}
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

  #basemap-container button.enabled {
    background-color: rgba(0, 0, 0, 0.2);
    color: white;
  }

  #basemap-container button.enabled:hover {
    background-color: rgba(100, 100, 100, 0.2);
  }

  #basemap-container button.enabled.inactive {
    text-decoration: line-through;
    color: rgb(70, 70, 70);
  }
</style>
