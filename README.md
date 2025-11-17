# Mappe

A quick web tool to assist in GIS debugging. Try it live [on my server][0], or
[on Cloudflare][1]!

[0]: https://davidbourgault.ca/map]
[1]: https://david-bourgault-ca-map.david-bourgault.workers.dev/

## Features

- Supports for many formats:
  - CSV (Lon,Lat format)
  - GeoJSON
  - Encoded Polylone
- Multiple base map options
  - Mapbox Streets
  - OpenStreetMaps
  - Mapbox Satellite
- Copy single coordinates on click:
  - `Ctrl + Click` for (Lon,Lat)
  - `Ctrl + Shift + Click` for (Lat,Lon)
- Show map tile boundaries at fixed zooms
- Geocoding (Search for places)

## Tech Stack

Built with Typescript and Svelte, using Mapbox GL. Packaged with Vite. Deployed
with Docker on Kubernetes, or on Cloudflare Workers.
